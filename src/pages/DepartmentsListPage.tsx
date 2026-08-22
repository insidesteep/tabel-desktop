import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as departmentsRepo from "../lib/db/departments.repo";
import type { Department } from "../lib/timesheet/types";
import { useAppStore } from "../state/appStore";
import { DepartmentCard } from "../components/departments/DepartmentCard";
import { NewDepartmentDialog } from "../components/departments/NewDepartmentDialog";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { EmptyState } from "../components/common/EmptyState";
import { Button } from "../components/common/Button";
import { PageHeader } from "../components/common/PageHeader";
import { reportError } from "../state/toastStore";
import { useT } from "../lib/i18n/t";

export function DepartmentsListPage() {
  const t = useT();
  const [departments, setDepartments] = useState<Department[] | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Department | null>(null);
  const openDepartment = useAppStore((s) => s.openDepartment);

  useEffect(() => {
    departmentsRepo.listDepartments().then(setDepartments);
  }, []);

  async function handleCreate(name: string) {
    try {
      const dept = await departmentsRepo.createDepartment(name);
      setDepartments((prev) => [...(prev ?? []), dept].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      reportError(t("departments.createError"), err);
    }
  }

  async function handleDelete(dept: Department) {
    setDepartments((prev) => (prev ?? []).filter((d) => d.id !== dept.id));
    try {
      await departmentsRepo.deleteDepartment(dept.id);
    } catch (err) {
      reportError(t("departments.deleteError"), err);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        left={
          <div>
            <h1 className="text-lg font-semibold text-white">{t("app.title")}</h1>
            <p className="text-sm text-white/70">{t("app.subtitle")}</p>
          </div>
        }
        right={
          <Button variant="primary" tone="dark" onClick={() => setNewOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {t("departments.newDepartment")}
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {departments === null ? null : departments.length === 0 ? (
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 20V6a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6a2 2 0 01-2-2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path d="M14 4v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            }
            title={t("departments.emptyTitle")}
            description={t("departments.emptyDescription")}
            action={
              <Button variant="primary" onClick={() => setNewOpen(true)}>
                {t("departments.createDepartment")}
              </Button>
            }
          />
        ) : (
          <motion.div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
          >
            <AnimatePresence>
              {departments.map((dept) => (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  onOpen={() => openDepartment(dept.id)}
                  onDelete={() => setPendingDelete(dept)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <NewDepartmentDialog open={newOpen} onOpenChange={setNewOpen} onCreate={handleCreate} />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={t("departments.deleteConfirmTitle")}
        description={pendingDelete ? t("departments.deleteConfirmDescription", { name: pendingDelete.name }) : undefined}
        onConfirm={() => pendingDelete && handleDelete(pendingDelete)}
      />
    </div>
  );
}
