import { useState, useEffect } from "react";
import { X, Briefcase, LogOut, AlertCircle } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { authService, servicesService } from "../services/api.js";
import { isAuthenticated, logout } from "../utils/jwt.js";
import LocationPicker from "./LocationPicker.jsx";

const initial = {
  fullName: "",
  phoneNumber: "",
  emailAddress: "",
  password: "",
  primaryServiceCategory: "",
  cnicNumber: "",
};
const emptyGeo = { location: "", latitude: null, longitude: null, placeId: "" };

const FALLBACK_SERVICES = [
  "Cleaning",
  "Home Repair",
  "Electrical",
  "Plumbing",
  "Automotive",
  "IT Support",
  "Other",
];

export default function WorkerModal() {
  const { activeModal, closeModal } = useModal();
  const [form, setForm] = useState(initial);
  const [geo, setGeo] = useState(emptyGeo);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);

  useEffect(() => {
    if (activeModal === "worker") {
      setIsCustomerLoggedIn(isAuthenticated());
    }
  }, [activeModal]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await servicesService.getAll();
        const services = response?.data?.services || [];
        const names = services.map((service) => service.name).filter(Boolean);
        setServiceCategories(names.length ? names : FALLBACK_SERVICES);
      } catch {
        setServiceCategories(FALLBACK_SERVICES);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadServices();
  }, []);

  if (activeModal !== "worker") return null;

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setIsError(false);

    if (!geo.location?.trim()) {
      setMessage("Please select your location on the map.");
      setIsError(true);
      setSubmitting(false);
      return;
    }

    const cnicClean = form.cnicNumber.replace(/-/g, "");
    if (!/^\d{13}$/.test(cnicClean)) {
      setMessage("CNIC must be 13 digits (e.g. 35201-1234567-8).");
      setIsError(true);
      setSubmitting(false);
      return;
    }

    try {
      const response = await authService.registerWorker({
        ...form,
        location: geo.location.trim(),
        serviceArea: geo.location.trim(),
        latitude: geo.latitude,
        longitude: geo.longitude,
        placeId: geo.placeId,
      });
      if (response.success) {
        if (isCustomerLoggedIn) logout();
        setDone(true);
        setForm(initial);
        setGeo(emptyGeo);
      }
    } catch (err) {
      setMessage(err.message || "Submission failed. Please try again.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    closeModal();
    setDone(false);
    setMessage("");
  };
  const inputCls =
    "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-[fadeScale_0.2s_ease-out]">
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Join as Worker
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Start with FixItNow
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Join our network of trusted professionals.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6">
          {done ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <Briefcase className="h-8 w-8 text-orange-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Application Submitted!
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Admin will review your application. You can log in after
                approval.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-orange-700 font-medium">
                  Application received
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  You will be notified by email when your account is approved.
                </p>
              </div>
              {isCustomerLoggedIn && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <LogOut size={14} className="inline mr-1" />
                    Your customer account has been logged out. Please login as
                    worker after approval.
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {isCustomerLoggedIn && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle
                    size={18}
                    className="text-amber-600 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Different Email Required
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      You are logged in as a customer. Use a different email to
                      register as a worker.
                    </p>
                  </div>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  required
                  className={inputCls}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phoneNumber}
                  onChange={(e) => update("phoneNumber", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={form.emailAddress}
                onChange={(e) => update("emailAddress", e.target.value)}
                required
                className={inputCls}
              />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={6}
                className={inputCls}
              />
              <select
                value={form.primaryServiceCategory}
                onChange={(e) =>
                  update("primaryServiceCategory", e.target.value)
                }
                required
                className={inputCls}
              >
                <option value="">
                  {loadingCategories ? "Loading services..." : "Select work"}
                </option>
                {serviceCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="CNIC number"
                value={form.cnicNumber}
                onChange={(e) => update("cnicNumber", e.target.value)}
                required
                className={inputCls}
              />
              <LocationPicker
                label="Location"
                required
                value={geo}
                onChange={setGeo}
              />
              {message && (
                <p
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${isError ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}
                >
                  {message}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
