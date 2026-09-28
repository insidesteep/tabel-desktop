export type Rate = 1 | 0.75 | 0.5 | 0.25;

export const RATE_PRESETS: Rate[] = [1, 0.75, 0.5, 0.25];

/** Special day codes. 'YA' (Sunday) and 'SH' (Saturday) are always computed, never stored as an override. */
export type DayCode = "YA" | "SH" | "MT" | "OZH" | "KV" | "B";

/** Codes the user can actually assign to a day (YA/SH weekend codes are automatic). */
export type OverrideCode = Exclude<DayCode, "YA" | "SH">;

export const OVERRIDE_CODES: OverrideCode[] = ["MT", "OZH", "KV", "B"];

export const CODE_LABELS: Record<DayCode, string> = {
  YA: "Ya",
  SH: "Sha",
  MT: "M/T",
  OZH: "O'z/h",
  KV: "K/v",
  B: "B",
};

export const CODE_MEANINGS: Record<DayCode, string> = {
  YA: "yakshanba",
  SH: "shanba",
  MT: "mehnat ta'tili",
  OZH: "o'z hisobidan",
  KV: "kasallik varaqasi",
  B: "bayram",
};

export interface Department {
  id: string;
  name: string;
  hr_head_name: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyTimesheet {
  id: string;
  department_id: string;
  year: number;
  month: number; // 1-12
  created_at: string;
  updated_at: string;
}

export interface TimesheetEmployee {
  id: string;
  timesheet_id: string;
  full_name: string;
  position: string;
  rate: Rate;
  is_manager: 0 | 1;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DayOverride {
  id: string;
  timesheet_employee_id: string;
  day: number;
  code: OverrideCode;
  created_at: string;
}

/** Computed contents of a single day cell for one employee. */
export interface DayCell {
  day: number;
  isWeekend: boolean; // Saturday or Sunday
  hours: number | null; // set when no code applies
  code: DayCode | null;
}
