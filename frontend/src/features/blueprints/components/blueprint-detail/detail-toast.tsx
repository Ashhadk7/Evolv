"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";

export function DetailToast({ toast }: { toast: string | null }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="blueprint-no-print bg-bp-forest text-bp-mint fixed bottom-[30px] left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-2xl px-5 py-[11px] text-[13px] font-semibold shadow-[0_14px_40px_rgba(11,34,27,0.42)]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
        >
          <CheckCircle size={16} weight="fill" /> {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
