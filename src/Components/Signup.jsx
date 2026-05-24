import { useState, useEffect } from "react";
import {
  X,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowRight,
  User,
  Briefcase,
} from "lucide-react";
import { useModal } from "../context/ModalContext";
import { authService, servicesService } from "../services/api.js";
import LocationPicker from "./LocationPicker.jsx";
import SearchableSelect from "./SearchableSelect.jsx";
import { WORKER_TRADE_OPTIONS } from "../utils/workerTrades.js";

const initialCustomer = { name: "", email: "", phone: "", password: "" };
const initialWorker = {
  fullName: "",
  phoneNumber: "",
  cnicNumber: "",
  emailAddress: "",
  password: "",
  primaryServiceCategory: "",
};
const emptyGeo = { location: "", latitude: null, longitude: null, placeId: "" };
export default function Signup() {
  const { activeModal, closeModal, switchModal } = useModal();
  const [signupType, setSignupType] = useState("customer");
  const [customerForm, setCustomerForm] = useState(initialCustomer);
  const [workerForm, setWorkerForm] = useState(initialWorker);
  const [showPw, setShowPw] = useState(false);
  const [showWorkerPw, setShowWorkerPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [done, setDone] = useState(false);
  const [workerGeo, setWorkerGeo] = useState(emptyGeo);
  const [tradeOptions, setTradeOptions] = useState(WORKER_TRADE_OPTIONS);

  const updateCustomer = (k, v) => setCustomerForm((f) => ({ ...f, [k]: v }));
  const updateWorker = (k, v) => setWorkerForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (activeModal === "signup") {
      const loadServices = async () => {
        try {
          const response = await servicesService.getAll();
          const services = response?.data?.services || [];
          const names = services.map((service) => service.name).filter(Boolean);
          const merged = [
            ...new Set([...WORKER_TRADE_OPTIONS, ...names]),
          ].sort();
          setTradeOptions(merged);
        } catch {
          setTradeOptions(WORKER_TRADE_OPTIONS);
        }
      };
      loadServices();
    }
  }, [activeModal]);

  if (activeModal !== "signup") return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (signupType === "customer") {
        if (
          !customerForm.name ||
          !customerForm.email ||
          !customerForm.phone ||
          !customerForm.password
        ) {
          setMessage("Please fill all fields.");
          setIsError(true);
          setSubmitting(false);
          return;
        }

        const response = await authService.registerCustomer({
          fullName: customerForm.name,
          email: customerForm.email,
          phone: customerForm.phone,
          password: customerForm.password,
        });

        if (response.success) setDone(true);
      } else {
        if (
          !workerForm.fullName ||
          !workerForm.emailAddress ||
          !workerForm.phoneNumber ||
          !workerForm.cnicNumber ||
          !workerForm.password ||
          !workerForm.primaryServiceCategory ||
          !workerGeo.location?.trim()
        ) {
          setMessage("Please fill all required fields.");
          setIsError(true);
          setSubmitting(false);
          return;
        }

        // Validate CNIC format (13 digits, optionally with dashes)
        const cnicClean = workerForm.cnicNumber.replace(/-/g, "");
        if (!/^\d{13}$/.test(cnicClean)) {
          setMessage("CNIC must be 13 digits (e.g. 35201-1234567-8).");
          setIsError(true);
          setSubmitting(false);
          return;
        }

        // Merge service city and area into service area string
        const response = await authService.registerWorker({
          ...workerForm,
          location: workerGeo.location.trim(),
          serviceArea: workerGeo.location.trim(),
          latitude: workerGeo.latitude,
          longitude: workerGeo.longitude,
          placeId: workerGeo.placeId,
          serviceCategories: [],
        });

        if (response.success) setDone(true);
      }
    } catch (err) {
      setMessage(err.message || "Registration failed. Please try again.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    closeModal();
    setCustomerForm(initialCustomer);
    setWorkerForm(initialWorker);
    setWorkerGeo(emptyGeo);
    setDone(false);
    setMessage("");
  };

  const inputCls =
    "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-[fadeScale_0.2s_ease-out]">
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Create Account
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Join FixItNow
            </h2>
          </div>
          <button
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
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {signupType === "worker"
                  ? "Application Submitted!"
                  : "Account created successfully!"}
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                {signupType === "worker"
                  ? "Your account needs admin approval. Please wait for verification."
                  : "Please check your email for a 6-digit verification code before logging in."}
              </p>
              {signupType === "worker" ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-5">
                  <p className="text-sm text-orange-700 font-medium">
                    Admin will approve your account, then you can login.
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Please wait a moment. You will receive notification via
                    email or SMS.
                  </p>
                </div>
              ) : null}
              {signupType === "customer" && (
                <div className="space-y-3">
                  <button
                    onClick={() => switchModal("verifyEmail")}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                  >
                    Verify Email <ArrowRight size={15} />
                  </button>
                  <button
                    onClick={() => switchModal("login")}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Login Now
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Signup Type Toggle */}
              <div className="flex rounded-lg border border-slate-200 p-1 mb-4">
                <button
                  type="button"
                  data-signup-type="customer"
                  onClick={() => setSignupType("customer")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    signupType === "customer"
                      ? "bg-orange-500 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <User size={14} />
                  Customer
                </button>
                <button
                  type="button"
                  data-signup-type="worker"
                  onClick={() => setSignupType("worker")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    signupType === "worker"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Briefcase size={14} />
                  Worker
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {signupType === "customer" ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={customerForm.name}
                        onChange={(e) => updateCustomer("name", e.target.value)}
                        required
                        className={inputCls}
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={customerForm.email}
                        onChange={(e) =>
                          updateCustomer("email", e.target.value)
                        }
                        required
                        className={inputCls}
                      />
                      <div className="relative">
                        <input
                          type={showPw ? "text" : "password"}
                          placeholder="Password"
                          value={customerForm.password}
                          onChange={(e) =>
                            updateCustomer("password", e.target.value)
                          }
                          required
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={customerForm.phone}
                        onChange={(e) =>
                          updateCustomer("phone", e.target.value)
                        }
                        required
                        className={inputCls}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={workerForm.fullName}
                        onChange={(e) =>
                          updateWorker("fullName", e.target.value)
                        }
                        required
                        className={inputCls}
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={workerForm.phoneNumber}
                        onChange={(e) =>
                          updateWorker("phoneNumber", e.target.value)
                        }
                        required
                        className={inputCls}
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={workerForm.emailAddress}
                      onChange={(e) =>
                        updateWorker("emailAddress", e.target.value)
                      }
                      required
                      className={inputCls}
                    />
                    <input
                      type="text"
                      placeholder="CNIC Number (e.g. 12345-1234567-1)"
                      value={workerForm.cnicNumber}
                      onChange={(e) =>
                        updateWorker("cnicNumber", e.target.value)
                      }
                      required
                      className={inputCls}
                    />
                    <div className="relative">
                      <input
                        type={showWorkerPw ? "text" : "password"}
                        placeholder="Password (min 6 chars)"
                        value={workerForm.password}
                        onChange={(e) =>
                          updateWorker("password", e.target.value)
                        }
                        required
                        minLength="6"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWorkerPw(!showWorkerPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={
                          showWorkerPw ? "Hide password" : "Show password"
                        }
                      >
                        {showWorkerPw ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Primary work / trade{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        options={tradeOptions}
                        value={workerForm.primaryServiceCategory}
                        onChange={(val) =>
                          updateWorker("primaryServiceCategory", val)
                        }
                        placeholder="Search and select your trade"
                        required
                      />
                    </div>
                    <LocationPicker
                      label="Location"
                      required
                      disabled={submitting}
                      value={workerGeo}
                      onChange={setWorkerGeo}
                    />
                  </>
                )}

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
                  className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
                    signupType === "worker"
                      ? "bg-slate-900 hover:bg-slate-800"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  <span className="truncate">
                    {submitting
                      ? "Creating..."
                      : `Create ${signupType === "worker" ? "Worker" : "Customer"} Account`}
                  </span>
                  <ArrowRight size={15} />
                </button>
                <p className="text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchModal("login")}
                    className="font-medium text-orange-500 hover:text-orange-600 underline"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
