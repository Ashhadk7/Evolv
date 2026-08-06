"use client";

import { useEffect, useState } from "react";
import { ArrowRight, PencilSimple } from "@phosphor-icons/react";
import { Avatar } from "@/components/shared/avatar";
import { Chip } from "@/components/shared/chip";
import { Label } from "@/components/shared/label";
import { fmtDate } from "@/features/blueprints/blueprint-content";
import { getApiErrorMessage } from "@/lib/api";
import { deleteAttachment, deleteComment, updateComment } from "@/features/projects/collaboration-api";
import type { IssueStatus } from "@/features/projects/types";
import {
  ISSUE_PRIORITY_LABEL,
  ISSUE_STATUS_LABEL,
  addComment,
  getIssue,
  setIssueStatus,
  uploadAttachment,
  type IssueDetail,
} from "@/features/projects/issues-api";
import { AttachmentList } from "../collaboration/attachment-list";
import { CommentThread } from "../collaboration/comment-thread";
import { TicketModal } from "../ticket-modal";
import { TicketField, TicketLoading, TicketSection } from "../ticket-parts";

const PRIORITY_TONE = { high: "red", medium: "amber", low: "mint" } as const;
const STATUS_TONE: Record<IssueStatus, "red" | "amber" | "mint" | "neutral"> = {
  open: "red",
  in_progress: "amber",
  in_review: "amber",
  resolved: "mint",
};

export function IssueModal({
  issueId,
  phaseNameFor,
  onClose,
  onChanged,
  onEdit,
}: {
  issueId: string;
  phaseNameFor: (index: number) => string | undefined;
  onClose: () => void;
  onChanged: () => void;
  onEdit?: (issue: IssueDetail) => void;
}) {
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () =>
    getIssue(issueId)
      .then(setIssue)
      .catch((err) => setError(getApiErrorMessage(err)));

  useEffect(() => {
    let active = true;
    getIssue(issueId)
      .then((next) => {
        if (active) setIssue(next);
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [issueId]);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      await reload();
      onChanged();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!issue) {
    return <TicketLoading message={error ?? "Loading issue…"} onClose={onClose} />;
  }

  return (
    <TicketModal
      id={`issue-${issue.id}`}
      eyebrow="Issue"
      title={issue.title}
      onClose={onClose}
      chips={
        <>
          <Chip tone={STATUS_TONE[issue.status]}>{ISSUE_STATUS_LABEL[issue.status]}</Chip>
          <Chip tone={PRIORITY_TONE[issue.priority]}>{ISSUE_PRIORITY_LABEL[issue.priority]}</Chip>
          {issue.phase_index !== null && (
            <Chip>{phaseNameFor(issue.phase_index) ?? `Phase ${issue.phase_index + 1}`}</Chip>
          )}
        </>
      }
      actions={
        issue.can_edit &&
        onEdit && (
          <button
            type="button"
            onClick={() => onEdit(issue)}
            aria-label="Edit issue"
            className="bg-bp-card border-bp-border-soft text-bp-muted hover:text-bp-ink hover:border-bp-mint focus-visible:ring-bp-teal flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <PencilSimple size={14} />
          </button>
        )
      }
      sidebar={
        <div className="flex flex-col gap-3.5">
          <TicketField label="Assignee">
            {issue.assignee_name ? (
              <div className="flex items-center gap-1.5">
                <Avatar initials={issue.assignee_initials ?? "?"} size={22} />
                <span className="text-bp-ink text-[12.5px] font-bold">{issue.assignee_name}</span>
              </div>
            ) : (
              <span className="text-bp-muted text-[12.5px]">Unassigned</span>
            )}
          </TicketField>
          <TicketField label="Reported by">
            <span className="text-bp-body text-[12.5px]">{issue.reporter_name ?? "—"}</span>
          </TicketField>
          <TicketField label="Due">
            <span className="text-bp-body text-[12.5px]">
              {issue.due_date ? fmtDate(issue.due_date) : "No due date"}
            </span>
          </TicketField>

          {issue.allowed_status_transitions.length > 0 && (
            <div className="border-bp-border-soft border-t pt-3.5">
              <Label>Move this issue</Label>
              <div className="mt-1.5 flex flex-col gap-1.5">
                {issue.allowed_status_transitions.map((next) => (
                  <button
                    key={next}
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => setIssueStatus(issue.id, next))}
                    className="border-bp-forest text-bp-forest hover:bg-bp-forest hover:text-bp-mint focus-visible:ring-bp-teal flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[9px] border bg-transparent px-3 py-[7px] text-[11.5px] font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowRight size={12} weight="bold" /> {ISSUE_STATUS_LABEL[next]}
                  </button>
                ))}
              </div>
              {!issue.can_edit && (
                <p className="text-bp-muted mt-2 mb-0 text-[11px] leading-relaxed">
                  Send it to In Review when you&apos;re done — the founder confirms it as resolved.
                </p>
              )}
            </div>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="border-bp-red-line bg-bp-red-bg text-bp-red rounded-lg border px-3 py-2 text-[12px]">
            {error}
          </div>
        )}

        <TicketSection label="Description">
          <p className="text-bp-body m-0 text-[13px] leading-relaxed whitespace-pre-wrap">
            {issue.description || "No description provided."}
          </p>
        </TicketSection>

        <AttachmentList
          attachments={issue.attachments}
          busy={busy}
          canDelete={(file) => file.is_mine || issue.can_edit}
          onUpload={(file) => run(() => uploadAttachment(issue.id, file))}
          onDelete={(attachmentId) => run(() => deleteAttachment(attachmentId))}
        />

        <CommentThread
          comments={issue.comments}
          busy={busy}
          onAdd={(body) => run(() => addComment(issue.id, body))}
          onEdit={(commentId, body) => run(() => updateComment(commentId, body))}
          onDelete={(commentId) => run(() => deleteComment(commentId))}
        />
      </div>
    </TicketModal>
  );
}
