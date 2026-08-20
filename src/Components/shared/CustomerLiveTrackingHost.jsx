import { useEffect, useState } from "react";
import { X, Radio } from "lucide-react";
import { apiRequestWithAuth } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import LiveWorkerTracking from "./LiveWorkerTracking.jsx";

const ACTIVE_STATUSES = new Set(["worker-assigned", "in-progress"]);

export default function CustomerLiveTrackingHost() {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.type !== "customer") {
      setBookings([]);
      setSelectedId(null);
      return undefined;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const response = await apiRequestWithAuth("/bookings/my", { role: "customer" });
        if (cancelled) return;
        const active = (response?.data || []).filter((booking) =>
          ACTIVE_STATUSES.has(booking.status) && booking.worker,
        );
        setBookings(active);
        setSelectedId((current) =>
          active.some((booking) => String(booking.id) === String(current))
            ? current
            : active[0]?.id || null,
        );
        if (active.length) setClosed(false);
      } catch {
        // The host is supplemental; the normal bookings UI remains usable.
      }
    };

    load();
    const interval = window.setInterval(load, 15000);
    const refresh = () => load();
    window.addEventListener("fixitnow-booking-updated", refresh);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("fixitnow-booking-updated", refresh);
    };
  }, [isAuthenticated, user?.type]);

  if (!bookings.length || !selectedId || closed) return null;

  const selected = bookings.find((booking) => String(booking.id) === String(selectedId));
  if (!selected) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[80] w-[min(92vw,430px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio size={17} className="text-emerald-600" />
          <div>
            <p className="text-sm font-bold text-slate-900">Worker live tracking</p>
            <p className="text-xs text-slate-500">Your assigned worker can be tracked live.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setClosed(true)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close live tracking"
        >
          <X size={18} />
        </button>
      </div>

      {bookings.length > 1 ? (
        <div className="border-b border-slate-200 px-4 py-2">
          <select
            value={selected.id}
            onChange={(event) => setSelectedId(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
          >
            {bookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.serviceTitle} — {booking.worker?.fullName || "Worker"}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <LiveWorkerTracking bookingId={selected.id} />
    </div>
  );
}
