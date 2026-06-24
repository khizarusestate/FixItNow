import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { FileText, Shield, X } from "lucide-react";

const LegalContext = createContext(null);

function LegalContent() {
  return (
    <div className="space-y-5">
      <article className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
            <Shield size={20} />
          </span>
          <h3 className="text-lg font-bold text-slate-900">Privacy Policy</h3>
        </div>
        <div className="space-y-2.5 text-sm leading-relaxed text-slate-600">
          <p>
            We collect name, contact, location, and payment proof to process
            bookings and assign workers. We do not sell your personal data to
            third parties.
          </p>
          <p>
            Data is used only to operate Fix It Now, communicate about your
            requests, and improve our service. You may request account deletion
            via support.
          </p>
          <p className="text-xs font-medium text-slate-400">Last updated May 2026</p>
        </div>
      </article>

      <article
        id="terms-of-service"
        className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-5 shadow-sm"
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/5 text-slate-800">
            <FileText size={20} />
          </span>
          <h3 className="text-lg font-bold text-slate-900">Terms of Service</h3>
        </div>
        <div className="space-y-2.5 text-sm leading-relaxed text-slate-600">
          <p>
            You agree to provide accurate booking and profile details and
            genuine payment proof when required. Bookings are confirmed after
            admin review.
          </p>
          <p>
            <strong>Commission & Payments:</strong> Fix It Now charges a 20% 
            service commission on all completed jobs. Workers must submit payment 
            proof to claim their earnings after job completion. The company retains 
            the right to adjust commission rates with 30 days notice.
          </p>
          <p>
            You may cancel while a booking is still pending. Workers must act
            professionally on site. Accounts may be suspended for abuse,
            fraud, or repeated non-payment.
          </p>
          <p>
            Advertisements and reviews are moderated. By submitting content you
            grant Fix It Now permission to display it in accordance with our
            policies.
          </p>
          <p className="text-xs font-medium text-slate-400">Last updated May 2026</p>
        </div>
      </article>
    </div>
  );
}

function LegalModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="legal-modal-root fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
        aria-label="Close legal information"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-white shadow-2xl shadow-slate-900/30 animate-slideUp sm:max-h-[88vh] sm:rounded-3xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
              Legal
            </p>
            <h2
              id="legal-modal-title"
              className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl"
            >
              Privacy &amp; Terms
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Please read before you continue.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <LegalContent />
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/35"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

export function LegalProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openLegal = useCallback(() => setOpen(true), []);
  const closeLegal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("fixitnow-open-legal", onOpen);
    return () => window.removeEventListener("fixitnow-open-legal", onOpen);
  }, []);

  return (
    <LegalContext.Provider value={{ openLegal, closeLegal, isOpen: open }}>
      {children}
      <LegalModal open={open} onClose={closeLegal} />
    </LegalContext.Provider>
  );
}

export function useLegal() {
  const ctx = useContext(LegalContext);
  if (!ctx) {
    throw new Error("useLegal must be used within LegalProvider");
  }
  return ctx;
}
