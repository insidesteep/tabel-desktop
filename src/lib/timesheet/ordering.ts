import type { TimesheetEmployee } from "./types";

const GAP = 1024;

/**
 * sort_order for a brand-new employee, inserted alphabetically among the
 * current (non-manager) roster. Uses gap-spaced integers so most inserts
 * and drags never need to renumber existing rows.
 */
export function nextAlphabeticalOrder(existing: TimesheetEmployee[], fullName: string): number {
  const rest = existing
    .filter((e) => !e.is_manager)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  const name = fullName.trim().toLowerCase();
  const after = rest.find((e) => e.full_name.trim().toLowerCase() > name);

  if (!after) {
    const last = rest[rest.length - 1];
    return (last?.sort_order ?? 0) + GAP;
  }
  const idx = rest.indexOf(after);
  const before = rest[idx - 1];
  const lower = before?.sort_order ?? 0;
  const upper = after.sort_order;
  return lower + (upper - lower) / 2;
}

/**
 * New sort_order for an employee dropped at `newIndex` within `orderedRest`
 * (the current, already-sorted, non-manager list, in its post-drag order,
 * excluding the moved item itself is NOT required here — pass the full
 * list-with-item-in-new-slot and this returns what that slot's order should be).
 */
export function reorderedValue(orderedRest: TimesheetEmployee[], newIndex: number): number {
  const before = orderedRest[newIndex - 1];
  const after = orderedRest[newIndex + 1];
  const lower = before?.sort_order ?? 0;
  const upper = after?.sort_order ?? lower + GAP * 2;
  if (after === undefined) return lower + GAP;
  return lower + (upper - lower) / 2;
}

/** Fallback full renumber, used only if gaps are ever exhausted. */
export function renumber(orderedRest: TimesheetEmployee[]): { id: string; sort_order: number }[] {
  return orderedRest.map((e, i) => ({ id: e.id, sort_order: (i + 1) * GAP }));
}
