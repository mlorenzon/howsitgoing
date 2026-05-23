// Pure animation helpers — ported verbatim from animations.jsx

export const Easing = {
  linear: (t: number): number => t,

  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => { const u = t - 1; return u * u * u + 1; },
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  easeOutQuad: (t: number): number => t * (2 - t),
  easeInQuad: (t: number): number => t * t,

  easeOutBack: (t: number): number => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: (t: number): number => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
};

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

export function phase(
  t: number,
  start: number,
  end: number,
  ease: (t: number) => number = Easing.easeOutCubic,
): number {
  if (t <= start) return 0;
  if (t >= end) return 1;
  return ease((t - start) / (end - start));
}

export function entryExit(
  localTime: number,
  sceneDuration: number,
  entryDur = 0.45,
  exitDur = 0.45,
): { opacity: number; slide: number } {
  const exitStart = sceneDuration - exitDur;
  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    return { opacity: t, slide: (1 - t) * 24 };
  }
  if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    return { opacity: 1 - t, slide: -t * 12 };
  }
  return { opacity: 1, slide: 0 };
}
