import { useLocaleStore, type Locale } from "../../state/localeStore";

const OPTIONS: Locale[] = ["uz", "ru"];

export function LanguageSwitcher() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-lg p-0.5"
      style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" }}
    >
      {OPTIONS.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className="rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors"
          style={{
            background: locale === l ? "var(--secondary)" : "transparent",
            color: locale === l ? "var(--text)" : "rgba(255,255,255,0.75)",
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
