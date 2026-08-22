import { create } from "zustand";
import * as employeesRepo from "../lib/db/employees.repo";
import * as overridesRepo from "../lib/db/overrides.repo";
import { nextAlphabeticalOrder, renumber } from "../lib/timesheet/ordering";
import type { OverrideCode, Rate, TimesheetEmployee } from "../lib/timesheet/types";
import { reportError } from "./toastStore";
import { t } from "../lib/i18n/t";

type OverridesMap = Record<string, Record<number, OverrideCode>>;

interface TimesheetState {
  timesheetId: string | null;
  year: number;
  month: number;
  employees: TimesheetEmployee[];
  overrides: OverridesMap;
  loading: boolean;
  saving: boolean;

  load: (timesheetId: string, year: number, month: number, employees: TimesheetEmployee[], overrides: OverridesMap) => void;

  addEmployee: (fullName: string, position: string, rate: Rate, isManager: boolean) => Promise<void>;
  updateEmployeeField: (id: string, patch: Partial<Pick<TimesheetEmployee, "full_name" | "position" | "rate">>) => void;
  deleteEmployee: (id: string) => void;
  setManager: (id: string) => void;

  reorderLocal: (newRestOrder: TimesheetEmployee[]) => void;
  commitReorder: () => void;

  setOverrideRange: (employeeId: string, days: number[], code: OverrideCode) => void;
  clearOverrideRange: (employeeId: string, days: number[]) => void;
}

async function track<T>(
  _get: () => TimesheetState,
  set: (fn: (s: TimesheetState) => Partial<TimesheetState>) => void,
  fn: () => Promise<T>,
) {
  set(() => ({ saving: true }));
  try {
    await fn();
  } catch (err) {
    reportError(t("common.saveError"), err);
  } finally {
    set(() => ({ saving: false }));
  }
}

export const useTimesheetStore = create<TimesheetState>((set, get) => ({
  timesheetId: null,
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  employees: [],
  overrides: {},
  loading: false,
  saving: false,

  load: (timesheetId, year, month, employees, overrides) =>
    set({ timesheetId, year, month, employees, overrides, loading: false }),

  addEmployee: async (fullName, position, rate, isManager) => {
    const { timesheetId, employees } = get();
    if (!timesheetId) return;
    const id = crypto.randomUUID();
    const sortOrder = isManager ? 0 : nextAlphabeticalOrder(employees, fullName);

    const optimistic: TimesheetEmployee = {
      id,
      timesheet_id: timesheetId,
      full_name: fullName,
      position,
      rate,
      is_manager: isManager ? 1 : 0,
      sort_order: sortOrder,
      created_at: "",
      updated_at: "",
    };

    set((s) => ({
      employees: isManager
        ? [...s.employees.map((e) => ({ ...e, is_manager: 0 as const })), optimistic]
        : [...s.employees, optimistic],
    }));

    await track(get, set, () =>
      employeesRepo.createEmployee({
        id,
        timesheetId,
        fullName,
        position,
        rate,
        isManager,
        sortOrder,
      }),
    );
  },

  updateEmployeeField: (id, patch) => {
    set((s) => ({
      employees: s.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
    void track(get, set, () => employeesRepo.updateEmployee(id, patch));
  },

  deleteEmployee: (id) => {
    set((s) => ({ employees: s.employees.filter((e) => e.id !== id) }));
    void track(get, set, () => employeesRepo.deleteEmployee(id));
  },

  setManager: (id) => {
    const { timesheetId } = get();
    if (!timesheetId) return;
    set((s) => ({
      employees: s.employees.map((e) => ({ ...e, is_manager: e.id === id ? 1 : 0 })),
    }));
    void track(get, set, () => employeesRepo.setManager(timesheetId, id));
  },

  reorderLocal: (newRestOrder) => {
    set((s) => {
      const manager = s.employees.find((e) => e.is_manager);
      return { employees: manager ? [manager, ...newRestOrder] : newRestOrder };
    });
  },

  commitReorder: () => {
    const rest = get().employees.filter((e) => !e.is_manager);
    const entries = renumber(rest);
    const byId = new Map(entries.map((e) => [e.id, e.sort_order]));
    set((s) => ({
      employees: s.employees.map((e) => (byId.has(e.id) ? { ...e, sort_order: byId.get(e.id)! } : e)),
    }));
    void track(get, set, () => employeesRepo.renumberEmployees(entries));
  },

  setOverrideRange: (employeeId, days, code) => {
    set((s) => {
      const forEmployee = { ...(s.overrides[employeeId] ?? {}) };
      for (const day of days) forEmployee[day] = code;
      return { overrides: { ...s.overrides, [employeeId]: forEmployee } };
    });
    void track(get, set, () => overridesRepo.setOverrideRange(employeeId, days, code));
  },

  clearOverrideRange: (employeeId, days) => {
    set((s) => {
      const forEmployee = { ...(s.overrides[employeeId] ?? {}) };
      for (const day of days) delete forEmployee[day];
      return { overrides: { ...s.overrides, [employeeId]: forEmployee } };
    });
    void track(get, set, () => overridesRepo.clearOverrideRange(employeeId, days));
  },
}));
