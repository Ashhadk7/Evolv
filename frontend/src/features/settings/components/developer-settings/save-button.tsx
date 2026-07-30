"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "@phosphor-icons/react";

const HOVER = { y: -2, boxShadow: "0 10px 26px rgba(26,49,44,0.22)" };
const TAP = { scale: 0.98 };
const SPRING = { type: "spring", stiffness: 400, damping: 24 } as const;

export function SaveButton({
  label = "Save Changes",
  disabled = false,
  onSave,
}: {
  label?: string;
  disabled?: boolean;
  onSave: () => void | Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const inert = disabled || saving;

  const handleClick = async () => {
    if (inert) return;
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.button
      type="button"
      disabled={inert}
      aria-busy={saving}
      onClick={() => void handleClick()}
      whileHover={inert ? undefined : HOVER}
      whileTap={inert ? undefined : TAP}
      transition={SPRING}
      className="bp-gradient-btn flex items-center justify-center gap-2 rounded-lg py-3 text-[13px] font-extrabold"
    >
      <Check size={15} weight="bold" />
      {saving ? "Saving..." : label}
    </motion.button>
  );
}
