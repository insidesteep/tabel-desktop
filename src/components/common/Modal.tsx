import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useT } from "../../lib/i18n/t";

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  width = 420,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  width?: number;
}) {
  const t = useT();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40"
                style={{ background: "rgba(15, 17, 21, 0.35)" }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 4 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5 outline-none"
                style={{ width, background: "var(--surface)", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)" }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title className="text-[15px] font-semibold" style={{ color: "var(--text)" }}>
                    {title}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      aria-label={t("common.close")}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </Dialog.Close>
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
