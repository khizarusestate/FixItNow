/**
 * Map socket / API notification payloads to live panel actions (bell inbox unchanged).
 */
export function resolveCustomerLiveNotification(detail, userType) {
  const title = detail?.title || "Notification";
  const message = detail?.message || "";
  const link = String(detail?.link || "");
  const type = String(detail?.type || "");
  const titleLower = title.toLowerCase();
  const messageLower = message.toLowerCase();

  if (detail?.kind === "session-expiring") {
    return {
      title,
      message,
      actions: [],
      dismissOnly: true,
    };
  }

  const actions = [];

  const isWorker = userType === "worker";
  const isCustomer = userType === "customer";

  const isJob =
    type === "job" ||
    titleLower.includes("job assigned") ||
    titleLower.includes("new job") ||
    detail?.booking;

  const isBooking =
    link === "#booking" ||
    titleLower.includes("booking") ||
    messageLower.includes("booking");

  const isAd =
    link === "#advertise" || titleLower.includes("advertisement");

  const adNeedsDismissOnly =
    isAd &&
    (titleLower.includes("approved") ||
      titleLower.includes("rejected") ||
      detail?.dismissOnly);

  if (isWorker && (isJob || titleLower.includes("assigned"))) {
    actions.push({
      label: "Open Dashboard",
      event: "open-worker-dashboard",
    });
  }

  if (isWorker && titleLower.includes("approved") && !actions.length) {
    actions.push({
      label: "Open Dashboard",
      event: "open-worker-dashboard",
    });
  }

  if (isCustomer && isBooking && !isAd) {
    actions.push({
      label: "See My Bookings",
      event: "open-my-bookings",
    });
  }

  if (isCustomer && isAd && !adNeedsDismissOnly) {
    actions.push({
      label: "View Advertisement",
      event: "scroll-advertise",
    });
  }

  const dismissOnly =
    detail?.dismissOnly === true ||
    adNeedsDismissOnly ||
    actions.length === 0;

  return { title, message, actions, dismissOnly };
}

export function runCustomerLiveAction(event) {
  switch (event) {
    case "open-worker-dashboard":
      window.dispatchEvent(new CustomEvent("open-worker-dashboard"));
      break;
    case "open-my-bookings":
      window.dispatchEvent(new CustomEvent("open-my-bookings"));
      break;
    case "scroll-advertise": {
      const el = document.getElementById("advertise");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      break;
    }
    case "open-notifications":
      window.dispatchEvent(new CustomEvent("fixitnow-open-notifications"));
      break;
    default:
      break;
  }
}
