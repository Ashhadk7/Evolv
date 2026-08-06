"use client";

import type { Phase, ProjectPhaseState } from "@/features/blueprints/blueprint-content";
import type { Deliverable } from "@/features/projects/deliverables-api";
import type { ProjectMemberWire } from "@/features/projects/projects-api";
import { PhaseCard } from "./phase-card";

export function PhaseBoard({
  phases,
  phaseStates,
  pendingInvites,
  acceptedMembers,
  deliverablesByPhase,
  deliverablesLoading = false,
  activeIdx,
  viewedPhaseIdx,
  budgetEditPhase,
  deadlineEditPhase,
  today,
  onSelectPhase,
  onStartPhase,
  onCompletePhase,
  onReopenPhase,
  onOpenDeliverable,
  onCreateDeliverable,
  onSetPhaseDeadline,
  onUpdatePhaseBudget,
  onSetBudgetEditPhase,
  onSetDeadlineEditPhase,
  onPay,
  onRemoveDev,
  onFindMatches,
  onRevokeInvite,
}: {
  phases: Phase[];
  phaseStates: ProjectPhaseState[];
  pendingInvites: Map<number, ProjectMemberWire[]>;
  acceptedMembers: Map<number, ProjectMemberWire[]>;
  deliverablesByPhase: Map<number, Deliverable[]>;
  deliverablesLoading?: boolean;
  activeIdx: number;
  viewedPhaseIdx: number;
  budgetEditPhase: number | null;
  deadlineEditPhase: number | null;
  today: string;
  onSelectPhase: (index: number) => void;
  onStartPhase: (index: number) => void;
  onCompletePhase: (index: number) => void;
  onReopenPhase: (index: number) => void;
  onOpenDeliverable: (deliverableId: string) => void;
  onCreateDeliverable: (phaseIndex: number) => void;
  onSetPhaseDeadline: (index: number, date: string) => void;
  onUpdatePhaseBudget: (index: number, amount: number) => void;
  onSetBudgetEditPhase: (index: number | null) => void;
  onSetDeadlineEditPhase: (index: number | null) => void;
  onPay: (member: ProjectMemberWire, phaseIdx: number) => void;
  onRemoveDev: (memberId: string, phaseIdx: number) => void;
  onFindMatches: () => void;
  onRevokeInvite: (memberId: string) => void;
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
              pendingInvites={pendingInvites.get(i) ?? []}
              acceptedMembers={acceptedMembers.get(i) ?? []}
              index={i}
              isSelected={isSelected}
              isActive={isActive}
              isBudgetEdit={budgetEditPhase === i}
              isDeadlineEdit={deadlineEditPhase === i}
              overdue={overdue}
              today={today}
              deliverables={deliverablesByPhase.get(i) ?? []}
              deliverablesLoading={deliverablesLoading}
              onSelect={() => onSelectPhase(i)}
              onStartPhase={() => onStartPhase(i)}
              onCompletePhase={() => onCompletePhase(i)}
              onReopenPhase={() => onReopenPhase(i)}
              onOpenDeliverable={onOpenDeliverable}
              onCreateDeliverable={() => onCreateDeliverable(i)}
              onSetPhaseDeadline={(date) => onSetPhaseDeadline(i, date)}
              onUpdatePhaseBudget={(amount) => onUpdatePhaseBudget(i, amount)}
              onSetBudgetEditPhase={() => onSetBudgetEditPhase(i)}
              onSetDeadlineEditPhase={() => onSetDeadlineEditPhase(i)}
              onPay={(member) => onPay(member, i)}
              onRemoveDev={(memberId) => onRemoveDev(memberId, i)}
              onFindMatches={onFindMatches}
              onRevokeInvite={onRevokeInvite}
            />
          );
        })}
      </div>
    </div>
  );
}
