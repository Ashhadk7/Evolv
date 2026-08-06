"use client";

import { useState } from "react";
import { CalendarBlank } from "@phosphor-icons/react";
import { Label } from "@/components/shared/label";
import { getApiErrorMessage } from "@/lib/api";
import type { BlueprintContent } from "@/features/blueprints/blueprint-content";
import type { IssuePriority } from "@/features/projects/developer-projects-api";
import {
  createDeadline,
  updateDeadline,
  type Deadline,
  type DeadlineDraft,
} from "@/features/projects/deadlines-api";
import type { AssigneeOption } from "@/features/projects/issues-api";
import { ModalShell } from "../modal-shell";

const FIELD =
  "text-bp-ink border-bp-border w-full rounded-lg border p-[10px_12px] text-[13px] outline-none";

function draftFrom(deadline: Deadline | null): DeadlineDraft {
  return {
    note: deadline?.note ?? "",
    due_date: deadline?.due_date ?? "",
    priority: deadline?.priority ?? "medium",
    phase_index: deadline?.phase_index ?? null,
    assignee_ids: deadline?.assignees.map((a) => a.user_id) ?? [],
  };
}

export function DeadlineComposer({
  projectId,
  phases,
  assignees,
  editing,
  onSaved,
  onClose,
}: {
  projectId: string;
  phases: BlueprintContent["phases"];
  assignees: AssigneeOption[];
  editing: Deadline | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<DeadlineDraft>(() => draftFrom(editing));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggleAssignee = (userId: string) =>
    setDraft((prev) => ({
      ...prev,
      assignee_ids: prev.assignee_ids.includes(userId)
        ? prev.assignee_ids.filter((id) => id !== userId)
        : [...prev.assignee_ids, userId],
    }));

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      if (editing) await updateDeadline(editing.id, draft);
      else await createDeadline(projectId, draft);
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
      icon={<CalendarBlank size={16} weight="duotone" className="text-bp-teal" />}
      title={editing ? "Edit deadline" : "Set a deadline"}
      subtitle={editing ? undefined : "Assign the people responsible for hitting it"}
      onClose={onClose}
    >
      {error && (
        <div className="border-bp-red-line bg-bp-red-bg text-bp-red mb-3 rounded-lg border px-3 py-2 text-[12px]">
          {error}
        </div>
      )}

      <Label>What is due</Label>
      <input
        value={draft.note}
        onChange={(e) => setDraft({ ...draft, note: e.target.value })}
        placeholder="e.g. Beta build ready for internal testing"
        className={`${FIELD} mb-3.5`}
      />

      <div className="mb-3.5 grid grid-cols-2 gap-3">
        <div>
          <Label>Due date</Label>
          <input
            type="date"
            value={draft.due_date}
            onChange={(e) => setDraft({ ...draft, due_date: e.target.value })}
            className={FIELD}
          />
        </div>
        <div>
          <Label>Priority</Label>
          <select
            value={draft.priority}
            onChange={(e) =>
              setDraft({ ...draft, priority: e.target.value as IssuePriority })
            }
            className={`${FIELD} bg-bp-card`}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <Label>Phase (optional)</Label>
      <select
        value={draft.phase_index === null ? "" : draft.phase_index}
        onChange={(e) =>
          setDraft({
            ...draft,
            phase_index: e.target.value === "" ? null : Number(e.target.value),
          })
        }
        className={`${FIELD} bg-bp-card mb-3.5`}
      >
        <option value="">General</option>
        {phases.map((phase, index) => (
          <option key={phase.name} value={index}>
            {phase.name}
          </option>
        ))}
      </select>

      <Label>Responsible</Label>
      {assignees.length === 0 ? (
        <p className="text-bp-muted mt-0 mb-5 text-[12px]">
          Nobody has accepted a phase on this project yet.
        </p>
      ) : (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {assignees.map((option) => {
            const picked = draft.assignee_ids.includes(option.user_id);
            return (
              <button
                key={option.user_id}
                type="button"
                onClick={() => toggleAssignee(option.user_id)}
                className={`cursor-pointer rounded-full border px-3 py-[5px] text-[11.5px] font-semibold ${
                  picked
                    ? "bg-bp-forest text-bp-mint border-transparent"
                    : "bg-bp-tint text-bp-muted border-bp-border-soft"
                }`}
              >
                {option.name}
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={save}
        disabled={busy || !draft.note.trim() || !draft.due_date}
        className="bp-gradient-btn w-full rounded-xl p-[11px] text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {editing ? "Save changes" : "Set deadline"}
      </button>
    </ModalShell>
  );
}
