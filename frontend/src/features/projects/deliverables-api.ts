import { apiFetch } from "@/lib/api";
import type { Attachment, Comment } from "./collaboration-api";
import type { DeliverableStatus } from "./types";

export interface Deliverable {
  id: string;
  project_id: string;
  phase_index: number;
  position: number;
  text: string;
  status: DeliverableStatus;
  done: boolean;
  due_date: string | null;
  can_toggle: boolean;
  next_statuses: DeliverableStatus[];
  can_edit: boolean;
  comment_count: number;
  attachment_count: number;
}

export interface DeliverableDetail extends Deliverable {
  description: string;
  comments: Comment[];
  attachments: Attachment[];
}

export interface DeliverableDraft {
  text: string;
  description: string;
  phase_index: number;
  due_date: string | null;
}

export async function listDeliverables(projectId: string): Promise<Deliverable[]> {
  const data = await apiFetch<{ total: number; items: Deliverable[] }>(
    `/projects/${projectId}/deliverables`,
    { auth: true }
  );
  return data.items;
}

export async function getDeliverable(deliverableId: string): Promise<DeliverableDetail> {
  return apiFetch<DeliverableDetail>(`/projects/deliverables/${deliverableId}`, { auth: true });
}

export async function createDeliverable(
  projectId: string,
  draft: DeliverableDraft
): Promise<Deliverable> {
  return apiFetch<Deliverable>(`/projects/${projectId}/deliverables`, {
    method: "POST",
    auth: true,
    body: draft,
  });
}

export async function updateDeliverable(
  deliverableId: string,
  patch: Partial<Omit<DeliverableDraft, "phase_index">> & { clear_due_date?: boolean }
): Promise<Deliverable> {
  return apiFetch<Deliverable>(`/projects/deliverables/${deliverableId}`, {
    method: "PATCH",
    auth: true,
    body: patch,
  });
}

export async function deleteDeliverable(deliverableId: string): Promise<void> {
  await apiFetch(`/projects/deliverables/${deliverableId}`, { method: "DELETE", auth: true });
}

export async function setDeliverableStatus(
  deliverableId: string,
  status: DeliverableStatus,
  comment?: string
): Promise<Deliverable> {
  return apiFetch<Deliverable>(`/projects/deliverables/${deliverableId}/status`, {
    method: "PATCH",
    auth: true,
    body: { status, comment: comment || null },
  });
}

export async function addComment(deliverableId: string, body: string): Promise<Comment> {
  return apiFetch<Comment>(`/projects/deliverables/${deliverableId}/comments`, {
    method: "POST",
    auth: true,
    body: { body },
  });
}

export async function uploadAttachment(deliverableId: string, file: File): Promise<Attachment> {
  const form = new FormData();
  form.append("file", file, file.name);
  return apiFetch<Attachment>(`/projects/deliverables/${deliverableId}/attachments`, {
    method: "POST",
    auth: true,
    body: form,
  });
}
