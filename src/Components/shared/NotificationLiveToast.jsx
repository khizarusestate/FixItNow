import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

export default function NotificationLiveToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      const data = e.detail || {};
      setToast({
        title: data.title || "New notification",
        message: data.message || "",
      });
    };
    window.addEventListener("fixitnow-notification-new", handler);
    return () => window.removeEventListener("fixitnow-notification-new", handler);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 z-[60] w-[min(100%,22rem)] animate-fadeIn">
      <div className="rounded-xl border border-orange-200 bg-white shadow-xl p-4 flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          <Bell size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-orange-700">{toast.title}</p>
          {toast.message ? (
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{toast.message}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setToast(null)}
          className="shrink-0 p-1 text-slate-400 hover:text-slate-600"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
