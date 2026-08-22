import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "../../state/toastStore";
import { useT } from "../../lib/i18n/t";

export function Toast() {
  const t = useT();
  const message = useToastStore((s) => s.message);
  const variant = useToastStore((s) => s.variant);
  const action = useToastStore((s) => s.action);
  const clear = useToastStore((s) => s.clear);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(clear, variant === "success" ? 6000 : 8000);
    return () => window.clearTimeout(t);
  }, [message, variant, clear]);

  const bg = variant === "success" ? "var(--success)" : "var(--danger)";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
            className="pointer-events-auto flex max-w-lg items-center gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: bg, color: "white", boxShadow: "var(--shadow-lg)" }}
          >
            {variant === "success" ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.4" />
                <path d="M5 8.2l2 2 4-4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.4" />
                <path d="M8 4.5v4M8 11h.01" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            )}
            <span className="break-words">{message}</span>
            {action && (
              <button
                onClick={() => {
                  action.onClick();
                  clear();
                }}
                className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                {action.label}
              </button>
            )}
            <button onClick={clear} className="ml-1 shrink-0 opacity-80" aria-label={t("common.close")}>
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
