import { RATE_PRESETS, type Rate } from "../../lib/timesheet/types";
import { formatRateUz } from "../../lib/timesheet/calc";

export function RatePicker({
  value,
  onChange,
  disabled,
}: {
  value: Rate;
  onChange: (r: Rate) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) as Rate)}
        className="appearance-none rounded-md py-1 pl-2 text-xs font-semibold outline-none transition-colors disabled:opacity-90"
        style={{ background: disabled ? "var(--surface-2)" : "var(--accent)", color: disabled ? "var(--text)" : "white", paddingRight: disabled ? 8 : 20 }}
      >
        {RATE_PRESETS.map((r) => (
          <option key={r} value={r} style={{ background: "var(--surface)", color: "var(--text)" }}>
            {formatRateUz(r)}
          </option>
        ))}
      </select>
      {!disabled && (
        <svg
          width="9"
          height="9"
          viewBox="0 0 10 10"
          fill="none"
          className="pointer-events-none absolute right-1.5"
          style={{ color: "white" }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}
