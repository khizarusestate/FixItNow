import { Bell, X } from "lucide-react";

export default function MissedNotificationsModal({ count, onOpenBell, onDismiss }) {
  if (!count || count <= 0) return null;

  const label = count > 9 ? "9+ new notifications" : `${count} new notification${count === 1 ? "" : "s"}`;

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl border border-orange-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-3">
            <Bell size={26} />
          </span>
          <h3 className="text-lg font-bold text-slate-900">You have updates</h3>
          <p className="mt-2 text-sm text-orange-700 font-semibold">{label}</p>
          <p className="mt-1 text-xs text-slate-500">
            Open the bell icon to read notifications you missed while away.
          </p>
          <button
            type="button"
            onClick={onOpenBell}
            className="mt-5 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
          >
            View notifications
          </button>
        </div>
      </div>
    </div>
  );
}
