"use client";

import { motion } from "framer-motion";
import { Eye } from "@phosphor-icons/react";
import type { Blueprint } from "@/features/founder-dashboard/data/dashboard-overview-data";
import { AnimatedBar } from "./animated-bar";

export function IdeaCard({
  bp,
  onView,
  index,
}: {
  bp: Blueprint;
  onView: (id: string) => void;
  index: number;
}) {
  const viabilityColor =
    bp.viability >= 70 ? "#2e7d5c" : bp.viability >= 50 ? "#C4973A" : "#b03030";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: 0.16 + index * 0.08 }}
      whileHover={{ y: -4, boxShadow: "0 12px 36px rgba(15,28,24,0.09)", borderColor: "#c8ddd4" }}
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "18px 18px 14px",
        border: "1px solid #eaeeed",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        cursor: "default",
        transition: "border-color 0.2s ease",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#1a2e26",
              lineHeight: 1.3,
              marginBottom: 3,
            }}
          >
            {bp.name}
          </div>
          <div style={{ fontSize: 11.5, color: "#8aab9a" }}>
            {bp.industry} · {bp.updatedAt}
          </div>
        </div>
        {/* Status pill — PUBLISHED or DRAFT only */}
        <span
          style={{
            flexShrink: 0,
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 99,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            background: bp.isPublic ? "#edf8f2" : "#f5f5f4",
            color: bp.isPublic ? "#2e7d5c" : "#888",
            border: `1px solid ${bp.isPublic ? "#b8e8cc" : "#e0e0de"}`,
            marginLeft: 10,
          }}
        >
          {bp.isPublic ? "Published" : "Draft"}
        </span>
      </div>

      {/* Viability */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              color: "#8aab9a",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Viability
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: viabilityColor }}>
            {bp.viability}%
          </span>
        </div>
        <AnimatedBar value={bp.viability} color={viabilityColor} delay={0.18 + index * 0.08} />
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingTop: 12,
          borderTop: "1px solid #f0f3f1",
        }}
      >
        <div style={{ display: "flex", flex: 1, gap: 12 }}>
          <div>
            <div
              style={{
                fontSize: 9.5,
                color: "#8aab9a",
                marginBottom: 1,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Devs
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26" }}>{bp.devMatches}</div>
          </div>
          <div>
            <div
              style={{
                fontSize: 9.5,
                color: "#8aab9a",
                marginBottom: 1,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Views
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26" }}>{bp.views}</div>
          </div>
        </div>
        <motion.button
          onClick={() => onView(bp.id)}
          whileHover={{ scale: 1.06, color: "#1a312c" }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
            color: "#428475",
            cursor: "pointer",
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          <Eye size={13} />
          View
        </motion.button>
      </div>
    </motion.div>
  );
}
