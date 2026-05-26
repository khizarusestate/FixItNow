import { useState, useEffect } from "react";
import { X, Mail, Key, ArrowRight, CheckCircle } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { authService } from "../services/api.js";
import { loadFormDraft, saveFormDraft, clearFormDraft } from "../utils/formDraft.js";

const FORGOT_DRAFT_KEY = "fixitnow_draft_forgot";
const initialState = { email: "", code: "", password: "" };

export default function ForgotPassword() {
  const { activeModal, closeModal, switchModal } = useModal();
  const savedDraft = loadFormDraft(FORGOT_DRAFT_KEY, {});
  const [form, setForm] = useState({
    email: savedDraft.email ?? "",
    code: savedDraft.code ?? "",
    password: "",
  });
  const [step, setStep] = useState(savedDraft.step ?? "request");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (activeModal !== "forgotPassword") return;
    saveFormDraft(FORGOT_DRAFT_KEY, {
      email: form.email,
      code: form.code,
      step,
    });
  }, [activeModal, form.email, form.code, step]);

  if (activeModal !== "forgotPassword") return null;

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage("");
    setIsError(false);
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!form.email) {
      setMessage("Enter your email to receive a reset code.");
      setIsError(true);
      return;
    }

    setSubmitting(true);
    try {
      const response = await authService.requestPasswordReset(form.email);
      if (!response?.success) {
        setMessage(response?.message || "Unable to send reset code.");
        setIsError(true);
      } else {
        setMessage(response.message || "Reset code sent. Check your email.");
        setIsError(false);
        setStep("reset");
      }
    } catch (err) {
      setMessage(err.message || "Unable to send reset code.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!form.email || !form.code || !form.password) {
      setMessage("Email, code, and new password are required.");
      setIsError(true);
      return;
    }

    setSubmitting(true);
    try {
      const response = await authService.resetPassword(
        form.email,
        form.code,
        form.password,
      );
      if (!response?.success) {
        setMessage(response?.message || "Unable to reset password.");
        setIsError(true);
      } else {
        setMessage(response.message || "Password reset successfully.");
        setIsError(false);
        setDone(true);
        clearFormDraft(FORGOT_DRAFT_KEY);
      }
    } catch (err) {
      setMessage(err.message || "Unable to reset password.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    saveFormDraft(FORGOT_DRAFT_KEY, {
      email: form.email,
      code: form.code,
      step,
    });
    closeModal();
    setMessage("");
    setIsError(false);
    setDone(false);
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
              Reset Password
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Forgot password?
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {step === "request"
                ? "Enter your email to receive a reset code."
                : "Enter the code and choose a new password."}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={step === "request" ? handleRequest : handleReset}
          className="px-6 pb-6 space-y-4"
        >
          {done ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">All set!</h3>
              <p className="text-sm text-slate-600 mb-5">
                Your password has been reset successfully.
              </p>
              <button
                type="button"
                onClick={() => switchModal("login")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white"
                  />
                  <Mail
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                </div>
                {step === "reset" && (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Reset code"
                        value={form.code}
                        onChange={(e) => update("code", e.target.value)}
                        maxLength={6}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white"
                      />
                      <Key
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                    </div>
                    <input
                      type="password"
                      placeholder="New password"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      required
                      minLength={6}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white"
                    />
                  </>
                )}
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
                {submitting
                  ? step === "request"
                    ? "Sending..."
                    : "Resetting..."
                  : step === "request"
                    ? "Send reset code"
                    : "Reset password"}
              </button>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    if (step === "reset") {
                      setStep("request");
                      setForm((prev) => ({ ...prev, code: "", password: "" }));
                      setMessage("");
                      setIsError(false);
                    } else {
                      switchModal("login");
                    }
                  }}
                  className="font-medium text-slate-500 hover:text-slate-700"
                >
                  {step === "reset" ? "Start over" : "Back to login"}
                </button>
                {step === "reset" && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep("request");
                      setForm((prev) => ({ ...prev, code: "", password: "" }));
                    }}
                    className="font-medium text-orange-500 hover:text-orange-600"
                  >
                    Send another code
                  </button>
                )}
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
