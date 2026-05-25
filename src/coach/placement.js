const PAD = 12;
const GAP = 14;

export function getTargetRect(selector) {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
    bottom: r.bottom + PAD,
    right: r.right + PAD,
    centerX: r.left + r.width / 2,
    centerY: r.top + r.height / 2,
  };
}

export function getCoachAnchor(rect, placement = "bottom") {
  if (!rect) return { top: "50%", left: "50%", placement: "bottom" };

  switch (placement) {
    case "top":
      return {
        top: rect.top - GAP,
        left: rect.centerX,
        placement: "top",
        transform: "translate(-50%, -100%)",
      };
    case "left":
      return {
        top: rect.centerY,
        left: rect.left - GAP,
        placement: "left",
        transform: "translate(-100%, -50%)",
      };
    case "right":
      return {
        top: rect.centerY,
        left: rect.right + GAP,
        placement: "right",
        transform: "translate(0, -50%)",
      };
    default:
      return {
        top: rect.bottom + GAP,
        left: rect.centerX,
        placement: "bottom",
        transform: "translate(-50%, 0)",
      };
  }
}
