"use client";

import { useState } from "react";
import { ChartLine } from "@phosphor-icons/react";
import type { Blueprint } from "@/features/founder-dashboard/data/dashboard-overview-data";
import { AnimatedBar } from "./animated-bar";

export function VentureHealthWidget({ blueprints }: { blueprints: Blueprint[] }) {
  const [selectedId, setSelectedId] = useState("latest");

  // Determine which blueprint is active
  const activeBp =
    selectedId === "latest"
      ? blueprints[0]
      : blueprints.find((b) => b.id === selectedId) || blueprints[0];

  // Dynamically calculate health bars based on the active blueprint's viability
  const baseViability = activeBp ? activeBp.viability : 70;

  const dynamicBars = [
    {
      label: "Market Strength",
      value: Math.min(95, Math.max(45, baseViability + 6)),
      color: "#428475",
    },
    {
      label: "Design Completeness",
      value: Math.min(95, Math.max(40, baseViability - 12)),
      color: "#89d7b7",
    },
    {
      label: "Developer Availability",
      value: Math.min(95, Math.max(35, baseViability - 5)),
      color: "#7C5CBF",
    },
    {
      label: "Execution Readiness",
      value: Math.min(95, Math.max(30, baseViability - 18)),
      color: "#C4973A",
    },
  ];

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "18px 20px",
        border: "1px solid #eaeeed",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <ChartLine size={14} weight="bold" style={{ color: "#428475" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26" }}>Venture Progress</span>
        </div>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#4a6a5a",
            background: "#f2f6f4",
            border: "1px solid #eaeeed",
            borderRadius: 8,
            padding: "4px 24px 4px 10px",
            cursor: "pointer",
            outline: "none",
            maxWidth: 160,
            textOverflow: "ellipsis",
            appearance: "none",
            WebkitAppearance: "none",
            backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%234a6a5a' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 6px center",
            backgroundSize: "14px",
          }}
        >
          <option value="latest">Latest Venture</option>
          {blueprints.map((bp) => (
            <option key={bp.id} value={bp.id}>
              {bp.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {dynamicBars.map((h, i) => (
          <div key={h.label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 11.5, color: "#4a6a5a" }}>{h.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1a2e26" }}>{h.value}%</span>
            </div>
            <AnimatedBar value={h.value} color={h.color} delay={i * 0.1} />
          </div>
        ))}
      </div>
    </div>
  );
}
