"use client";

import { Users } from "@phosphor-icons/react";
import type { PipelineRow } from "@/features/founder-dashboard/data/dashboard-overview-data";
import { PIPELINE } from "@/features/founder-dashboard/data/dashboard-overview-data";

export function DevPipelineWidget({ pipeline }: { pipeline?: PipelineRow[] }) {
  const rows = pipeline ?? PIPELINE;
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Users size={14} weight="bold" style={{ color: "#7C5CBF" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26" }}>Developer Pipeline</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: i < rows.length - 1 ? "1px solid #f0f3f1" : "none",
            }}
          >
            <span style={{ fontSize: 12.5, color: "#4a6a5a" }}>{row.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {row.badge && (
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 99,
                    background: `${row.badgeColor}18`,
                    color: row.badgeColor,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {row.badge}
                </span>
              )}
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#1a2e26",
                  letterSpacing: "-0.02em",
                }}
              >
                {row.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
