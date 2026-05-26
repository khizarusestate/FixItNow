/**
 * Client-side API error parsing (pairs with Backend/utils/apiErrors.js codes).
 */

export class ApiClientError extends Error {
  constructor(message, { code, status, details } = {}) {
    super(message);
    this.name = "ApiClientError";
    this.code = code || null;
    this.status = status || 0;
    this.details = details || {};
  }

  get refreshRecommended() {
    return Boolean(this.details?.refreshRecommended);
  }
}

const FRIENDLY_BY_CODE = {
  ACCOUNT_NOT_FOUND: "No account found for this email. Please sign up first.",
  INVALID_PASSWORD: "Incorrect password. Please try again.",
  ADMIN_NOT_FOUND: "No admin account found for this email.",
  INVALID_PIN: "Incorrect PIN. Please try again.",
  ADMIN_LOCKED: "Too many attempts. Your account is temporarily locked.",
  ADMIN_DEACTIVATED:
    "Your admin account has been deactivated. Contact the super admin.",
  WRONG_LOGIN_PORTAL:
    "This account cannot use this login portal. Try the other login option.",
  TOKEN_EXPIRED:
    "Your session has expired due to inactivity. Please sign in again.",
  INVALID_TOKEN: "Your session is invalid. Please sign in again.",
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  BOOKING_ALREADY_REJECTED:
    "This booking was already rejected by the admin. Please refresh your bookings list.",
  BOOKING_ALREADY_CANCELLED: "This booking is already cancelled.",
  BOOKING_ALREADY_COMPLETED: "This booking is already completed.",
  BOOKING_ALREADY_APPROVED:
    "This booking was approved by the admin. Refresh the page to see the latest status.",
  BOOKING_WORKER_ASSIGNED:
    "A worker is already assigned to this booking. You cannot cancel it here.",
  BOOKING_IN_PROGRESS: "This booking is already in progress.",
  BOOKING_NOT_CANCELLABLE:
    "This booking can no longer be cancelled. Please refresh your list.",
  BOOKING_NOT_COMPLETABLE:
    "This booking cannot be marked as done in its current state.",
  BOOKING_ALREADY_CLAIMED:
    "Another worker has already claimed this job. Refresh to see available jobs.",
  BOOKING_NOT_AVAILABLE: "This job is no longer available.",
  BOOKING_NOT_FOUND: "This booking was not found. It may have been removed.",
};

export function createApiClientError(data = {}, status = 0) {
  const code = data.code || null;
  const message =
    data.message ||
    (code && FRIENDLY_BY_CODE[code]) ||
    "Something went wrong. Please try again.";

  const details = { ...(data.details || {}) };
  if (data.email) {
    details.email = data.email;
  }

  return new ApiClientError(message, {
    code,
    status,
    details,
  });
}

export function isApiClientError(err) {
  return err instanceof ApiClientError;
}

export function shouldRefreshBookings(err) {
  if (!isApiClientError(err)) return false;
  if (err.refreshRecommended) return true;
  return String(err.code || "").startsWith("BOOKING_");
}
