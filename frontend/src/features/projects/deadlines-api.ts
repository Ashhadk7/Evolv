import { apiFetch } from "@/lib/api";
import type { DeadlineStatus, IssuePriority } from "./types";

export interface DeadlineAssignee {
  user_id: string;
  name: string;
  initials: string;
  met_at: string | null;
}

export type DeadlineSource = "deadline" | "issue" | "deliverable";

export interface Deadline {
  id: string;
  project_id: string;
  source: DeadlineSource;
  phase_index: number | null;
  note: string;
  priority: IssuePriority;
  due_date: string;
  status: DeadlineStatus;
  assignees: DeadlineAssignee[];
  assigned_to_me: boolean;
  met_by_me: boolean;
  can_edit: boolean;
  created_at: string;
}

export interface DeadlineDraft {
  note: string;
  due_date: string;
  priority: IssuePriority;
  phase_index: number | null;
  assignee_ids: string[];
}

export async function listDeadlines(projectId: string): Promise<Deadline[]> {
  const data = await apiFetch<{ total: number; items: Deadline[] }>(
    `/projects/${projectId}/deadlines`,
    { auth: true }
  );
  return data.items;
}

export async function createDeadline(
  projectId: string,
  draft: DeadlineDraft
): Promise<Deadline> {
  return apiFetch<Deadline>(`/projects/${projectId}/deadlines`, {
    method: "POST",
    auth: true,
    body: draft,
  });
}

export async function updateDeadline(
  deadlineId: string,
  patch: Partial<DeadlineDraft> & { status?: DeadlineStatus }
): Promise<Deadline> {
  return apiFetch<Deadline>(`/projects/deadlines/${deadlineId}`, {
    method: "PATCH",
    auth: true,
    body: patch,
  });
}

export async function deleteDeadline(deadlineId: string): Promise<void> {
  await apiFetch(`/projects/deadlines/${deadlineId}`, { method: "DELETE", auth: true });
}

export async function setDeadlineMet(deadlineId: string, met: boolean): Promise<Deadline> {
  return apiFetch<Deadline>(`/projects/deadlines/${deadlineId}/met`, {
    method: "PATCH",
    auth: true,
    body: { met },
  });
}
