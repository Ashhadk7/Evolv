"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarBlank,
  CaretRight,
  CheckCircle,
  PencilSimple,
} from "@phosphor-icons/react";
import { Chip } from "@/components/shared/chip";
import { PhaseDeliverables } from "./phase-deliverables";
import { PhaseAssignment } from "./phase-assignment";
import {
  fmtDate,
  fmtMoney,
  type Phase,
  type ProjectPhaseState,
} from "@/features/blueprints/blueprint-content";

type StatusTag = "Completed" | "In Progress" | "Not Started" | "Upcoming";

export function PhaseCard({
  phase,
  ps,
  index,
  isSelected,
  isActive,
  isBudgetEdit,
  isDeadlineEdit,
  overdue,
  newDeliverable,
  onSelect,
  onStartPhase,
  onCompletePhase,
  onReopenPhase,
  onToggleDeliverable,
  onAddDeliverable,
  onRemoveDeliverable,
  onNewDeliverableChange,
  onSetPhaseDeadline,
  onUpdatePhaseBudget,
  onSetBudgetEditPhase,
  onSetDeadlineEditPhase,
  onPay,
  onRemoveDev,
  onFindMatches,
}: {
  phase: Phase;
  ps: ProjectPhaseState;
  index: number;
  isSelected: boolean;
  isActive: boolean;
  isBudgetEdit: boolean;
  isDeadlineEdit: boolean;
  overdue: boolean | "" | null;
  newDeliverable: string;
  onSelect: () => void;
  onStartPhase: () => void;
  onCompletePhase: () => void;
  onReopenPhase: () => void;
  onToggleDeliverable: (delivIdx: number) => void;
  onAddDeliverable: (text: string) => void;
  onRemoveDeliverable: (delivIdx: number) => void;
  onNewDeliverableChange: (text: string) => void;
  onSetPhaseDeadline: (date: string) => void;
  onUpdatePhaseBudget: (amount: number) => void;
  onSetBudgetEditPhase: () => void;
  onSetDeadlineEditPhase: () => void;
  onPay: () => void;
  onRemoveDev: () => void;
  onFindMatches: () => void;
}) {
  const doneCount = ps.deliverables.filter((d) => d.done).length;

  const statusTag: StatusTag =
    ps.status === "Complete"
      ? "Completed"
      : isActive
        ? ps.status === "In Progress"
          ? "In Progress"
          : "Not Started"
        : "Upcoming";
  const tone =
    statusTag === "Completed"
      ? "mint"
      : statusTag === "In Progress"
        ? "amber"
        : statusTag === "Upcoming"
          ? "neutral"
          : "dark";

  const budgetChip = isBudgetEdit ? (
    <span className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <input
        type="number"
        autoFocus
        defaultValue={ps.budget}
        onKeyDown={(e) => {
          if (e.key === "Enter")
            onUpdatePhaseBudget(Number((e.target as HTMLInputElement).value) || ps.budget);
          if (e.key === "Escape") onSetBudgetEditPhase();
        }}
        onBlur={(e) => onUpdatePhaseBudget(Number(e.target.value) || ps.budget)}
        className="border-bp-forest text-bp-ink w-[76px] rounded-[7px] border bg-white px-1.5 py-[3px] font-[inherit] text-[11.5px] outline-none tabular-nums font-feature-settings-[_tnum_1,_ss01_1]"
      />
    </span>
  ) : (
    <Chip>
      {fmtMoney(ps.budget)}
      <PencilSimple
        size={9}
        weight="bold"
        className="ml-1 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onSetBudgetEditPhase();
        }}
      />
    </Chip>
  );

  const deadlineChip = isDeadlineEdit ? (
    <span className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <input
        type="date"
        autoFocus
        defaultValue={ps.deadline || ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSetPhaseDeadline((e.target as HTMLInputElement).value);
          if (e.key === "Escape") onSetDeadlineEditPhase();
        }}
        onBlur={(e) => onSetPhaseDeadline(e.target.value)}
        className="border-bp-forest text-bp-ink w-[110px] rounded-[7px] border bg-white px-1.5 py-[3px] font-[inherit] text-[11.5px] outline-none tabular-nums font-feature-settings-[_tnum_1,_ss01_1]"
      />
    </span>
  ) : (
    <Chip icon={<CalendarBlank size={11} weight="fill" />} tone={overdue ? "red" : "neutral"}>
      {ps.deadline ? fmtDate(ps.deadline) : "No deadline set"}
      <PencilSimple
        size={9}
        weight="bold"
        className="ml-1 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onSetDeadlineEditPhase();
        }}
      />
    </Chip>
  );

  return (
    <div
      className={`overflow-hidden rounded-2xl transition-all duration-200 ${
        isSelected
          ? "border-bp-mint border-[1.5px] bg-white shadow-[0_6px_18px_-8px_rgba(66,132,117,0.22)]"
          : "border-bp-border-soft bg-bp-tint border shadow-none"
      }`}
    >
      {/* Phase Header (Accordion Toggle) */}
      <div
        onClick={onSelect}
        className={`flex cursor-pointer items-center justify-between gap-2.5 px-5 py-4 ${
          isSelected
            ? "border-bp-border-soft border-b bg-[linear-gradient(90deg,#e8f5ef_0%,#f4faf7_100%)]"
            : "border-b-0 bg-transparent"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-xs font-extrabold tabular-nums font-feature-settings-[_tnum_1,_ss01_1] ${
              isSelected
                ? "bg-bp-forest text-bp-mint border-0"
                : "border-bp-border bg-bp-card text-bp-muted border"
            }`}
          >
            {index + 1}
          </div>
          <span
            className={`text-[14.5px] ${
              isSelected ? "text-bp-ink font-extrabold" : "text-bp-body font-bold"
            }`}
          >
            {phase.name}
          </span>
          <Chip tone={tone}>{statusTag}</Chip>
          {isSelected && (
            <>
              {budgetChip}
              {deadlineChip}
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isSelected && (
            <>
              {ps.status === "Not Started" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartPhase();
                  }}
                  className="bp-primary-btn"
                >
                  Start phase
                </button>
              )}
              {ps.status === "In Progress" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompletePhase();
                  }}
                  className="bp-primary-btn"
                >
                  <CheckCircle size={14} weight="fill" /> Complete phase
                </button>
              )}
              {ps.status === "Complete" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReopenPhase();
                  }}
                  className="border-bp-forest text-bp-forest flex cursor-pointer items-center gap-1.5 rounded-[9px] border bg-transparent px-3.5 py-[7px] text-xs font-bold"
                >
                  Re-open phase
                </button>
              )}
            </>
          )}
          <CaretRight
            size={14}
            weight="bold"
            className={`text-bp-muted transition-transform duration-200 ${isSelected ? "rotate-90" : "rotate-0"}`}
          />
        </div>
      </div>

      {/* Phase Body (Expanded) */}
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
              <PhaseDeliverables
                ps={ps}
                newDeliverable={newDeliverable}
                onToggleDeliverable={onToggleDeliverable}
                onAddDeliverable={onAddDeliverable}
                onRemoveDeliverable={onRemoveDeliverable}
                onNewDeliverableChange={onNewDeliverableChange}
              />

              <PhaseAssignment
                ps={ps}
                onPay={onPay}
                onRemoveDev={onRemoveDev}
                onFindMatches={onFindMatches}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
