import { create } from "zustand";
import type { ExportModel } from "../lib/export/buildExportRows";

interface PrintState {
  model: ExportModel | null;
  setModel: (model: ExportModel | null) => void;
}

export const usePrintStore = create<PrintState>((set) => ({
  model: null,
  setModel: (model) => set({ model }),
}));
