import type { ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useT } from "../../lib/i18n/t";

/** Flat navy header bar used at the top of every page, matching bsmi.uz's
 * own header exactly — fixed color, not a gradient, and not theme-dependent
 * (the reference site has no dark mode; its header is always this navy). */
export function PageHeader({
  onBack,
  backLabel,
  left,
  right,
}: {
  onBack?: () => void;
  backLabel?: string;
  left: ReactNode;
  right?: ReactNode;
}) {
  const t = useT();
  return (
    <header
      className="flex items-center justify-between gap-4 px-8 py-4"
      style={{ background: "var(--header-bg)", boxShadow: "var(--shadow-md)" }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <img
          src="/bsmi-logo.png"
          alt="BSMI"
          className="h-9 w-9 shrink-0 rounded-full bg-white/95 p-0.5 shadow-sm"
        />
        {onBack && (
          <button
            onClick={onBack}
            aria-label={backLabel ?? t("common.back")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="min-w-0">{left}</div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {right}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
