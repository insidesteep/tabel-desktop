import { create } from "zustand";

/** A point in the grid identified by absolute row position (0-based, in
 * visual top-to-bottom order — manager row included) and day-of-month. */
interface Point {
  rowIndex: number;
  day: number;
}

interface CellSelectionState {
  anchor: Point | null;
  cursor: Point | null;
  dragging: boolean;
  start: (rowIndex: number, day: number) => void;
  extend: (rowIndex: number, day: number) => void;
  finish: () => void;
  clear: () => void;
}

/**
 * Tracks an in-progress or just-finished rectangular cell selection —
 * employee rows × days — spanning the whole grid rather than a single row.
 * Every row's day cells report into this shared store, so dragging down
 * through several employees at the same day column selects all of them
 * (e.g. marking a public holiday for the whole department in one drag),
 * exactly like dragging sideways selects a day range for one employee.
 */
export const useCellSelectionStore = create<CellSelectionState>((set, get) => ({
  anchor: null,
  cursor: null,
  dragging: false,
  start: (rowIndex, day) => set({ anchor: { rowIndex, day }, cursor: { rowIndex, day }, dragging: true }),
  extend: (rowIndex, day) => {
    if (!get().dragging) return;
    set({ cursor: { rowIndex, day } });
  },
  finish: () => set({ dragging: false }),
  clear: () => set({ anchor: null, cursor: null, dragging: false }),
}));
