import { AnimatePresence, motion } from "framer-motion";
import { useT } from "../../lib/i18n/t";

export function SavedIndicator({ saving, tone = "light" }: { saving: boolean; tone?: "light" | "dark" }) {
  const t = useT();
  const mutedColor = tone === "dark" ? "rgba(255,255,255,0.75)" : "var(--text-muted)";
  const dotColor = tone === "dark" ? "rgba(255,255,255,0.85)" : "var(--accent)";
  const successColor = tone === "dark" ? "#4ade80" : "var(--success)";
  return (
    <div className="flex h-6 items-center gap-1.5 text-xs font-medium" style={{ color: mutedColor }}>
      <AnimatePresence mode="wait">
        {saving ? (
          <motion.div
            key="saving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: dotColor }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 0.9 }}
            />
            {t("saved.saving")}
          </motion.div>
        ) : (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-1.5"
            style={{ color: successColor }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6.5L4.5 9L10 3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("saved.saved")}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
