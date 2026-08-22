// Twip-based column proportions, verified against the real government
// template's word/document.xml. Shared by docxExport.ts and PrintTimesheet.tsx
// so both lay the table out identically instead of drifting apart.
export const META_WIDTHS = { num: 279, name: 1134, position: 1134, rate: 709 };
export const DAY_BASE_WIDTH = 425;

/** 10 of the day columns are 1 twip wider than the rest so the row sums to
 * an exact, evenly-distributed total — a Word "distribute columns evenly"
 * artifact, imperceptible either way. */
export function dayColumnWidths(count: number): number[] {
  const widths = new Array(count).fill(DAY_BASE_WIDTH);
  const bump = Math.min(10, count);
  for (let i = count - bump; i < count; i++) widths[i] += 1;
  return widths;
}
