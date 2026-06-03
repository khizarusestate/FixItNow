import { useState, useEffect } from "react";
import { X, Briefcase, LogOut, AlertCircle } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { authService } from "../services/api.js";
import { isAuthenticated, logout } from "../utils/jwt.js";

const initial = {
  firstName: "",
  lastName: "",
  emailAddress: "",
  password: "",
};

export default function WorkerModal() {
  const { activeModal, closeModal, switchModal } = useModal();
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

    try {
      const response = await authService.registerWorker({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        emailAddress: form.emailAddress,
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
      setMessage(err.message || "Submission failed. Please try again.");
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
              Join as Worker
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Step 1 — Basic info
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Verify your email, then complete trade, CNIC, and verification photo.
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
          <form onSubmit={handleSubmit} className="space-y-3">
            {isCustomerLoggedIn && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle
                  size={18}
                  className="text-amber-600 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-amber-700">
                  Use a different email than your customer account.
                </p>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                required
                className={inputCls}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
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
              {submitting ? "Creating…" : "Continue to email verification"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
