import { apiFetch } from "@/lib/api";

export interface Comment {
  id: string;
  author_id: string | null;
  author_name: string;
  author_initials: string;
  body: string;
  is_mine: boolean;
  created_at: string;
  edited_at: string | null;
}

export interface Attachment {
  id: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  url: string;
  uploader_name: string;
  is_mine: boolean;
  created_at: string;
}

export const ATTACHMENT_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,application/pdf";

export async function updateComment(commentId: string, body: string): Promise<Comment> {
  return apiFetch<Comment>(`/projects/comments/${commentId}`, {
    method: "PATCH",
    auth: true,
    body: { body },
  });
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiFetch(`/projects/comments/${commentId}`, { method: "DELETE", auth: true });
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  await apiFetch(`/projects/attachments/${attachmentId}`, { method: "DELETE", auth: true });
}
