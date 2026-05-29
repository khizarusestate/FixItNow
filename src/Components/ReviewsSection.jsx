import { useState, useEffect, useCallback } from "react";
import {
  Star,
  MessageSquare,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { resolveUploadMediaUrl } from "../utils/mediaUrl.js";
import { appReviewService } from "../services/api.js";
import TermsAgreement from "./shared/TermsAgreement.jsx";

const REVIEWS_PER_PAGE = 3;

export default function ReviewsSection() {
  const { user, isAuthenticated } = useAuth();
  const modal = useModal();
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const fetchPendingReviews = useCallback(async () => {
    if (!isAuthenticated) {
      setPendingReviews([]);
      return;
    }
    try {
      const data = await appReviewService.getMy();
      setPendingReviews((data.data || []).filter((r) => r.status === "pending"));
    } catch {
      setPendingReviews([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPendingReviews();
  }, [fetchPendingReviews]);

  useEffect(() => {
    const onReviewStatus = () => {
      fetchPendingReviews();
      fetchReviews();
    };
    window.addEventListener("fixitnow-review-status-update", onReviewStatus);
    return () =>
      window.removeEventListener("fixitnow-review-status-update", onReviewStatus);
  }, [fetchPendingReviews]);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await appReviewService.getActive();
      setReviews(data.data || []);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      setError("Please login to submit a review.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a comment for your review.");
      return;
    }

    if (!termsAgreed) {
      setError("Please agree to the terms and conditions.");
      return;
    }

    setLoading(true);

    try {
      await appReviewService.submit({
        rating,
        comment: comment.trim(),
      });

      setSuccess(true);
      setComment("");
      setRating(5);
      fetchReviews();
      fetchPendingReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setError("");
    setSuccess(false);
    setComment("");
    setRating(5);
    setTermsAgreed(false);
  };

  const openReviewModal = () => {
    if (!isAuthenticated) {
      modal?.openModal?.("login");
      return;
    }
    setShowModal(true);
  };

  const renderStars = (value, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={interactive ? 28 : 16}
        className={`${
          i < (interactive ? hoverRating || rating : value)
            ? "fill-yellow-400 text-yellow-400"
            : "text-slate-300"
        } ${interactive ? "cursor-pointer transition-all hover:scale-110" : ""}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(i + 1) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
      />
    ));
  };

  const indexOfLastReview = currentPage * REVIEWS_PER_PAGE;
  const indexOfFirstReview = indexOfLastReview - REVIEWS_PER_PAGE;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE));

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === star).length / reviews.length) *
          100
        : 0,
  }));

  return (
    <>
      <section
        id="reviews"
        className="bg-gradient-to-br from-slate-50 via-white to-orange-50/30 px-5 py-16 sm:py-20"
      >
        <style>{`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scaleIn { animation: scaleIn 0.35s ease-out both; }
          .review-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
          .review-card:hover { transform: translateY(-4px); }
        `}</style>

        <div className="mx-auto max-w-7xl">
          {pendingReviews.length > 0 && (
            <div className="mb-8 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-orange-50/90 px-4 py-3 shadow-sm ring-1 ring-amber-100/80">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <AlertTriangle size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-amber-900">
                      {pendingReviews.length} review{pendingReviews.length > 1 ? "s" : ""} awaiting moderation
                    </p>
                    <p className="mt-0.5 text-xs text-amber-800/90">
                      Approved reviews appear below once the team publishes them.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Customer Reviews
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-slate-600">
              Real feedback from customers who booked through Fix It Now.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl">
                <h3 className="mb-4 text-lg font-bold">Ratings overview</h3>

                <div className="mb-6 flex items-center gap-4">
                  <div className="text-5xl font-bold">{averageRating}</div>
                  <div>
                    <div className="mb-1 flex gap-1">
                      {renderStars(Math.round(Number(averageRating)))}
                    </div>
                    <p className="text-sm text-slate-300">
                      {reviews.length} reviews
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {ratingDistribution.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-8 text-sm">{star}★</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-sm text-slate-300">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={openReviewModal}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-yellow-300"
                >
                  <Star size={18} className="fill-slate-900" />
                  Write a Review
                </button>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-slate-900">
                  Recent reviews
                </h3>
                {reviews.length > REVIEWS_PER_PAGE && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-slate-200 p-2 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm text-slate-600">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-slate-200 p-2 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={32} className="animate-spin text-slate-400" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
                  <MessageSquare
                    size={48}
                    className="mx-auto mb-3 text-slate-300"
                  />
                  <p className="font-medium text-slate-500">No reviews yet</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Be the first to review our app!
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {currentReviews.map((review, idx) => (
                    <div
                      key={review.id || review._id || idx}
                      className="review-card animate-scaleIn flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-orange-200 hover:shadow-lg"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <div className="mb-4 flex items-start gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-orange-100 bg-gradient-to-br from-slate-100 to-slate-200">
                          {review.submitterProfilePicture ? (
                            <img
                              src={resolveUploadMediaUrl(
                                review.submitterProfilePicture,
                              )}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-600">
                              {review.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-semibold text-slate-900">
                            {review.name}
                          </h4>
                          <div className="mt-1 flex flex-wrap gap-0.5">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-slate-600">
                        {review.comment}
                      </p>
                      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <Star size={20} className="text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Rate Our App
                  </h3>
                  <p className="text-xs text-slate-500">Share your experience</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {success ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">
                    Review Submitted!
                  </h4>
                  <p className="mt-2 text-slate-600">
                    Thank you for your feedback. Your review will be reviewed by
                    our team.
                  </p>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-900"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Your profile
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Name
                        </label>
                        <input
                          type="text"
                          value={user?.fullName || ""}
                          disabled
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:bg-slate-100"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-500">
                            Email
                          </label>
                          <input
                            type="email"
                            value={user?.email || user?.emailAddress || ""}
                            disabled
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:bg-slate-100"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-500">
                            Phone
                          </label>
                          <input
                            type="text"
                            value={user?.phone || user?.phoneNumber || ""}
                            disabled
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:bg-slate-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Rating
                    </label>
                    <div className="flex gap-2">{renderStars(rating, true)}</div>
                    <p className="mt-1 text-sm text-slate-500">
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very Good"}
                      {rating === 5 && "Excellent"}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-900">
                      Your review
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with Fix It Now..."
                      rows={4}
                      maxLength={500}
                      className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">
                      {comment.length}/500
                    </p>
                  </div>

                  <TermsAgreement
                    checked={termsAgreed}
                    onChange={(v) => {
                      setTermsAgreed(v);
                      setError("");
                    }}
                  />

                  {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <AlertTriangle
                        size={16}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !termsAgreed}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg transition-all hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Star size={18} className="fill-slate-900" />
                        Submit Review
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
