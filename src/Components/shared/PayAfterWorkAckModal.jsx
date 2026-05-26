import { X } from "lucide-react";

export default function PayAfterWorkAckModal({ onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl animate-scaleIn">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600 pr-8">
          Payment reminder
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          You selected pay after work. Please complete payment once the job is
          finished — leaving without paying is not acceptable.
        </p>
        <button
          type="button"
          onClick={onConfirm}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white hover:from-amber-600 hover:to-orange-600 transition-colors"
        >
          I understand
        </button>
      </div>
    </div>
  );
}
