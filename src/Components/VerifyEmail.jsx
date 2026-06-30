import { useState, useEffect } from "react";
import { X, Mail, Loader2 } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api.js";
import { runPostLoginFlow } from "../utils/postLoginFlow.js";
import { useI18n } from "../context/I18nContext.jsx";

const initialForm = { email: "", code: "" };

export default function VerifyEmail() {
  const { t } = useI18n();
  const { activeModal, modalPayload, closeModal, switchModal } = useModal();
  const { login } = useAuth();
  const isWorker = modalPayload?.role === "worker";
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);

  useEffect(() => {
    if (activeModal !== "verifyEmail") return;
    const email = modalPayload?.email || "";
    if (email) {
      setForm((f) => ({ ...f, email: String(email).trim().toLowerCase() }));
    }
    setMessage("");
    setIsError(false);
    setAutoLoggingIn(false);
  }, [activeModal, modalPayload?.email]);

  if (activeModal !== "verifyEmail") return null;

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setMessage("");
    setIsError(false);
  };

  const handleResend = async () => {
    if (!form.email) {
      setMessage(t("signup.fillAll"));
      setIsError(true);
      return;
    }
    setResending(true);
    try {
      const res = await authService.resendVerification(
        form.email,
        isWorker ? "worker" : undefined,
      );
      setMessage(res.message || t("verify.resend"));
      setIsError(false);
    } catch (err) {
      setMessage(err.message || t("common.error"));
      setIsError(true);
    } finally {
      setResending(false);
    }
  };

  const finishCustomerAutoLogin = (res) => {
    const token = res.accessToken || res.token;
    const customer = res.customer || res.data?.customer;
    if (!token || !customer) return false;
    closeModal();
    login(customer, "customer", token, true, res.refreshToken);
    setAutoLoggingIn(true);
    setMessage(t("verify.loggingIn"));
    setIsError(false);
    setTimeout(() => {
      runPostLoginFlow({
        userData: customer,
        userType: "customer",
        switchModal,
        closeModal,
      });
    }, 800);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const res = await authService.verifyEmail(
        form.email,
        form.code,
        isWorker ? "worker" : "customer",
      );
      if (!res.success) return;

      if (!isWorker && (res.autoLogin || res.accessToken || res.token)) {
        if (finishCustomerAutoLogin(res)) return;
      }

      if (isWorker) {
        closeModal();
        switchModal("workerProfessional", {
          email: form.email,
          password: modalPayload?.password || "",
        });
        return;
      }

      setMessage(res.message || t("verify.submit"));
      setIsError(false);
    } catch (err) {
      setMessage(err.message || t("common.error"));
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (autoLoggingIn) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="text-center animate-fade-up px-6">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-orange-500" />
          <p className="mt-4 text-base font-semibold text-emerald-700">
            {t("verify.successTitle")}
          </p>
          <p className="mt-2 text-sm font-medium text-blue-900">Logging In...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center px-4 animate-fadeIn">
      <button
        onClick={closeModal}
        className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm"
        aria-label={t("common.close")}
      />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl animate-slideUp">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Mail className="text-orange-500" size={22} />
            <h2 className="text-lg font-bold text-blue-900">{t("verify.title")}</h2>
          </div>
          <button onClick={closeModal} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 mb-4">{t("verify.subtitle")}</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder={`${t("signup.email")} *`}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
            />
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder={`${t("verify.code")} *`}
              value={form.code}
              onChange={(e) => update("code", e.target.value.replace(/\D/g, ""))}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm tracking-widest outline-none focus:border-orange-400"
            />
            {message && (
              <p className={`text-sm ${isError ? "text-red-600" : "text-emerald-600"}`}>
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {submitting ? t("verify.verifying") : t("verify.submit")}
            </button>
          </form>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="mt-3 w-full text-sm font-medium text-orange-600 hover:text-orange-700 disabled:opacity-60"
          >
            {resending ? t("verify.sending") : t("verify.resend")}
          </button>
        </div>
      </div>
    </div>
  );
}
