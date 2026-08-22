import { describe, expect, it } from "vitest";
import { computeCell, formatHoursUz, formatRateUz, renderOrder } from "./calc";
import type { TimesheetEmployee } from "./types";

// 2026-08-03 is a Monday, 2026-08-08 is a Saturday, 2026-08-09 is a Sunday.
describe("computeCell", () => {
  it.each([
    [1, 7, 5],
    [0.75, 5.25, 3.75],
    [0.5, 3.5, 2.5],
    [0.25, 1.75, 1.25],
  ])("rate %s -> weekday %s, saturday %s", (rate, weekday, saturday) => {
    const mon = computeCell(2026, 8, 3, rate, undefined);
    expect(mon.hours).toBeCloseTo(weekday);
    expect(mon.code).toBeNull();

    const sat = computeCell(2026, 8, 8, rate, undefined);
    expect(sat.hours).toBeCloseTo(saturday);
    expect(sat.isWeekend).toBe(true);
  });

  it("Sunday is always Ya, even with an override present", () => {
    const sun = computeCell(2026, 8, 9, 1, "MT");
    expect(sun.code).toBe("YA");
    expect(sun.hours).toBeNull();
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
