"use client";

import { useState } from "react";
import { Users } from "@phosphor-icons/react";
import {
  computePipeline,
  type Blueprint,
} from "@/features/founder-dashboard/data/dashboard-overview-data";

export interface ProjectPipelineCounts {
  matchedCount: number;
  incomingCount: number;
  connectedCount: number;
  hiredCount: number;
}

export function DevPipelineWidget({
  blueprints,
  pipelineByBlueprintId,
}: {
  blueprints: Blueprint[];
  /** Per-venture counts, scoped to that blueprint's own applications/matches/hires. */
  pipelineByBlueprintId: Record<string, ProjectPipelineCounts>;
}) {
  const [selectedId, setSelectedId] = useState("latest");

  // Determine which blueprint is active — same dropdown pattern as Venture
  // Roadmap / Venture Progress, for consistency.
  const activeBp =
    selectedId === "latest"
      ? blueprints[0]
      : blueprints.find((b) => b.id === selectedId) || blueprints[0];

  const counts = activeBp
    ? (pipelineByBlueprintId[activeBp.id] ?? {
        matchedCount: 0,
        incomingCount: 0,
        connectedCount: 0,
        hiredCount: 0,
      })
    : { matchedCount: 0, incomingCount: 0, connectedCount: 0, hiredCount: 0 };
  const rows = computePipeline(counts);

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
          <Users size={14} weight="bold" style={{ color: "#7C5CBF" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26" }}>
            Developer Pipeline
          </span>
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
