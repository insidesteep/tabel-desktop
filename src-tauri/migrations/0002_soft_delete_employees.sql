-- Deleting an employee from a month's roster no longer erases them from
-- department history: it just hides them from the active roster so they can
-- still be picked from the "previously in this department" suggestions when
-- re-adding someone later.
ALTER TABLE timesheet_employees ADD COLUMN removed INTEGER NOT NULL DEFAULT 0;
CREATE INDEX idx_te_timesheet_active ON timesheet_employees(timesheet_id, removed);
