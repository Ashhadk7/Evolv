import { apiFetch } from "@/lib/api";
import type { ProjectState, ProjectStatus } from "@/features/blueprints/blueprint-content";

// ─── Wire types (match backend schemas/projects.py exactly) ───────────────────

export type BackendProjectStatus = "active" | "paused" | "completed" | "cancelled";

export interface ProjectWire {
  id: string;
  blueprint_id: string;
  founder_id: string;
  developer_id: string | null;
  status: BackendProjectStatus;
  title: string;
  milestones: Record<string, unknown>[] | null;
  members?: ProjectMemberWire[];
  deliverables_done?: number;
  deliverables_total?: number;
  created_at: string;
  updated_at: string;
}

interface ProjectListWire {
  total: number;
  limit: number;
  offset: number;
  items: ProjectWire[];
}

// ─── Status bridge ────────────────────────────────────────────────────────────

/**
 * The two maps are exact inverses. Collapsing distinct backend statuses onto one
 * frontend status would round-trip a cancelled project back as completed on the
 * next save, so every value keeps its own identity.
 */
const STATUS_TO_BACKEND: Record<ProjectStatus, BackendProjectStatus> = {
  ONBOARDING: "paused",
  IN_DEVELOPMENT: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const STATUS_TO_FRONTEND: Record<BackendProjectStatus, ProjectStatus> = {
  paused: "ONBOARDING",
  active: "IN_DEVELOPMENT",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

/** Map backend → frontend project status. */
export function frontendStatus(s: BackendProjectStatus): ProjectStatus {
  return STATUS_TO_FRONTEND[s] ?? "IN_DEVELOPMENT";
}

/** Map frontend → backend project status. */
export function backendStatus(s: ProjectStatus): BackendProjectStatus {
  return STATUS_TO_BACKEND[s] ?? "active";
}

// ─── Milestones serialisation ─────────────────────────────────────────────────

/**
 * Serialise a frontend ProjectState to the backend milestones array.
 * We store the full phase state array as-is so it can be round-tripped
 * without loss of deliverables, assignments, expenses, or issues.
 */
export function serialiseMilestones(project: ProjectState): Record<string, unknown>[] {
  return [
    { key: "projectState", value: project as unknown as Record<string, unknown> },
  ];
}

/**
 * Deserialise backend milestones back to a partial ProjectState.
 * Returns null when milestones are missing/invalid (new project with no state yet).
 */
export function deserialiseMilestones(
  milestones: Record<string, unknown>[] | null
): ProjectState | null {
  if (!milestones || milestones.length === 0) return null;
  const entry = milestones.find((m) => m.key === "projectState");
  if (!entry || !entry.value) return null;
  const value = entry.value as Record<string, unknown>;
  // The cast below trusts the stored shape completely. If the persisted
  // document is ever missing phaseStates (or it isn't an array), a naive
  // cast lets a malformed ProjectState flow straight into normalizeProjectState
  // downstream, which calls `.map` on phaseStates and throws — that render
  // crash is what would actually produce an empty-looking "no projects" page
  // after refresh, not a clean zero state. Guard against it explicitly and
  // fall back to null (caller falls back to a fresh initProjectState) instead.
  if (!Array.isArray(value.phaseStates)) {
    console.error(
      "[projects] Stored milestones are missing a valid phaseStates array; ignoring persisted state.",
      value
    );
    return null;
  }
  return value as unknown as ProjectState;
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function listProjects(): Promise<ProjectWire[]> {
  const data = await apiFetch<ProjectListWire>("/projects", { auth: true });
  return data.items;
}

export async function createProject(payload: {
  blueprint_id: string;
  title: string;
  milestones: Record<string, unknown>[] | null;
}): Promise<ProjectWire> {
  return apiFetch<ProjectWire>("/projects", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export async function updateProjectStatus(
  projectId: string,
  status: BackendProjectStatus
): Promise<ProjectWire> {
  return apiFetch<ProjectWire>(`/projects/${projectId}/status`, {
    method: "PATCH",
    auth: true,
    body: { status },
  });
}

export type ProjectMemberStatus =
  | "invited"
  | "accepted"
  | "declined"
  | "revoked"
  | "removed";

export interface ProjectMemberWire {
  id: string;
  project_id: string;
  developer_id: string;
  developer_name: string;
  developer_initials: string;
  phase_index: number;
  status: ProjectMemberStatus;
  amount_agreed_cents: number;
  amount_paid_cents: number;
  invited_at: string;
  responded_at: string | null;
  removed_at: string | null;
  removal_reason: string | null;
}

export async function listProjectMembers(projectId: string): Promise<ProjectMemberWire[]> {
  const data = await apiFetch<{ total: number; items: ProjectMemberWire[] }>(
    `/projects/${projectId}/members`,
    { auth: true }
  );
  return data.items;
}

export async function inviteProjectMember(
  projectId: string,
  payload: { developer_id: string; phase_index: number; amount_agreed_cents: number }
): Promise<ProjectMemberWire> {
  return apiFetch<ProjectMemberWire>(`/projects/${projectId}/members`, {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export async function revokeProjectInvite(memberId: string): Promise<ProjectMemberWire> {
  return apiFetch<ProjectMemberWire>(`/projects/members/${memberId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function recordProjectPayment(
  memberId: string,
  payload: { amount_cents: number; idempotency_key: string }
): Promise<ProjectMemberWire> {
  return apiFetch<ProjectMemberWire>(`/projects/members/${memberId}/payments`, {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export async function removeProjectMember(
  memberId: string,
  reason: string
): Promise<ProjectMemberWire> {
  return apiFetch<ProjectMemberWire>(`/projects/members/${memberId}/remove`, {
    method: "POST",
    auth: true,
    body: { reason },
  });
}

export async function updateProjectMilestones(
  projectId: string,
  milestones: Record<string, unknown>[]
): Promise<ProjectWire> {
  return apiFetch<ProjectWire>(`/projects/${projectId}/milestones`, {
    method: "PUT",
    auth: true,
    body: { milestones },
  });
}
