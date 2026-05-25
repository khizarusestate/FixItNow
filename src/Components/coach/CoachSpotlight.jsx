import { useEffect, useState, useCallback } from "react";
import { lockPageScroll, unlockPageScroll } from "../../coach/scrollLock";
import { getTargetRect, getCoachAnchor } from "../../coach/placement";

function ArrowHead({ placement }) {
  const rotate =
    placement === "top"
      ? "rotate(180deg)"
      : placement === "left"
        ? "rotate(90deg)"
        : placement === "right"
          ? "rotate(-90deg)"
          : "rotate(0deg)";
  return (
    <span
      className="inline-block text-orange-500 drop-shadow-sm"
      style={{ transform: rotate }}
      aria-hidden
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
      </svg>
    </span>
  );
}

export default function CoachSpotlight({
  targetSelector,
  label,
  placement = "bottom",
  onDismiss,
  zIndex = 240,
}) {
  const [rect, setRect] = useState(null);

  const measure = useCallback(() => {
    setRect(getTargetRect(targetSelector));
  }, [targetSelector]);

  useEffect(() => {
    measure();
    lockPageScroll();
    const t = window.setTimeout(measure, 120);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      unlockPageScroll();
    };
  }, [measure]);

  const anchor = getCoachAnchor(rect, placement);
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;

  if (!rect) return null;

  const hole = {
    top: Math.max(0, rect.top),
    left: Math.max(0, rect.left),
    width: Math.min(rect.width, vw - rect.left),
    height: Math.min(rect.height, vh - rect.top),
  };

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-label="App guide"
    >
      {/* Dimmed panels with blur outside spotlight */}
      <div
        className="absolute left-0 right-0 top-0 bg-slate-900/45 backdrop-blur-[3px]"
        style={{ height: hole.top }}
        onClick={onDismiss}
      />
      <div
        className="absolute left-0 bg-slate-900/45 backdrop-blur-[3px]"
        style={{ top: hole.top, width: hole.left, height: hole.height }}
        onClick={onDismiss}
      />
      <div
        className="absolute right-0 bg-slate-900/45 backdrop-blur-[3px]"
        style={{
          top: hole.top,
          left: hole.left + hole.width,
          height: hole.height,
        }}
        onClick={onDismiss}
      />
      <div
        className="absolute left-0 right-0 bottom-0 bg-slate-900/45 backdrop-blur-[3px]"
        style={{ top: hole.top + hole.height }}
        onClick={onDismiss}
      />

      {/* Clear ring around target */}
      <div
        className="pointer-events-none absolute rounded-2xl ring-4 ring-orange-400 ring-offset-2 ring-offset-white/90 shadow-[0_0_0_9999px_rgba(15,23,42,0)]"
        style={{
          top: hole.top,
          left: hole.left,
          width: hole.width,
          height: hole.height,
          boxShadow: "0 0 0 2px rgba(249,115,22,0.85), 0 0 24px rgba(249,115,22,0.35)",
        }}
      />

      {/* Coach label at arrow head */}
      <div
        className="pointer-events-none absolute flex max-w-[min(92vw,320px)] flex-col items-center gap-1"
        style={{
          top: anchor.top,
          left: anchor.left,
          transform: anchor.transform,
        }}
      >
        <div className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3 py-2 shadow-lg">
          <ArrowHead placement={anchor.placement} />
          <p className="text-sm font-semibold text-slate-800 leading-snug">{label}</p>
        </div>
      </div>

      {/* Got it — only interactive control besides target */}
      <button
        type="button"
        onClick={onDismiss}
        className="fixed bottom-6 left-1/2 z-[241] -translate-x-1/2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-800 shadow-xl ring-2 ring-orange-400 hover:bg-orange-50 transition-colors"
      >
        Got it
      </button>
    </div>
  );
}
