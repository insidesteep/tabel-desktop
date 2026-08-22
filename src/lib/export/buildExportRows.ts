import { cellDisplay, computeRow, daysInMonth, formatRateUz, renderOrder } from "../timesheet/calc";
import { CODE_LABELS, CODE_MEANINGS, type DayCode, type Department, type OverrideCode, type TimesheetEmployee } from "../timesheet/types";
import { codeLabel, codeMeaning, exportTitleLine, translate } from "../i18n/translations";
import type { Locale } from "../../state/localeStore";

export interface ExportCell {
  text: string;
  code: DayCode | null;
}

export interface ExportRow {
  index: number;
  fullName: string;
  position: string;
  rateLabel: string;
  cells: ExportCell[];
}

export interface ExportLabels {
  num: string;
  fullName: string;
  position: string;
  rate: string;
  legendTitle: string;
  managerLabel: string;
  hrHeadLabel: string;
}

export interface ExportModel {
  titleLine: string;
  days: number[];
  weekendFlags: boolean[];
  rows: ExportRow[];
  legend: { code: DayCode; label: string; meaning: string }[];
  managerName: string;
  hrHeadName: string;
  labels: ExportLabels;
}

export interface ExportInput {
  department: Department;
  year: number;
  month: number;
  employees: TimesheetEmployee[];
  overrides: Record<string, Record<number, OverrideCode>>;
  locale: Locale;
}

export function buildExportRows(input: ExportInput): ExportModel {
  const { department, year, month, employees, overrides, locale } = input;
  const total = daysInMonth(year, month);
  const days = Array.from({ length: total }, (_, i) => i + 1);
  const weekendFlags = days.map((d) => {
    const wd = new Date(year, month - 1, d).getDay();
    return wd === 0 || wd === 6;
  });

  const ordered = renderOrder(employees);
  const manager = ordered.find((e) => e.is_manager === 1);

  const rows: ExportRow[] = ordered.map((emp, i) => {
    const overridesMap = new Map<number, OverrideCode>();
    for (const [d, c] of Object.entries(overrides[emp.id] ?? {})) overridesMap.set(Number(d), c);
    const cells = computeRow(year, month, emp.rate, overridesMap).map((cell) => ({
      text: cellDisplay(cell, locale),
      code: cell.code,
    }));
    return {
      index: i + 1,
      fullName: emp.full_name,
      position: emp.position,
      rateLabel: formatRateUz(emp.rate),
      cells,
    };
  });

  return {
    titleLine: exportTitleLine(department.name, year, month, locale),
    days,
    weekendFlags,
    rows,
    legend: (["YA", "MT", "OZH", "KV", "B"] as const).map((code) => ({
      code,
      label: codeLabel(code, locale, CODE_LABELS[code]),
      meaning: codeMeaning(code, locale, CODE_MEANINGS[code]),
    })),
    managerName: manager?.full_name ?? "",
    hrHeadName: department.hr_head_name,
    labels: {
      num: translate(locale, "export.colNum"),
      fullName: translate(locale, "export.colName"),
      position: translate(locale, "export.colPosition"),
      rate: translate(locale, "export.colRate"),
      legendTitle: translate(locale, "export.legendTitle"),
      managerLabel: translate(locale, "export.managerLabel"),
      hrHeadLabel: translate(locale, "export.hrHeadLabel"),
    },
  };
}
