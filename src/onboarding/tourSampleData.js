/** Practice booking shown only during the customer tracking tour */
export const TOUR_SAMPLE_BOOKING = {
  id: "tour-sample-booking",
  serviceTitle: "Pipe Leak Repair (Practice)",
  category: "Plumbing",
  address: "123 Sample Street, Lahore",
  location: "123 Sample Street, Lahore",
  notes: "This is a practice booking for the app tour.",
  status: "assigned",
  price: 2500,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  paymentDetails: {
    paymentMethod: "pay-after-work",
    payToSummary: "Pay after the job is completed",
  },
  customerRating: null,
  customerMarkedDone: false,
  workerMarkedDone: true,
  worker: {
    id: "tour-worker",
    fullName: "Ali Khan (Demo)",
    phoneNumber: "0300 0000000",
    emailAddress: "demo.worker@fixitnow.app",
    primaryServiceCategory: "Plumbing",
    rating: 4.8,
    totalReviews: 42,
  },
};

export const TOUR_SAMPLE_AVAILABLE_JOB = {
  id: "tour-job-available",
  serviceTitle: "Electrical Outlet Fix (Practice)",
  phone: "0301 1111111",
  address: "45 Demo Road, Karachi",
  location: "45 Demo Road, Karachi",
  price: 1800,
  status: "approved",
};

export const TOUR_SAMPLE_CLAIMED_JOB = {
  id: "tour-job-claimed",
  serviceTitle: "Electrical Outlet Fix (Practice)",
  phone: "0301 1111111",
  address: "45 Demo Road, Karachi",
  location: "45 Demo Road, Karachi",
  price: 1800,
  status: "assigned",
  assignedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  customerMarkedDone: false,
  workerMarkedDone: false,
  customerRating: null,
};
