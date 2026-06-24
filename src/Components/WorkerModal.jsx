import { useState, useEffect } from "react";
import { X, Briefcase, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { authService } from "../services/api.js";
import { isAuthenticated, logout } from "../utils/jwt.js";
import PhoneInput from "./shared/PhoneInput.jsx";
import { isPhoneValid } from "../utils/phoneValidation.js";
import { useI18n } from "../context/I18nContext.jsx";

const initial = {
  fullName: "",
  emailAddress: "",
  phoneNumber: "",
  password: "",
};

export default function WorkerModal() {
  const { t } = useI18n();
  const { activeModal, closeModal, switchModal } = useModal();
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);

  useEffect(() => {
    if (activeModal === "worker") {
      setIsCustomerLoggedIn(isAuthenticated());
    }
  }, [activeModal]);

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

    if (!isPhoneValid(form.phoneNumber)) {
      setMessage(t("signup.invalidPhone"));
      setIsError(true);
      setSubmitting(false);
      return;
    }

    try {
      const response = await authService.registerWorker({
        fullName: form.fullName.trim(),
        emailAddress: form.emailAddress,
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
      });
      if (response.success) {
        if (isCustomerLoggedIn) logout();
        closeModal();
        switchModal("verifyEmail", {
          email: form.emailAddress.trim().toLowerCase(),
          role: "worker",
          password: form.password,
        });
      }
    } catch (err) {
      setMessage(err.message || t("signup.failed"));
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    closeModal();
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
              {t("worker.joinTitle")}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-blue-900">
              {t("worker.step1Title")}
            </h2>
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
          <form onSubmit={handleSubmit} className="space-y-3">
            {isCustomerLoggedIn && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle
                  size={18}
                  className="text-amber-600 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-amber-700">
                  {t("worker.differentEmail")}
                </p>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder={t("signup.fullName")}
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                required
                className={inputCls}
              />
              <input
                type="email"
                placeholder={t("signup.email")}
                value={form.emailAddress}
                onChange={(e) => update("emailAddress", e.target.value)}
                required
                className={inputCls}
              />
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder={t("signup.passwordMin")}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? t("login.hidePassword") : t("login.showPassword")}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PhoneInput
                value={form.phoneNumber}
                onChange={(v) => update("phoneNumber", v)}
                placeholder={t("signup.phone")}
                required
              />
            </div>
            {message && (
              <p
                className={`rounded-lg px-3 py-2 text-sm ${isError ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}
              >
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              <Briefcase size={16} />
              {submitting ? t("common.saving") : t("worker.continueVerify")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
