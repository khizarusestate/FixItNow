import { X, UserPlus } from "lucide-react";

export default function TourGuestPrompt({ onSignUp, onDismiss }) {
  return (
    <div className="fixed inset-0 z-[225] flex items-center justify-center p-4 pointer-events-auto">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onDismiss}
        aria-label="Close"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 animate-scaleIn">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100"
        >
          <X size={18} />
        </button>
        <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
          Tour complete
        </p>
        <h3 className="mt-1 text-xl font-bold text-slate-900">
          Create an account to track bookings
        </h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          You saw a practice example. Sign up free to save real bookings, get
          status updates, and rate workers when jobs finish.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={onSignUp}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
          >
            <UserPlus size={16} />
            Sign up free
          </button>
        </div>
      </div>
    </div>
  );
}
