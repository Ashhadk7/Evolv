"use client";

import { Check, Plus, X } from "@phosphor-icons/react";
import type { ProjectPhaseState } from "@/features/blueprints/blueprint-content";

export function PhaseDeliverables({
  ps,
  newDeliverable,
  onToggleDeliverable,
  onAddDeliverable,
  onRemoveDeliverable,
  onNewDeliverableChange,
}: {
  ps: ProjectPhaseState;
  newDeliverable: string;
  onToggleDeliverable: (delivIdx: number) => void;
  onAddDeliverable: (text: string) => void;
  onRemoveDeliverable: (delivIdx: number) => void;
  onNewDeliverableChange: (text: string) => void;
}) {
  const doneCount = ps.deliverables.filter((d) => d.done).length;

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-bp-forest text-[11px] font-extrabold tracking-[0.08em] uppercase">
          Deliverables
        </div>
        <div className="text-bp-muted text-[11px] font-bold">
          {doneCount}/{ps.deliverables.length} completed
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-2">
        {ps.deliverables.map((d, di) => (
          <div
            key={di}
            className={`flex items-start gap-3 rounded-xl px-4 py-3.5 transition-colors duration-200 ${
              d.done
                ? "border border-[#cfeadd] bg-[#e8f5ef]"
                : "border-bp-border-soft bg-bp-card border"
            }`}
          >
            <button
              onClick={() => onToggleDeliverable(di)}
              disabled={ps.status === "Not Started"}
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md disabled:cursor-not-allowed disabled:opacity-50 ${
                d.done
                  ? "bg-bp-forest cursor-pointer border-0"
                  : "border-bp-border cursor-pointer border-[1.5px]"
              }`}
            >
              {d.done && <Check size={14} weight="bold" className="text-bp-mint" />}
            </button>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                className={`text-[13.5px] leading-[1.5] break-words ${
                  d.done
                    ? "font-semibold text-[#1d6e47] line-through"
                    : "text-bp-ink font-medium no-underline"
                }`}
              >
                {d.text}
              </span>
            </div>
            <button
              onClick={() => onRemoveDeliverable(di)}
              className="text-bp-muted cursor-pointer border-none bg-transparent p-1 opacity-60 transition-opacity hover:opacity-100"
            >
              <X size={15} weight="bold" />
            </button>
          </div>
        ))}

        <div className="border-bp-border bg-bp-tint flex items-start gap-3 rounded-xl border border-dashed px-4 py-3">
          <Plus size={16} className="text-bp-muted mt-1 shrink-0" />
          <textarea
            value={newDeliverable}
            onChange={(e) => onNewDeliverableChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onAddDeliverable(newDeliverable);
              }
            }}
            placeholder="Add a new deliverable (Shift+Enter for newline)"
            rows={2}
            className="text-bp-ink flex-1 resize-none border-none bg-transparent p-0.5 font-[inherit] text-[13px] outline-none"
          />
        </div>
      </div>
    </>
  );
}
