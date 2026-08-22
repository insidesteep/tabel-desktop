import type { ReactNode } from "react";

/** Bold title with a small gold accent bar to its left — the bsmi.uz
 * homepage's "Yangiliklar" / "E'LONLAR" section-header pattern. */
export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="h-4 w-1 shrink-0 rounded-sm" style={{ background: "var(--secondary)" }} />
        <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
