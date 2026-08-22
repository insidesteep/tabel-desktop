import { getDb } from "./client";
import type { Rate, TimesheetEmployee } from "../timesheet/types";

export async function listEmployees(timesheetId: string): Promise<TimesheetEmployee[]> {
  const db = await getDb();
  return db.select<TimesheetEmployee[]>(
    "SELECT * FROM timesheet_employees WHERE timesheet_id = $1 AND removed = 0 ORDER BY sort_order ASC",
    [timesheetId],
  );
}

/**
 * One row per distinct name that has ever appeared on any timesheet in this
 * department, taken from their most recent appearance (so position/rate
 * reflect the latest known values). Used to let the user re-add someone who
 * was removed from the current month instead of retyping everything.
 */
export async function listKnownEmployeesForDepartment(departmentId: string): Promise<TimesheetEmployee[]> {
  const db = await getDb();
  const rows = await db.select<TimesheetEmployee[]>(
    `SELECT te.* FROM timesheet_employees te
     JOIN monthly_timesheets mt ON mt.id = te.timesheet_id
     WHERE mt.department_id = $1
     ORDER BY mt.year DESC, mt.month DESC, te.created_at DESC`,
    [departmentId],
  );
  const seen = new Set<string>();
  const result: TimesheetEmployee[] = [];
  for (const row of rows) {
    const key = row.full_name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(row);
  }
  return result;
}

export async function createEmployee(input: {
  id: string;
  timesheetId: string;
  fullName: string;
  position: string;
  rate: Rate;
  isManager: boolean;
  sortOrder: number;
}): Promise<TimesheetEmployee> {
  const db = await getDb();
  const id = input.id;

  if (input.isManager) {
    await db.execute("UPDATE timesheet_employees SET is_manager = 0 WHERE timesheet_id = $1", [input.timesheetId]);
  }

  await db.execute(
    `INSERT INTO timesheet_employees (id, timesheet_id, full_name, position, rate, is_manager, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, input.timesheetId, input.fullName, input.position, input.rate, input.isManager ? 1 : 0, input.sortOrder],
  );

  const rows = await db.select<TimesheetEmployee[]>("SELECT * FROM timesheet_employees WHERE id = $1", [id]);
  return rows[0];
}

export async function updateEmployee(
  id: string,
  patch: Partial<Pick<TimesheetEmployee, "full_name" | "position" | "rate">>,
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  let n = 1;
  if (patch.full_name !== undefined) {
    fields.push(`full_name = $${n++}`);
    values.push(patch.full_name);
  }
  if (patch.position !== undefined) {
    fields.push(`position = $${n++}`);
    values.push(patch.position);
  }
  if (patch.rate !== undefined) {
    fields.push(`rate = $${n++}`);
    values.push(patch.rate);
  }
  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  values.push(id);
  await db.execute(`UPDATE timesheet_employees SET ${fields.join(", ")} WHERE id = $${n}`, values);
}

export async function setManager(timesheetId: string, employeeId: string): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE timesheet_employees SET is_manager = 0 WHERE timesheet_id = $1", [timesheetId]);
  await db.execute("UPDATE timesheet_employees SET is_manager = 1 WHERE id = $1", [employeeId]);
}

export async function unsetManager(employeeId: string): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE timesheet_employees SET is_manager = 0 WHERE id = $1", [employeeId]);
}

export async function reorderEmployee(id: string, sortOrder: number): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE timesheet_employees SET sort_order = $1 WHERE id = $2", [sortOrder, id]);
}

export async function renumberEmployees(entries: { id: string; sort_order: number }[]): Promise<void> {
  const db = await getDb();
  for (const e of entries) {
    await db.execute("UPDATE timesheet_employees SET sort_order = $1 WHERE id = $2", [e.sort_order, e.id]);
  }
}

/**
 * Soft-delete: hides the employee from this month's active roster without
 * erasing them, so they still show up as "previously in this department"
 * when re-adding someone later.
 */
export async function deleteEmployee(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE timesheet_employees SET removed = 1, updated_at = datetime('now') WHERE id = $1", [id]);
}
