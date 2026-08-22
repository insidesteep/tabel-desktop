import type { ReactNode } from "react";
import { daysInMonth } from "../../lib/timesheet/calc";
import { COL, LEFT, STICKY_EDGE_BORDER, STICKY_EDGE_SHADOW, type DynamicLayout } from "./gridLayout";
import { CODE_COLORS } from "../../lib/timesheet/codeColors";
import { useT } from "../../lib/i18n/t";

export function TimesheetGridHeader({ year, month, layout }: { year: number; month: number; layout: DynamicLayout }) {
  const t = useT();
  const total = daysInMonth(year, month);
  const days = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="sticky top-0 z-20 flex" style={{ borderBottom: "2px solid var(--accent)" }}>
      <HeadCell left={LEFT.num} width={COL.num}>
        {t("grid.colNum")}
      </HeadCell>
      <HeadCell left={LEFT.name} width={layout.nameWidth} align="left">
        {t("grid.colName")}
      </HeadCell>
      <HeadCell left={layout.leftPosition} width={layout.positionWidth} align="left">
        {t("grid.colPosition")}
      </HeadCell>
      <HeadCell left={layout.leftRate} width={COL.rate} stickyEdge>
        {t("grid.colRate")}
      </HeadCell>

      <div className="flex" style={{ marginLeft: layout.daysStart - (layout.leftRate + COL.rate), background: "var(--accent-soft)" }}>
        {days.map((d) => {
          const weekday = new Date(year, month - 1, d).getDay();
          const isSunday = weekday === 0;
          return (
            <div
              key={d}
              className="flex h-9 w-9 shrink-0 items-center justify-center border-r text-[11px] font-semibold last:border-r-0"
              style={{
                borderColor: "var(--border)",
                background: isSunday ? CODE_COLORS.YA.bg : "transparent",
                color: isSunday ? CODE_COLORS.YA.fg : "var(--accent)",
              }}
            >
              {d}
            </div>
          );
        })}
      </div>

      <div
        className="sticky right-0 flex h-9 shrink-0 items-center justify-center text-[11px] font-semibold"
        style={{
          width: COL.actions,
          background: "var(--accent-soft)",
          color: "var(--accent)",
        }}
      />
    </div>
  );
}

function HeadCell({
  children,
  left,
  width,
  align = "center",
  stickyEdge = false,
}: {
  children: ReactNode;
  left: number;
  width: number;
  align?: "left" | "center";
  stickyEdge?: boolean;
}) {
  return (
    <div
      className="sticky z-10 flex h-9 shrink-0 items-center px-2 text-[11px] font-semibold uppercase tracking-wide"
      style={{
        left,
        width,
        background: "var(--accent-soft)",
        color: "var(--accent)",
        justifyContent: align === "left" ? "flex-start" : "center",
        borderRight: stickyEdge ? STICKY_EDGE_BORDER : undefined,
        boxShadow: stickyEdge ? STICKY_EDGE_SHADOW : undefined,
      }}
    >
      {children}
    </div>
  );
}
