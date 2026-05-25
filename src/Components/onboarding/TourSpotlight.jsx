import { useEffect, useState, useCallback } from "react";

export default function TourSpotlight({ targetSelector, padding = 8, zIndex = 200 }) {
  const [rect, setRect] = useState(null);

  const measure = useCallback(() => {
    if (!targetSelector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(targetSelector);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({
      top: r.top - padding,
      left: r.left - padding,
      width: r.width + padding * 2,
      height: r.height + padding * 2,
    });
  }, [targetSelector, padding]);

  useEffect(() => {
    measure();
    const t = window.setTimeout(measure, 120);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;
    const el = targetSelector ? document.querySelector(targetSelector) : null;
    if (el && observer) observer.observe(el);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      observer?.disconnect();
    };
  }, [measure, targetSelector]);

  if (!rect) return null;

  const { top, left, width, height } = rect;
  const hole = `polygon(0% 0%, 0% 100%, ${left}px 100%, ${left}px ${top}px, ${left + width}px ${top}px, ${left + width}px ${top + height}px, ${left}px ${top + height}px, ${left}px 100%, 100% 100%, 100% 0%)`;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex }}
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-slate-900/65 transition-all duration-300"
        style={{ clipPath: hole, WebkitClipPath: hole }}
      />
      <div
        className="absolute rounded-xl ring-2 ring-orange-400 ring-offset-2 ring-offset-transparent pointer-events-none"
        style={{
          top,
          left,
          width,
          height,
          boxShadow: "0 0 0 2px rgba(249,115,22,0.9), 0 0 24px rgba(249,115,22,0.35)",
        }}
      />
    </div>
  );
}
