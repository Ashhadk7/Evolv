"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarBlank, CaretRight } from "@phosphor-icons/react";
import { Chip } from "@/components/shared/chip";
import { fmtDate, type Phase } from "@/features/blueprints/blueprint-content";
import type { DeveloperPhase } from "@/features/projects/developer-projects-api";
import type { Deliverable } from "@/features/projects/deliverables-api";
import { DeliverableList } from "../deliverables/deliverable-list";

const STATUS_TONE: Record<string, "mint" | "amber" | "neutral" | "dark"> = {
  Complete: "mint",
  "In Review": "amber",
  "In Progress": "amber",
  "Not Started": "neutral",
};

export function DeveloperPhaseBoard({
  phases,
  phaseContent,
  deliverablesByPhase,
  expandedIndex,
  today,
  onSelectPhase,
  onOpenDeliverable,
}: {
  phases: DeveloperPhase[];
  phaseContent: Phase[];
  deliverablesByPhase: Map<number, Deliverable[]>;
  expandedIndex: number;
  today: string;
  onSelectPhase: (index: number) => void;
  onOpenDeliverable: (deliverableId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {phases.map((phase) => {
        const content = phaseContent[phase.phase_index];
        const isSelected = phase.phase_index === expandedIndex;
        const deliverables = deliverablesByPhase.get(phase.phase_index) ?? [];
        const doneCount = deliverables.filter((d) => d.done).length;
        const overdue =
          phase.status !== "Complete" && Boolean(phase.deadline) && phase.deadline! < today;

        return (
          <div
            key={phase.phase_index}
            className={`overflow-hidden rounded-2xl transition-all duration-200 ${
              isSelected
                ? "border-bp-mint border-[1.5px] bg-white shadow-[0_6px_18px_-8px_rgba(66,132,117,0.22)]"
                : "border-bp-border-soft bg-bp-tint border shadow-none"
            }`}
          >
            <div
              onClick={() => onSelectPhase(phase.phase_index)}
              className={`flex cursor-pointer items-center justify-between gap-2.5 px-5 py-4 ${
                isSelected
                  ? "border-bp-border-soft border-b bg-[linear-gradient(90deg,#e8f5ef_0%,#f4faf7_100%)]"
                  : "border-b-0 bg-transparent"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <div
                  className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-xs font-extrabold tabular-nums ${
                    isSelected
                      ? "bg-bp-forest text-bp-mint border-0"
                      : "border-bp-border bg-bp-card text-bp-muted border"
                  }`}
                >
                  {phase.phase_index + 1}
                </div>
                <span
                  className={`text-[14.5px] ${isSelected ? "text-bp-ink font-extrabold" : "text-bp-body font-bold"}`}
                >
                  {content?.name ?? `Phase ${phase.phase_index + 1}`}
                </span>
                <Chip tone={STATUS_TONE[phase.status] ?? "neutral"}>{phase.status}</Chip>
                {phase.is_mine && <Chip tone="dark">Your phase</Chip>}
                {phase.deadline && (
                  <Chip
                    icon={<CalendarBlank size={11} weight="fill" />}
                    tone={overdue ? "red" : "neutral"}
                  >
                    {fmtDate(phase.deadline)}
                  </Chip>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-bp-muted text-[11.5px] tabular-nums">
                  {doneCount}/{deliverables.length}
                </span>
                <CaretRight
                  size={14}
                  weight="bold"
                  className={`text-bp-muted transition-transform duration-200 ${isSelected ? "rotate-90" : "rotate-0"}`}
                />
              </div>
            </div>

            <AnimatePresence initial={false}>
              {isSelected && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-5">
                    <DeliverableList
                      deliverables={deliverables}
                      today={today}
                      onOpen={onOpenDeliverable}
                    />

                    {!phase.is_mine && (
                      <p className="text-bp-muted mt-3 mb-0 text-[11.5px]">
                        You are not assigned to this phase — shown for context only.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
