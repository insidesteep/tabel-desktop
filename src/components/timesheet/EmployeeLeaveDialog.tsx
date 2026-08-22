import { useEffect, useMemo, useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { DateRangeCalendar, type CellState } from "../common/DateRangeCalendar";
import { CODE_LABELS, CODE_MEANINGS, OVERRIDE_CODES, type OverrideCode } from "../../lib/timesheet/types";
import { CODE_COLORS } from "../../lib/timesheet/codeColors";
import { daysInMonth } from "../../lib/timesheet/calc";
import * as timesheetsRepo from "../../lib/db/timesheets.repo";
import * as employeesRepo from "../../lib/db/employees.repo";
import * as overridesRepo from "../../lib/db/overrides.repo";
import { reportError } from "../../state/toastStore";
import { useT } from "../../lib/i18n/t";
import { codeLabel, codeMeaning, monthName } from "../../lib/i18n/translations";
import { useLocaleStore } from "../../state/localeStore";

interface Point {
  offset: 0 | 1; // 0 = this month, 1 = next month (may not exist yet)
  day: number;
}

function idx(p: Point): number {
  return p.offset * 1000 + p.day;
}

function nextMonthOf(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

export function EmployeeLeaveDialog({
  open,
  onOpenChange,
  departmentId,
  employeeName,
  year,
  month,
  overrides,
  onSetRange,
  onClearRange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  employeeName: string;
  year: number;
  month: number;
  overrides: Record<number, OverrideCode>;
  onSetRange: (days: number[], code: OverrideCode) => void;
  onClearRange: (days: number[]) => void;
}) {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const { year: nextYear, month: nextMonth } = nextMonthOf(year, month);

  const [code, setCode] = useState<OverrideCode>("MT");
  const [start, setStart] = useState<Point | null>(null);
  const [end, setEnd] = useState<Point | null>(null);
  const [awaitingEnd, setAwaitingEnd] = useState(false);

  // Read-only preview of what's already marked next month (if that month
  // happens to exist already) — we never create it just to peek.
  const [nextOverrides, setNextOverrides] = useState<Record<number, OverrideCode>>({});
  const [nextExists, setNextExists] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const ts = await timesheetsRepo.findMonth(departmentId, nextYear, nextMonth);
      if (!ts || cancelled) {
        if (!cancelled) setNextExists(false);
        return;
      }
      setNextExists(true);
      const employees = await employeesRepo.listEmployees(ts.id);
      const match = employees.find((e) => e.full_name.trim().toLowerCase() === employeeName.trim().toLowerCase());
      if (!match || cancelled) return;
      const rows = await overridesRepo.listOverridesForTimesheet(ts.id);
      const map: Record<number, OverrideCode> = {};
      for (const o of rows) if (o.timesheet_employee_id === match.id) map[o.day] = o.code;
      if (!cancelled) setNextOverrides(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, departmentId, nextYear, nextMonth, employeeName]);

  function resetSelection() {
    setStart(null);
    setEnd(null);
    setAwaitingEnd(false);
  }

  function pick(offset: 0 | 1, day: number) {
    const point: Point = { offset, day };
    if (!awaitingEnd) {
      setStart(point);
      setEnd(point);
      setAwaitingEnd(true);
    } else {
      setEnd(point);
      setAwaitingEnd(false);
    }
  }

  const split = useMemo(() => {
    if (!start || !end) return { current: [] as number[], next: [] as number[] };
    const lo = Math.min(idx(start), idx(end));
    const hi = Math.max(idx(start), idx(end));
    const current: number[] = [];
    const next: number[] = [];
    for (let i = lo; i <= hi; i++) {
      const offset: 0 | 1 = i >= 1000 ? 1 : 0;
      const day = offset === 1 ? i - 1000 : i;
      const y = offset === 0 ? year : nextYear;
      const m = offset === 0 ? month : nextMonth;
      if (day < 1 || day > daysInMonth(y, m)) continue;
      const weekday = new Date(y, m - 1, day).getDay();
      if (weekday === 0) continue;
      (offset === 0 ? current : next).push(day);
    }
    return { current, next };
  }, [start, end, year, month, nextYear, nextMonth]);

  function cellStateFor(offset: 0 | 1, dayOverrides: Record<number, OverrideCode>) {
    return (day: number): CellState => {
      const p = idx({ offset, day });
      const inRange = start !== null && end !== null && p >= Math.min(idx(start), idx(end)) && p <= Math.max(idx(start), idx(end));
      const isEdge = (start?.offset === offset && start.day === day) || (end?.offset === offset && end.day === day);
      return { inRange, isEdge, code: dayOverrides[day] ?? null };
    };
  }

  /** Writes to next month, silently creating it (seeded once from the
   * current roster, same as any brand-new month) if it doesn't exist yet.
   * No tab, no ongoing mirroring — it just quietly holds the data until
   * real time reaches it. Freely editable from here for as long as next
   * month hasn't actually started; once it has, this whole dialog (living
   * on what is now a locked, past month) is no longer reachable anyway. */
  async function writeNextMonth(days: number[], applyCode: OverrideCode | null) {
    if (days.length === 0) return;
    try {
      const ts = await timesheetsRepo.ensureMonth(departmentId, nextYear, nextMonth);
      const employees = await employeesRepo.listEmployees(ts.id);
      const match = employees.find((e) => e.full_name.trim().toLowerCase() === employeeName.trim().toLowerCase());
      if (!match) {
        reportError(
          t("leave.notMarkedError"),
          new Error(t("leave.notMarkedErrorDetail", { name: employeeName, month: monthName(nextMonth, locale) })),
        );
        return;
      }
      if (applyCode) await overridesRepo.setOverrideRange(match.id, days, applyCode);
      else await overridesRepo.clearOverrideRange(match.id, days);
      setNextExists(true);
      setNextOverrides((prev) => {
        const next = { ...prev };
        for (const day of days) {
          if (applyCode) next[day] = applyCode;
          else delete next[day];
        }
        return next;
      });
    } catch (err) {
      reportError(t("leave.saveNextMonthError"), err);
    }
  }

  function apply() {
    if (split.current.length === 0 && split.next.length === 0) return;
    if (split.current.length) onSetRange(split.current, code);
    void writeNextMonth(split.next, code);
    resetSelection();
    onOpenChange(false);
  }

  function clearSelectedRange() {
    if (split.current.length === 0 && split.next.length === 0) return;
    if (split.current.length) onClearRange(split.current);
    void writeNextMonth(split.next, null);
    resetSelection();
  }

  const daysOfSelectedType = useMemo(() => {
    const current = Object.entries(overrides)
      .filter(([, c]) => c === code)
      .map(([d]) => Number(d));
    const next = Object.entries(nextOverrides)
      .filter(([, c]) => c === code)
      .map(([d]) => Number(d));
    return { current, next };
  }, [overrides, nextOverrides, code]);

  function clearAllOfType() {
    if (daysOfSelectedType.current.length) onClearRange(daysOfSelectedType.current);
    if (daysOfSelectedType.next.length) void writeNextMonth(daysOfSelectedType.next, null);
  }

  const chips = useMemo(() => {
    const rows: { day: number; code: OverrideCode; offset: 0 | 1 }[] = [
      ...Object.entries(overrides).map(([d, c]) => ({ day: Number(d), code: c, offset: 0 as const })),
      ...Object.entries(nextOverrides).map(([d, c]) => ({ day: Number(d), code: c, offset: 1 as const })),
    ];
    return rows.sort((a, b) => idx({ offset: a.offset, day: a.day }) - idx({ offset: b.offset, day: b.day }));
  }, [overrides, nextOverrides]);

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) resetSelection();
        onOpenChange(o);
      }}
      title={t("leave.title", { name: employeeName })}
      width={640}
    >
      <div className="flex flex-col gap-3">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {t("leave.dayType")}
            </label>
            <button
              type="button"
              onClick={clearAllOfType}
              disabled={daysOfSelectedType.current.length === 0 && daysOfSelectedType.next.length === 0}
              className="text-[11px] font-medium underline-offset-2 disabled:opacity-30 disabled:no-underline hover:underline"
              style={{ color: "var(--danger)" }}
            >
              {t("leave.clearAllOfType", {
                label: codeLabel(code, locale, CODE_LABELS[code]),
                count: daysOfSelectedType.current.length + daysOfSelectedType.next.length,
              })}
            </button>
          </div>
          <div
            className="inline-flex w-full items-center gap-1 rounded-lg p-0.5"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            {OVERRIDE_CODES.filter((c) => c !== "B").map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCode(c)}
                title={codeMeaning(c, locale, CODE_MEANINGS[c])}
                className="flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors"
                style={{ background: code === c ? "var(--accent)" : "transparent", color: code === c ? "white" : "var(--text-muted)" }}
              >
                {codeLabel(c, locale, CODE_LABELS[c])}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {awaitingEnd ? t("leave.chooseEndDay") : t("leave.chooseStartDay")}
            {t("leave.rangeSuffix")}
          </label>
          <div className="flex gap-5">
            <div className="flex-1">
              <div className="mb-1 text-center text-[11px] font-semibold" style={{ color: "var(--text)" }}>
                {monthName(month, locale)} {year}
              </div>
              <DateRangeCalendar year={year} month={month} onPick={(d) => pick(0, d)} cellState={cellStateFor(0, overrides)} />
            </div>
            <div className="flex-1">
              <div className="mb-1 text-center text-[11px] font-semibold" style={{ color: "var(--text)" }}>
                {monthName(nextMonth, locale)} {nextYear}
                {!nextExists && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>{t("leave.notArrivedYet")}</span>}
              </div>
              <DateRangeCalendar
                year={nextYear}
                month={nextMonth}
                onPick={(d) => pick(1, d)}
                cellState={cellStateFor(1, nextOverrides)}
              />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {OVERRIDE_CODES.filter((c) => c !== "B").map((c) => (
              <span key={c} className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: CODE_COLORS[c].bg }} />
                {codeLabel(c, locale, CODE_LABELS[c])} — {codeMeaning(c, locale, CODE_MEANINGS[c])}
              </span>
            ))}
          </div>
        </div>

        {chips.length > 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {t("leave.alreadyMarked")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <span
                  key={`${chip.offset}-${chip.day}`}
                  className="flex items-center gap-1 rounded-full py-1 pl-2.5 pr-1.5 text-[11px] font-medium"
                  style={{ background: "var(--surface-2)", color: "var(--text)" }}
                >
                  {chip.offset === 1 ? `${monthName(nextMonth, locale).slice(0, 3)} ` : ""}
                  {chip.day} · {codeLabel(chip.code, locale, CODE_LABELS[chip.code])}
                  <button
                    type="button"
                    onClick={() =>
                      chip.offset === 0 ? onClearRange([chip.day]) : void writeNextMonth([chip.day], null)
                    }
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-full"
                    style={{ color: "var(--text-muted)" }}
                    aria-label={t("leave.remove")}
                  >
                    <svg width="8" height="8" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-1 flex justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={clearSelectedRange} disabled={!start || !end}>
            {t("leave.clearPeriod")}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="primary" size="sm" onClick={apply} disabled={!start || !end}>
              {t("leave.apply")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
