import type { ProjectIssue, ProjectState } from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";
import { FOUNDER_NETWORK_PROFILES } from "@/features/network/data";
import type { FounderContactProfile } from "@/features/network/types";

export type ProjectBlueprint = Blueprint & { project: ProjectState };

/* ═══════════════════════════════════════════════════════ */
/* Small local helpers                                        */
/* ═══════════════════════════════════════════════════════ */
export function currentPhaseIndex(project: ProjectState): number {
  const idx = project.phaseStates.findIndex((ps) => ps.status !== "Complete");
  return idx === -1 ? Math.max(0, project.phaseStates.length - 1) : idx;
}
export function devsForSkillset(skillset: string[]): FounderContactProfile[] {
  const devs = FOUNDER_NETWORK_PROFILES.filter((p) => p.type === "Developer");
  const matched = devs.filter((d) =>
    skillset.some((s) =>
      d.skills.some(
        (sk) =>
          sk.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(sk.toLowerCase())
      )
    )
  );
  return matched.length ? matched : devs;
}
/* Issue priority uses the danger scale — same convention as risk severity, never the ordinal must/should/nice ramp. */
export const issueTone = (p: ProjectIssue["priority"]) =>
  (p === "High" ? "red" : p === "Medium" ? "amber" : "mint") as "red" | "amber" | "mint";
export const issueStatusTone = (s: ProjectIssue["status"]) =>
  (s === "Open" ? "red" : s === "In Progress" ? "amber" : "mint") as "red" | "amber" | "mint";
