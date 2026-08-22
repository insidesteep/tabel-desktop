import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "./state/appStore";
import { useLocaleStore } from "./state/localeStore";
import { DepartmentsListPage } from "./pages/DepartmentsListPage";
import { DepartmentDetailPage } from "./pages/DepartmentDetailPage";
import { ArchiveListPage } from "./pages/ArchiveListPage";
import { ArchiveMonthPage } from "./pages/ArchiveMonthPage";
import { Toast } from "./components/common/Toast";
import { PrintTimesheet } from "./components/timesheet/PrintTimesheet";
import { t } from "./lib/i18n/t";

function App() {
  const view = useAppStore((s) => s.view);
  const selectedDepartmentId = useAppStore((s) => s.selectedDepartmentId);
  const archiveYear = useAppStore((s) => s.archiveYear);
  const archiveMonth = useAppStore((s) => s.archiveMonth);

  const locale = useLocaleStore((s) => s.locale);
  useEffect(() => {
    const title = t("app.title");
    document.title = title;
    import("@tauri-apps/api/window")
      .then(({ getCurrentWindow }) => getCurrentWindow().setTitle(title))
      .catch(() => {
        // Not running inside Tauri (e.g. plain browser dev preview) — document.title above still applies.
      });
  }, [locale]);

  let content;
  let key = "departments";

  if (view === "department" && selectedDepartmentId) {
    key = `department:${selectedDepartmentId}`;
    content = <DepartmentDetailPage departmentId={selectedDepartmentId} />;
  } else if (view === "archive" && selectedDepartmentId) {
    key = `archive:${selectedDepartmentId}`;
    content = <ArchiveListPage departmentId={selectedDepartmentId} />;
  } else if (view === "archiveMonth" && selectedDepartmentId && archiveYear && archiveMonth) {
    key = `archiveMonth:${selectedDepartmentId}:${archiveYear}-${archiveMonth}`;
    content = <ArchiveMonthPage departmentId={selectedDepartmentId} year={archiveYear} month={archiveMonth} />;
  } else {
    content = <DepartmentsListPage />;
  }

  return (
    <>
      <div id="app-normal" className="h-screen w-screen overflow-hidden" style={{ background: "var(--bg)" }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={key}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            {content}
          </motion.div>
        </AnimatePresence>
        <Toast />
      </div>
      <PrintTimesheet />
    </>
  );
}

export default App;
