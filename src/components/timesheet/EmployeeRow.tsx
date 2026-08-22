import { useEffect, useMemo, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { computeRow } from "../../lib/timesheet/calc";
import type { OverrideCode, Rate, TimesheetEmployee } from "../../lib/timesheet/types";
import { RatePicker } from "./RatePicker";
import { DayCell } from "./DayCell";
import { EmployeeLeaveDialog } from "./EmployeeLeaveDialog";
import { COL, LEFT, STICKY_EDGE_BORDER, STICKY_EDGE_SHADOW, type DynamicLayout } from "./gridLayout";
import { useCellSelectionStore } from "../../state/cellSelectionStore";
import { useT } from "../../lib/i18n/t";

export function EmployeeRow({
  employee,
  index,
  rowIndex,
  departmentId,
  year,
  month,
  overrides,
  layout,
  onUpdateField,
  onSetManager,
  onRequestDelete,
  onSetRange,
  onClearRange,
  draggable,
  onDragEnd,
  locked = false,
}: {
  employee: TimesheetEmployee;
  index: number;
  rowIndex: number;
  departmentId: string;
  year: number;
  month: number;
  overrides: Record<number, OverrideCode>;
  layout: DynamicLayout;
  onUpdateField: (patch: Partial<Pick<TimesheetEmployee, "full_name" | "position" | "rate">>) => void;
  onSetManager: () => void;
  onRequestDelete: () => void;
  onSetRange: (days: number[], code: OverrideCode) => void;
  onClearRange: (days: number[]) => void;
  draggable: boolean;
  onDragEnd?: () => void;
  locked?: boolean;
}) {
  const t = useT();
  const [name, setName] = useState(employee.full_name);
  const [position, setPosition] = useState(employee.position);
  const nameTimer = useRef<number | undefined>(undefined);
  const posTimer = useRef<number | undefined>(undefined);
  const dragControls = useDragControls();
  const rowRef = useRef<HTMLDivElement>(null);
  const [rowHovered, setRowHovered] = useState(false);

  useEffect(() => setName(employee.full_name), [employee.full_name]);
  useEffect(() => setPosition(employee.position), [employee.position]);

  // Safety net for onMouseEnter/Leave: native tooltips and disabled buttons
  // can swallow the leave event in WKWebView, leaving the row "stuck"
  // hovered. While hovered, double-check the real cursor position on every
  // move and self-correct if it's actually left the row.
  useEffect(() => {
    if (!rowHovered) return;
    function onMove(e: MouseEvent) {
      const rect = rowRef.current?.getBoundingClientRect();
      if (!rect) return;
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) setRowHovered(false);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [rowHovered]);

  const overridesMap = useMemo(() => {
    const m = new Map<number, OverrideCode>();
    for (const [d, c] of Object.entries(overrides)) m.set(Number(d), c);
    return m;
  }, [overrides]);
  const cells = useMemo(
    () => computeRow(year, month, employee.rate, overridesMap),
    [year, month, employee.rate, overridesMap],
  );

  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  // Selection is grid-wide (see cellSelectionStore) so a drag can span
  // several employee rows, not just this one's day cells. Each row only
  // needs to know: does the current rectangle (rows x days) touch my row,
  // and if so which of my days fall inside it.
  const anchor = useCellSelectionStore((s) => s.anchor);
  const cursor = useCellSelectionStore((s) => s.cursor);
  const startSelection = useCellSelectionStore((s) => s.start);
  const extendSelection = useCellSelectionStore((s) => s.extend);
  const clearSelection = useCellSelectionStore((s) => s.clear);

  const hasSelection = anchor !== null && cursor !== null;
  const inRowRange =
    hasSelection && rowIndex >= Math.min(anchor!.rowIndex, cursor!.rowIndex) && rowIndex <= Math.max(anchor!.rowIndex, cursor!.rowIndex);
  const minDay = hasSelection ? Math.min(anchor!.day, cursor!.day) : null;
  const maxDay = hasSelection ? Math.max(anchor!.day, cursor!.day) : null;

  // Zebra striping (matches the print/export look) with a subtle accent
  // tint layered on top while hovered, so the row background gives the
  // same hover feedback the crown/delete buttons already do.
  const zebra = rowIndex % 2 === 1;
  const rowBg = rowHovered ? "var(--accent-soft)" : zebra ? "var(--surface-2)" : "var(--surface)";

  const rowContent = (
    <div
      ref={rowRef}
      className="flex transition-colors"
      style={{ borderBottom: "1px solid var(--border)", background: rowBg }}
      onMouseEnter={() => setRowHovered(true)}
      onMouseLeave={() => setRowHovered(false)}
    >
      <div
        className="sticky z-10 flex h-10 shrink-0 items-center justify-center text-[12px] transition-colors"
        style={{ left: LEFT.num, width: COL.num, background: rowBg, color: "var(--text-muted)" }}
      >
        {draggable ? (
          <span
            onPointerDown={(e) => {
              // A row-reorder drag is about to change everyone's row
              // position — a stale cell selection would silently apply to
              // the wrong employees afterward, so drop it now.
              clearSelection();
              dragControls.start(e);
            }}
            className="relative flex h-full w-full cursor-grab items-center justify-center"
            title={t("row.dragTitle")}
          >
            <span className="transition-opacity" style={{ opacity: rowHovered ? 0 : 1 }}>
              {index}
            </span>
            <svg
              width="10"
              height="14"
              viewBox="0 0 10 14"
              fill="none"
              className="absolute inset-0 m-auto transition-opacity"
              style={{ opacity: rowHovered ? 1 : 0, color: "var(--text-muted)" }}
            >
              <circle cx="2.5" cy="2.5" r="1.3" fill="currentColor" />
              <circle cx="7.5" cy="2.5" r="1.3" fill="currentColor" />
              <circle cx="2.5" cy="7" r="1.3" fill="currentColor" />
              <circle cx="7.5" cy="7" r="1.3" fill="currentColor" />
              <circle cx="2.5" cy="11.5" r="1.3" fill="currentColor" />
              <circle cx="7.5" cy="11.5" r="1.3" fill="currentColor" />
            </svg>
          </span>
        ) : (
          <span title={t("row.managerAlwaysFirst")}>{index}</span>
        )}
      </div>

      <div
        className="sticky z-10 flex h-10 shrink-0 items-center gap-1.5 px-2 transition-colors"
        style={{ left: LEFT.name, width: layout.nameWidth, background: rowBg }}
      >
        {employee.is_manager === 1 && (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ color: "var(--accent)", flexShrink: 0 }}>
            <path
              d="M2 12.5h12M2.5 12.5l1-6 2.7 2.3L8 5l1.8 3.8 2.7-2.3 1 6"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        )}
        <input
          value={name}
          disabled={locked}
          onChange={(e) => {
            setName(e.target.value);
            window.clearTimeout(nameTimer.current);
            nameTimer.current = window.setTimeout(() => onUpdateField({ full_name: e.target.value }), 400);
          }}
          className="w-full truncate bg-transparent text-[13px] font-medium outline-none disabled:opacity-100"
          style={{ color: "var(--text)" }}
        />
      </div>

      <div
        className="sticky z-10 flex h-10 shrink-0 items-center px-2 transition-colors"
        style={{ left: layout.leftPosition, width: layout.positionWidth, background: rowBg }}
      >
        <input
          value={position}
          disabled={locked}
          onChange={(e) => {
            setPosition(e.target.value);
            window.clearTimeout(posTimer.current);
            posTimer.current = window.setTimeout(() => onUpdateField({ position: e.target.value }), 400);
          }}
          className="w-full truncate bg-transparent text-[13px] outline-none disabled:opacity-100"
          style={{ color: "var(--text-muted)" }}
        />
      </div>

      <div
        className="sticky z-10 flex h-10 shrink-0 items-center px-1.5 transition-colors"
        style={{ left: layout.leftRate, width: COL.rate, background: rowBg, borderRight: STICKY_EDGE_BORDER, boxShadow: STICKY_EDGE_SHADOW }}
      >
        <RatePicker value={employee.rate} onChange={(r: Rate) => onUpdateField({ rate: r })} disabled={locked} />
      </div>

      <div className="relative flex" style={{ marginLeft: layout.daysStart - (layout.leftRate + COL.rate) }}>
        {cells.map((cell) => (
          <DayCell
            key={cell.day}
            cell={cell}
            selected={inRowRange && cell.day >= minDay! && cell.day <= maxDay!}
            onSelectStart={(day) => {
              if (locked) return;
              startSelection(rowIndex, day);
            }}
            onSelectEnter={(day) => {
              if (locked) return;
              extendSelection(rowIndex, day);
            }}
          />
        ))}
      </div>

      <div
        className="sticky right-0 z-10 flex h-10 shrink-0 items-center justify-center gap-1"
        style={{ width: COL.actions, background: "var(--accent-soft)", borderLeft: "1px solid var(--border)" }}
      >
        {locked ? (
          <span title={t("row.lockedTitle")} style={{ color: "var(--text-muted)" }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <rect x="3" y="6.5" width="8" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4.5 6.5V4.5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </span>
        ) : (
          <>
            <button
              onClick={() => setLeaveDialogOpen(true)}
              title={t("row.leaveDialogTitle")}
              className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-(--surface)"
              style={{ color: Object.keys(overrides).length > 0 ? "var(--accent)" : "var(--text-muted)" }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M1.5 5.5h11M4 1.2v2M10 1.2v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={onSetManager}
              title={t("row.makeManager")}
              disabled={employee.is_manager === 1}
              className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-(--surface)"
              style={{
                color: "var(--text-muted)",
                visibility: employee.is_manager === 1 ? "hidden" : "visible",
                opacity: employee.is_manager === 1 ? 0 : rowHovered ? 1 : 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 12.5h12M2.5 12.5l1-6 2.7 2.3L8 5l1.8 3.8 2.7-2.3 1 6"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              onClick={onRequestDelete}
              title={t("row.deleteEmployee")}
              className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-(--danger-soft)"
              style={{ color: "var(--danger)", opacity: rowHovered ? 1 : 0 }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 3.5h10M5.5 3.5V2h3v1.5M3.5 3.5V12a1 1 0 001 1h5a1 1 0 001-1V3.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );

  const leaveDialog = (
    <EmployeeLeaveDialog
      open={leaveDialogOpen}
      onOpenChange={setLeaveDialogOpen}
      departmentId={departmentId}
      employeeName={employee.full_name}
      year={year}
      month={month}
      overrides={overrides}
      onSetRange={onSetRange}
      onClearRange={onClearRange}
    />
  );

  if (!draggable) {
    return (
      <div className="group">
        {rowContent}
        {leaveDialog}
      </div>
    );
  }

  return (
    <Reorder.Item
      value={employee}
      dragListener={false}
      dragControls={dragControls}
      // The drag gesture moves the pointer across other rows, so a CSS
      // :active/:hover cursor on the handle itself doesn't reliably track —
      // forcing the cursor on <body> for the drag's duration keeps it
      // "grabbing" everywhere until the row is dropped.
      onDragStart={() => {
        document.body.style.cursor = "grabbing";
      }}
      onDragEnd={() => {
        document.body.style.cursor = "";
        onDragEnd?.();
      }}
      className="group"
      style={{ background: "var(--surface)" }}
      whileDrag={{ boxShadow: "var(--shadow-md)", zIndex: 20, position: "relative" }}
    >
      {rowContent}
      {leaveDialog}
    </Reorder.Item>
  );
}
