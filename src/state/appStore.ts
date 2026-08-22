import { create } from "zustand";

type View = "departments" | "department" | "archive" | "archiveMonth";

interface AppState {
  view: View;
  selectedDepartmentId: string | null;
  /** Only meaningful in the "archiveMonth" view — which past month is open. */
  archiveYear: number | null;
  archiveMonth: number | null;

  openDepartment: (id: string) => void;
  backToDepartments: () => void;
  openArchive: () => void;
  backToDepartment: () => void;
  openArchiveMonth: (year: number, month: number) => void;
  backToArchive: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "departments",
  selectedDepartmentId: null,
  archiveYear: null,
  archiveMonth: null,

  openDepartment: (id) => set({ view: "department", selectedDepartmentId: id }),

  backToDepartments: () =>
    set({ view: "departments", selectedDepartmentId: null, archiveYear: null, archiveMonth: null }),

  openArchive: () => set({ view: "archive", archiveYear: null, archiveMonth: null }),

  backToDepartment: () => set({ view: "department", archiveYear: null, archiveMonth: null }),

  openArchiveMonth: (year, month) => set({ view: "archiveMonth", archiveYear: year, archiveMonth: month }),

  backToArchive: () => set({ view: "archive", archiveYear: null, archiveMonth: null }),
}));
