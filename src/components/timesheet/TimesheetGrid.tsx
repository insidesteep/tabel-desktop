import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, Reorder } from "framer-motion";
import { useTimesheetStore } from "../../state/useTimesheetStore";
import { useCellSelectionStore } from "../../state/cellSelectionStore";
import { isDayOff, renderOrder } from "../../lib/timesheet/calc";
import type { OverrideCode, TimesheetEmployee } from "../../lib/timesheet/types";
import { TimesheetGridHeader } from "./TimesheetGridHeader";
import { EmployeeRow } from "./EmployeeRow";
import { DayRangeToolbar } from "./DayRangeToolbar";
import { AddEmployeeForm } from "./AddEmployeeForm";
import { Legend } from "./Legend";
import { EmptyState } from "../common/EmptyState";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { useT } from "../../lib/i18n/t";
import {
  COL,
  HEADER_HEIGHT,
  ROW_HEIGHT,
  NAME_COL_MIN,
  NAME_COL_MAX,
  POSITION_COL_MIN,
  POSITION_COL_MAX,
  COL_TEXT_PADDING,
  computeDynamicLayout,
} from "./gridLayout";
import { measureTextWidth, clamp } from "../../lib/timesheet/measureText";

const NAME_FONT = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const POSITION_FONT = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export function TimesheetGrid({
  departmentId,
  year,
  month,
  locked = false,
}: {
  departmentId: string;
  year: number;
  month: number;
  locked?: boolean;
}) {
  const t = useT();
  const employees = useTimesheetStore((s) => s.employees);
  const overrides = useTimesheetStore((s) => s.overrides);
  const addEmployee = useTimesheetStore((s) => s.addEmployee);
  const updateEmployeeField = useTimesheetStore((s) => s.updateEmployeeField);
  const deleteEmployee = useTimesheetStore((s) => s.deleteEmployee);
  const setManager = useTimesheetStore((s) => s.setManager);
  const reorderLocal = useTimesheetStore((s) => s.reorderLocal);
  const commitReorder = useTimesheetStore((s) => s.commitReorder);
  const setOverrideRange = useTimesheetStore((s) => s.setOverrideRange);
  const clearOverrideRange = useTimesheetStore((s) => s.clearOverrideRange);

  const [pendingDelete, setPendingDelete] = useState<TimesheetEmployee | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const anchor = useCellSelectionStore((s) => s.anchor);
  const cursor = useCellSelectionStore((s) => s.cursor);
  const dragging = useCellSelectionStore((s) => s.dragging);
  const finishSelection = useCellSelectionStore((s) => s.finish);
  const clearSelection = useCellSelectionStore((s) => s.clear);
  const hasSelection = anchor !== null && cursor !== null;

  useEffect(() => {
    if (!dragging) return;
    const onUp = () => finishSelection();
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, [dragging, finishSelection]);

  // Selection is finalized (not mid-drag) — clicking anywhere outside the
  // grid (day cells, meta columns, or the toolbar) dismisses it.
  useEffect(() => {
    if (!hasSelection || dragging) return;
    function onDocMouseDown(e: MouseEvent) {
      if (gridRef.current && !gridRef.current.contains(e.target as Node)) {
        clearSelection();
      }
    }
    window.addEventListener("mousedown", onDocMouseDown);
    return () => window.removeEventListener("mousedown", onDocMouseDown);
  }, [hasSelection, dragging, clearSelection]);

  // Leaving this month/page shouldn't leave a stale selection for whatever
  // grid mounts next.
  useEffect(() => () => clearSelection(), [clearSelection]);

  // Ф.И.О./Должность size to the widest current value instead of a fixed
  // guess — sticky columns still need one known width, so it's computed
  // once here (from the saved employee list, not live keystrokes) and
  // handed down to the header and every row.
  const layout = useMemo(() => {
    const nameWidth = clamp(
      NAME_COL_MIN,
      Math.max(0, ...employees.map((e) => measureTextWidth(e.full_name, NAME_FONT))) + COL_TEXT_PADDING,
      NAME_COL_MAX,
    );
    const positionWidth = clamp(
      POSITION_COL_MIN,
      Math.max(0, ...employees.map((e) => measureTextWidth(e.position, POSITION_FONT))) + COL_TEXT_PADDING,
      POSITION_COL_MAX,
    );
    return computeDynamicLayout(nameWidth, positionWidth);
  }, [employees]);

  const ordered = renderOrder(employees);
  const manager = ordered.find((e) => e.is_manager === 1) ?? null;
  const rest = ordered.filter((e) => e.is_manager !== 1);
  const rowIndexById = new Map(ordered.map((e, i) => [e.id, i]));

  if (employees.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <EmptyState
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 20c0-3 2.5-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M15 3.5c1.5.4 2.5 1.7 2.5 3.5S16.5 10.6 15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M20 20c0-2.3-1.5-4.1-3.5-4.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          title={locked ? t("grid.emptyTitleLocked") : t("grid.emptyTitleOpen")}
          description={locked ? t("grid.emptyDescriptionLocked") : t("grid.emptyDescriptionOpen")}
        />
        {!locked && (
          <AddEmployeeForm
            departmentId={departmentId}
            existingNames={employees.map((e) => e.full_name)}
            onAdd={(n, p, r, m) => addEmployee(n, p, r, m)}
          />
        )}
      </div>
    );
  }

  const rows = rest.map((emp, i) => (
    <EmployeeRow
      key={emp.id}
      employee={emp}
      index={(manager ? 1 : 0) + i + 1}
      rowIndex={rowIndexById.get(emp.id)!}
      departmentId={departmentId}
      year={year}
      month={month}
      overrides={overrides[emp.id] ?? {}}
      layout={layout}
      onUpdateField={(patch) => updateEmployeeField(emp.id, patch)}
      onSetManager={() => setManager(emp.id)}
      onRequestDelete={() => setPendingDelete(emp)}
      onSetRange={(days: number[], code: OverrideCode) => setOverrideRange(emp.id, days, code)}
      onClearRange={(days: number[]) => clearOverrideRange(emp.id, days)}
      draggable={!locked}
      onDragEnd={commitReorder}
      locked={locked}
    />
  ));

  function selectedWorkDays(): number[] {
    if (!anchor || !cursor) return [];
    const minDay = Math.min(anchor.day, cursor.day);
    const maxDay = Math.max(anchor.day, cursor.day);
    const days: number[] = [];
    for (let d = minDay; d <= maxDay; d++) {
      const weekday = new Date(year, month - 1, d).getDay();
      if (!isDayOff(weekday)) days.push(d);
    }
    return days;
  }

  function applyToSelection(code: OverrideCode) {
    if (!anchor || !cursor) return;
    const days = selectedWorkDays();
    const minRow = Math.min(anchor.rowIndex, cursor.rowIndex);
    const maxRow = Math.max(anchor.rowIndex, cursor.rowIndex);
    for (let r = minRow; r <= maxRow; r++) {
      const emp = ordered[r];
      if (emp) setOverrideRange(emp.id, days, code);
    }
    clearSelection();
  }

  function clearSelectionOverrides() {
    if (!anchor || !cursor) return;
    const days = selectedWorkDays();
    const minRow = Math.min(anchor.rowIndex, cursor.rowIndex);
    const maxRow = Math.max(anchor.rowIndex, cursor.rowIndex);
    for (let r = minRow; r <= maxRow; r++) {
      const emp = ordered[r];
      if (emp) clearOverrideRange(emp.id, days);
    }
    clearSelection();
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden px-8 pb-3 pt-1">
        <div
          className="flex h-full flex-col overflow-hidden rounded-xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="flex-1 overflow-auto">
            <div ref={gridRef} className="relative inline-block min-w-full">
              <TimesheetGridHeader year={year} month={month} layout={layout} />

              {manager && (
                <EmployeeRow
                  employee={manager}
                  index={1}
                  rowIndex={rowIndexById.get(manager.id)!}
                  departmentId={departmentId}
                  year={year}
                  month={month}
                  overrides={overrides[manager.id] ?? {}}
                  layout={layout}
                  onUpdateField={(patch) => updateEmployeeField(manager.id, patch)}
                  onSetManager={() => setManager(manager.id)}
                  onRequestDelete={() => setPendingDelete(manager)}
                  onSetRange={(days: number[], code: OverrideCode) => setOverrideRange(manager.id, days, code)}
                  onClearRange={(days: number[]) => clearOverrideRange(manager.id, days)}
                  draggable={false}
                  locked={locked}
                />
              )}

              {locked ? (
                <div>{rows}</div>
              ) : (
                <Reorder.Group axis="y" values={rest} onReorder={reorderLocal} as="div">
                  {rows}
                </Reorder.Group>
              )}

              <AnimatePresence>
                {hasSelection && !dragging && (
                  <div
                    className="absolute z-30"
                    style={{
                      left: layout.daysStart + (Math.min(anchor!.day, cursor!.day) - 1) * COL.day,
                      top: HEADER_HEIGHT + (Math.max(anchor!.rowIndex, cursor!.rowIndex) + 1) * ROW_HEIGHT,
                    }}
                  >
                    <DayRangeToolbar
                      dayCount={selectedWorkDays().length}
                      codes={["B"]}
                      onApply={applyToSelection}
                      onClear={clearSelectionOverrides}
                      onClose={clearSelection}
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <Legend />
      {!locked && (
        <AddEmployeeForm
          departmentId={departmentId}
          existingNames={employees.map((e) => e.full_name)}
          onAdd={(n, p, r, m) => addEmployee(n, p, r, m)}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={t("grid.deleteEmployeeTitle")}
        description={pendingDelete ? t("grid.deleteEmployeeDescription", { name: pendingDelete.full_name }) : undefined}
        onConfirm={() => pendingDelete && deleteEmployee(pendingDelete.id)}
      />
    </div>
  );
}
