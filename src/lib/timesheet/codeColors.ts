import type { DayCode } from "./types";
import { EXPORT_FILL_BY_LABEL } from "../export/fillColors";

// On-screen day-code pill colors now share the exact same fills as the
// Word/Excel export and native print (EXPORT_FILL_BY_LABEL) — previously
// this used an unrelated ad-hoc palette (accent/danger/success theme
// colors), so what you saw on screen didn't match what you got on paper.
export const CODE_COLORS: Record<DayCode, { bg: string; fg: string }> = {
  YA: { bg: `#${EXPORT_FILL_BY_LABEL.YA}`, fg: "#1565c0" },
  MT: { bg: `#${EXPORT_FILL_BY_LABEL.MT}`, fg: "#2f6b63" },
  OZH: { bg: `#${EXPORT_FILL_BY_LABEL.OZH}`, fg: "#92400e" },
  KV: { bg: `#${EXPORT_FILL_BY_LABEL.KV}`, fg: "#9a3412" },
  B: { bg: `#${EXPORT_FILL_BY_LABEL.B}`, fg: "#1f5c3a" },
};
