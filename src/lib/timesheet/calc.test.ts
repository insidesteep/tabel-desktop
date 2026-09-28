import { describe, expect, it } from "vitest";
import { computeCell, formatHoursUz, formatRateUz, renderOrder } from "./calc";
import type { TimesheetEmployee } from "./types";

// 2026-08-03 is a Monday, 2026-08-08 is a Saturday, 2026-08-09 is a Sunday.
describe("computeCell", () => {
  it.each([
    [1, 8],
    [0.75, 6],
    [0.5, 4],
    [0.25, 2],
  ])("rate %s -> working day %s hours", (rate, hours) => {
    const mon = computeCell(2026, 8, 3, rate, undefined);
    expect(mon.hours).toBeCloseTo(hours);
    expect(mon.code).toBeNull();

    const fri = computeCell(2026, 8, 7, rate, undefined);
    expect(fri.hours).toBeCloseTo(hours);
  });

  it.each([
    ["Saturday", 8, "SH"],
    ["Sunday", 9, "YA"],
  ])("%s is always %s, even with an override present", (_name, day, code) => {
    const cell = computeCell(2026, 8, day, 1, "MT");
    expect(cell.code).toBe(code);
    expect(cell.hours).toBeNull();
    expect(cell.isWeekend).toBe(true);
  });

  it("an override on a weekday wins over computed hours", () => {
    const cell = computeCell(2026, 8, 3, 1, "KV");
    expect(cell.code).toBe("KV");
    expect(cell.hours).toBeNull();
  });
});

describe("formatting", () => {
  it("formats rates with a comma", () => {
    expect(formatRateUz(1)).toBe("1,0");
    expect(formatRateUz(0.5)).toBe("0,5");
  });

  it("formats hours with a comma, no trailing zeros", () => {
    expect(formatHoursUz(7)).toBe("7");
    expect(formatHoursUz(3.5)).toBe("3,5");
  });
});

describe("renderOrder", () => {
  const base = {
    timesheet_id: "t1",
    position: "x",
    rate: 1 as const,
    created_at: "",
    updated_at: "",
  };

  it("pins the manager first regardless of sort_order", () => {
    const employees: TimesheetEmployee[] = [
      { ...base, id: "a", full_name: "Anvarov", is_manager: 0, sort_order: 1 },
      { ...base, id: "b", full_name: "Boss", is_manager: 1, sort_order: 999 },
      { ...base, id: "c", full_name: "Choriev", is_manager: 0, sort_order: 2 },
    ];
    const order = renderOrder(employees);
    expect(order.map((e) => e.id)).toEqual(["b", "a", "c"]);
  });
});
