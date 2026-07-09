"use client";

import type { Phase, ProjectPhaseState } from "@/features/blueprints/blueprint-content";
import { PhaseCard } from "./phase-card";

export function PhaseBoard({
  phases,
  phaseStates,
  activeIdx,
  viewedPhaseIdx,
  budgetEditPhase,
  deadlineEditPhase,
  today,
  newDeliverable,
  onSelectPhase,
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
  phases: Phase[];
  phaseStates: ProjectPhaseState[];
  activeIdx: number;
  viewedPhaseIdx: number;
  budgetEditPhase: number | null;
  deadlineEditPhase: number | null;
  today: string;
  newDeliverable: string;
  onSelectPhase: (index: number) => void;
  onStartPhase: (index: number) => void;
  onCompletePhase: (index: number) => void;
  onReopenPhase: (index: number) => void;
  onToggleDeliverable: (index: number, delivIdx: number) => void;
  onAddDeliverable: (index: number, text: string) => void;
  onRemoveDeliverable: (index: number, delivIdx: number) => void;
  onNewDeliverableChange: (text: string) => void;
  onSetPhaseDeadline: (index: number, date: string) => void;
  onUpdatePhaseBudget: (index: number, amount: number) => void;
  onSetBudgetEditPhase: (index: number | null) => void;
  onSetDeadlineEditPhase: (index: number | null) => void;
  onPay: (index: number) => void;
  onRemoveDev: (index: number) => void;
  onFindMatches: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="text-bp-ink mb-0.5 text-[13px] font-extrabold">Development Pipeline</div>

      <div className="flex flex-col gap-2.5">
        {phases.map((phase, i) => {
          const ps = phaseStates[i];
          const isSelected = viewedPhaseIdx === i;
          const isActive = i === activeIdx;
          const overdue = Boolean(
            ps.assignment && ps.status !== "Complete" && ps.deadline && ps.deadline < today
          );

          return (
            <PhaseCard
              key={phase.name}
              phase={phase}
              ps={ps}
              index={i}
              isSelected={isSelected}
              isActive={isActive}
              isBudgetEdit={budgetEditPhase === i}
              isDeadlineEdit={deadlineEditPhase === i}
              overdue={overdue}
              newDeliverable={newDeliverable}
              onSelect={() => onSelectPhase(i)}
              onStartPhase={() => onStartPhase(i)}
              onCompletePhase={() => onCompletePhase(i)}
              onReopenPhase={() => onReopenPhase(i)}
              onToggleDeliverable={(delivIdx) => onToggleDeliverable(i, delivIdx)}
              onAddDeliverable={(text) => onAddDeliverable(i, text)}
              onRemoveDeliverable={(delivIdx) => onRemoveDeliverable(i, delivIdx)}
              onNewDeliverableChange={onNewDeliverableChange}
              onSetPhaseDeadline={(date) => onSetPhaseDeadline(i, date)}
              onUpdatePhaseBudget={(amount) => onUpdatePhaseBudget(i, amount)}
              onSetBudgetEditPhase={() => onSetBudgetEditPhase(i)}
              onSetDeadlineEditPhase={() => onSetDeadlineEditPhase(i)}
              onPay={() => onPay(i)}
              onRemoveDev={() => onRemoveDev(i)}
              onFindMatches={onFindMatches}
            />
          );
        })}
      </div>
    </div>
  );
}
