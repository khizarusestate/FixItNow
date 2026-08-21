import { useState, useEffect } from "react";
import { X, Eye, EyeOff, CheckCircle, Clock, ArrowRight, User, Briefcase, Upload, MapPin } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { authService } from "../services/api.js";
import ServiceSelection from "./ServiceSelection.jsx";
import { loadFormDraft, saveFormDraft, clearFormDraft } from "../utils/formDraft.js";
import TermsAgreement from "./shared/TermsAgreement.jsx";
import PhoneInput from "./shared/PhoneInput.jsx";
import { isPhoneValid } from "../utils/phoneValidation.js";
import { useI18n } from "../context/I18nContext.jsx";
import { formatCnicInput, isValidCnic } from "../utils/workerSignup.js";
import LocationPicker from "./LocationPicker.jsx";
import { geoFromUser } from "../utils/location.js";

const SIGNUP_DRAFT_KEY = "fixitnow_draft_signup";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const initialCustomer = { name: "", email: "", phone: "", password: "" };
const initialWorker = { fullName: "", emailAddress: "", phoneNumber: "", password: "", cnicNumber: "", selectedServices: [] };

export default function Signup() {
  const { t } = useI18n();
  const { activeModal, closeModal, switchModal } = useModal();
  const savedDraft = loadFormDraft(SIGNUP_DRAFT_KEY, {});
  const [signupType, setSignupType] = useState(savedDraft.signupType ?? "customer");
  const [customerForm, setCustomerForm] = useState({ ...initialCustomer, ...savedDraft.customerForm });
  const [workerForm, setWorkerForm] = useState(() => {
    const draft = { ...initialWorker, ...savedDraft.workerForm };
    if (!draft.fullName && (draft.firstName || draft.lastName)) draft.fullName = [draft.firstName, draft.lastName].filter(Boolean).join(" ");
    return draft;
  });
  const [customerGeo, setCustomerGeo] = useState(() => geoFromUser(null));
  const [workerGeo, setWorkerGeo] = useState(() => geoFromUser(null));
  const [showPw, setShowPw] = useState(false);
  const [showWorkerPw, setShowWorkerPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [done, setDone] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(savedDraft.termsAgreed ?? false);
  const [verificationPhoto, setVerificationPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cnicFrontPhoto, setCnicFrontPhoto] = useState(null);
  const [cnicBackPhoto, setCnicBackPhoto] = useState(null);
  const [cnicFrontPreview, setCnicFrontPreview] = useState(null);
  const [cnicBackPreview, setCnicBackPreview] = useState(null);

  useEffect(() => {
    if (activeModal !== "signup") return;
    saveFormDraft(SIGNUP_DRAFT_KEY, { signupType, customerForm, workerForm, termsAgreed });
  }, [activeModal, signupType, customerForm, workerForm, termsAgreed]);

  useEffect(() => () => {
    [photoPreview, cnicFrontPreview, cnicBackPreview].forEach((url) => { if (url) URL.revokeObjectURL(url); });
  }, [photoPreview, cnicFrontPreview, cnicBackPreview]);

  const updateCustomer = (k, v) => setCustomerForm((f) => ({ ...f, [k]: v }));
  const updateWorker = (k, v) => setWorkerForm((f) => ({ ...f, [k]: v }));

  if (activeModal !== "signup") return null;

  const handleImage = (file, setter, previewSetter, label) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage(`${label} must be an image.`);
      setIsError(true);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setMessage(`${label} must be 2MB or smaller.`);
      setIsError(true);
      return;
    }
    setter(file);
    previewSetter((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
    setMessage("");
    setIsError(false);
  };

  const handleWorkerPhoto = (e) => handleImage(e.target.files?.[0], setVerificationPhoto, setPhotoPreview, "Passport/verification photo");
  const handleCnicFront = (e) => handleImage(e.target.files?.[0], setCnicFrontPhoto, setCnicFrontPreview, "CNIC front photo");
  const handleCnicBack = (e) => handleImage(e.target.files?.[0], setCnicBackPhoto, setCnicBackPreview, "CNIC back photo");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAgreed) {
      setMessage(t("signup.termsRequired")); setIsError(true); return;
    }
    setSubmitting(true);
    try {
      if (signupType === "customer") {
        if (!customerForm.name || !customerForm.email || !customerForm.phone || !customerForm.password) {
          setMessage(t("signup.fillAll")); setIsError(true); setSubmitting(false); return;
        }
        if (!isPhoneValid(customerForm.phone)) {
          setMessage(t("signup.invalidPhone")); setIsError(true); setSubmitting(false); return;
        }
        if (!customerGeo.location?.trim()) {
          setMessage("Please select your location on the map."); setIsError(true); setSubmitting(false); return;
        }
        const response = await authService.registerCustomer({
          fullName: customerForm.name,
          email: customerForm.email,
          phone: customerForm.phone,
          password: customerForm.password,
          location: customerGeo.location.trim(),
          latitude: customerGeo.latitude,
          longitude: customerGeo.longitude,
          placeId: customerGeo.placeId,
        });
        if (response.success) {
          clearFormDraft(SIGNUP_DRAFT_KEY);
          closeModal();
          switchModal("verifyEmail", { email: customerForm.email.trim().toLowerCase() });
        }
        return;
      }

      if (!workerForm.fullName?.trim() || !workerForm.emailAddress || !workerForm.phoneNumber?.trim() || !workerForm.password || !workerForm.cnicNumber?.trim()) {
        setMessage(t("signup.workerRequired")); setIsError(true); setSubmitting(false); return;
      }
      if (!isPhoneValid(workerForm.phoneNumber)) {
        setMessage(t("signup.invalidPhone")); setIsError(true); setSubmitting(false); return;
      }
      if (!isValidCnic(workerForm.cnicNumber)) {
        setMessage(t("worker.cnicInvalid")); setIsError(true); setSubmitting(false); return;
      }
      if (!workerForm.selectedServices?.length) {
        setMessage(t("worker.tradeRequired")); setIsError(true); setSubmitting(false); return;
      }
      if (!workerGeo.location?.trim()) {
        setMessage("Please select your location on the map."); setIsError(true); setSubmitting(false); return;
      }
      if (!verificationPhoto || !cnicFrontPhoto || !cnicBackPhoto) {
        setMessage("Passport photo, CNIC front photo and CNIC back photo are required."); setIsError(true); setSubmitting(false); return;
      }

      const body = new FormData();
      body.append("fullName", workerForm.fullName.trim());
      body.append("email", workerForm.emailAddress.trim().toLowerCase());
      body.append("emailAddress", workerForm.emailAddress.trim().toLowerCase());
      body.append("phoneNumber", workerForm.phoneNumber.trim());
      body.append("password", workerForm.password);
      body.append("cnicNumber", workerForm.cnicNumber.replace(/-/g, ""));
      body.append("location", workerGeo.location.trim());
      body.append("latitude", workerGeo.latitude);
      body.append("longitude", workerGeo.longitude);
      body.append("placeId", workerGeo.placeId);
      body.append("services", JSON.stringify(workerForm.selectedServices));
      const primary = workerForm.selectedServices[0];
      if (primary?.serviceId) body.append("primaryServiceId", primary.serviceId);
      body.append("verificationPhoto", verificationPhoto);
      body.append("cnicFrontPhoto", cnicFrontPhoto);
      body.append("cnicBackPhoto", cnicBackPhoto);

      const response = await authService.registerWorker(body);
      if (response.success) {
        clearFormDraft(SIGNUP_DRAFT_KEY);
        if (response.requiresVerification) {
          closeModal();
          switchModal("verifyEmail", {
            email: workerForm.emailAddress.trim().toLowerCase(),
            role: "worker",
            password: workerForm.password,
          });
          return;
        }
        setDone(true);
        setMessage(response.message || t("worker.submitApproval"));
        setIsError(false);
      }
    } catch (err) {
      setMessage(err.message || t("signup.failed"));
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    saveFormDraft(SIGNUP_DRAFT_KEY, { signupType, customerForm, workerForm });
    closeModal();
    setDone(false);
    setMessage("");
  };

  const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white";
  const uploadBox = (id, label, file, preview, onChange) => (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-700">{label} *</label>
      <input type="file" accept="image/*" onChange={onChange} className="sr-only" id={id} />
      <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-800 hover:bg-orange-100">
        <Upload size={16} /> {file ? "Change photo" : "Upload photo"}
      </label>
      {preview && <img src={preview} alt={`${label} preview`} className="mt-3 h-28 w-full rounded-lg border object-cover" />}
      {!preview && <div className="mt-3 flex h-20 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">No photo selected</div>}
      <p className="mt-1 text-xs text-slate-500">Image only, maximum 2MB.</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button onClick={handleClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" aria-label="Close signup" />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-[fadeScale_0.2s_ease-out]">
        <div className="flex items-start justify-between p-6 pb-4">
          <h2 className={`mt-1 text-2xl font-bold ${signupType === "worker" ? "text-blue-900" : "text-orange-500"}`}>{t("signup.title")}</h2>
          <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 pb-6">
          {done ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"><CheckCircle className="h-8 w-8 text-emerald-600" /></div></div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{t("worker.pendingApprovalTitle")}</h3>
              <p className="text-sm text-slate-500 mb-4">{t("worker.accountCreated")}</p>
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-left mb-5"><Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><p className="text-sm font-medium leading-relaxed text-amber-900">{t("worker.pendingApprovalBody")}</p></div>
              <button onClick={() => switchModal("login")} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">{t("signup.loginNow")} <ArrowRight size={15} /></button>
            </div>
          ) : (
            <>
              <div className="flex rounded-lg border border-slate-200 p-1 mb-4">
                <button type="button" onClick={() => { setSignupType("customer"); setMessage(""); setIsError(false); }} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${signupType === "customer" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}><User size={14} />{t("signup.customer")}</button>
                <button type="button" onClick={() => { setSignupType("worker"); setMessage(""); setIsError(false); }} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${signupType === "worker" ? "bg-blue-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}><Briefcase size={14} />{t("signup.worker")}</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                {signupType === "customer" ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input type="text" placeholder={t("signup.fullName")} value={customerForm.name} onChange={(e) => updateCustomer("name", e.target.value)} required className={inputCls} />
                      <input type="email" placeholder={t("signup.email")} value={customerForm.email} onChange={(e) => updateCustomer("email", e.target.value)} required className={inputCls} />
                      <div className="relative"><input type={showPw ? "text" : "password"} placeholder={t("signup.password")} value={customerForm.password} onChange={(e) => updateCustomer("password", e.target.value)} required className={inputCls + " pr-10"} /><button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
                      <PhoneInput value={customerForm.phone} onChange={(v) => updateCustomer("phone", v)} placeholder={t("signup.phone")} required />
                    </div>
                    <div><label className="mb-1 block text-xs font-semibold text-slate-700"><MapPin size={14} className="inline mr-1" />Location *</label><LocationPicker value={customerGeo} onChange={setCustomerGeo} /></div>
                  </>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input type="text" placeholder={t("signup.fullName")} value={workerForm.fullName} onChange={(e) => updateWorker("fullName", e.target.value)} required className={inputCls} />
                      <input type="email" placeholder={t("signup.email")} value={workerForm.emailAddress} onChange={(e) => updateWorker("emailAddress", e.target.value)} required className={inputCls} />
                      <div className="relative"><input type={showWorkerPw ? "text" : "password"} placeholder={t("signup.passwordMin")} value={workerForm.password} onChange={(e) => updateWorker("password", e.target.value)} required minLength={6} className={inputCls + " pr-10"} /><button type="button" onClick={() => setShowWorkerPw(!showWorkerPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label={showWorkerPw ? t("login.hidePassword") : t("login.showPassword")}>{showWorkerPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
                      <PhoneInput value={workerForm.phoneNumber} onChange={(v) => updateWorker("phoneNumber", v)} placeholder={t("signup.phone")} required />
                    </div>
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div><label className="mb-1 block text-xs font-semibold text-slate-700">{t("worker.trade")} *</label><ServiceSelection selectedServices={workerForm.selectedServices || []} onChange={(selectedServices) => updateWorker("selectedServices", selectedServices)} maxSelection={5} /><p className="mt-1 text-xs text-slate-500">Select up to 5 trades to continue.</p></div>
                      <div><label className="mb-1 block text-xs font-semibold text-slate-700">{t("worker.cnic")} *</label><input type="text" inputMode="numeric" value={workerForm.cnicNumber} onChange={(e) => updateWorker("cnicNumber", formatCnicInput(e.target.value))} placeholder={t("worker.cnicPlaceholder")} required className={inputCls} /></div>
                      <div><label className="mb-1 block text-xs font-semibold text-slate-700"><MapPin size={14} className="inline mr-1" />Location *</label><LocationPicker value={workerGeo} onChange={setWorkerGeo} /></div>
                      {uploadBox("signup-worker-photo", t("worker.passportPhoto"), verificationPhoto, photoPreview, handleWorkerPhoto)}
                      {uploadBox("signup-worker-cnic-front", "CNIC Front Photo", cnicFrontPhoto, cnicFrontPreview, handleCnicFront)}
                      {uploadBox("signup-worker-cnic-back", "CNIC Back Photo", cnicBackPhoto, cnicBackPreview, handleCnicBack)}
                      <p className="text-xs text-slate-500">All three identity images are required for admin verification.</p>
                    </div>
                  </>
                )}
                {message && <p className={`rounded-lg px-3 py-2.5 text-sm font-medium ${isError ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>{message}</p>}
                <TermsAgreement checked={termsAgreed} onChange={(v) => { setTermsAgreed(v); setMessage(""); }} prefix="By signing up, you agree to the" />
                <button type="submit" disabled={submitting || !termsAgreed} className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${signupType === "worker" ? "bg-blue-900 hover:bg-blue-800" : "bg-orange-500 hover:bg-orange-600"}`}><span className="truncate">{submitting ? t("signup.creating") : signupType === "worker" ? t("signup.createWorker") : t("signup.createCustomer")}</span><ArrowRight size={15} /></button>
                <p className="text-center text-sm text-slate-500">{t("signup.haveAccount")} <button type="button" onClick={() => switchModal("login")} className="font-medium text-orange-500 hover:text-orange-600 underline">{t("signup.signIn")}</button></p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
