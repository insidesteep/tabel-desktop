import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center"
    >
      {icon && (
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          {icon}
        </div>
      )}
      <div className="text-base font-semibold" style={{ color: "var(--text)" }}>
        {title}
      </div>
      {description && (
        <div className="max-w-sm text-sm" style={{ color: "var(--text-muted)" }}>
          {description}
        </div>
      )}
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
}
