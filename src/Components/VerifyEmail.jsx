import { useState, useEffect } from "react";
import { X, Mail, RefreshCcw, CheckCircle } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { authService } from "../services/api.js";
import { loadFormDraft, saveFormDraft, clearFormDraft } from "../utils/formDraft.js";

const VERIFY_DRAFT_KEY = "fixitnow_draft_verify";
const initialForm = { email: "", code: "" };

export default function VerifyEmail() {
  const { activeModal, closeModal, switchModal, modalPayload } = useModal();
  const savedDraft = loadFormDraft(VERIFY_DRAFT_KEY, {});
  const [form, setForm] = useState({
    email: savedDraft.email ?? "",
    code: savedDraft.code ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [done, setDone] = useState(false);

  const emailLocked = Boolean(modalPayload?.emailLocked && modalPayload?.email);

  useEffect(() => {
    if (activeModal !== "verifyEmail") return;
    if (modalPayload?.email) {
      setForm((prev) => ({
        ...prev,
        email: String(modalPayload.email).trim().toLowerCase(),
      }));
    }
  }, [activeModal, modalPayload?.email, modalPayload?.emailLocked]);

  useEffect(() => {
    if (activeModal !== "verifyEmail") return;
    saveFormDraft(VERIFY_DRAFT_KEY, { email: form.email, code: form.code });
  }, [activeModal, form.email, form.code]);

  if (activeModal !== "verifyEmail") return null;

  const update = (field, value) => {
    if (field === "email" && emailLocked) return;
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage("");
    setIsError(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!form.email || !form.code) {
      setMessage("Email and code are required.");
      setIsError(true);
      return;
    }

    setSubmitting(true);
    try {
      const response = await authService.verifyEmail(form.email, form.code);
      if (!response?.success) {
        setMessage(response?.message || "Verification failed.");
        setIsError(true);
      } else {
        setMessage(response.message || "Email verified successfully.");
        setIsError(false);
        setDone(true);
        clearFormDraft(VERIFY_DRAFT_KEY);
      }
    } catch (err) {
      setMessage(err.message || "Verification failed.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!form.email) {
      setMessage("Enter your email to resend the code.");
      setIsError(true);
      return;
    }
    setSubmitting(true);
    try {
      const response = await authService.resendVerification(form.email);
      if (!response?.success) {
        setMessage(response?.message || "Could not resend verification code.");
        setIsError(true);
      } else {
        setMessage(
          response.message || "Verification code resent. Check your email.",
        );
        setIsError(false);
      }
    } catch (err) {
      setMessage(err.message || "Could not resend verification code.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    saveFormDraft(VERIFY_DRAFT_KEY, { email: form.email, code: form.code });
    closeModal();
    setMessage("");
    setDone(false);
    setIsError(false);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        aria-label="Close"
      />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl animate-[fadeScale_0.2s_ease-out]">
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Verify Email
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Confirm your account
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {emailLocked
                ? "Enter the 6-digit code sent to your email."
                : "Enter your email and the 6-digit code we sent you."}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleVerify} className="px-6 pb-6 space-y-4">
          {done ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Email verified!
              </h3>
              <p className="text-sm text-slate-600 mb-5">
                You can now login with your credentials.
              </p>
              <button
                type="button"
                onClick={() => {
                  switchModal("login", { email: form.email });
                  setDone(false);
                  setForm((f) => ({ ...initialForm, email: f.email }));
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {emailLocked ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <p className="text-xs font-medium text-slate-500">Email</p>
                    <p className="text-sm font-semibold text-slate-900 break-all">
                      {form.email}
                    </p>
                  </div>
                ) : (
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white"
                  />
                )}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit verification code"
                    value={form.code}
                    onChange={(e) =>
                      update("code", e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    required
                    autoFocus={emailLocked}
                    autoComplete="one-time-code"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white tracking-widest"
                  />
                  <Mail
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                </div>
              </div>
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
                className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
              >
                {submitting ? "Verifying..." : "Verify Email"}
              </button>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={submitting}
                  className="inline-flex items-center gap-1 font-medium text-orange-500 hover:text-orange-600 disabled:opacity-60"
                >
                  <RefreshCcw size={14} />
                  Resend code
                </button>
                <button
                  type="button"
                  onClick={() => switchModal("login")}
                  className="font-medium text-slate-500 hover:text-slate-700"
                >
                  Back to login
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
