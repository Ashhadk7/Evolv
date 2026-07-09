"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Segmented meter — segments light up left→right on view. Feature-local: only used inside BlueprintDetail. */
export function SegmentedBar({
  value,
  total = 14,
  lit: litOverride,
  height = 22,
}: {
  value: number;
  total?: number;
  lit?: number;
  height?: number;
}) {
  const reduce = useReducedMotion();
  const lit = litOverride ?? Math.round((value / 100) * total);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          initial={reduce ? false : { opacity: 0.25, transform: "scaleY(0.5)" }}
          whileInView={{ opacity: 1, transform: "scaleY(1)" }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.035, duration: 0.3, ease: "easeOut" }}
          className={i < lit ? "bg-bp-mint" : "bg-[#e7eee9]"}
          style={{
            flex: 1,
            height,
            borderRadius: 3,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  );
}
