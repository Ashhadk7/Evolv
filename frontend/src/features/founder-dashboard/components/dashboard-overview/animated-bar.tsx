"use client";

import { motion } from "framer-motion";

export function AnimatedBar({
  value,
  color,
  delay = 0,
}: {
  value: number;
  color: string;
  delay?: number;
}) {
  return (
    <div style={{ height: 4, borderRadius: 99, background: "#edf2ef", overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.85, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ height: "100%", borderRadius: 99, background: color }}
      />
    </div>
  );
}
