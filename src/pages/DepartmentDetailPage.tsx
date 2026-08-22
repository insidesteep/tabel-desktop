import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as departmentsRepo from "../lib/db/departments.repo";
import * as timesheetsRepo from "../lib/db/timesheets.repo";
import * as employeesRepo from "../lib/db/employees.repo";
import * as overridesRepo from "../lib/db/overrides.repo";
import type { Department, OverrideCode } from "../lib/timesheet/types";
import { useAppStore } from "../state/appStore";
import { useTimesheetStore } from "../state/useTimesheetStore";
import { TimesheetGrid } from "../components/timesheet/TimesheetGrid";
import { SavedIndicator } from "../components/common/SavedIndicator";
import { Button } from "../components/common/Button";
import { PageHeader } from "../components/common/PageHeader";
import { SectionHeading } from "../components/common/SectionHeading";
import { Badge } from "../components/common/Badge";
import { reportError } from "../state/toastStore";
import { usePrintStore } from "../state/printStore";
import { useT } from "../lib/i18n/t";
import { monthName } from "../lib/i18n/translations";
import { useLocaleStore } from "../state/localeStore";

export function DepartmentDetailPage({ departmentId }: { departmentId: string }) {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const [department, setDepartment] = useState<Department | null>(null);
  const [hrHead, setHrHead] = useState("");
  const hrHeadTimer = useRef<number | undefined>(undefined);

  const backToDepartments = useAppStore((s) => s.backToDepartments);
  const openArchive = useAppStore((s) => s.openArchive);

  const { year, month } = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }, []);

  const saving = useTimesheetStore((s) => s.saving);
  const timesheetId = useTimesheetStore((s) => s.timesheetId);
  const loadTimesheet = useTimesheetStore((s) => s.load);

  useEffect(() => {
    departmentsRepo.getDepartment(departmentId).then((d) => {
      setDepartment(d);
      setHrHead(d?.hr_head_name ?? "");
    });
  }, [departmentId]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const ts = await timesheetsRepo.ensureMonth(departmentId, year, month);
      const [employees, rawOverrides] = await Promise.all([
        employeesRepo.listEmployees(ts.id),
        overridesRepo.listOverridesForTimesheet(ts.id),
      ]);
      const overrides: Record<string, Record<number, OverrideCode>> = {};
      for (const o of rawOverrides) {
        (overrides[o.timesheet_employee_id] ??= {})[o.day] = o.code;
      }
      if (cancelled) return;
      loadTimesheet(ts.id, year, month, employees, overrides);
    }
    run().catch((err) => reportError(t("common.openMonthError"), err));
    return () => {
      cancelled = true;
    };
  }, [departmentId, year, month, loadTimesheet]);

  async function handleExport(kind: "docx" | "xlsx") {
    if (!department || !timesheetId) return;
    try {
      const state = useTimesheetStore.getState();
      const { exportDocx, exportXlsx } = await import("../lib/export");
      const fn = kind === "docx" ? exportDocx : exportXlsx;
      await fn({
        department: { ...department, hr_head_name: hrHead },
        year,
        month,
        employees: state.employees,
        overrides: state.overrides,
        locale,
      });
    } catch (err) {
      reportError(t("common.exportError"), err);
    }
  }

  async function handlePrint() {
    if (!department || !timesheetId) return;
    try {
      const state = useTimesheetStore.getState();
      const { buildExportRows } = await import("../lib/export");
      const model = buildExportRows({
        department: { ...department, hr_head_name: hrHead },
        year,
        month,
        employees: state.employees,
        overrides: state.overrides,
        locale,
      });
      usePrintStore.getState().setModel(model);
    } catch (err) {
      reportError(t("common.printError"), err);
    }
  }

  if (!department) return null;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        onBack={backToDepartments}
        backLabel={t("department.backAria")}
        left={
          <div>
            <input
              defaultValue={department.name}
              onBlur={(e) => {
                const name = e.target.value.trim();
                if (name && name !== department.name) {
                  departmentsRepo
                    .updateDepartmentName(department.id, name)
                    .catch((err) => reportError(t("department.nameSaveError"), err));
                  setDepartment({ ...department, name });
                }
              }}
              className="bg-transparent text-[15px] font-semibold text-white outline-none"
            />
            <div className="flex items-center gap-1.5 text-xs text-white/70">
              {t("department.hrHeadLabel")}
              <input
                value={hrHead}
                onChange={(e) => {
                  setHrHead(e.target.value);
                  window.clearTimeout(hrHeadTimer.current);
                  hrHeadTimer.current = window.setTimeout(
                    () =>
                      departmentsRepo
                        .updateDepartmentHrHead(department.id, e.target.value)
                        .catch((err) => reportError(t("department.hrHeadSaveError"), err)),
                    400,
                  );
                }}
                placeholder={t("department.hrHeadPlaceholder")}
                className="bg-transparent text-white/85 outline-none placeholder:text-white/40"
                style={{ borderBottom: "1px dashed rgba(255,255,255,0.35)" }}
              />
            </div>
          </div>
        }
        right={
          <>
            <SavedIndicator saving={saving} tone="dark" />
            <Button size="sm" tone="dark" onClick={openArchive}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect x="1.5" y="3.5" width="11" height="8.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1.5 3.5l1-2h9l1 2M5.5 7h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("department.archive")}
            </Button>
            <Button size="sm" tone="dark" onClick={() => handleExport("xlsx")}>
              {t("common.excel")}
            </Button>
            <Button size="sm" tone="dark" onClick={() => handleExport("docx")}>
              {t("common.word")}
            </Button>
            <Button size="sm" variant="primary" tone="dark" onClick={handlePrint}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3.5 5V1.5h7V5M3.5 11h7v2.5h-7V11z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <rect x="1" y="5" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {t("common.print")}
            </Button>
          </>
        }
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="px-8 pb-1 pt-5">
          <SectionHeading
            title={`${monthName(month, locale)} ${year}`}
            action={<Badge tone="gold">{t("department.currentBadge")}</Badge>}
          />
          <p className="ml-3.5 mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            {t("department.currentMonthNote")}
          </p>
        </div>
        {timesheetId && <TimesheetGrid departmentId={departmentId} year={year} month={month} locked={false} />}
      </motion.div>
    </div>
  );
}
