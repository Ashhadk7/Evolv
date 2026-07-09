"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "./card-style";

// Scroll-into-view reveal — calm, expo-out, honours reduced motion.
export function Reveal({
  children,
  delay = 0,
  y = 18,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      style={{ breakInside: "avoid", ...style }}
    >
      {children}
    </motion.div>
  );
}
