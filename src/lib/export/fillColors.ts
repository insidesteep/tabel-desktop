import type { DayCode } from "../timesheet/types";

// Keyed by the DayCode enum, not the display text — the display text varies
// by locale (Ya/В, M/T/ОТ, ...), but the underlying code and its color never
// change. Used by all three paper outputs (docx, xlsx, native print) so they
// never visually diverge from each other.
export const EXPORT_FILL_BY_LABEL: Record<DayCode, string> = {
  YA: "BDD7EE",
  MT: "A2C4C9",
  OZH: "FFE699",
  KV: "F8CBAD",
  B: "73C79E",
};

export const ACCENT = "0B5394";
export const ZEBRA_FILL = "EFEFEF";
