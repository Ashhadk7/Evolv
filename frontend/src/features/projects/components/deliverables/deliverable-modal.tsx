"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, PencilSimple, Trash } from "@phosphor-icons/react";
import { Chip } from "@/components/shared/chip";
import { Label } from "@/components/shared/label";
import { fmtDate } from "@/features/blueprints/blueprint-content";
import { getApiErrorMessage } from "@/lib/api";
import { deleteAttachment, deleteComment, updateComment } from "@/features/projects/collaboration-api";
import {
  addComment,
  deleteDeliverable,
  getDeliverable,
  setDeliverableStatus,
  uploadAttachment,
  type DeliverableDetail,
} from "@/features/projects/deliverables-api";
import { DELIVERABLE_STATUS_LABEL, type DeliverableStatus } from "@/features/projects/types";
import { AttachmentList } from "../collaboration/attachment-list";
import { CommentThread } from "../collaboration/comment-thread";
import { TicketModal } from "../ticket-modal";
import { TicketField, TicketLoading, TicketSection } from "../ticket-parts";

const STATUS_TONE: Record<DeliverableStatus, "amber" | "mint" | "neutral"> = {
  todo: "neutral",
  in_progress: "amber",
  in_review: "amber",
  done: "mint",
};

export function DeliverableModal({
  deliverableId,
  phaseNameFor,
  onClose,
  onChanged,
  onEdit,
}: {
  deliverableId: string;
  phaseNameFor: (index: number) => string | undefined;
  onClose: () => void;
  onChanged: () => void;
  onEdit?: (deliverable: DeliverableDetail) => void;
}) {
  const [deliverable, setDeliverable] = useState<DeliverableDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const reload = () =>
    getDeliverable(deliverableId)
      .then(setDeliverable)
      .catch((err) => setError(getApiErrorMessage(err)));

  useEffect(() => {
    let active = true;
    getDeliverable(deliverableId)
      .then((next) => {
        if (active) setDeliverable(next);
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [deliverableId]);

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

  const moveTo = (status: DeliverableStatus) =>
    run(async () => {
      await setDeliverableStatus(deliverableId, status, note);
      setNote("");
    });

  if (!deliverable) {
    return <TicketLoading message={error ?? "Loading deliverable…"} onClose={onClose} />;
  }

  return (
    <TicketModal
      id={`deliverable-${deliverable.id}`}
      eyebrow="Deliverable"
      title={deliverable.text}
      onClose={onClose}
      chips={
        <>
          <Chip tone={STATUS_TONE[deliverable.status]}>
            {DELIVERABLE_STATUS_LABEL[deliverable.status]}
          </Chip>
          <Chip>
            {phaseNameFor(deliverable.phase_index) ?? `Phase ${deliverable.phase_index + 1}`}
          </Chip>
        </>
      }
      actions={
        deliverable.can_edit && (
          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(deliverable)}
                aria-label="Edit deliverable"
                className="bg-bp-card border-bp-border-soft text-bp-muted hover:text-bp-ink hover:border-bp-mint focus-visible:ring-bp-teal flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <PencilSimple size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => run(() => deleteDeliverable(deliverable.id).then(onClose))}
              aria-label="Delete deliverable"
              className="bg-bp-card border-bp-border-soft text-bp-red hover:border-bp-red-line focus-visible:ring-bp-red flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Trash size={14} />
            </button>
          </div>
        )
      }
      sidebar={
        <div className="flex flex-col gap-3.5">
          <TicketField label="Status">
            <span className="text-bp-ink text-[12.5px] font-bold">
              {DELIVERABLE_STATUS_LABEL[deliverable.status]}
            </span>
          </TicketField>
          <TicketField label="Due">
            <span className="text-bp-body text-[12.5px]">
              {deliverable.due_date ? fmtDate(deliverable.due_date) : "No due date"}
            </span>
          </TicketField>

          {deliverable.next_statuses.length > 0 && (
            <div className="border-bp-border-soft border-t pt-3.5">
              <Label>Move this deliverable</Label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                aria-label="Note to attach to this change"
                placeholder="Add a note — progress, or an issue you hit (optional)…"
                className="text-bp-ink border-bp-border focus-visible:ring-bp-teal mt-1.5 mb-2 min-h-[62px] w-full resize-y rounded-lg border p-[9px_11px] text-[12px] outline-none focus-visible:ring-2"
              />
              <div className="flex flex-col gap-1.5">
                {deliverable.next_statuses.map((next) => (
                  <button
                    key={next}
                    type="button"
                    disabled={busy}
                    onClick={() => moveTo(next)}
                    className={
                      next === "done"
                        ? "bp-primary-btn w-full disabled:cursor-not-allowed disabled:opacity-50"
                        : "border-bp-forest text-bp-forest hover:bg-bp-forest hover:text-bp-mint focus-visible:ring-bp-teal flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[9px] border bg-transparent px-3 py-[7px] text-[11.5px] font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    }
                  >
                    {next === "done" ? (
                      <Check size={13} weight="bold" />
                    ) : (
                      <ArrowRight size={12} weight="bold" />
                    )}
                    {DELIVERABLE_STATUS_LABEL[next]}
                  </button>
                ))}
              </div>
              {!deliverable.can_edit && (
                <p className="text-bp-muted mt-2 mb-0 text-[11px] leading-relaxed">
                  Send it to In Review when you&apos;re done — the founder signs it off.
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
            {deliverable.description || "No description provided."}
          </p>
        </TicketSection>

        <AttachmentList
          attachments={deliverable.attachments}
          busy={busy}
          canDelete={(file) => file.is_mine || deliverable.can_edit}
          onUpload={(file) => run(() => uploadAttachment(deliverable.id, file))}
          onDelete={(attachmentId) => run(() => deleteAttachment(attachmentId))}
        />

        <CommentThread
          comments={deliverable.comments}
          busy={busy}
          onAdd={(body) => run(() => addComment(deliverable.id, body))}
          onEdit={(commentId, body) => run(() => updateComment(commentId, body))}
          onDelete={(commentId) => run(() => deleteComment(commentId))}
        />
      </div>
    </TicketModal>
  );
}
