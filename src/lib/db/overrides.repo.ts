import { getDb } from "./client";
import type { DayOverride, OverrideCode } from "../timesheet/types";

/** All overrides for every employee on a given timesheet, in one query. */
export async function listOverridesForTimesheet(timesheetId: string): Promise<DayOverride[]> {
  const db = await getDb();
  return db.select<DayOverride[]>(
    `SELECT o.* FROM day_overrides o
     JOIN timesheet_employees e ON e.id = o.timesheet_employee_id
     WHERE e.timesheet_id = $1`,
    [timesheetId],
  );
}

export async function setOverride(employeeId: string, day: number, code: OverrideCode): Promise<void> {
  const db = await getDb();
  const id = crypto.randomUUID();
  await db.execute(
    `INSERT INTO day_overrides (id, timesheet_employee_id, day, code) VALUES ($1, $2, $3, $4)
     ON CONFLICT(timesheet_employee_id, day) DO UPDATE SET code = excluded.code`,
    [id, employeeId, day, code],
  );
}

export async function setOverrideRange(employeeId: string, days: number[], code: OverrideCode): Promise<void> {
  const db = await getDb();
  for (const day of days) {
    await db.execute(
      `INSERT INTO day_overrides (id, timesheet_employee_id, day, code) VALUES ($1, $2, $3, $4)
       ON CONFLICT(timesheet_employee_id, day) DO UPDATE SET code = excluded.code`,
      [crypto.randomUUID(), employeeId, day, code],
    );
  }
}

export async function clearOverride(employeeId: string, day: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM day_overrides WHERE timesheet_employee_id = $1 AND day = $2", [employeeId, day]);
}

export async function clearOverrideRange(employeeId: string, days: number[]): Promise<void> {
  const db = await getDb();
  for (const day of days) {
    await db.execute("DELETE FROM day_overrides WHERE timesheet_employee_id = $1 AND day = $2", [employeeId, day]);
  }
}
