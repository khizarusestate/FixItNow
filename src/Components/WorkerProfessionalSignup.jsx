import { useState, useEffect } from "react";
import { X, Upload, Shield, Loader2 } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { authService, servicesService } from "../services/api.js";
import SearchableSelect from "./SearchableSelect.jsx";
import { buildServicePickerOptions } from "../utils/servicePicker.js";

export default function WorkerProfessionalSignup() {
  const { activeModal, modalPayload, closeModal, switchModal } = useModal();
  const email = String(modalPayload?.email || "").trim().toLowerCase();
  const password = modalPayload?.password || "";

  const [form, setForm] = useState({
    cnicNumber: "",
    primaryServiceId: "",
    primaryServiceName: "",
    primaryServiceCategory: "",
    phoneNumber: "",
  });
  const [verificationPhoto, setVerificationPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [tradeOptions, setTradeOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (activeModal !== "workerProfessional") return;
    servicesService
      .getAll()
      .then((response) => {
        const services = response?.data?.services || [];
        setTradeOptions(buildServicePickerOptions(services));
      })
      .catch(() => setTradeOptions([]));
  }, [activeModal]);

  if (activeModal !== "workerProfessional") return null;

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setMessage("");
    setIsError(false);
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please upload a JPEG or PNG photo.");
      setIsError(true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Photo must be under 5MB.");
      setIsError(true);
      return;
    }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setVerificationPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setMessage("");
    setIsError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Email is required. Restart signup from step 1.");
      setIsError(true);
      return;
    }
    const cnicClean = String(form.cnicNumber).replace(/-/g, "");
    if (!/^\d{13}$/.test(cnicClean)) {
      setMessage("CNIC must be 13 digits.");
      setIsError(true);
      return;
    }
    if (!form.primaryServiceId && !form.primaryServiceCategory) {
      setMessage("Please select your trade / profession.");
      setIsError(true);
      return;
    }
    if (!verificationPhoto) {
      setMessage("Passport-size verification photo is required.");
      setIsError(true);
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const body = new FormData();
      body.append("emailAddress", email);
      if (password) body.append("password", password);
      body.append("cnicNumber", cnicClean);
      if (form.phoneNumber) body.append("phoneNumber", form.phoneNumber.trim());
      if (form.primaryServiceId) body.append("primaryServiceId", form.primaryServiceId);
      if (form.primaryServiceName) body.append("primaryServiceName", form.primaryServiceName);
      if (form.primaryServiceCategory) {
        body.append("primaryServiceCategory", form.primaryServiceCategory);
      }
      body.append("verificationPhoto", verificationPhoto);

      const res = await authService.registerWorkerProfessional(body);
      if (res.success) {
        setDone(true);
        setMessage(
          res.message ||
            "Application submitted. Admin will review your details.",
        );
        setIsError(false);
      }
    } catch (err) {
      setMessage(err.message || "Could not submit professional details.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white";

  return (
    <div className="fixed inset-0 z-[76] flex items-center justify-center px-4">
      <button
        onClick={closeModal}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        aria-label="Close"
      />
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="text-orange-500" size={22} />
            <h2 className="text-lg font-bold text-slate-900">
              Professional verification
            </h2>
          </div>
          <button onClick={closeModal} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {done ? (
            <div className="text-center py-4">
              <p className="text-sm text-emerald-700 font-medium mb-4">{message}</p>
              <button
                type="button"
                onClick={() => switchModal("login", { email })}
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-4">
                Step 2 of 2: Add your trade, CNIC, and passport-size photo for admin
                review. This photo is only for verification — not your profile picture.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trade / profession *
                </label>
                <SearchableSelect
                  options={tradeOptions}
                  value={form.primaryServiceId}
                  onChange={(val) => update("primaryServiceId", val)}
                  onSelectOption={(opt) => {
                    setForm((f) => ({
                      ...f,
                      primaryServiceId: opt.value,
                      primaryServiceName: opt.name || "",
                      primaryServiceCategory: opt.category || "",
                    }));
                  }}
                  placeholder="Select your trade"
                  required
                />
                <input
                  type="text"
                  placeholder="CNIC (13 digits) *"
                  value={form.cnicNumber}
                  onChange={(e) => update("cnicNumber", e.target.value)}
                  required
                  className={inputCls}
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={form.phoneNumber}
                  onChange={(e) => update("phoneNumber", e.target.value)}
                  className={inputCls}
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Passport-size verification photo *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    className="sr-only"
                    id="worker-verify-photo"
                  />
                  <label
                    htmlFor="worker-verify-photo"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-800 hover:bg-orange-100"
                  >
                    <Upload size={16} />
                    {verificationPhoto ? "Change photo" : "Upload photo"}
                  </label>
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Verification preview"
                      className="mt-3 h-28 w-28 rounded-lg border object-cover"
                    />
                  )}
                </div>
                {message && (
                  <p className={`text-sm ${isError ? "text-red-600" : "text-emerald-600"}`}>
                    {message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    "Submit for approval"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
