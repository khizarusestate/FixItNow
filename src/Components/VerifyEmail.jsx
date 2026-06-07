import { useState, useEffect } from "react";
import { X, Mail, Loader2 } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api.js";
import { runPostLoginFlow } from "../utils/postLoginFlow.js";

const initialForm = { email: "", code: "" };

export default function VerifyEmail() {
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
      setMessage("Enter your email first.");
      setIsError(true);
      return;
    }
    setResending(true);
    try {
      const res = await authService.resendVerification(
        form.email,
        isWorker ? "worker" : undefined,
      );
      setMessage(res.message || "Verification code sent. Check your inbox.");
      setIsError(false);
    } catch (err) {
      setMessage(err.message || "Could not resend code.");
      setIsError(true);
    } finally {
      setResending(false);
    }
  };

  const finishCustomerAutoLogin = (res) => {
    const token = res.accessToken || res.token;
    const customer = res.customer || res.data;
    if (!token || !customer) return false;
    login(customer, "customer", token, true, res.refreshToken);
    setAutoLoggingIn(true);
    setMessage("Signed in. Completing your profile…");
    setIsError(false);
    setTimeout(() => {
      runPostLoginFlow({
        userData: customer,
        userType: "customer",
        switchModal,
        closeModal,
      });
    }, 600);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.code) {
      setMessage("Enter your email and 6-digit code.");
      setIsError(true);
      return;
    }
    setSubmitting(true);
    try {
      const res = await authService.verifyEmail(
        form.email,
        form.code,
        isWorker ? "worker" : undefined,
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

      setMessage(res.message || "Email verified.");
      setIsError(false);
    } catch (err) {
      setMessage(err.message || "Verification failed.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (autoLoggingIn) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="text-center animate-fade-up">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-orange-500" />
          <p className="mt-4 text-sm font-medium text-blue-900">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center px-4 animate-fadeIn">
      <button
        onClick={closeModal}
        className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm"
        aria-label="Close"
      />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl animate-slideUp">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Mail className="text-orange-500" size={22} />
            <h2 className="text-lg font-bold text-blue-900">Verify your email</h2>
          </div>
          <button onClick={closeModal} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 mb-4">
            Enter the 6-digit code we sent to your email.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Email address *"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
            />
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code *"
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
              {submitting ? "Verifying…" : "Verify & continue"}
            </button>
          </form>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="mt-3 w-full text-sm font-medium text-orange-600 hover:text-orange-700 disabled:opacity-60"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        </div>
      </div>
    </div>
  );
}
