import { motion } from "framer-motion";
import type { DayCell as DayCellData } from "../../lib/timesheet/types";
import { cellDisplay } from "../../lib/timesheet/calc";
import { CODE_COLORS } from "../../lib/timesheet/codeColors";
import { useLocaleStore } from "../../state/localeStore";

export function DayCell({
  cell,
  selected,
  onSelectStart,
  onSelectEnter,
}: {
  cell: DayCellData;
  selected: boolean;
  onSelectStart: (day: number) => void;
  onSelectEnter: (day: number) => void;
}) {
  const locale = useLocaleStore((s) => s.locale);
  const codeStyle = cell.code ? CODE_COLORS[cell.code] : null;
  const isSunday = cell.code === "YA";

  return (
    <div
      onMouseDown={() => {
        if (!isSunday) onSelectStart(cell.day);
      }}
      onMouseEnter={() => onSelectEnter(cell.day)}
      className="relative flex h-10 w-9 shrink-0 select-none items-center justify-center border-r text-[12px] font-bold last:border-r-0"
      style={{
        borderColor: "var(--border)",
        background: selected ? "var(--accent-soft)" : codeStyle ? codeStyle.bg : "transparent",
        color: selected ? "var(--text)" : codeStyle ? codeStyle.fg : "var(--text)",
        cursor: isSunday ? "default" : "pointer",
      }}
    >
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 0 1.5px var(--accent)" }}
        />
      )}
      <span>{cellDisplay(cell, locale)}</span>
    </div>
  );
}
