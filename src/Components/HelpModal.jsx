import { useState } from "react";
import {
  X,
  User,
  Briefcase,
  CalendarCheck,
  ClipboardList,
  Star,
  Wrench,
  CheckCircle,
} from "lucide-react";

const CUSTOMER_SECTIONS = [
  {
    icon: CalendarCheck,
    title: "Book a service",
    body: "Scroll to the booking section, choose a category, pick a service, and submit your details. You can pay online (EasyPaisa / JazzCash), hand-to-hand, or select pay after work when available.",
  },
  {
    icon: ClipboardList,
    title: "My Bookings",
    body: "Open My Bookings from the header to see every request. Statuses include Pending (awaiting admin), Approved, Worker Assigned, In Progress, and Done.",
  },
  {
    icon: Star,
    title: "Rate & mark done",
    body: "When the worker finishes, open the booking, give a star rating, and tap Mark as Done. Both you and the worker must confirm — orange tick is you, blue tick is the worker — before the job is fully complete.",
  },
  {
    icon: User,
    title: "Account",
    body: "Sign up or log in to save bookings and track them on any device. Guest bookings are possible, but you need an account to manage them in My Bookings.",
  },
];

const WORKER_SECTIONS = [
  {
    icon: Wrench,
    title: "Join as a worker",
    body: "Tap Join as Worker on the home page or sign up with the Worker tab. Add your trade, location, and CNIC. An admin reviews your profile before you can claim real jobs.",
  },
  {
    icon: Briefcase,
    title: "Dashboard & jobs",
    body: "Open Dashboard in the header. Available Jobs lists work near you — tap Claim Job to accept. My Jobs shows work you have accepted.",
  },
  {
    icon: CheckCircle,
    title: "Mark as done",
    body: "When you finish on site, open the job in My Jobs and tap Mark as Done. The customer will then rate the service and confirm on their side.",
  },
  {
    icon: Star,
    title: "Ratings",
    body: "Customer ratings build your reputation. Complete jobs on time and communicate clearly to earn better reviews.",
  },
];

function HelpTab({ sections }) {
  return (
    <div className="space-y-4">
      {sections.map(({ icon: Icon, title, body }) => (
        <div
          key={title}
          className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <Icon size={20} />
          </span>
          <div>
            <h4 className="font-bold text-slate-900">{title}</h4>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">{body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HelpModal({ isOpen, onClose }) {
  const [tab, setTab] = useState("customer");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close help"
      />
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl animate-scaleIn">
        <div className="flex items-start justify-between border-b border-slate-200 p-5 shrink-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
              Help
            </p>
            <h2 className="mt-0.5 text-xl font-bold text-slate-900">
              How Fix It Now works
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-200 px-5 shrink-0">
          <button
            type="button"
            onClick={() => setTab("customer")}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
              tab === "customer"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <User size={16} />
            Customer
          </button>
          <button
            type="button"
            onClick={() => setTab("worker")}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
              tab === "worker"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Briefcase size={16} />
            Worker
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {tab === "customer" ? (
            <HelpTab sections={CUSTOMER_SECTIONS} />
          ) : (
            <HelpTab sections={WORKER_SECTIONS} />
          )}
        </div>

        <div className="border-t border-slate-200 p-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
