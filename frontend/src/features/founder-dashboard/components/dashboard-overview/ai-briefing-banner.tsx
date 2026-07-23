"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AI_CONTENT,
  type AIContentShape,
  type AIState,
} from "@/features/founder-dashboard/data/dashboard-overview-data";

export function AIBriefingBanner({
  state,
  onCta,
  overrideContent,
}: {
  state: AIState;
  onCta: () => void;
  overrideContent?: AIContentShape;
}) {
  const c = overrideContent ?? AI_CONTENT[state];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "#ffffff",
          borderRadius: 16,
          padding: "14px 18px",
          border: "1px solid #eaeeed",
        }}
      >
        {/* Icon bubble */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: c.accentBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {c.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1a2e26" }}>
              AI Venture Briefing
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: c.accentText,
                background: c.accentBg,
                borderRadius: 6,
                padding: "2px 6px",
              }}
            >
              {c.accentLabel}
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: "#4a6a5a", lineHeight: 1.55, marginBottom: 8 }}>
            <strong style={{ color: "#1a2e26" }}>{c.heading}</strong> — {c.body}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {c.tags.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 10.5,
                  fontWeight: 500,
                  padding: "3px 10px",
                  borderRadius: 99,
                  background: "#f2f6f4",
                  color: "#4a6a5a",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.button
          onClick={onCta}
          whileHover={{ scale: 1.03, boxShadow: "0 6px 20px rgba(26,49,44,0.22)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="bp-gradient-btn"
          style={{
            flexShrink: 0,
            padding: "9px 16px",
            borderRadius: 11,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {c.cta} →
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
