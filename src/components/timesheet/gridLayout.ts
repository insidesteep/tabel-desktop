export const COL = {
  num: 40,
  rate: 72,
  day: 36,
  actions: 76,
};

export const LEFT = {
  num: 0,
  name: COL.num,
};

// Ф.И.О./Должность are sized to their actual content (see measureText.ts),
// clamped between these bounds so an empty/very short value doesn't collapse
// the column and a very long one doesn't eat the whole page.
export const NAME_COL_MIN = 90;
export const NAME_COL_MAX = 320;
export const POSITION_COL_MIN = 80;
export const POSITION_COL_MAX = 260;
// Room for the input's own horizontal padding plus a little breathing space,
// added on top of the measured text width.
export const COL_TEXT_PADDING = 28;

export interface DynamicLayout {
  nameWidth: number;
  positionWidth: number;
  leftPosition: number;
  leftRate: number;
  daysStart: number;
}

/** Sticky columns need a single known left-offset per column, so the
 * measured Ф.И.О./Должность widths (same for every row) are turned into
 * concrete offsets here once, then handed down to the header and each row. */
export function computeDynamicLayout(nameWidth: number, positionWidth: number): DynamicLayout {
  const leftPosition = LEFT.name + nameWidth;
  const leftRate = leftPosition + positionWidth;
  return {
    nameWidth,
    positionWidth,
    leftPosition,
    leftRate,
    daysStart: leftRate + COL.rate,
  };
}

// Pixel heights of TimesheetGridHeader (h-9) and each EmployeeRow (h-10) —
// used to position the shared cross-row selection toolbar without needing
// a DOM measurement (every row is a fixed height, so simple arithmetic works).
export const HEADER_HEIGHT = 36;
export const ROW_HEIGHT = 40;

// Marks the boundary between the sticky meta columns (№/Ф.И.О./Должность/
// Ставка) and the horizontally-scrolling day columns — without it the two
// visually merge as soon as you scroll, since both share the same row
// background. Matches the border already used on the sticky actions column.
export const STICKY_EDGE_BORDER = "1px solid var(--border-strong)";
export const STICKY_EDGE_SHADOW = "3px 0 6px -3px rgba(0, 0, 0, 0.18)";
