import { X, ClipboardList } from "lucide-react";

export default function FirstBookingTip({ onOpenBookings, onDismiss }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[60] pointer-events-auto animate-slideUp">
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-white shadow-lg p-4 flex gap-3">
        <ClipboardList className="shrink-0 text-blue-600 mt-0.5" size={22} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900">Booking submitted</p>
          <p className="text-xs text-slate-600 mt-1">
            Track status anytime in <strong>My Bookings</strong> in the header.
          </p>
          <button
            type="button"
            onClick={onOpenBookings}
            className="mt-2 text-xs font-bold text-blue-700 hover:text-blue-900"
          >
            Open My Bookings →
          </button>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-1 text-slate-400 hover:text-slate-600"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
