import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as departmentsRepo from "../lib/db/departments.repo";
import * as timesheetsRepo from "../lib/db/timesheets.repo";
import * as employeesRepo from "../lib/db/employees.repo";
import * as overridesRepo from "../lib/db/overrides.repo";
import type { Department, MonthlyTimesheet, OverrideCode } from "../lib/timesheet/types";
import { useAppStore } from "../state/appStore";
import { reportError } from "../state/toastStore";
import { isPastMonth } from "../lib/timesheet/lock";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { useT } from "../lib/i18n/t";
import { monthName } from "../lib/i18n/translations";
import { useLocaleStore } from "../state/localeStore";

export function ArchiveListPage({ departmentId }: { departmentId: string }) {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const [department, setDepartment] = useState<Department | null>(null);
  const [months, setMonths] = useState<MonthlyTimesheet[] | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const backToDepartment = useAppStore((s) => s.backToDepartment);
  const openArchiveMonth = useAppStore((s) => s.openArchiveMonth);

  useEffect(() => {
    departmentsRepo.getDepartment(departmentId).then(setDepartment);
    timesheetsRepo.listMonths(departmentId).then((rows) => {
      const past = rows.filter((m) => isPastMonth(m.year, m.month)).sort((a, b) => b.year - a.year || b.month - a.month);
      setMonths(past);
    });
  }, [departmentId]);

  async function handleExport(m: MonthlyTimesheet, kind: "docx" | "xlsx") {
    if (!department) return;
    setExportingId(`${m.id}:${kind}`);
    try {
      const [employees, rawOverrides] = await Promise.all([
        employeesRepo.listEmployees(m.id),
        overridesRepo.listOverridesForTimesheet(m.id),
      ]);
      const overrides: Record<string, Record<number, OverrideCode>> = {};
      for (const o of rawOverrides) (overrides[o.timesheet_employee_id] ??= {})[o.day] = o.code;

      const { exportDocx, exportXlsx } = await import("../lib/export");
      const fn = kind === "docx" ? exportDocx : exportXlsx;
      await fn({ department, year: m.year, month: m.month, employees, overrides, locale });
    } catch (err) {
      reportError(t("common.exportError"), err);
    } finally {
      setExportingId(null);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        onBack={backToDepartment}
        backLabel={t("archive.backAria")}
        left={
          <div>
            <h1 className="text-[15px] font-semibold text-white">
              {t("archive.title", { name: department?.name ?? "…" })}
            </h1>
            <p className="text-xs text-white/70">{t("archive.subtitle")}</p>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {months === null ? null : months.length === 0 ? (
          <EmptyState
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 6l2-3h14l2 3M9 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title={t("archive.emptyTitle")}
            description={t("archive.emptyDescription")}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {months.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                onClick={() => openArchiveMonth(m.year, m.month)}
                whileHover={{ y: -1, boxShadow: "var(--shadow-md)", borderColor: "var(--accent)" }}
                className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition-colors"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold"
                    style={{ background: "linear-gradient(135deg, var(--accent-soft), var(--surface-2))", color: "var(--accent)" }}
                  >
                    {String(m.month).padStart(2, "0")}
                  </div>
                  <div className="text-[14px] font-medium" style={{ color: "var(--text)" }}>
                    {monthName(m.month, locale)} {m.year}
                  </div>
                </div>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleExport(m, "xlsx")}
                    disabled={exportingId === `${m.id}:xlsx`}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                    style={{ background: "var(--surface-2)", color: "var(--text)" }}
                  >
                    {t("common.excel")}
                  </button>
                  <button
                    onClick={() => handleExport(m, "docx")}
                    disabled={exportingId === `${m.id}:docx`}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                    style={{ background: "var(--surface-2)", color: "var(--text)" }}
                  >
                    {t("common.word")}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
