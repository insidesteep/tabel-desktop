import { getDb } from "./client";
import type { MonthlyTimesheet, TimesheetEmployee } from "../timesheet/types";

export async function listMonths(departmentId: string): Promise<MonthlyTimesheet[]> {
  const db = await getDb();
  return db.select<MonthlyTimesheet[]>(
    "SELECT * FROM monthly_timesheets WHERE department_id = $1 ORDER BY year ASC, month ASC",
    [departmentId],
  );
}

export async function findMonth(departmentId: string, year: number, month: number): Promise<MonthlyTimesheet | null> {
  const db = await getDb();
  const rows = await db.select<MonthlyTimesheet[]>(
    "SELECT * FROM monthly_timesheets WHERE department_id = $1 AND year = $2 AND month = $3",
    [departmentId, year, month],
  );
  return rows[0] ?? null;
}

async function activeEmployeesOf(timesheetId: string): Promise<TimesheetEmployee[]> {
  const db = await getDb();
  return db.select<TimesheetEmployee[]>(
    "SELECT * FROM timesheet_employees WHERE timesheet_id = $1 AND removed = 0 ORDER BY sort_order ASC",
    [timesheetId],
  );
}

/**
 * The closest month (by calendar order, not by row creation time) strictly
 * before (year, month) for this department that actually has an active
 * roster. Used to seed a brand-new month the first time it's opened.
 */
async function findNearestPopulatedMonthBefore(
  departmentId: string,
  year: number,
  month: number,
): Promise<{ month: MonthlyTimesheet; employees: TimesheetEmployee[] } | null> {
  const db = await getDb();
  const candidates = await db.select<MonthlyTimesheet[]>(
    `SELECT * FROM monthly_timesheets
     WHERE department_id = $1 AND (year < $2 OR (year = $2 AND month < $3))
     ORDER BY year DESC, month DESC`,
    [departmentId, year, month],
  );
  for (const candidate of candidates) {
    const employees = await activeEmployeesOf(candidate.id);
    if (employees.length > 0) return { month: candidate, employees };
  }
  return null;
}

async function copyRoster(sourceEmployees: TimesheetEmployee[], targetTimesheetId: string): Promise<void> {
  const db = await getDb();
  for (const e of sourceEmployees) {
    await db.execute(
      `INSERT INTO timesheet_employees
         (id, timesheet_id, full_name, position, rate, is_manager, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [crypto.randomUUID(), targetTimesheetId, e.full_name, e.position, e.rate, e.is_manager, e.sort_order],
    );
  }
}

/**
 * Returns the timesheet for (departmentId, year, month), creating it if
 * needed. There is no concept of "future" months here — months only ever
 * come into existence as the real current month, or as an already-archived
 * past month that was current once. A brand-new, still-empty month is
 * seeded once from the nearest earlier populated month (roster only — day
 * overrides never carry over, each month starts with a clean calendar).
 */
export async function ensureMonth(departmentId: string, year: number, month: number): Promise<MonthlyTimesheet> {
  const db = await getDb();
  let ts = await findMonth(departmentId, year, month);

  if (!ts) {
    const newId = crypto.randomUUID();
    await db.execute("INSERT INTO monthly_timesheets (id, department_id, year, month) VALUES ($1, $2, $3, $4)", [
      newId,
      departmentId,
      year,
      month,
    ]);
    ts = await findMonth(departmentId, year, month);
    if (!ts) throw new Error("Failed to create month");
  }

  const currentEmployees = await activeEmployeesOf(ts.id);
  if (currentEmployees.length === 0) {
    const source = await findNearestPopulatedMonthBefore(departmentId, year, month);
    if (source) await copyRoster(source.employees, ts.id);
  }

  return ts;
}

export async function deleteMonth(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM monthly_timesheets WHERE id = $1", [id]);
}
