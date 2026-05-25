/** @typedef {'next' | 'click' | 'modal' | 'none'} TourAdvance */

/**
 * @typedef {Object} TourStep
 * @property {string} id
 * @property {string} [target]
 * @property {string} title
 * @property {string} body
 * @property {TourAdvance} [advance]
 */

export const CUSTOMER_STEPS = [
  {
    id: "booking-overview",
    target: "#booking",
    title: "Book a home service",
    body: "Browse categories, pick a service, and send your request. Admin reviews it, then a verified worker is assigned. No need to book during this tour — just learn the layout.",
    advance: "next",
  },
  {
    id: "my-bookings-header",
    target: "[data-tour='my-bookings-btn']",
    title: "My Bookings — your control center",
    body: "Every request lives here: Pending, Approved, Assigned, and Done. Sign in to save real bookings; guests can still follow this practice example.",
    advance: "next",
  },
  {
    id: "bookings-list",
    target: "[data-tour='tour-my-bookings-panel']",
    title: "Your booking list",
    body: "Each card shows the service name, price, worker (when assigned), and live status. Tap a card to expand details and take action.",
    advance: "next",
  },
  {
    id: "sample-status",
    target: "[data-tour='tour-sample-booking']",
    title: "Track progress",
    body: "Statuses update as admin and workers move the job forward. Orange tick = you confirmed done; blue tick = worker confirmed — both are needed to fully complete a job.",
    advance: "next",
  },
  {
    id: "rate-done",
    target: "[data-tour='tour-rate-done']",
    title: "Rate & mark done (required)",
    body: "When work is finished, pick a star rating, then tap Mark as Done. Ratings are required — they help other customers choose well and keep workers accountable.",
    advance: "next",
  },
];

export const WORKER_SIGNUP_STEPS = [
  {
    id: "join-worker",
    target: "[data-tour='join-worker-btn']",
    title: "Join as a worker",
    body: "Offer your trade on Fix It Now and get job requests near you. You do not need to register during this tour — tap Next to continue.",
    advance: "next",
  },
  {
    id: "worker-signup-tab",
    target: "[data-tour='signup-worker-tab']",
    title: "Worker profile",
    body: "Add your trade, service area on the map, CNIC, and contact details. Accurate info helps admin approve you faster.",
    advance: "next",
  },
  {
    id: "worker-approval",
    target: null,
    title: "Admin approval",
    body: "After signup, an admin reviews your profile. You will receive a notification when you are approved and can claim real jobs.",
    advance: "next",
  },
];

export const WORKER_DASHBOARD_STEPS = [
  {
    id: "dashboard-open",
    target: null,
    title: "Worker dashboard",
    body: "See available jobs, your active work, and completed jobs in one place. We will open a practice view next.",
    advance: "next",
  },
  {
    id: "jobs-tab",
    target: "[data-tour='tour-worker-jobs-tab']",
    title: "Available jobs",
    body: "Jobs are sorted for your area and skills. In real use, tap Claim Job to accept — only claim what you can finish on time.",
    advance: "next",
  },
  {
    id: "claim-job",
    target: "[data-tour='tour-claim-job']",
    title: "Claim a job",
    body: "Claiming assigns the job to you and shares customer contact details. This sample job is for learning only.",
    advance: "next",
  },
  {
    id: "mark-done",
    target: "[data-tour='tour-worker-mark-done']",
    title: "Mark as done",
    body: "When you finish on site, mark the job done on your side. The customer then rates and confirms — then the job is fully complete.",
    advance: "next",
  },
];

export const CUSTOMER_CHECKLIST = [
  "Browse services and submit a booking when you are ready",
  "Track status anytime in My Bookings",
  "Rate the worker and tap Mark as Done when work is finished",
];

export const WORKER_CHECKLIST = [
  "Complete worker signup and wait for admin approval",
  "Claim jobs from Available Jobs in your dashboard",
  "Mark jobs done on site, then let the customer rate and confirm",
];
