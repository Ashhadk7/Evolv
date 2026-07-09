"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, MONO, NUM } from "./card-style";
import { CountNum } from "./count-num";

/** Circular viability gauge — gradient arc, soft glow, counting centre. */
export function ViabilityGauge({
  score,
  label = "VIABILITY",
  size = 190,
}: {
  score: number;
  label?: string;
  size?: number;
}) {
  const reduce = useReducedMotion();
  const scale = size / 190;
  const r = 76,
    cx = 95,
    cy = 95,
    sw = 12;
  const Circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 190 190" style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#428475" />
            <stop offset="100%" stopColor="#89d7b7" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e7eee9" strokeWidth={sw} />
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={Circ}
          initial={
            reduce ? { strokeDashoffset: Circ * (1 - score / 100) } : { strokeDashoffset: Circ }
          }
          whileInView={{ strokeDashoffset: Circ * (1 - score / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: EASE }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="text-bp-ink"
          style={{
            fontSize: 50 * scale,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            ...NUM,
          }}
        >
          <CountNum value={score} />
        </div>
        <div
          className="text-bp-label"
          style={{
            fontSize: 10 * Math.max(scale, 0.85),
            fontWeight: 600,
            letterSpacing: "0.2em",
            marginTop: 6 * scale,
            fontFamily: MONO,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
