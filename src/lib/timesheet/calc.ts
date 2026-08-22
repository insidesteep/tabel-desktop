import type { DayCell, DayCode, OverrideCode, Rate, TimesheetEmployee } from "./types";
import { codeLabel } from "../i18n/translations";
import type { Locale } from "../../state/localeStore";

const RATE_LABELS: Record<Rate, string> = {
  1: "1,0",
  0.75: "0,75",
  0.5: "0,5",
  0.25: "0,25",
};

export function formatRateUz(rate: number): string {
  return RATE_LABELS[rate as Rate] ?? rate.toString().replace(".", ",");
}

export function formatHoursUz(hours: number): string {
  const rounded = Math.round(hours * 100) / 100;
  return rounded.toString().replace(".", ",");
}

export function daysInMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate();
}

/**
 * Full weekday hours = 7 * rate. Saturday is reduced by 2 * rate (matches the
 * real template exactly: rate 1.0 -> 7/5, rate 0.5 -> 3.5/2.5).
 */
export function computeCell(
  year: number,
  month1to12: number,
  day: number,
  rate: number,
  overrideCode: OverrideCode | undefined,
): DayCell {
  const weekday = new Date(year, month1to12 - 1, day).getDay(); // 0=Sun..6=Sat
  if (weekday === 0) {
    // Sunday is always "Ya", regardless of any stored override.
    return { day, isWeekend: true, hours: null, code: "YA" };
  }
  if (overrideCode) {
    return { day, isWeekend: weekday === 6, hours: null, code: overrideCode };
  }
  const hours = weekday === 6 ? (7 - 2) * rate : 7 * rate;
  return { day, isWeekend: weekday === 6, hours, code: null };
}

export function computeRow(
  year: number,
  month: number,
  rate: number,
  overridesByDay: Map<number, OverrideCode>,
): DayCell[] {
  const total = daysInMonth(year, month);
  const cells: DayCell[] = [];
  for (let day = 1; day <= total; day++) {
    cells.push(computeCell(year, month, day, rate, overridesByDay.get(day)));
  }
  return cells;
}

/** Total worked hours for the month (codes contribute 0). */
export function sumHours(cells: DayCell[]): number {
  return cells.reduce((sum, c) => sum + (c.hours ?? 0), 0);
}

export function cellDisplay(cell: DayCell, locale: Locale): string {
  if (cell.code) return codeLabel(cell.code, locale, cellCodeLabelUz(cell.code));
  return formatHoursUz(cell.hours ?? 0);
}

function cellCodeLabelUz(code: DayCode): string {
  switch (code) {
    case "YA":
      return "Ya";
    case "MT":
      return "M/T";
    case "OZH":
      return "O'z/h";
    case "KV":
      return "K/v";
    case "B":
      return "B";
  }
}

/** Manager always first; everyone else in manual sort_order. */
export function renderOrder(employees: TimesheetEmployee[]): TimesheetEmployee[] {
  const manager = employees.find((e) => e.is_manager);
  const rest = employees
    .filter((e) => !e.is_manager)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  return manager ? [manager, ...rest] : rest;
}
