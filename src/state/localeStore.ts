import { create } from "zustand";

export type Locale = "uz" | "ru";

const STORAGE_KEY = "tabel-locale";

function loadInitial(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "uz" || saved === "ru") return saved;
  } catch {
    // localStorage unavailable — fall through to the default
  }
  return "uz";
}

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: loadInitial(),
  setLocale: (locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore — locale just won't persist across restarts
    }
    set({ locale });
  },
}));
