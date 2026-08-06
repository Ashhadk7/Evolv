"use client";

import { useState } from "react";
import { CalendarBlank, CheckSquare, PencilSimple, Plus, Square, Trash } from "@phosphor-icons/react";
import { Chip } from "@/components/shared/chip";
import { Kicker } from "@/components/shared/kicker";
import { ScrollArea } from "@/components/shared/scroll-area";
import { fmtDate } from "@/features/blueprints/blueprint-content";
import type { Deadline } from "@/features/projects/deadlines-api";
import { AssigneeFilter, EVERYONE, MINE, type AssigneeOption } from "../assignee-filter";

const STATUS_TONE = { pending: "neutral", met: "mint", missed: "red" } as const;
const PRIORITY_TONE = { high: "red", medium: "amber", low: "mint" } as const;
const SOURCE_LABEL = {
  deadline: "Deadline",
  issue: "From issue",
  deliverable: "From deliverable",
} as const;

export function DeadlinesPanel({
  deadlines,
  today,
  phaseNameFor,
  busyId,
  onCreate,
  onEdit,
  onDelete,
  onToggleMet,
}: {
  deadlines: Deadline[];
  today: string;
  phaseNameFor: (index: number) => string | undefined;
  busyId?: string | null;
  onCreate?: () => void;
  onEdit?: (deadline: Deadline) => void;
  onDelete?: (deadline: Deadline) => void;
  onToggleMet?: (deadline: Deadline) => void;
}) {
  const [filter, setFilter] = useState(EVERYONE);

  const pending = deadlines.filter((d) => d.status === "pending").length;
  const mineCount = deadlines.filter((d) => d.assigned_to_me).length;
  const visible =
    filter === EVERYONE
      ? deadlines
      : filter === MINE
        ? deadlines.filter((d) => d.assigned_to_me)
        : deadlines.filter((d) => d.assignees.some((a) => a.user_id === filter));

  const assigneeOptions = Array.from(
    deadlines
      .flatMap((d) => d.assignees)
      .reduce((acc, assignee) => {
        const existing = acc.get(assignee.user_id);
        acc.set(assignee.user_id, {
          id: assignee.user_id,
          name: assignee.name,
          count: (existing?.count ?? 0) + 1,
        });
        return acc;
      }, new Map<string, AssigneeOption>())
      .values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="bg-bp-card border-bp-border rounded-2xl border p-[18px_20px] shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)]">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <CalendarBlank size={17} weight="duotone" className="text-bp-teal" />
          <div>
            <Kicker>Deadlines</Kicker>
            <h3 className="text-bp-ink text-[15px] font-extrabold">{pending} outstanding</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AssigneeFilter
            options={assigneeOptions}
            value={filter}
            mineCount={mineCount}
            totalCount={deadlines.length}
            onChange={setFilter}
          />
          {onCreate && (
            <button type="button" onClick={onCreate} className="bp-primary-btn">
              <Plus size={11} weight="bold" /> New
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-bp-muted m-0 text-[12.5px]">
          {filter === EVERYONE
            ? "No deadlines set on this project yet."
            : "Nothing due for this person."}
        </p>
      ) : (
        <ScrollArea size="md">
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {visible.map((deadline) => {
            const overdue = deadline.status === "pending" && deadline.due_date < today;
            const MetIcon = deadline.met_by_me ? CheckSquare : Square;

            return (
              <li
                key={deadline.id}
                className="border-bp-border-soft bg-bp-tint rounded-xl border p-[10px_12px]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-bp-ink text-[12.5px] font-bold leading-snug">
                    {deadline.note}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Chip tone={overdue ? "red" : STATUS_TONE[deadline.status]}>
                      {fmtDate(deadline.due_date)}
                    </Chip>
                    {deadline.can_edit && onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(deadline)}
                        className="text-bp-muted cursor-pointer border-none bg-transparent p-0"
                      >
                        <PencilSimple size={12} />
                      </button>
                    )}
                    {deadline.can_edit && onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(deadline)}
                        className="text-bp-red cursor-pointer border-none bg-transparent p-0"
                      >
                        <Trash size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {deadline.source !== "deadline" && (
                    <Chip>{SOURCE_LABEL[deadline.source]}</Chip>
                  )}
                  <Chip tone={PRIORITY_TONE[deadline.priority]}>{deadline.priority}</Chip>
                  {deadline.phase_index !== null && (
                    <Chip>
                      {phaseNameFor(deadline.phase_index) ?? `Phase ${deadline.phase_index + 1}`}
                    </Chip>
                  )}
                  {deadline.assignees.map((assignee) => (
                    <Chip key={assignee.user_id} tone={assignee.met_at ? "mint" : "neutral"}>
                      {assignee.name}
                      {assignee.met_at ? " ✓" : ""}
                    </Chip>
                  ))}
                  {deadline.assignees.length === 0 && (
                    <span className="text-bp-muted text-[11px]">Nobody assigned</span>
                  )}
                </div>

                {deadline.assigned_to_me && onToggleMet && (
                  <button
                    type="button"
                    disabled={busyId === deadline.id}
                    onClick={() => onToggleMet(deadline)}
                    className="text-bp-forest mt-2 flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[11.5px] font-bold disabled:opacity-50"
                  >
                    <MetIcon
                      size={14}
                      weight={deadline.met_by_me ? "fill" : "regular"}
                      className={deadline.met_by_me ? "text-bp-success" : "text-bp-label"}
                    />
                    {deadline.met_by_me ? "You marked this met" : "Mark as met"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        </ScrollArea>
      )}
    </div>
  );
}
