import type { ButtonHTMLAttributes, CSSProperties } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Tone = "light" | "dark";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.97]";

const sizes = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-3.5",
};

// tone="dark" is for buttons sitting directly on the gradient PageHeader —
// a flat var(--accent) button would nearly vanish against the header's own
// accent-toned gradient, so it swaps to a gold CTA / translucent-white style.
const variantsByTone: Record<Tone, Record<Variant, CSSProperties>> = {
  light: {
    primary: { background: "linear-gradient(135deg, var(--accent), var(--accent-hover))", color: "white", boxShadow: "0 2px 10px -2px color-mix(in srgb, var(--accent) 55%, transparent)" },
    secondary: { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border-strong)" },
    ghost: { background: "transparent", color: "var(--text-muted)" },
    danger: { background: "var(--danger-soft)", color: "var(--danger)" },
  },
  dark: {
    primary: { background: "linear-gradient(135deg, var(--secondary), #ffb700)", color: "var(--text)", boxShadow: "0 2px 10px -2px rgba(0,0,0,0.35)" },
    // Outline pill, like bsmi.uz's "HOZIRGI TALABALAR" nav buttons — transparent
    // with a thin light border, filling in translucent white on hover.
    secondary: { background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.45)" },
    ghost: { background: "transparent", color: "rgba(255,255,255,0.85)" },
    danger: { background: "rgba(220,38,38,0.25)", color: "#fca5a5", border: "1px solid rgba(220,38,38,0.35)" },
  },
};

const toneClassName: Record<Tone, Partial<Record<Variant, string>>> = {
  light: {},
  dark: {
    primary: "uppercase tracking-wide text-[12px] font-bold",
    secondary: "uppercase tracking-wide text-[12px] font-semibold",
  },
};

const hoverByTone: Record<Tone, Record<Variant, CSSProperties | undefined>> = {
  light: {
    primary: { background: "linear-gradient(135deg, var(--accent-hover), var(--accent-hover))" },
    secondary: { background: "var(--surface-2)" },
    ghost: { background: "var(--surface-2)" },
    danger: undefined,
  },
  dark: {
    primary: undefined,
    secondary: { background: "rgba(255,255,255,0.14)" },
    ghost: { background: "rgba(255,255,255,0.12)" },
    danger: undefined,
  },
};

export function Button({
  variant = "secondary",
  size = "md",
  tone = "light",
  className = "",
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof sizes; tone?: Tone }) {
  const restingStyle = variantsByTone[tone][variant];
  const hoverStyle = hoverByTone[tone][variant];
  const extraClass = toneClassName[tone][variant] ?? "";

  return (
    <button
      className={`${base} ${sizes[size]} ${extraClass} ${className}`}
      style={{ ...restingStyle, ...style }}
      onMouseEnter={(e) => {
        if (!hoverStyle) return;
        Object.assign((e.currentTarget as HTMLButtonElement).style, hoverStyle);
      }}
      onMouseLeave={(e) => {
        if (!hoverStyle) return;
        Object.assign((e.currentTarget as HTMLButtonElement).style, restingStyle);
      }}
      {...props}
    />
  );
}
