/** @typedef {'next' | 'click' | 'modal' | 'none'} TourAdvance */

/**
 * @typedef {Object} TourStep
 * @property {string} id
 * @property {string} [target] - CSS selector
 * @property {string} title
 * @property {string} body
 * @property {TourAdvance} [advance]
 */

/** Short overview only — no forced booking during the tour */
export const CUSTOMER_STEPS = [
  {
    id: "booking-overview",
    target: "#booking",
    title: "Where you book services",
    body: "When you are ready, pick a category, choose a service, and submit your details here. You do not need to book anything during this tour.",
    advance: "next",
  },
  {
    id: "my-bookings-header",
    target: "[data-tour='my-bookings-btn']",
    title: "My Bookings",
    body: "After you book, use My Bookings in the header to see every request and its status. Sign in to save and track real bookings.",
    advance: "next",
  },
  {
    id: "bookings-list",
    target: "[data-tour='tour-my-bookings-panel']",
    title: "Your booking list",
    body: "Each card shows the service, worker (when assigned), and status — for example Pending, Approved, Assigned, or Done.",
    advance: "next",
  },
  {
    id: "sample-status",
    target: "[data-tour='tour-sample-booking']",
    title: "Track status",
    body: "Open a booking to see details. Orange and blue ticks show when you and the worker have both confirmed the job is finished.",
    advance: "next",
  },
  {
    id: "rate-done",
    target: "[data-tour='tour-rate-done']",
    title: "Rate & mark done",
    body: "When work is complete, choose a star rating and tap Mark as Done. Rating is required — it helps other customers and improves worker quality.",
    advance: "next",
  },
];

export const WORKER_SIGNUP_STEPS = [
  {
    id: "join-worker",
    target: "[data-tour='join-worker-btn']",
    title: "Join as a worker",
    body: "Register here when you want to offer services. You do not need to sign up during this tour — tap Next to continue.",
    advance: "next",
  },
  {
    id: "worker-signup-tab",
    target: "[data-tour='signup-worker-tab']",
    title: "Worker account",
    body: "The Worker tab asks for your trade, location, and CNIC. Fields are shown for reference only in this tour.",
    advance: "next",
  },
  {
    id: "worker-approval",
    target: null,
    title: "Admin approval",
    body: "After signup, an admin reviews your profile. You will get a notification when you are approved.",
    advance: "next",
  },
];

export const WORKER_DASHBOARD_STEPS = [
  {
    id: "dashboard-open",
    target: null,
    title: "Worker dashboard",
    body: "Your dashboard lists available jobs, active work, and completed jobs. We will open a practice view next.",
    advance: "next",
  },
  {
    id: "jobs-tab",
    target: "[data-tour='tour-worker-jobs-tab']",
    title: "Available jobs",
    body: "Browse jobs that match your skills. In real use, tap Claim Job to accept work.",
    advance: "next",
  },
  {
    id: "claim-job",
    target: "[data-tour='tour-claim-job']",
    title: "Claim a job",
    body: "Claiming assigns the job to you. This sample is for learning only.",
    advance: "next",
  },
  {
    id: "mark-done",
    target: "[data-tour='tour-worker-mark-done']",
    title: "Mark as done",
    body: "When you finish on site, mark the job done. The customer then rates and confirms completion.",
    advance: "next",
  },
];
