import {
  PROJECT_STATUS_LABEL,
  type ProjectState,
  type ProjectStatus,
} from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";

// Tailwind only emits classes it can read as complete strings, so the project
// palette is mapped to static classes here rather than built from
// PROJECT_STATUS_STYLE's hex values at runtime.
const PROJECT_TONE: Record<ProjectStatus, { text: string; dot: string }> = {
  ONBOARDING: { text: "text-[#a66a10]", dot: "bg-[#a66a10]" },
  IN_DEVELOPMENT: { text: "text-[#1d6e47]", dot: "bg-[#1d6e47]" },
  COMPLETED: { text: "text-[#4f6358]", dot: "bg-[#4f6358]" },
  CANCELLED: { text: "text-[#a33a30]", dot: "bg-[#a33a30]" },
};

const PUBLISHED_TONE = { text: "text-bp-success", dot: "bg-[#3a9a6f]" };
const DRAFT_TONE = { text: "text-[#8a9a92]", dot: "bg-[#b6c6bd]" };

/** Dot + uppercase label used at the top of every workspace idea card. */
export function StatusBadge({
  status,
  project,
}: {
  status: Blueprint["status"];
  project?: ProjectState;
}) {
  const tone = project
    ? PROJECT_TONE[project.status]
    : status === "PUBLISHED"
      ? PUBLISHED_TONE
      : DRAFT_TONE;
  const label = project
    ? PROJECT_STATUS_LABEL[project.status]
    : status === "PUBLISHED"
      ? "Published"
      : "Draft";

  return (
    <span
      className={`inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.08em] uppercase ${tone.text}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`} />
      {label}
    </span>
  );
}
