import { create } from "zustand";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastState {
  message: string | null;
  variant: "error" | "success";
  action: ToastAction | null;
  showError: (message: string) => void;
  showSuccess: (message: string, action?: ToastAction) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  variant: "error",
  action: null,
  showError: (message) => {
    console.error(message);
    set({ message, variant: "error", action: null });
  },
  showSuccess: (message, action) => {
    set({ message, variant: "success", action: action ?? null });
  },
  clear: () => set({ message: null, action: null }),
}));

export function reportError(context: string, err: unknown) {
  const detail = err instanceof Error ? err.message : String(err);
  useToastStore.getState().showError(`${context}: ${detail}`);
}
