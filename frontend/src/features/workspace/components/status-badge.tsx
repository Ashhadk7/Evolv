import {
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_STYLE,
  type ProjectState,
} from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";

// Feature-local: only used inside the workspace feature (IdeaCard, BlueprintDetail).
export function StatusBadge({
  status,
  project,
}: {
  status: Blueprint["status"];
  project?: ProjectState;
}) {
  if (project) {
    const s = PROJECT_STATUS_STYLE[project.status];
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "4px 10px",
          borderRadius: 999,
          background: s.bg,
          color: s.color,
        }}
      >
        {PROJECT_STATUS_LABEL[project.status]}
      </span>
    );
  }
  const pub = status === "PUBLISHED";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "4px 10px",
        borderRadius: 999,
        background: pub ? "#dcf0e6" : "#eff2f0",
        color: pub ? "#1d6e47" : "#7a9e8e",
      }}
    >
      {pub ? "Published" : "Draft"}
    </span>
  );
}
