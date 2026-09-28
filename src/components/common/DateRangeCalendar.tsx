import { daysInMonth, isDayOff } from "../../lib/timesheet/calc";
import { CODE_COLORS } from "../../lib/timesheet/codeColors";
import { CODE_LABELS, type OverrideCode } from "../../lib/timesheet/types";
import { codeLabel, weekdayLabels } from "../../lib/i18n/translations";
import { useLocaleStore } from "../../state/localeStore";

export interface CellState {
  inRange: boolean;
  isEdge: boolean;
  code: OverrideCode | null;
}

export function DateRangeCalendar({
  year,
  month,
  onPick,
  cellState,
}: {
  year: number;
  month: number;
  onPick: (day: number) => void;
  cellState: (day: number) => CellState;
}) {
  const locale = useLocaleStore((s) => s.locale);
  const total = daysInMonth(year, month);
  const firstWeekday = new Date(year, month - 1, 1).getDay(); // 0=Sun..6=Sat
  const leadingBlanks = firstWeekday === 0 ? 6 : firstWeekday - 1; // convert to Monday-first offset

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {weekdayLabels(locale).map((w) => (
          <div key={w} className="text-center text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`b${i}`} />;
          const weekday = new Date(year, month - 1, day).getDay();
          const isSunday = isDayOff(weekday);
          const { inRange, isEdge, code } = cellState(day);
          const codeStyle = code ? CODE_COLORS[code] : null;

          const background = isEdge ? "var(--accent)" : codeStyle ? codeStyle.bg : inRange ? "var(--accent-soft)" : "transparent";
          const color = isEdge ? "white" : codeStyle ? codeStyle.fg : "var(--text)";

          return (
            <button
              key={day}
              type="button"
              disabled={isSunday}
              onClick={() => onPick(day)}
              className="relative flex h-10 w-9 flex-col items-center justify-center gap-0.5 rounded-lg text-[12px] font-medium leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-35"
              style={{ background, color }}
            >
              {day}
              {code && <span className="text-[7px] font-bold uppercase leading-none">{codeLabel(code, locale, CODE_LABELS[code])}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
