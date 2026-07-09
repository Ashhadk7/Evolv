"use client";

import { motion } from "framer-motion";
import { DARK } from "@/features/settings/lib/settings-theme";

export function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative shrink-0 rounded-full transition-colors duration-200"
      style={{ width: 36, height: 20, background: on ? DARK : "#dde5e0" }}
      aria-pressed={on}
    >
      <motion.span
        className="absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-white shadow-sm"
        animate={{ x: on ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
      />
    </button>
  );
}
