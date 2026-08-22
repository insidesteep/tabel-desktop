import { useLocaleStore } from "../../state/localeStore";
import { translate, type TranslationKey } from "./translations";

/** For non-component code (repo/store files) that fires a one-shot message —
 * reads the current locale without subscribing, since there's no re-render
 * to drive. Components should use useT() instead so they react to switches. */
export function t(key: TranslationKey, vars?: Record<string, string | number>): string {
  return translate(useLocaleStore.getState().locale, key, vars);
}

/** For components — subscribes to locale so they re-render on switch. */
export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  return (key: TranslationKey, vars?: Record<string, string | number>) => translate(locale, key, vars);
}
