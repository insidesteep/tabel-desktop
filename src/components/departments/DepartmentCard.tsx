import { motion } from "framer-motion";
import type { Department } from "../../lib/timesheet/types";
import { useT } from "../../lib/i18n/t";

export function DepartmentCard({
  department,
  onOpen,
  onDelete,
}: {
  department: Department;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const t = useT();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, boxShadow: "var(--shadow-lg)", borderColor: "var(--accent)" }}
      onClick={onOpen}
      className="group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: "linear-gradient(90deg, var(--accent), var(--secondary))" }}
      />
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold"
          style={{
            background: "linear-gradient(135deg, var(--accent-soft), var(--surface))",
            color: "var(--accent)",
            boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--accent) 18%, transparent)",
          }}
        >
          {initials(department.name)}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 transition-opacity group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-md"
          style={{ color: "var(--text-muted)" }}
          aria-label={t("departments.deleteAria")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 3.5h10M5.5 3.5V2h3v1.5M3.5 3.5V12a1 1 0 001 1h5a1 1 0 001-1V3.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div>
        <div className="text-[15px] font-semibold leading-snug" style={{ color: "var(--text)" }}>
          {department.name}
        </div>
        <div className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
          {department.hr_head_name
            ? t("departments.hrHeadLabel", { name: department.hr_head_name })
            : t("departments.openTimesheet")}
        </div>
      </div>
    </motion.div>
  );
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
