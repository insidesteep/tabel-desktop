import { motion } from "framer-motion";
import { CODE_LABELS, CODE_MEANINGS, type OverrideCode } from "../../lib/timesheet/types";
import { useT } from "../../lib/i18n/t";
import { codeLabel, codeMeaning, dayCountLabel } from "../../lib/i18n/translations";
import { useLocaleStore } from "../../state/localeStore";

export function DayRangeToolbar({
  dayCount,
  codes,
  onApply,
  onClear,
  onClose,
}: {
  dayCount: number;
  codes: OverrideCode[];
  onApply: (code: OverrideCode) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.97 }}
      transition={{ type: "spring", duration: 0.32, bounce: 0.25 }}
      className="absolute left-0 top-full z-30 mt-1 flex items-center gap-1 rounded-xl p-1.5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}
    >
      <span className="px-1.5 text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
        {dayCountLabel(dayCount, locale)}
      </span>
      {codes.map((code) => (
        <button
          key={code}
          onClick={() => onApply(code)}
          title={codeMeaning(code, locale, CODE_MEANINGS[code])}
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-transform active:scale-95"
          style={{ background: "var(--surface-2)", color: "var(--text)" }}
        >
          {codeLabel(code, locale, CODE_LABELS[code])}
        </button>
      ))}
      <button
        onClick={onClear}
        className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-transform active:scale-95"
        style={{ color: "var(--danger)" }}
      >
        {t("toolbar.clear")}
      </button>
      <button
        onClick={onClose}
        className="ml-1 flex h-6 w-6 items-center justify-center rounded-md"
        style={{ color: "var(--text-muted)" }}
        aria-label={t("common.close")}
      >
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
          <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </motion.div>
  );
}
