"use client";

import { useState } from "react";
import { Bug } from "@phosphor-icons/react";
import { Label } from "@/components/shared/label";
import { getApiErrorMessage } from "@/lib/api";
import type { BlueprintContent } from "@/features/blueprints/blueprint-content";
import type { IssuePriority } from "@/features/projects/developer-projects-api";
import {
  createIssue,
  updateIssue,
  type AssigneeOption,
  type IssueDetail,
  type IssueDraft,
} from "@/features/projects/issues-api";
import { ModalShell } from "../modal-shell";

const FIELD =
  "text-bp-ink border-bp-border w-full rounded-lg border p-[10px_12px] text-[13px] outline-none";

function draftFrom(issue: IssueDetail | null): IssueDraft {
  return {
    title: issue?.title ?? "",
    description: issue?.description ?? "",
    priority: issue?.priority ?? "medium",
    phase_index: issue?.phase_index ?? null,
    assignee_id: issue?.assignee_id ?? null,
    due_date: issue?.due_date ?? null,
  };
}

export function IssueComposer({
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
  editing: IssueDetail | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<IssueDraft>(() => draftFrom(editing));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      if (editing) {
        await updateIssue(editing.id, {
          ...draft,
          clear_assignee: draft.assignee_id === null,
          clear_due_date: draft.due_date === null,
        });
      } else {
        await createIssue(projectId, draft);
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
      icon={<Bug size={16} weight="duotone" className="text-bp-red" />}
      title={editing ? "Edit issue" : "Raise an issue"}
      subtitle={editing ? undefined : "Track a fix and assign it to a developer"}
      onClose={onClose}
    >
      {error && (
        <div className="border-bp-red-line bg-bp-red-bg text-bp-red mb-3 rounded-lg border px-3 py-2 text-[12px]">
          {error}
        </div>
      )}

      <Label>Title</Label>
      <input
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        placeholder="e.g. Dashboard chart doesn't update on filter change"
        className={`${FIELD} mb-3.5`}
      />

      <Label>What needs to change</Label>
      <textarea
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        placeholder="Describe the fix, steps to reproduce, and what good looks like…"
        className={`${FIELD} mb-3.5 min-h-[90px] resize-y`}
      />

      <div className="mb-3.5 grid grid-cols-2 gap-3">
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
        <div>
          <Label>Phase (optional)</Label>
          <select
            value={draft.phase_index === null ? "" : draft.phase_index}
            onChange={(e) =>
              setDraft({
                ...draft,
                phase_index: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className={`${FIELD} bg-bp-card`}
          >
            <option value="">General</option>
            {phases.map((phase, index) => (
              <option key={phase.name} value={index}>
                {phase.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div>
          <Label>Assignee</Label>
          <select
            value={draft.assignee_id ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, assignee_id: e.target.value || null })
            }
            className={`${FIELD} bg-bp-card`}
          >
            <option value="">Unassigned</option>
            {assignees.map((option) => (
              <option key={option.user_id} value={option.user_id}>
                {option.name}
              </option>
            ))}
          </select>
          {assignees.length === 0 && (
            <p className="text-bp-muted mt-1 mb-0 text-[11px]">
              Nobody has accepted a phase on this project yet.
            </p>
          )}
        </div>
        <div>
          <Label>Due date</Label>
          <input
            type="date"
            value={draft.due_date ?? ""}
            onChange={(e) => setDraft({ ...draft, due_date: e.target.value || null })}
            className={FIELD}
          />
        </div>
      </div>

      <button
        onClick={save}
        disabled={busy || !draft.title.trim()}
        className="bp-gradient-btn w-full rounded-xl p-[11px] text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {editing ? "Save changes" : "Raise issue"}
      </button>
    </ModalShell>
  );
}
