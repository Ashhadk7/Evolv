import type { ProjectIssue, ProjectState } from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";

export type ProjectBlueprint = Blueprint & { project: ProjectState };

/* ═══════════════════════════════════════════════════════ */
/* Small local helpers                                        */
/* ═══════════════════════════════════════════════════════ */
export function currentPhaseIndex(project: ProjectState): number {
  const idx = project.phaseStates.findIndex((ps) => ps.status !== "Complete");
  return idx === -1 ? Math.max(0, project.phaseStates.length - 1) : idx;
}
/* Issue priority uses the danger scale — same convention as risk severity, never the ordinal must/should/nice ramp. */
export const issueTone = (p: ProjectIssue["priority"]) =>
  (p === "High" ? "red" : p === "Medium" ? "amber" : "mint") as "red" | "amber" | "mint";
export const issueStatusTone = (s: ProjectIssue["status"]) =>
  (s === "Open" ? "red" : s === "In Progress" ? "amber" : "mint") as "red" | "amber" | "mint";
