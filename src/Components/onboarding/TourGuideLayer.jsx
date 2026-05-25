import { useEffect, useState, useCallback } from "react";
import { ArrowDown, X } from "lucide-react";
import {
  computeCoachPlacement,
  measureTarget,
  getArrowPosition,
} from "../../onboarding/placement";
import {
  lockTourScroll,
  scrollTourTargetIntoView,
} from "../../onboarding/tourScrollLock";

const COACH_W = 320;
const COACH_H = 260;
const FOCUS_PAD = 10;

const BLUR_PANEL =
  "fixed z-[216] bg-slate-900/50 backdrop-blur-md pointer-events-auto transition-all duration-300";

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
        className="absolute inset-0 rounded-[inherit] border-[3px] border-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.3),0_0_24px_rgba(249,115,22,0.5)]"
        style={{ borderRadius: radius }}
      />
    </div>
  );
}

/**
 * Four blurred panels around the focus hole — only the hole stays sharp.
 */
function FocusMask({ rect }) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;

  if (!rect) {
    return <div className={`inset-0 ${BLUR_PANEL}`} aria-hidden />;
  }

  const t = Math.max(0, rect.top - FOCUS_PAD);
  const l = Math.max(0, rect.left - FOCUS_PAD);
  const r = Math.min(vw, rect.left + rect.width + FOCUS_PAD);
  const b = Math.min(vh, rect.top + rect.height + FOCUS_PAD);
  const holeH = Math.max(0, b - t);

  return (
    <>
      {t > 0 && (
        <div className={BLUR_PANEL} style={{ top: 0, left: 0, right: 0, height: t }} />
      )}
      {b < vh && (
        <div
          className={BLUR_PANEL}
          style={{ top: b, left: 0, right: 0, bottom: 0 }}
        />
      )}
      {l > 0 && holeH > 0 && (
        <div className={BLUR_PANEL} style={{ top: t, left: 0, width: l, height: holeH }} />
      )}
      {r < vw && holeH > 0 && (
        <div
          className={BLUR_PANEL}
          style={{ top: t, left: r, right: 0, height: holeH }}
        />
      )}
    </>
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

  useEffect(() => {
    return lockTourScroll();
  }, []);

  const remeasure = useCallback(() => {
    const rect = measureTarget(targetSelector, FOCUS_PAD);
    setTargetRect(rect);
    const next = computeCoachPlacement(rect);
    setPlacement(next);
    const coachW = Math.min(COACH_W, window.innerWidth - 24);
    setArrowPos(getArrowPosition(next, next.style, rect, coachW, COACH_H));
  }, [targetSelector]);

  useEffect(() => {
    if (targetSelector) {
      scrollTourTargetIntoView(targetSelector);
    }
    const t0 = window.setTimeout(remeasure, 80);
    const t1 = window.setTimeout(remeasure, 350);
    const t2 = window.setTimeout(remeasure, 700);
    window.addEventListener("resize", remeasure);
    const el = targetSelector ? document.querySelector(targetSelector) : null;
    const ro =
      el && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(remeasure)
        : null;
    ro?.observe(el);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", remeasure);
      ro?.disconnect();
    };
  }, [targetSelector, remeasure, stepIndex, title]);

  const { style: coachStyle } = placement;

  return (
    <>
      <FocusMask rect={targetRect} />
      <TargetHighlight rect={targetRect} />
      {arrowPos && targetRect && <TourArrow {...arrowPos} />}
      <div
        data-tour-coach
        data-tour-scroll-allowed
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
          <p className="mt-2 text-xs text-slate-500">
            Only the highlighted area is in focus. Use <strong>Next</strong> to
            continue — page scroll is paused during the tour.
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
