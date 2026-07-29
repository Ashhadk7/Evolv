import {
  buildBlueprintContent,
  initProjectState,
  type ProjectIssue,
  type ProjectState,
} from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";
import {
  deserialiseMilestones,
  frontendStatus,
  type ProjectWire,
} from "@/features/projects/projects-api";

export type ProjectBlueprint = Blueprint & { project: ProjectState };

/* ═══════════════════════════════════════════════════════ */
/* Small local helpers                                        */
/* ═══════════════════════════════════════════════════════ */
export function currentPhaseIndex(project: ProjectState): number {
  const idx = project.phaseStates.findIndex((ps) => ps.status !== "Complete");
  return idx === -1 ? Math.max(0, project.phaseStates.length - 1) : idx;
}

/**
 * Merge backend project rows (milestones/status) onto their blueprints.
 * Shared by every screen that needs a blueprint's real phase state — the
 * Projects tab, and the founder Dashboard's Venture Progress / Roadmap /
 * Developer Pipeline cards. Pure function: given the founder's blueprints
 * and the CURRENT backend project rows, produce the enriched blueprint
 * list — no caching, always recomputed from the latest of both.
 */
export function mergeBlueprintsWithProjects(
  blueprints: Blueprint[],
  apiProjects: ProjectWire[]
): Blueprint[] {
  const byBlueprint = new Map<string, ProjectWire>();
  for (const p of apiProjects) byBlueprint.set(p.blueprint_id, p);

  return blueprints.map((bp) => {
    const wire = byBlueprint.get(bp.id);
    if (!wire) return bp;

    // Prefer persisted phase state from milestones; fall back to a fresh init.
    const storedState = deserialiseMilestones(wire.milestones);
    const content = buildBlueprintContent(bp);
    const project = storedState ?? initProjectState(content);

    return {
      ...bp,
      project: {
        ...project,
        // Always authoritative from backend:
        status: frontendStatus(wire.status),
      },
      // Store backend project id on the blueprint for later mutations.
      _projectId: wire.id,
    } as Blueprint & { _projectId: string };
  });
}
/* Issue priority uses the danger scale — same convention as risk severity, never the ordinal must/should/nice ramp. */
export const issueTone = (p: ProjectIssue["priority"]) =>
  (p === "High" ? "red" : p === "Medium" ? "amber" : "mint") as "red" | "amber" | "mint";
export const issueStatusTone = (s: ProjectIssue["status"]) =>
  (s === "Open" ? "red" : s === "In Progress" ? "amber" : "mint") as "red" | "amber" | "mint";
