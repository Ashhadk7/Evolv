"use client";

import { useState } from "react";
import { TrendUp } from "@phosphor-icons/react";
import {
  getRoadmapForBlueprint,
  type Blueprint,
} from "@/features/founder-dashboard/data/dashboard-overview-data";

export function VentureRoadmapWidget({ blueprints }: { blueprints: Blueprint[] }) {
  const [selectedId, setSelectedId] = useState("latest");

  // Determine which blueprint is active
  const activeBp =
    selectedId === "latest"
      ? blueprints[0]
      : blueprints.find((b) => b.id === selectedId) || blueprints[0];

  const roadmap = getRoadmapForBlueprint(activeBp);

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
          <TrendUp size={14} weight="bold" style={{ color: "#7C5CBF" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26" }}>Venture Roadmap</span>
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
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {roadmap.map((item, i) => (
          <div key={item.phase} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                top: 2,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background:
                    item.status === "completed"
                      ? "#428475"
                      : item.status === "active"
                        ? "#7C5CBF"
                        : "#eaeeed",
                  border: item.status === "active" ? "2px solid #ffffff" : "none",
                  boxShadow: item.status === "active" ? "0 0 0 2px #7C5CBF" : "none",
                  zIndex: 2,
                }}
              />
              {i < roadmap.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    bottom: -20,
                    width: 1.5,
                    background: item.status === "completed" ? "#428475" : "#eaeeed",
                    zIndex: 1,
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#8aab9a",
                    textTransform: "uppercase",
                  }}
                >
                  {item.phase}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "1px 5px",
                    borderRadius: 4,
                    background:
                      item.status === "completed"
                        ? "#edf8f2"
                        : item.status === "active"
                          ? "#f3effa"
                          : "#f5f5f4",
                    color:
                      item.status === "completed"
                        ? "#2e7d5c"
                        : item.status === "active"
                          ? "#7C5CBF"
                          : "#888",
                  }}
                >
                  {item.date}
                </span>
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#1a2e26" }}>{item.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
