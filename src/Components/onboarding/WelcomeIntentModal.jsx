import { Wrench, CalendarCheck, Compass, X } from "lucide-react";

export default function WelcomeIntentModal({
  onSelectCustomer,
  onSelectWorker,
  onBrowseOnly,
  onDismissPermanent,
}) {
  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl p-6 sm:p-8 animate-scaleIn"
        role="dialog"
        aria-labelledby="welcome-tour-title"
      >
        <button
          type="button"
          onClick={onBrowseOnly}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
          Welcome
        </p>
        <h2
          id="welcome-tour-title"
          className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900"
        >
          What brings you to Fix It Now?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          A short guided tour — tap Next to learn the basics. No booking required.
        </p>
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={onSelectCustomer}
            className="w-full flex items-start gap-4 rounded-2xl border-2 border-orange-200 bg-orange-50/50 p-4 text-left hover:border-orange-400 hover:shadow-md transition-all"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
              <CalendarCheck size={24} />
            </span>
            <span>
              <span className="block font-bold text-slate-900">
                I want to book a service
              </span>
              <span className="block text-sm text-slate-600 mt-0.5">
                Quick overview: where to book, how to use My Bookings, and how to rate when done.
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={onSelectWorker}
            className="w-full flex items-start gap-4 rounded-2xl border-2 border-slate-200 p-4 text-left hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md transition-all"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Wrench size={24} />
            </span>
            <span>
              <span className="block font-bold text-slate-900">
                I am looking for work
              </span>
              <span className="block text-sm text-slate-600 mt-0.5">
                Learn signup, job claims, and completing jobs.
              </span>
            </span>
          </button>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBrowseOnly}
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <Compass size={16} />
            Just browsing
          </button>
          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) onDismissPermanent();
              }}
              className="rounded border-slate-300 text-orange-500 focus:ring-orange-400"
            />
            Don&apos;t show again
          </label>
        </div>
      </div>
    </div>
  );
}
