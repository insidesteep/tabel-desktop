let canvas: HTMLCanvasElement | null = null;

/** Pixel width of `text` rendered in `font` (a CSS font shorthand string).
 * Used to size the sticky Ф.И.О./Должность columns to their actual content
 * instead of a fixed guess — sticky positioning still needs a single known
 * width per column, so this computes one from the widest current value. */
export function measureTextWidth(text: string, font: string): number {
  if (!canvas) canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = font;
  return ctx.measureText(text).width;
}

export function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
