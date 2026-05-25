export const COACH_SAMPLE_BOOKING = {
  id: "coach-sample-booking",
  serviceTitle: "Home Cleaning (Example)",
  status: "completed",
  createdAt: new Date().toISOString(),
  location: "Sample address — practice only",
  phone: "03XX-XXXXXXX",
  customerMarkedDone: false,
  workerMarkedDone: true,
  worker: {
    id: "coach-worker",
    fullName: "Sample Worker",
    phone: "03XX-XXXXXXX",
  },
  paymentMethod: "cash",
};
