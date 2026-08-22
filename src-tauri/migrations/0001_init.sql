CREATE TABLE departments (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  hr_head_name  TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE monthly_timesheets (
  id             TEXT PRIMARY KEY,
  department_id  TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  year           INTEGER NOT NULL,
  month          INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(department_id, year, month)
);

CREATE TABLE timesheet_employees (
  id             TEXT PRIMARY KEY,
  timesheet_id   TEXT NOT NULL REFERENCES monthly_timesheets(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  position       TEXT NOT NULL,
  rate           REAL NOT NULL CHECK(rate IN (1.0, 0.75, 0.5, 0.25)),
  is_manager     INTEGER NOT NULL DEFAULT 0,
  sort_order     INTEGER NOT NULL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_te_timesheet ON timesheet_employees(timesheet_id);

CREATE TABLE day_overrides (
  id                     TEXT PRIMARY KEY,
  timesheet_employee_id  TEXT NOT NULL REFERENCES timesheet_employees(id) ON DELETE CASCADE,
  day                    INTEGER NOT NULL CHECK(day BETWEEN 1 AND 31),
  code                   TEXT NOT NULL CHECK(code IN ('MT','OZH','KV','B')),
  created_at             TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(timesheet_employee_id, day)
);
CREATE INDEX idx_do_employee ON day_overrides(timesheet_employee_id);
