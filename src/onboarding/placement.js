const COACH_W = 320;
const COACH_H = 260;
const MARGIN = 12;
const GAP = 18;

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

/**
 * Pick the largest free area for the coach panel relative to the highlighted target.
 * @returns {{ style: { top: number, left: number }, placement: string, arrow: 'up'|'down'|'left'|'right'|null, targetRect: object|null }}
 */
export function computeCoachPlacement(targetRect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cw = Math.min(COACH_W, vw - MARGIN * 2);
  const ch = Math.min(COACH_H, vh - MARGIN * 2);

  if (!targetRect) {
    return {
      style: {
        top: clamp(vh * 0.12, MARGIN, vh - ch - MARGIN),
        left: clamp((vw - cw) / 2, MARGIN, vw - cw - MARGIN),
      },
      placement: "center",
      arrow: null,
      targetRect: null,
    };
  }

  const { top, left, width, height } = targetRect;
  const right = left + width;
  const bottom = top + height;
  const tcx = left + width / 2;
  const tcy = top + height / 2;

  const candidates = [];

  const spaceTop = top - MARGIN;
  const spaceBottom = vh - bottom - MARGIN;
  const spaceLeft = left - MARGIN;
  const spaceRight = vw - right - MARGIN;

  if (spaceTop >= ch * 0.55) {
    candidates.push({
      score: spaceTop * vw,
      placement: "top",
      style: {
        top: clamp(top - ch - GAP, MARGIN, vh - ch - MARGIN),
        left: clamp(tcx - cw / 2, MARGIN, vw - cw - MARGIN),
      },
      arrow: "down",
    });
  }

  if (spaceBottom >= ch * 0.55) {
    candidates.push({
      score: spaceBottom * vw * 0.45,
      placement: "bottom",
      style: {
        top: clamp(bottom + GAP, MARGIN, vh - ch - MARGIN),
        left: clamp(tcx - cw / 2, MARGIN, vw - cw - MARGIN),
      },
      arrow: "up",
    });
  }

  if (spaceLeft >= cw * 0.9) {
    candidates.push({
      score: spaceLeft * vh,
      placement: "left",
      style: {
        top: clamp(tcy - ch / 2, MARGIN, vh - ch - MARGIN),
        left: clamp(left - cw - GAP, MARGIN, vw - cw - MARGIN),
      },
      arrow: "right",
    });
  }

  if (spaceRight >= cw * 0.9) {
    candidates.push({
      score: spaceRight * vh * 1.05,
      placement: "right",
      style: {
        top: clamp(tcy - ch / 2, MARGIN, vh - ch - MARGIN),
        left: clamp(right + GAP, MARGIN, vw - cw - MARGIN),
      },
      arrow: "left",
    });
  }

  if (candidates.length === 0) {
    const quadrants = [
      {
        score: (vw - right) * (vh - bottom),
        style: { top: MARGIN, left: clamp(right + GAP, MARGIN, vw - cw - MARGIN) },
        placement: "top-right",
        arrow: "left",
      },
      {
        score: left * (vh - bottom),
        style: { top: MARGIN, left: MARGIN },
        placement: "top-left",
        arrow: "right",
      },
      {
        score: (vw - right) * top,
        style: { top: clamp(bottom + GAP, MARGIN, vh - ch - MARGIN), left: clamp(right + GAP, MARGIN, vw - cw - MARGIN) },
        placement: "bottom-right",
        arrow: "up",
      },
      {
        score: left * top,
        style: { top: clamp(bottom + GAP, MARGIN, vh - ch - MARGIN), left: MARGIN },
        placement: "bottom-left",
        arrow: "up",
      },
    ];
    quadrants.sort((a, b) => b.score - a.score);
    return { ...quadrants[0], targetRect };
  }

  candidates.sort((a, b) => b.score - a.score);
  return { ...candidates[0], targetRect };
}

/** @returns {{ top: number, left: number, width: number, height: number } | null} */
export function measureTarget(selector, padding = 10) {
  if (!selector) return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - padding,
    left: r.left - padding,
    width: r.width + padding * 2,
    height: r.height + padding * 2,
  };
}

export function getArrowPosition(placement, coachStyle, targetRect, coachW, coachH) {
  if (!targetRect || !placement.arrow) return null;

  const tcx = targetRect.left + targetRect.width / 2;
  const tcy = targetRect.top + targetRect.height / 2;
  const coachBottom = coachStyle.top + coachH;
  const coachRight = coachStyle.left + coachW;

  switch (placement.arrow) {
    case "down":
      return {
        top: coachBottom + 8,
        left: tcx - 18,
        rotate: 0,
      };
    case "up":
      return {
        top: targetRect.top - 40,
        left: tcx - 18,
        rotate: 180,
      };
    case "right":
      return {
        top: tcy - 18,
        left: coachRight + 8,
        rotate: 90,
      };
    case "left":
      return {
        top: tcy - 18,
        left: coachStyle.left - 40,
        rotate: -90,
      };
    default:
      return null;
  }
}
