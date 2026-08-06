import { apiFetch } from "@/lib/api";
import type { Attachment, Comment } from "./collaboration-api";
import type { IssuePriority, IssueStatus } from "./types";

export interface Issue {
  id: string;
  project_id: string;
  phase_index: number | null;
  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  reporter_id: string | null;
  reporter_name: string | null;
  assignee_id: string | null;
  assignee_name: string | null;
  assignee_initials: string | null;
  due_date: string | null;
  assigned_to_me: boolean;
  can_edit: boolean;
  allowed_status_transitions: IssueStatus[];
  comment_count: number;
  attachment_count: number;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface IssueDetail extends Issue {
  comments: Comment[];
  attachments: Attachment[];
}

export interface AssigneeOption {
  user_id: string;
  name: string;
  initials: string;
  phase_indices: number[];
}

export interface IssueDraft {
  title: string;
  description: string;
  priority: IssuePriority;
  phase_index: number | null;
  assignee_id: string | null;
  due_date: string | null;
}

export const ISSUE_STATUS_LABEL: Record<IssueStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  in_review: "In Review",
  resolved: "Resolved",
};

export const ISSUE_PRIORITY_LABEL: Record<IssuePriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export async function listIssues(projectId: string): Promise<Issue[]> {
  const data = await apiFetch<{ total: number; items: Issue[] }>(
    `/projects/${projectId}/issues`,
    { auth: true }
  );
  return data.items;
}

export async function getIssue(issueId: string): Promise<IssueDetail> {
  return apiFetch<IssueDetail>(`/projects/issues/${issueId}`, { auth: true });
}

export async function listAssignees(projectId: string): Promise<AssigneeOption[]> {
  const data = await apiFetch<{ items: AssigneeOption[] }>(
    `/projects/${projectId}/assignees`,
    { auth: true }
  );
  return data.items;
}

export async function createIssue(projectId: string, draft: IssueDraft): Promise<Issue> {
  return apiFetch<Issue>(`/projects/${projectId}/issues`, {
    method: "POST",
    auth: true,
    body: {
      title: draft.title,
      description: draft.description,
      priority: draft.priority,
      phase_index: draft.phase_index,
      assignee_id: draft.assignee_id,
      due_date: draft.due_date,
    },
  });
}

export async function updateIssue(
  issueId: string,
  patch: Partial<IssueDraft> & { clear_assignee?: boolean; clear_due_date?: boolean }
): Promise<Issue> {
  return apiFetch<Issue>(`/projects/issues/${issueId}`, {
    method: "PATCH",
    auth: true,
    body: patch,
  });
}

export async function setIssueStatus(issueId: string, status: IssueStatus): Promise<Issue> {
  return apiFetch<Issue>(`/projects/issues/${issueId}/status`, {
    method: "PATCH",
    auth: true,
    body: { status },
  });
}

export async function addComment(issueId: string, body: string): Promise<Comment> {
  return apiFetch<Comment>(`/projects/issues/${issueId}/comments`, {
    method: "POST",
    auth: true,
    body: { body },
  });
}

export async function uploadAttachment(issueId: string, file: File): Promise<Attachment> {
  const form = new FormData();
  form.append("file", file, file.name);
  return apiFetch<Attachment>(`/projects/issues/${issueId}/attachments`, {
    method: "POST",
    auth: true,
    body: form,
  });
}
