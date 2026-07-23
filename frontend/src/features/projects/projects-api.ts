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

/** Map backend → frontend project status. */
export function frontendStatus(s: BackendProjectStatus): ProjectStatus {
  if (s === "completed" || s === "cancelled") return "COMPLETED";
  if (s === "paused") return "ONBOARDING";
  return "IN_DEVELOPMENT"; // "active"
}

/** Map frontend → backend project status. */
export function backendStatus(s: ProjectStatus): BackendProjectStatus {
  if (s === "COMPLETED") return "completed";
  if (s === "ONBOARDING") return "paused";
  return "active"; // "IN_DEVELOPMENT"
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
