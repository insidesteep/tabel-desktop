import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RATE_PRESETS, type Rate, type TimesheetEmployee } from "../../lib/timesheet/types";
import { formatRateUz } from "../../lib/timesheet/calc";
import { Button } from "../common/Button";
import * as employeesRepo from "../../lib/db/employees.repo";
import { useT } from "../../lib/i18n/t";

type Mode = "closed" | "list" | "create";

export function AddEmployeeForm({
  departmentId,
  existingNames,
  onAdd,
}: {
  departmentId: string;
  existingNames: string[];
  onAdd: (fullName: string, position: string, rate: Rate, isManager: boolean) => void;
}) {
  const t = useT();
  const [mode, setMode] = useState<Mode>("closed");
  const [known, setKnown] = useState<TimesheetEmployee[]>([]);
  const [query, setQuery] = useState("");

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [rate, setRate] = useState<Rate>(1);
  const [isManager, setIsManager] = useState(false);

  const existingLower = useMemo(() => new Set(existingNames.map((n) => n.trim().toLowerCase())), [existingNames]);

  useEffect(() => {
    if (mode === "closed") return;
    employeesRepo.listKnownEmployeesForDepartment(departmentId).then(setKnown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, departmentId]);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return known
      .filter((k) => !existingLower.has(k.full_name.trim().toLowerCase()))
      .filter((k) => !q || k.full_name.toLowerCase().includes(q));
  }, [known, existingLower, query]);

  function open() {
    setMode("list");
  }

  function close() {
    setMode("closed");
    setQuery("");
    setName("");
    setPosition("");
    setRate(1);
    setIsManager(false);
  }

  function addKnown(emp: TimesheetEmployee) {
    onAdd(emp.full_name, emp.position, emp.rate, false);
    setKnown((prev) => prev.filter((k) => k.id !== emp.id));
  }

  function submitNew() {
    if (!name.trim() || !position.trim()) return;
    onAdd(name.trim(), position.trim(), rate, isManager);
    setName("");
    setPosition("");
    setRate(1);
    setIsManager(false);
    setMode(candidates.length > 0 ? "list" : "create");
  }

  return (
    <div className="px-8 py-3">
      <AnimatePresence mode="wait">
        {mode === "closed" && (
          <motion.button
            key="cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={open}
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "var(--accent)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {t("addEmployee.cta")}
          </motion.button>
        )}

        {mode === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="w-96 overflow-hidden rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2 border-b p-2.5" style={{ borderColor: "var(--border)" }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M12.5 12.5L9.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("addEmployee.searchPlaceholder")}
                className="h-6 flex-1 bg-transparent text-[13px] outline-none"
                style={{ color: "var(--text)" }}
              />
              <button type="button" onClick={close} className="flex h-5 w-5 items-center justify-center" style={{ color: "var(--text-muted)" }} aria-label={t("common.close")}>
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {candidates.length === 0 ? (
                <div className="px-3 py-4 text-center text-[12px]" style={{ color: "var(--text-muted)" }}>
                  {query ? t("addEmployee.noneFound") : t("addEmployee.noMoreInHistory")}
                </div>
              ) : (
                candidates.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => addKnown(emp)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors"
                    style={{ color: "var(--text)" }}
                  >
                    <span>
                      <span className="block text-[13px] font-medium">{emp.full_name}</span>
                      <span className="block text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {emp.position} · {formatRateUz(emp.rate)}
                      </span>
                    </span>
                    <span className="text-[11px] font-medium" style={{ color: "var(--accent)" }}>
                      {t("addEmployee.addAction")}
                    </span>
                  </button>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setMode("create")}
              className="flex w-full items-center gap-1.5 border-t px-3 py-2.5 text-[13px] font-medium"
              style={{ borderColor: "var(--border)", color: "var(--accent)" }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {t("addEmployee.newEmployee")}
            </button>
          </motion.div>
        )}

        {mode === "create" && (
          <motion.form
            key="create"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            onSubmit={(e) => {
              e.preventDefault();
              submitNew();
            }}
            className="flex flex-wrap items-start gap-2 rounded-xl p-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            {candidates.length > 0 && (
              <button
                type="button"
                onClick={() => setMode("list")}
                className="mb-1 flex w-full items-center gap-1 text-[12px] font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L3 7l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("addEmployee.backToList")}
              </button>
            )}
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("addEmployee.namePlaceholder")}
              className="h-8 w-48 rounded-lg px-2.5 text-sm outline-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
            />
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder={t("addEmployee.positionPlaceholder")}
              className="h-8 w-44 rounded-lg px-2.5 text-sm outline-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
            />
            <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              {RATE_PRESETS.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRate(r)}
                  className="rounded-md px-2 py-1 text-xs font-medium"
                  style={{
                    background: rate === r ? "var(--accent)" : "transparent",
                    color: rate === r ? "white" : "var(--text-muted)",
                  }}
                >
                  {formatRateUz(r)}
                </button>
              ))}
            </div>
            <label className="flex h-8 items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              <input type="checkbox" checked={isManager} onChange={(e) => setIsManager(e.target.checked)} />
              {t("addEmployee.managerCheckbox")}
            </label>
            <div className="ml-auto flex h-8 items-center gap-1.5">
              <Button type="button" variant="ghost" size="sm" onClick={close}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={!name.trim() || !position.trim()}>
                {t("addEmployee.submit")}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
