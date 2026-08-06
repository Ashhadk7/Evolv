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
  type ProjectMemberWire,
  type ProjectWire,
} from "@/features/projects/projects-api";

export type ProjectBlueprint = Blueprint & {
  project: ProjectState;
  _projectId?: string;
  _deliverablesDone?: number;
  _deliverablesTotal?: number;
};

/**
 * Overlay accepted memberships onto phase state as the authority for who is
 * engaged and what they have been paid. Invitations are excluded on purpose:
 * nobody is staffed until they accept, so health, status and spend must not
 * count a pending invite.
 */
export function applyMembersToProject(
  project: ProjectState,
  members: ProjectMemberWire[]
): ProjectState {
  if (members.length === 0) return project;

  const accepted = new Map<number, ProjectMemberWire>();
  for (const member of members) {
    if (member.status === "accepted") accepted.set(member.phase_index, member);
  }
  if (accepted.size === 0) return project;

  return {
    ...project,
    phaseStates: project.phaseStates.map((ps, index) => {
      const member = accepted.get(index);
      if (!member) return ps;
      const amountPaid = member.amount_paid_cents / 100;
      return {
        ...ps,
        totalPaid: amountPaid,
        assignment: {
          developerId: member.developer_id,
          developerName: member.developer_name,
          developerInitials: member.developer_initials,
          hiredAt: (member.responded_at ?? member.invited_at).slice(0, 10),
          amountAgreed: member.amount_agreed_cents / 100,
          amountPaid,
          payments: ps.assignment?.payments ?? [],
        },
      };
    }),
  };
}

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
    const project = applyMembersToProject(
      storedState ?? initProjectState(content),
      wire.members ?? []
    );

    return {
      ...bp,
      project: {
        ...project,
        // Always authoritative from backend:
        status: frontendStatus(wire.status),
      },
      // Store backend project id on the blueprint for later mutations.
      _projectId: wire.id,
      // Real per-phase deliverable rows are relational, not part of this blob —
      // the list view has no per-project deliverable fetch, so it relies on
      // this aggregate from the wire instead of the (now always-empty) blob.
      _deliverablesDone: wire.deliverables_done ?? 0,
      _deliverablesTotal: wire.deliverables_total ?? 0,
    } as ProjectBlueprint;
  });
}
/* Issue priority uses the danger scale — same convention as risk severity, never the ordinal must/should/nice ramp. */
export const issueTone = (p: ProjectIssue["priority"]) =>
  (p === "High" ? "red" : p === "Medium" ? "amber" : "mint") as "red" | "amber" | "mint";
export const issueStatusTone = (s: ProjectIssue["status"]) =>
  (s === "Open" ? "red" : s === "In Progress" ? "amber" : "mint") as "red" | "amber" | "mint";
