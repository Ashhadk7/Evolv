import { motion } from "framer-motion";
import { Eye, PencilSimple, Sparkle, Trash } from "@phosphor-icons/react";
import { PROJECT_STATUS_STYLE } from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";
import { StatusBadge } from "./status-badge";

// Feature-local: the workspace list-view card for a single blueprint idea.
export function IdeaCard({
  bp,
  idx,
  onView,
  onDelete,
}: {
  bp: Blueprint;
  idx: number;
  onView: () => void;
  onDelete: () => void;
  canPublish: boolean;
  onCompleteProfile?: () => void;
  onTogglePublic: () => void;
}) {
  const pub = bp.status === "PUBLISHED";
  const accent = bp.project
    ? PROJECT_STATUS_STYLE[bp.project.status].color
    : pub
      ? "#89d7b7"
      : "#c8d8d0";
  const metrics = [
    { value: String(bp.viability), label: "Viability" },
    { value: `${bp.marketPotential}%`, label: "Market" },
    { value: String(bp.investorViews), label: "Impressions" },
    { value: String(bp.devMatches), label: "Dev Matches" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ delay: idx * 0.07, type: "spring", stiffness: 260, damping: 24 }}
      whileHover={{ y: -3, boxShadow: "0 16px 44px rgba(26,49,44,0.12)" }}
      style={{
        background: "#fff",
        border: "1px solid #e4ece7",
        borderLeft: `4px solid ${accent}`,
        borderRadius: 18,
        padding: "24px 26px 22px 24px",
        boxShadow: "0 2px 12px rgba(26,49,44,0.06)",
      }}
    >
      {/* Header: name + badge */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#1a2e26",
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            {bp.name}
          </h3>
          <StatusBadge status={bp.status} project={bp.project} />
        </div>
        <span style={{ fontSize: 11, color: "#9ab4a4", flexShrink: 0, marginLeft: 12 }}>
          {bp.updatedAt}
        </span>
      </div>

      {/* Industry pill */}
      <div style={{ marginBottom: 14 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
            color: "#1d6e47",
            background: "#e8f5ef",
            padding: "4px 10px",
            borderRadius: 999,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: 999,
              background: "#89d7b7",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          {bp.industry}
        </span>
      </div>

      {/* Description */}
      <p
        className="line-clamp-2"
        style={{ fontSize: 13, color: "#5a7a6a", lineHeight: 1.6, marginBottom: 20 }}
      >
        {bp.ideaDesc}
      </p>

      {/* Metrics — unified grid on green-tinted background */}
      <div
        style={{
          display: "flex",
          background: "#f3f8f5",
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 18,
          border: "1px solid #e0ede6",
        }}
      >
        {metrics.map((m, i) => (
          <div
            key={m.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "14px 8px",
              borderRight: i < metrics.length - 1 ? "1px solid #e0ede6" : "none",
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 900, color: "#1a2e26", lineHeight: 1 }}>
              {m.value}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#7a9e8e",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginTop: 5,
              }}
            >
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* AI Recommend */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "12px 14px",
          background: "#fffbef",
          border: "1px solid #edd98a",
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <Sparkle
          size={13}
          weight="fill"
          style={{ color: "#b07d10", flexShrink: 0, marginTop: 1 }}
        />
        <span style={{ fontSize: 12, color: "#7a5c10", lineHeight: 1.5 }}>
          <strong style={{ color: "#b07d10" }}>AI: </strong>
          {bp.aiRecommend}
        </span>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 16,
          borderTop: "1px solid #edf2ee",
        }}
      >
        <span style={{ fontSize: 12, color: "#9ab4a4" }}>
          {bp.wordCount} words · {bp.interested} interested
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.04, filter: "brightness(1.08)" }}
            whileTap={{ scale: 0.96 }}
            onClick={onView}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              padding: "8px 18px",
              borderRadius: 10,
              background: "linear-gradient(180deg, #234840, #1a312c)",
              color: "#89d7b7",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 14px -4px rgba(17, 34, 27, 0.4)",
            }}
          >
            <Eye size={13} weight="bold" /> View
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, background: "#e3ede8" }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              padding: "8px 18px",
              borderRadius: 10,
              background: "#eef4f1",
              color: "#428475",
              border: "1px solid #d8e8e0",
              cursor: "pointer",
            }}
          >
            <PencilSimple size={13} /> Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, background: "#fdeceb", borderColor: "#f3c3bf" }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            onClick={onDelete}
            aria-label="Delete idea"
            title="Delete idea"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 12px",
              borderRadius: 10,
              background: "#f6f2f1",
              color: "#c0554c",
              border: "1px solid #e6d3d1",
              cursor: "pointer",
            }}
          >
            <Trash size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
