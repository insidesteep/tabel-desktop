import { describe, expect, it } from "vitest";
import { buildExportRows } from "./buildExportRows";
import type { Department, TimesheetEmployee } from "../timesheet/types";

const department: Department = {
  id: "d1",
  name: "Raqamli ta'lim texnologiyalari markazi",
  hr_head_name: "O.I.Muminova",
  created_at: "",
  updated_at: "",
};

function emp(partial: Partial<TimesheetEmployee>): TimesheetEmployee {
  return {
    id: partial.id ?? "e",
    timesheet_id: "t1",
    full_name: partial.full_name ?? "Ivanov",
    position: partial.position ?? "Texnik",
    rate: partial.rate ?? 1,
    is_manager: partial.is_manager ?? 0,
    sort_order: partial.sort_order ?? 0,
    created_at: "",
    updated_at: "",
  };
}

describe("buildExportRows", () => {
  it("builds the Uzbek title line and puts the manager first", () => {
    const employees = [
      emp({ id: "a", full_name: "Anvarov", sort_order: 1 }),
      emp({ id: "b", full_name: "Farmonov Sunnatullo", position: "Markaz rahbari", is_manager: 1, rate: 0.5 }),
    ];
    const model = buildExportRows({ department, year: 2026, month: 8, employees, overrides: {}, locale: "uz" });

    expect(model.titleLine).toBe(
      "RAQAMLI TA'LIM TEXNOLOGIYALARI MARKAZI XODIMLARINING 2026-YIL AVGUST OYI  UCHUN TABELI",
    );
    expect(model.rows[0].fullName).toBe("Farmonov Sunnatullo");
    expect(model.managerName).toBe("Farmonov Sunnatullo");
    expect(model.hrHeadName).toBe("O.I.Muminova");
    expect(model.days.length).toBe(31);
  });

  it("renders M/T for an overridden weekday and Ya for Sunday even with an override stored", () => {
    const employees = [emp({ id: "a", rate: 1 })];
    // 2026-08-09 is a Sunday, 2026-08-10 a Monday
    const model = buildExportRows({
      department,
      year: 2026,
      month: 8,
      employees,
      overrides: { a: { 9: "KV", 10: "MT" } },
      locale: "uz",
    });
    expect(model.rows[0].cells[8]).toEqual({ text: "Ya", code: "YA" }); // day 9
    expect(model.rows[0].cells[9]).toEqual({ text: "M/T", code: "MT" }); // day 10
  });
});
