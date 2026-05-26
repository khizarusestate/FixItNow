import { useCallback, useEffect, useState } from "react";
import { Bell, X, CheckCheck, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiRequestWithAuth } from "../services/api.js";

export default function NotificationBell() {
  const { isAuthenticated, user, badgeCount } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated || !user?.type) return;
    try {
      setLoading(true);
      const res = await apiRequestWithAuth("/notifications?limit=20");
      setItems(res.data || []);
      setUnread(res.unreadCount ?? 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.type]);

  useEffect(() => {
    const onNew = () => {
      setUnread((c) => Math.min(c + 1, 99));
      if (open) load();
    };
    window.addEventListener("fixitnow-notification-new", onNew);
    return () => window.removeEventListener("fixitnow-notification-new", onNew);
  }, [open, load]);

  useEffect(() => {
    const openBell = () => {
      setOpen(true);
      load();
    };
    window.addEventListener("fixitnow-open-notifications", openBell);
    return () => window.removeEventListener("fixitnow-open-notifications", openBell);
  }, [load]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  if (!isAuthenticated) return null;

  const displayCount =
    unread > 0 ? (unread > 9 ? "9+" : unread) : badgeCount > 0 ? (badgeCount > 9 ? "9+" : badgeCount) : null;

  const markAllRead = async () => {
    try {
      await apiRequestWithAuth("/notifications/read-all", { method: "PATCH" });
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      /* ignore */
    }
  };

  const markOneRead = async (id) => {
    try {
      await apiRequestWithAuth(`/notifications/${id}/read`, { method: "PATCH" });
      setItems((prev) =>
        prev.map((n) => (String(n._id) === String(id) ? { ...n, isRead: true } : n)),
      );
      setUnread((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-700"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {displayCount && (
          <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {displayCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 max-h-[70vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <span className="font-semibold text-slate-900">Notifications</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={markAllRead}
                  className="p-1.5 text-slate-500 hover:text-orange-600"
                  title="Mark all read"
                >
                  <CheckCheck size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="flex justify-center py-8 text-slate-400">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              ) : items.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">
                  No notifications yet.
                </p>
              ) : (
                items.map((n) => (
                  <button
                    key={n._id}
                    type="button"
                    onClick={() => {
                      if (!n.isRead) markOneRead(n._id);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-slate-50 text-sm ${
                      !n.isRead ? "bg-orange-50/60" : "bg-white"
                    }`}
                  >
                    <p
                      className={`font-medium ${
                        !n.isRead ? "text-orange-700" : "text-slate-800"
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className={`mt-0.5 ${!n.isRead ? "text-slate-700" : "text-slate-500"}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
