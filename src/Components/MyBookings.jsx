import { useState, useEffect } from "react";
import {
  X,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  UserCheck,
  Phone,
  Mail,
  Wrench,
  Star,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { bookingService, apiRequestWithAuth } from "../services/api";
import { shouldRefreshBookings } from "../utils/apiError";
import CompletionTicks from "./CompletionTicks";
import { TOUR_SAMPLE_BOOKING } from "../onboarding/tourSampleData";

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Pending",
    priority: 1,
  },
  approved: {
    icon: CheckCircle,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    label: "Approved",
    priority: 2,
  },
  assigned: {
    icon: UserCheck,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    label: "Worker Assigned",
    priority: 0,
  },
  "in-progress": {
    icon: Loader2,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    label: "In Progress",
    priority: 0,
  },
  completed: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Done",
    priority: 3,
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Rejected",
    priority: 4,
  },
  cancelled: {
    icon: XCircle,
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
    label: "Cancelled",
    priority: 4,
  },
};

export default function MyBookings({ isOpen, onClose, tourMode = false }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const [completing, setCompleting] = useState(null);
  const [ratings, setRatings] = useState({});
  const [hoveredStar, setHoveredStar] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [statusNotice, setStatusNotice] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (tourMode) {
      setBookings([TOUR_SAMPLE_BOOKING]);
      setLoading(false);
      setError("");
      return;
    }
    fetchBookings();
  }, [isOpen, tourMode]);

  useEffect(() => {
    if (!isOpen || !tourMode) return;
    const expand = () => setExpandedId(TOUR_SAMPLE_BOOKING.id);
    window.addEventListener("fixitnow-tour-expand-sample", expand);
    setExpandedId(TOUR_SAMPLE_BOOKING.id);
    return () =>
      window.removeEventListener("fixitnow-tour-expand-sample", expand);
  }, [isOpen, tourMode]);

  useEffect(() => {
    if (!isOpen) return;
    const onBookingUpdated = (event) => {
      const detail = event.detail || {};
      if (detail.message) {
        setStatusNotice(detail.message);
      }
      fetchBookings();
    };
    window.addEventListener("fixitnow-booking-updated", onBookingUpdated);
    return () =>
      window.removeEventListener("fixitnow-booking-updated", onBookingUpdated);
  }, [isOpen]);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await bookingService.getMyBookings();
      const sorted = (res.data || []).sort((a, b) => {
        const aPriority = STATUS_CONFIG[a.status]?.priority ?? 99;
        const bPriority = STATUS_CONFIG[b.status]?.priority ?? 99;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setBookings(sorted);
    } catch (err) {
      setError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    setCancelling(id);
    setError("");
    try {
      await bookingService.cancelBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      setStatusNotice("Booking cancelled successfully.");
    } catch (err) {
      if (shouldRefreshBookings(err)) {
        await fetchBookings();
      }
      setError(err.message || "Failed to cancel booking.");
    } finally {
      setCancelling(null);
    }
  };

  const handleMarkDone = async (id) => {
    const rating = ratings[id];
    if (!rating) {
      setError("Please select a rating before marking as done.");
      return;
    }
    if (tourMode && id === TOUR_SAMPLE_BOOKING.id) {
      setBookings([
        {
          ...TOUR_SAMPLE_BOOKING,
          customerMarkedDone: true,
          customerRating: rating,
          status: "completed",
        },
      ]);
      setStatusNotice("Practice complete! In real bookings, both you and the worker must confirm.");
      setRatings((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }
    setCompleting(id);
    try {
      const payload = await apiRequestWithAuth(`/bookings/${id}/complete`, {
        method: "POST",
        body: JSON.stringify({ rating }),
      });
      const data = payload?.data || {};
      setBookings((prev) => {
        const updated = prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: data.status || b.status,
                customerRating: rating,
                customerMarkedDone: true,
                workerMarkedDone: Boolean(data.workerMarkedDone),
              }
            : b,
        );
        return updated.sort((a, b) => {
          const aPriority = STATUS_CONFIG[a.status]?.priority ?? 99;
          const bPriority = STATUS_CONFIG[b.status]?.priority ?? 99;
          if (aPriority !== bPriority) return aPriority - bPriority;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      });
      setStatusNotice(
        payload?.message ||
          (data.finalized
            ? "Booking fully completed."
            : "Marked done — waiting for worker confirmation."),
      );
      setRatings((prev) => {
        const newRatings = { ...prev };
        delete newRatings[id];
        return newRatings;
      });
      setExpandedId(null);
    } catch (err) {
      if (shouldRefreshBookings(err)) {
        await fetchBookings();
      }
      setError(err.message || "Failed to mark booking as done.");
    } finally {
      setCompleting(null);
    }
  };

  const handleRatingClick = (bookingId, rating) => {
    setRatings((prev) => ({ ...prev, [bookingId]: rating }));
  };

  const handleStarHover = (bookingId, star) => {
    setHoveredStar((prev) => ({ ...prev, [bookingId]: star }));
  };

  const handleStarLeave = (bookingId) => {
    setHoveredStar((prev) => {
      const newHovered = { ...prev };
      delete newHovered[bookingId];
      return newHovered;
    });
  };

  if (!isOpen) return null;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const formatDateTime = (d) =>
    new Date(d).toLocaleString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getApprovedTimestamp = (booking) => {
    const approvedEvent = (booking.timeline || []).find(
      (entry) => entry.status === "approved",
    );
    return approvedEvent?.timestamp || booking.updatedAt || null;
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center px-4 ${tourMode ? "z-[205]" : "z-[70]"}`}>
      <button
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <div
        data-tour={tourMode ? "tour-my-bookings-panel" : undefined}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-[fadeScale_0.2s_ease-out]"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              My Bookings
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Your Service Requests
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto p-6"
          data-tour-scroll-allowed={tourMode ? true : undefined}
        >
          {tourMode && (
            <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
              <strong>Practice mode.</strong> This sample booking shows how to track status, rate a worker, and mark a job done.
            </div>
          )}
          {statusNotice && !error && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              {statusNotice}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2
                size={40}
                className="animate-spin text-orange-500 mb-4"
              />
              <p className="text-sm text-slate-500">Loading your bookings...</p>
            </div>
          ) : error && bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle size={40} className="text-red-400 mb-4" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchBookings}
                className="mt-4 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ClipboardList size={48} className="text-slate-300 mb-4" />
              <p className="text-lg font-semibold text-slate-600">
                No bookings yet
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Book a service and it will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => {
                const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                const canCancel = b.status === "pending";
                const canMarkDone =
                  Boolean(b.worker) &&
                  ["assigned", "in-progress"].includes(b.status) &&
                  !b.customerMarkedDone;
                const waitingWorker =
                  b.customerMarkedDone &&
                  !b.workerMarkedDone &&
                  b.status !== "completed";
                const isExpanded = expandedId === b.id;

                return (
                  <div
                    key={b.id}
                    data-tour={
                      tourMode && b.id === TOUR_SAMPLE_BOOKING.id
                        ? "tour-sample-booking"
                        : undefined
                    }
                    className={`rounded-xl border-2 transition-all ${cfg.border} ${cfg.bg} overflow-hidden`}
                  >
                    {/* Main Card Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-white/50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : b.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Service Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.color} bg-white border-2 ${cfg.border}`}
                            >
                              <Icon
                                size={14}
                                className={
                                  b.status === "in-progress"
                                    ? "animate-spin"
                                    : ""
                                }
                              />
                              {cfg.label}
                              <CompletionTicks
                                customerMarkedDone={b.customerMarkedDone}
                                workerMarkedDone={b.workerMarkedDone}
                              />
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              {formatDate(b.createdAt)}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-slate-900 truncate">
                            {b.serviceTitle}
                          </h3>
                          {b.category && (
                            <p className="text-xs text-slate-600 font-medium mt-1">
                              {b.category}
                            </p>
                          )}
                          {getApprovedTimestamp(b) &&
                            b.status !== "pending" && (
                              <p className="text-xs text-slate-500 mt-1">
                                Approved on{" "}
                                {formatDateTime(getApprovedTimestamp(b))}
                              </p>
                            )}
                          <p className="text-sm text-slate-700 mt-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                            {b.location || b.address || "N/A"}
                          </p>
                        </div>

                        {/* Right: Status Badge & Expand Button */}
                        <div className="flex flex-col items-end gap-2">
                          {b.worker && (
                            <div className="text-right">
                              <p className="text-xs text-slate-500 font-medium">
                                Worker Assigned
                              </p>
                              <p className="text-sm font-bold text-slate-900">
                                {b.worker.fullName}
                              </p>
                            </div>
                          )}
                          <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                            {isExpanded ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="border-t-2 border-inherit bg-white/50 px-4 py-4 space-y-4">
                        {/* Notes Section */}
                        {b.notes && (
                          <div className="rounded-lg bg-white p-3 border border-slate-200">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                              Notes
                            </p>
                            <p className="text-sm text-slate-700 italic">
                              "{b.notes}"
                            </p>
                          </div>
                        )}

                        {b.paymentDetails?.paymentMethod && (
                          <div className="rounded-lg bg-white p-3 border border-slate-200">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                              Payment
                            </p>
                            <p className="text-sm text-slate-800 capitalize">
                              {String(b.paymentDetails.paymentMethod).replace(
                                /-/g,
                                " ",
                              )}
                            </p>
                            {b.paymentDetails.payToSummary && (
                              <p className="text-xs text-slate-500 mt-1">
                                {b.paymentDetails.payToSummary}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Worker Details Section */}
                        {b.worker && (
                          <div className="rounded-lg bg-white p-4 border-2 border-purple-200">
                            <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                              <UserCheck
                                size={14}
                                className="text-purple-600"
                              />{" "}
                              Assigned Worker Details
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                                  Name
                                </p>
                                <p className="text-slate-900 font-bold mt-0.5">
                                  {b.worker.fullName}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                                  Category
                                </p>
                                <p className="text-slate-900 font-bold mt-0.5">
                                  {b.worker.primaryServiceCategory || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-600 font-medium uppercase tracking-wide flex items-center gap-1">
                                  <Phone size={12} /> Phone
                                </p>
                                <p className="text-slate-900 font-bold mt-0.5">
                                  {b.worker.phoneNumber || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-600 font-medium uppercase tracking-wide flex items-center gap-1">
                                  <Star
                                    size={12}
                                    className="fill-amber-400 text-amber-400"
                                  />{" "}
                                  Rating
                                </p>
                                <p className="text-slate-900 font-bold mt-0.5">
                                  {b.worker.rating?.toFixed(1) || "0.0"}{" "}
                                  <span className="text-slate-500 font-normal">
                                    ({b.worker.totalReviews || 0} reviews)
                                  </span>
                                </p>
                              </div>
                              <div className="sm:col-span-2">
                                <p className="text-xs text-slate-600 font-medium uppercase tracking-wide flex items-center gap-1">
                                  <Mail size={12} /> Email
                                </p>
                                <p className="text-slate-900 font-bold mt-0.5 break-all">
                                  {b.worker.emailAddress || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {waitingWorker && (
                          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
                            You marked this job done. Waiting for the worker to
                            confirm (blue tick).
                          </div>
                        )}

                        {b.workerMarkedDone && !b.customerMarkedDone && (
                          <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-900">
                            Worker marked done. Please rate and tap Mark as Done
                            to confirm.
                          </div>
                        )}

                        {/* Rating Section */}
                        {canMarkDone && (
                          <div
                            data-tour={tourMode ? "tour-rate-done" : undefined}
                            className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 p-4 border-2 border-emerald-200"
                          >
                            <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
                              Rate this service
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => {
                                  const isFilled =
                                    star <=
                                    (hoveredStar[b.id] || ratings[b.id] || 0);
                                  return (
                                    <button
                                      key={star}
                                      onClick={() =>
                                        handleRatingClick(b.id, star)
                                      }
                                      onMouseEnter={() =>
                                        handleStarHover(b.id, star)
                                      }
                                      onMouseLeave={() => handleStarLeave(b.id)}
                                      className="transition-transform hover:scale-110"
                                      disabled={completing === b.id}
                                    >
                                      <Star
                                        size={24}
                                        className={
                                          isFilled
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-slate-300"
                                        }
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                              {ratings[b.id] && (
                                <span className="text-sm font-bold text-slate-700 ml-3">
                                  ({ratings[b.id]}/5)
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2 border-t border-slate-200">
                          {canMarkDone && (
                            <button
                              onClick={() => handleMarkDone(b.id)}
                              disabled={completing === b.id || !ratings[b.id]}
                              className="flex-1 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all px-4 py-3 rounded-lg shadow-md hover:shadow-lg"
                            >
                              {completing === b.id
                                ? "Saving..."
                                : "✓ Mark as Done (with rating)"}
                            </button>
                          )}
                          {canCancel && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={cancelling === b.id}
                              className="flex-1 text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all px-4 py-3 rounded-lg shadow-md hover:shadow-lg"
                            >
                              {cancelling === b.id
                                ? "Cancelling..."
                                : "✕ Cancel Booking"}
                            </button>
                          )}
                          {!canMarkDone && !canCancel && (
                            <div className="flex-1 py-3 px-4 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg text-center">
                              No action available
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
