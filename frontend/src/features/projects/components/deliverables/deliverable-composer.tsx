"use client";

import { useState } from "react";
import { ListChecks } from "@phosphor-icons/react";
import { Label } from "@/components/shared/label";
import { getApiErrorMessage } from "@/lib/api";
import {
  createDeliverable,
  updateDeliverable,
  type DeliverableDetail,
  type DeliverableDraft,
} from "@/features/projects/deliverables-api";
import { ModalShell } from "../modal-shell";

const FIELD =
  "text-bp-ink border-bp-border w-full rounded-lg border p-[10px_12px] text-[13px] outline-none";

function draftFrom(deliverable: DeliverableDetail | null, phaseIndex: number): DeliverableDraft {
  return {
    text: deliverable?.text ?? "",
    description: deliverable?.description ?? "",
    phase_index: deliverable?.phase_index ?? phaseIndex,
    due_date: deliverable?.due_date ?? null,
  };
}

export function DeliverableComposer({
  projectId,
  phaseIndex,
  phaseName,
  editing,
  onSaved,
  onClose,
}: {
  projectId: string;
  phaseIndex: number;
  phaseName: string;
  editing: DeliverableDetail | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<DeliverableDraft>(() => draftFrom(editing, phaseIndex));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      if (editing) {
        await updateDeliverable(editing.id, {
          text: draft.text,
          description: draft.description,
          due_date: draft.due_date,
          clear_due_date: draft.due_date === null,
        });
      } else {
        await createDeliverable(projectId, draft);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      icon={<ListChecks size={16} weight="duotone" className="text-bp-teal" />}
      title={editing ? "Edit deliverable" : "Add a deliverable"}
      subtitle={phaseName}
      onClose={onClose}
    >
      {error && (
        <div className="border-bp-red-line bg-bp-red-bg text-bp-red mb-3 rounded-lg border px-3 py-2 text-[12px]">
          {error}
        </div>
      )}

      <Label>Title</Label>
      <input
        value={draft.text}
        onChange={(e) => setDraft({ ...draft, text: e.target.value })}
        placeholder="e.g. Ship the login flow"
        className={`${FIELD} mb-3.5`}
      />

      <Label>Description</Label>
      <textarea
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        placeholder="What does done look like for this deliverable?"
        className={`${FIELD} mb-3.5 min-h-[90px] resize-y`}
      />

      <Label>Due date (optional)</Label>
      <input
        type="date"
        value={draft.due_date ?? ""}
        onChange={(e) => setDraft({ ...draft, due_date: e.target.value || null })}
        className={`${FIELD} mb-5`}
      />

      <button
        onClick={save}
        disabled={busy || !draft.text.trim()}
        className="bp-gradient-btn w-full rounded-xl p-[11px] text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {editing ? "Save changes" : "Add deliverable"}
      </button>
    </ModalShell>
  );
}
