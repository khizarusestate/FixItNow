import { useState, useEffect } from "react";
import { X, Mail, ArrowRight } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { authService } from "../services/api.js";

const initialForm = { email: "", code: "" };

export default function VerifyEmail() {
  const { activeModal, modalPayload, closeModal, switchModal } = useModal();
  const isWorker = modalPayload?.role === "worker";
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (activeModal !== "verifyEmail") return;
    const email = modalPayload?.email || "";
    if (email) {
      setForm((f) => ({ ...f, email: String(email).trim().toLowerCase() }));
    }
    setMessage("");
    setIsError(false);
    setVerified(false);
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
      if (res.success) {
        setVerified(true);
        setMessage(
          res.message ||
            (isWorker
              ? "Email verified. Complete your professional details next."
              : "Email verified! You can log in now."),
        );
        setIsError(false);
      }
    } catch (err) {
      setMessage(err.message || "Verification failed.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    if (isWorker) {
      closeModal();
      switchModal("workerProfessional", {
        email: form.email,
        password: modalPayload?.password || "",
      });
      return;
    }
    switchModal("login", { email: form.email });
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center px-4">
      <button
        onClick={closeModal}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        aria-label="Close"
      />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Mail className="text-orange-500" size={22} />
            <h2 className="text-lg font-bold text-slate-900">Verify your email</h2>
          </div>
          <button onClick={closeModal} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {verified ? (
            <div className="text-center py-4">
              <p className="text-sm text-emerald-700 font-medium mb-4">{message}</p>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {isWorker ? "Continue to Step 2" : "Go to Login"}
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-4">
                {isWorker
                  ? "Step 1 complete. Enter the 6-digit code we sent to your email to continue worker signup."
                  : "We sent a 6-digit code to your email. Enter it below to activate your account."}
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
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
                  {submitting ? "Verifying…" : "Verify email"}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
