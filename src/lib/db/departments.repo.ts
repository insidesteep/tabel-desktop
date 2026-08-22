import { getDb } from "./client";
import type { Department } from "../timesheet/types";

export async function listDepartments(): Promise<Department[]> {
  const db = await getDb();
  return db.select<Department[]>("SELECT * FROM departments ORDER BY name COLLATE NOCASE ASC");
}

export async function getDepartment(id: string): Promise<Department | null> {
  const db = await getDb();
  const rows = await db.select<Department[]>("SELECT * FROM departments WHERE id = $1", [id]);
  return rows[0] ?? null;
}

export async function createDepartment(name: string): Promise<Department> {
  const db = await getDb();
  const id = crypto.randomUUID();
  await db.execute("INSERT INTO departments (id, name, hr_head_name) VALUES ($1, $2, '')", [id, name]);
  const dept = await getDepartment(id);
  if (!dept) throw new Error("Failed to create department");
  return dept;
}

export async function updateDepartmentName(id: string, name: string): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE departments SET name = $1, updated_at = datetime('now') WHERE id = $2", [name, id]);
}

export async function updateDepartmentHrHead(id: string, hrHeadName: string): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE departments SET hr_head_name = $1, updated_at = datetime('now') WHERE id = $2", [
    hrHeadName,
    id,
  ]);
}

export async function deleteDepartment(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM departments WHERE id = $1", [id]);
}
