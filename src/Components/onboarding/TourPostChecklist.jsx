import { X, CheckCircle2 } from "lucide-react";
import { dismissPostTourChecklist } from "../../onboarding/storage";

export default function TourPostChecklist({ path, items, onClose }) {
  const title =
    path === "worker" ? "You are ready to earn" : "You are ready to book";

  const handleDismiss = () => {
    dismissPostTourChecklist(path);
    onClose();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-[225] pointer-events-auto animate-slideUp">
      <div className="rounded-2xl border border-emerald-200 bg-white shadow-2xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
        <h3 className="mt-3 text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">Quick recap:</p>
        <ul className="mt-3 space-y-2">
          {items.map((line) => (
            <li
              key={line}
              className="flex items-start gap-2 text-sm text-slate-700"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
              {line}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleDismiss}
          className="mt-4 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
