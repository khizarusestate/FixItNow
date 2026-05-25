/** @typedef {'next' | 'click' | 'modal' | 'none'} TourAdvance */

/**
 * @typedef {Object} TourStep
 * @property {string} id
 * @property {string} [target] - CSS selector
 * @property {string} title
 * @property {string} body
 * @property {TourAdvance} [advance]
 * @property {() => void} [beforeEnter]
 * @property {() => void} [afterEnter]
 */

export const CUSTOMER_BOOKING_STEPS = [
  {
    id: "booking-section",
    target: "#booking",
    title: "Book a service",
    body: "Scroll here to browse categories and pick a professional service.",
    advance: "next",
  },
  {
    id: "category-pick",
    target: "[data-tour='tour-category-first']",
    title: "Choose a category",
    body: "Tap a category — like choosing a section from a menu.",
    advance: "click",
  },
  {
    id: "service-pick",
    target: "[data-tour='tour-service-book']",
    title: "Select a service",
    body: "Tap Book on any service to continue. We will use a practice form next.",
    advance: "click",
  },
  {
    id: "practice-form",
    target: null,
    title: "Practice booking form",
    body: "Fill in the sample fields, then submit. Nothing is sent to the server.",
    advance: "modal",
  },
  {
    id: "booking-done",
    target: null,
    title: "Booking submitted",
    body: "In real use, admin approves your request, then a worker is assigned.",
    advance: "next",
  },
];

export const CUSTOMER_TRACK_STEPS = [
  {
    id: "track-intro",
    target: null,
    title: "Track your bookings",
    body: "Open My Bookings anytime to see status updates.",
    advance: "next",
  },
  {
    id: "my-bookings-btn",
    target: null,
    title: "My Bookings",
    body: "Your booking list opens here. Sign in to save real bookings — this tour uses a practice example.",
    advance: "next",
  },
  {
    id: "sample-card",
    target: "[data-tour='tour-sample-booking']",
    title: "Practice booking",
    body: "This sample shows a worker assigned to your job. Tap the card to expand it.",
    advance: "click",
  },
  {
    id: "rate-done",
    target: "[data-tour='tour-rate-done']",
    title: "Rate & mark done",
    body: "When work is finished, rate the service and tap Mark as Done. Orange tick = you, blue tick = worker.",
    advance: "next",
  },
];

export const WORKER_SIGNUP_STEPS = [
  {
    id: "join-worker",
    target: "[data-tour='join-worker-btn']",
    title: "Join as a worker",
    body: "Tap here to register and offer your services on Fix It Now.",
    advance: "click",
  },
  {
    id: "worker-signup-tab",
    target: "[data-tour='signup-worker-tab']",
    title: "Worker account",
    body: "Switch to the Worker tab and review the required fields.",
    advance: "next",
  },
  {
    id: "worker-approval",
    target: null,
    title: "Admin approval",
    body: "After signup, an admin reviews your profile. You will get a notification when approved.",
    advance: "next",
  },
];

export const WORKER_DASHBOARD_STEPS = [
  {
    id: "dashboard-open",
    target: null,
    title: "Worker dashboard",
    body: "Your dashboard shows available jobs, active work, and completed jobs.",
    advance: "next",
  },
  {
    id: "jobs-tab",
    target: "[data-tour='tour-worker-jobs-tab']",
    title: "Available jobs",
    body: "Browse jobs that match your skills and location.",
    advance: "click",
  },
  {
    id: "claim-job",
    target: "[data-tour='tour-claim-job']",
    title: "Claim a job",
    body: "Tap Claim Job to accept work. This practice job is for learning only.",
    advance: "click",
  },
  {
    id: "mark-done",
    target: "[data-tour='tour-worker-mark-done']",
    title: "Mark as done",
    body: "When you finish on site, mark the job done. The customer then rates and confirms.",
    advance: "click",
  },
];
