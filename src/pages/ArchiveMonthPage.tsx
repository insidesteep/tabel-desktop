import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as departmentsRepo from "../lib/db/departments.repo";
import * as timesheetsRepo from "../lib/db/timesheets.repo";
import * as employeesRepo from "../lib/db/employees.repo";
import * as overridesRepo from "../lib/db/overrides.repo";
import type { Department, OverrideCode } from "../lib/timesheet/types";
import { useAppStore } from "../state/appStore";
import { useTimesheetStore } from "../state/useTimesheetStore";
import { TimesheetGrid } from "../components/timesheet/TimesheetGrid";
import { Button } from "../components/common/Button";
import { PageHeader } from "../components/common/PageHeader";
import { Badge } from "../components/common/Badge";
import { reportError } from "../state/toastStore";
import { usePrintStore } from "../state/printStore";
import { useT } from "../lib/i18n/t";
import { monthName } from "../lib/i18n/translations";
import { useLocaleStore } from "../state/localeStore";

export function ArchiveMonthPage({ departmentId, year, month }: { departmentId: string; year: number; month: number }) {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const [department, setDepartment] = useState<Department | null>(null);
  const backToArchive = useAppStore((s) => s.backToArchive);
  const timesheetId = useTimesheetStore((s) => s.timesheetId);
  const loadTimesheet = useTimesheetStore((s) => s.load);

  useEffect(() => {
    departmentsRepo.getDepartment(departmentId).then(setDepartment);
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
      for (const o of rawOverrides) (overrides[o.timesheet_employee_id] ??= {})[o.day] = o.code;
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
      await fn({ department, year, month, employees: state.employees, overrides: state.overrides, locale });
    } catch (err) {
      reportError(t("common.exportError"), err);
    }
  }

  async function handlePrint() {
    if (!department || !timesheetId) return;
    try {
      const state = useTimesheetStore.getState();
      const { buildExportRows } = await import("../lib/export");
      const model = buildExportRows({ department, year, month, employees: state.employees, overrides: state.overrides, locale });
      usePrintStore.getState().setModel(model);
    } catch (err) {
      reportError(t("common.printError"), err);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        onBack={backToArchive}
        backLabel={t("archiveMonth.backAria")}
        left={
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-semibold text-white">{department?.name ?? "…"}</h1>
              <Badge tone="glass">{t("archiveMonth.readOnlyBadge")}</Badge>
            </div>
            <p className="text-xs text-white/70">
              {monthName(month, locale)} {year}
            </p>
          </div>
        }
        right={
          <>
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
        {timesheetId && <TimesheetGrid departmentId={departmentId} year={year} month={month} locked />}
      </motion.div>
    </div>
  );
}
