"use client";

import { CalendarBlank, ChatCircle, CheckSquare, Paperclip, Plus, Square } from "@phosphor-icons/react";
import { Chip } from "@/components/shared/chip";
import { ScrollArea } from "@/components/shared/scroll-area";
import { fmtDate } from "@/features/blueprints/blueprint-content";
import type { Deliverable } from "@/features/projects/deliverables-api";
import { DELIVERABLE_STATUS_LABEL } from "@/features/projects/types";

export function DeliverableList({
  deliverables,
  today,
  onOpen,
  onCreate,
}: {
  deliverables: Deliverable[];
  today: string;
  onOpen: (deliverableId: string) => void;
  onCreate?: () => void;
}) {
  const doneCount = deliverables.filter((d) => d.done).length;

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-bp-forest text-[11px] font-extrabold tracking-[0.08em] uppercase">
          Deliverables
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-bp-muted text-[11px] font-bold">
            {doneCount}/{deliverables.length} completed
          </span>
          {onCreate && (
            <button
              type="button"
              onClick={onCreate}
              className="text-bp-teal flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[11px] font-bold"
            >
              <Plus size={12} weight="bold" /> Add
            </button>
          )}
        </div>
      </div>

      {deliverables.length === 0 ? (
        <p className="text-bp-muted mb-5 text-[12.5px]">No deliverables listed for this phase yet.</p>
      ) : (
        <ScrollArea size="md">
        <div className="mb-5 flex flex-col gap-2">
          {deliverables.map((deliverable) => {
            const Icon = deliverable.done ? CheckSquare : Square;
            const overdue =
              !deliverable.done && Boolean(deliverable.due_date) && deliverable.due_date! < today;

            return (
              <button
                key={deliverable.id}
                type="button"
                onClick={() => onOpen(deliverable.id)}
                className={`flex w-full cursor-pointer items-start gap-3 rounded-xl px-4 py-3.5 text-left transition-colors duration-200 ${
                  deliverable.done
                    ? "border border-[#cfeadd] bg-[#e8f5ef]"
                    : "border-bp-border-soft bg-bp-card border"
                }`}
              >
                <Icon
                  size={18}
                  weight={deliverable.done ? "fill" : "regular"}
                  className={`mt-0.5 shrink-0 ${deliverable.done ? "text-bp-success" : "text-bp-label"}`}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span
                    className={`text-[13.5px] leading-[1.5] break-words ${
                      deliverable.done
                        ? "font-semibold text-[#1d6e47] line-through"
                        : "text-bp-ink font-medium no-underline"
                    }`}
                  >
                    {deliverable.text}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {deliverable.status !== "todo" && (
                      <Chip tone={deliverable.status === "in_review" ? "amber" : "neutral"}>
                        {DELIVERABLE_STATUS_LABEL[deliverable.status]}
                      </Chip>
                    )}
                    {deliverable.due_date && (
                      <Chip
                        icon={<CalendarBlank size={10} weight="fill" />}
                        tone={overdue ? "red" : "neutral"}
                      >
                        {fmtDate(deliverable.due_date)}
                      </Chip>
                    )}
                    {deliverable.comment_count > 0 && (
                      <span className="text-bp-muted flex items-center gap-1 text-[11px]">
                        <ChatCircle size={11} weight="fill" />
                        {deliverable.comment_count}
                      </span>
                    )}
                    {deliverable.attachment_count > 0 && (
                      <span className="text-bp-muted flex items-center gap-1 text-[11px]">
                        <Paperclip size={11} weight="bold" />
                        {deliverable.attachment_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        </ScrollArea>
      )}
    </>
  );
}
