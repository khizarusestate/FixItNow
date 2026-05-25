import { X } from "lucide-react";

/**
 * Fixed left sidebar so the coach never covers highlighted buttons.
 */
export default function TourCoachCard({
  stepIndex,
  totalSteps,
  title,
  body,
  onNext,
  onSkip,
  nextLabel = "Next",
}) {
  return (
    <div
      className="fixed left-3 right-3 sm:left-4 sm:right-auto sm:top-1/2 sm:-translate-y-1/2 sm:max-w-[340px] bottom-4 sm:bottom-auto z-[220] animate-slideUp pointer-events-auto"
      role="dialog"
      aria-labelledby="tour-coach-title"
    >
      <div className="rounded-2xl border border-orange-200 bg-white shadow-2xl p-5 max-h-[min(70vh,520px)] overflow-y-auto">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex
                    ? "w-6 bg-orange-500"
                    : i < stepIndex
                      ? "w-1.5 bg-orange-300"
                      : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {stepIndex + 1} / {totalSteps}
          </span>
          <button
            type="button"
            onClick={onSkip}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Skip tour"
          >
            <X size={18} />
          </button>
        </div>
        <h3 id="tour-coach-title" className="text-lg font-bold text-slate-900">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{body}</p>
        <p className="mt-3 text-xs text-slate-500">
          Use Next to continue — nothing is submitted unless you choose to.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Skip tour
          </button>
          <button
            type="button"
            onClick={onNext}
            className="ml-auto px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
