"use client";

import { motion } from "framer-motion";
import { EASE } from "./card-style";

/** Thin gradient meter line. */
export function MeterBar({ value, height = 8 }: { value: number; height?: number }) {
  return (
    <div style={{ height, background: "#e7eee9", borderRadius: 999, overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE }}
        style={{
          height: "100%",
          borderRadius: 999,
          background: "linear-gradient(90deg, #428475, #89d7b7)",
        }}
      />
    </div>
  );
}
