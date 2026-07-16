"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WarningCircle, X } from "@phosphor-icons/react";

export function NetworkActionToast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed right-5 bottom-5 z-[70] w-[320px] overflow-hidden rounded-xl border border-[#ead7c2] bg-[#fff8ef] shadow-[0_18px_44px_rgba(15,28,24,0.16)]"
        >
          <div className="flex items-start gap-3 px-4 py-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff1df] text-[#c26a1b]">
              <WarningCircle size={18} weight="fill" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-extrabold text-[#1a2e26]">Action needed</p>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="rounded-md p-1 text-[#b8793a] transition hover:bg-[#fff1df]"
                  aria-label="Dismiss network action message"
                >
                  <X size={13} weight="bold" />
                </button>
              </div>
              <p className="mt-1 text-[12px] leading-5 text-[#935f24]">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
