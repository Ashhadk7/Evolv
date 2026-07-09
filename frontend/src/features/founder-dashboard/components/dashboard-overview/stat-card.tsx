"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "@phosphor-icons/react";
import type { Metric } from "@/features/founder-dashboard/data/dashboard-overview-data";
import { AreaSparkline } from "./area-sparkline";

export function StatCard({ metric, index }: { metric: Metric; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, boxShadow: "0 12px 36px rgba(15,28,24,0.09)", borderColor: "#c8ddd4" }}
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "18px 20px 16px",
        border: "1px solid #eaeeed",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        cursor: "default",
        transition: "border-color 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#8aab9a",
          }}
        >
          {metric.label}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            fontSize: 11,
            fontWeight: 700,
            color: metric.deltaUp ? "#2e7d5c" : "#b03030",
            background: metric.deltaUp ? "#edf8f2" : "#fdf0f0",
            padding: "2px 7px",
            borderRadius: 99,
          }}
        >
          {metric.deltaUp ? (
            <ArrowUp size={9} weight="bold" />
          ) : (
            <ArrowDown size={9} weight="bold" />
          )}
          {metric.delta}
        </span>
      </div>

      <div
        style={{
          fontSize: "2rem",
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
          color: "#1a2e26",
          marginTop: 6,
        }}
      >
        {metric.value}
      </div>

      <div style={{ fontSize: 11, color: "#8aab9a", marginBottom: 8 }}>{metric.sub}</div>

      <div style={{ height: 38, marginTop: "auto" }}>
        <AreaSparkline data={metric.trend} color={metric.accentColor} height={38} />
      </div>
    </motion.div>
  );
}
