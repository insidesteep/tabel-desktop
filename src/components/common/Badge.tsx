import type { ReactNode } from "react";

type Tone = "gold" | "glass";

const toneStyle: Record<Tone, { background: string; color: string; border?: string }> = {
  gold: { background: "var(--secondary)", color: "var(--text)" },
  glass: { background: "rgba(20,28,38,0.55)", color: "white", border: "1px solid rgba(255,255,255,0.18)" },
};

/** Small solid pill badge — bsmi.uz's "E'LONLAR" tag (gold) and its
 * semi-transparent dark timestamp pill ("1 kun oldin" → tone="glass"). */
export function Badge({ children, tone = "gold" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={toneStyle[tone]}
    >
      {children}
    </span>
  );
}
