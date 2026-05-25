const ALLOW_SCROLL = "[data-tour-scroll-allowed]";

function isInsideAllowedScroll(target) {
  if (!(target instanceof Node)) return false;
  return Boolean(target.closest?.(ALLOW_SCROLL));
}

/**
 * Lock page scroll while the tour runs. Restores position on cleanup.
 */
export function lockTourScroll() {
  const scrollY = window.scrollY;
  const html = document.documentElement;
  const body = document.body;

  const prev = {
    htmlOverflow: html.style.overflow,
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyWidth: body.style.width,
  };

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.width = "100%";

  const preventScroll = (e) => {
    if (isInsideAllowedScroll(e.target)) return;
    e.preventDefault();
  };

  const preventKeys = (e) => {
    const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
    if (!keys.includes(e.key)) return;
    if (isInsideAllowedScroll(e.target)) return;
    e.preventDefault();
  };

  window.addEventListener("wheel", preventScroll, { passive: false });
  window.addEventListener("touchmove", preventScroll, { passive: false });
  window.addEventListener("keydown", preventKeys, { passive: false });

  return () => {
    window.removeEventListener("wheel", preventScroll);
    window.removeEventListener("touchmove", preventScroll);
    window.removeEventListener("keydown", preventKeys);

    html.style.overflow = prev.htmlOverflow;
    body.style.overflow = prev.bodyOverflow;
    body.style.position = prev.bodyPosition;
    body.style.top = prev.bodyTop;
    body.style.width = prev.bodyWidth;
    window.scrollTo(0, scrollY);
  };
}

/** Scroll target into view (tour-controlled only, works while scroll is locked). */
export function scrollTourTargetIntoView(selector) {
  if (!selector) return;
  const el = document.querySelector(selector);
  if (!el) return;

  const body = document.body;
  const rect = el.getBoundingClientRect();
  const idealY = window.innerHeight * 0.34;
  const delta = rect.top + rect.height / 2 - idealY;

  if (Math.abs(delta) < 20) return;

  if (body.style.position === "fixed") {
    const cur = parseFloat(body.style.top) || 0;
    body.style.top = `${cur - delta}px`;
    return;
  }

  el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
}
