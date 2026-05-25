import { useEffect, useState, useCallback } from "react";
import { ArrowDown, X } from "lucide-react";
import {
  computeCoachPlacement,
  measureTarget,
  getArrowPosition,
} from "../../onboarding/placement";

const COACH_W = 320;
const COACH_H = 260;

function TourArrow({ top, left, rotate }) {
  return (
    <div
      className="fixed z-[218] pointer-events-none"
      style={{ top, left, transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <div className="tour-arrow-bounce flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-orange-500 text-white shadow-lg shadow-orange-500/50">
        <ArrowDown size={22} strokeWidth={2.5} />
      </div>
    </div>
  );
}

/** Sharp ring around the target — no blur on top of the element */
function TargetHighlight({ rect }) {
  if (!rect) return null;
  const { top, left, width, height } = rect;
  const radius = Math.min(16, width / 4, height / 4);

  return (
    <div
      className="fixed z-[217] pointer-events-none tour-target-ring"
      style={{ top, left, width, height, borderRadius: radius }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-[inherit] border-[3px] border-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.25),0_0_20px_rgba(249,115,22,0.45)]"
        style={{ borderRadius: radius }}
      />
      <span className="absolute -top-0.5 -left-0.5 h-3 w-3 border-l-[3px] border-t-[3px] border-orange-500 rounded-tl-sm" />
      <span className="absolute -top-0.5 -right-0.5 h-3 w-3 border-r-[3px] border-t-[3px] border-orange-500 rounded-tr-sm" />
      <span className="absolute -bottom-0.5 -left-0.5 h-3 w-3 border-l-[3px] border-b-[3px] border-orange-500 rounded-bl-sm" />
      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 border-r-[3px] border-b-[3px] border-orange-500 rounded-br-sm" />
    </div>
  );
}

/** Light tint only — no backdrop-blur so the page stays readable */
function DimOverlay({ rect }) {
  const tint = "rgba(15, 23, 42, 0.28)";

  if (!rect) {
    return (
      <div
        className="fixed inset-0 z-[216] pointer-events-none transition-opacity duration-300"
        style={{ backgroundColor: tint }}
        aria-hidden
      />
    );
  }

  const { top, left, width, height } = rect;
  const pad = 6;
  const t = Math.max(0, top - pad);
  const l = Math.max(0, left - pad);
  const w = width + pad * 2;
  const h = height + pad * 2;
  const hole = `polygon(0% 0%, 0% 100%, ${l}px 100%, ${l}px ${t}px, ${l + w}px ${t}px, ${l + w}px ${t + h}px, ${l}px ${t + h}px, ${l}px 100%, 100% 100%, 100% 0%)`;

  return (
    <div className="fixed inset-0 z-[216] pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          backgroundColor: tint,
          clipPath: hole,
          WebkitClipPath: hole,
        }}
      />
    </div>
  );
}

export default function TourGuideLayer({
  targetSelector,
  stepIndex,
  totalSteps,
  title,
  body,
  onNext,
  onSkip,
  nextLabel = "Next",
}) {
  const [targetRect, setTargetRect] = useState(null);
  const [placement, setPlacement] = useState(() =>
    computeCoachPlacement(null),
  );
  const [arrowPos, setArrowPos] = useState(null);

  const remeasure = useCallback(() => {
    const rect = measureTarget(targetSelector, 12);
    setTargetRect(rect);
    const next = computeCoachPlacement(rect);
    setPlacement(next);
    const coachW = Math.min(COACH_W, window.innerWidth - 24);
    setArrowPos(getArrowPosition(next, next.style, rect, coachW, COACH_H));
  }, [targetSelector]);

  useEffect(() => {
    remeasure();
    const t1 = window.setTimeout(remeasure, 100);
    const t2 = window.setTimeout(remeasure, 400);
    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", remeasure, true);
    const el = targetSelector ? document.querySelector(targetSelector) : null;
    const ro =
      el && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(remeasure)
        : null;
    ro?.observe(el);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", remeasure, true);
      ro?.disconnect();
    };
  }, [targetSelector, remeasure, stepIndex, title]);

  const { style: coachStyle } = placement;

  return (
    <>
      <DimOverlay rect={targetRect} />
      <TargetHighlight rect={targetRect} />
      {arrowPos && targetRect && <TourArrow {...arrowPos} />}
      <div
        className="fixed z-[220] animate-slideUp pointer-events-auto"
        style={{
          top: coachStyle.top,
          left: coachStyle.left,
          width: Math.min(COACH_W, window.innerWidth - 24),
          maxWidth: "calc(100vw - 24px)",
        }}
        role="dialog"
        aria-labelledby="tour-coach-title"
      >
        <div className="rounded-2xl border border-orange-100 bg-white shadow-2xl p-5 max-h-[min(70vh,280px)] overflow-y-auto">
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
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60"
              aria-label="Skip tour"
            >
              <X size={18} />
            </button>
          </div>
          <h3 id="tour-coach-title" className="text-lg font-bold text-slate-900">
            {title}
          </h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{body}</p>
          {targetRect && (
            <p className="mt-2 text-xs font-medium text-orange-600">
              Follow the highlighted area
            </p>
          )}
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
              className="ml-auto px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/25"
            >
              {nextLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
