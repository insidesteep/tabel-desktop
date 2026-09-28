import { CODE_LABELS, CODE_MEANINGS, type DayCode } from "../../lib/timesheet/types";
import { CODE_COLORS } from "../../lib/timesheet/codeColors";
import { useT } from "../../lib/i18n/t";
import { codeLabel, codeMeaning } from "../../lib/i18n/translations";
import { useLocaleStore } from "../../state/localeStore";

const ORDER: DayCode[] = ["YA", "SH", "MT", "OZH", "KV", "B"];

export function Legend() {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  return (
    <div
      className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-8 py-3 text-[12px]"
      style={{ color: "var(--text-muted)" }}
    >
      <span className="font-semibold" style={{ color: "var(--text)" }}>
        {t("legend.title")}
      </span>
      {ORDER.map((code) => (
        <span key={code} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: CODE_COLORS[code].bg }} />
          <span className="font-semibold" style={{ color: "var(--text)" }}>
            {codeLabel(code, locale, CODE_LABELS[code])}
          </span>
          — {codeMeaning(code, locale, CODE_MEANINGS[code])}
        </span>
      ))}
    </div>
  );
}
