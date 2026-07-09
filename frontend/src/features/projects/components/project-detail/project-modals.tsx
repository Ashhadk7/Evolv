"use client";

import { AnimatePresence } from "framer-motion";
import { PaymentModal } from "../payment-modal";
import { AddDeveloperModal, RemoveDeveloperModal } from "../add-remove-developer-modals";
import { IssueModal } from "../issue-modal";
import { DeadlineModal } from "../deadline-modal";
import { SpendHistoryModal } from "../spend-history-modal";
import type { BlueprintContent, ProjectDeadline, ProjectExpense, ProjectIssue, ProjectPhaseState } from "@/features/blueprints/blueprint-content";
import type { FounderContactProfile } from "@/features/network/types";
import { useProjectModals } from "@/features/projects/lib/use-project-modals";
import { ProjectBlueprint } from "@/features/projects/lib/project-helpers";

export function ProjectModals({
  bp,
  content,
  totalBudget,
  spentBudget,
  stripeConnected,
  onNavigateSettingsPayment,
  assignDeveloper,
  removeDeveloper,
  sendPayment,
  addExpense,
  addIssue,
  addDeadline,
  modals
}: {
  bp: ProjectBlueprint;
  content: BlueprintContent;
  totalBudget: number;
  spentBudget: number;
  stripeConnected: boolean;
  onNavigateSettingsPayment?: () => void;
  assignDeveloper: (phaseIdx: number, dev: FounderContactProfile, amount: number) => void;
  removeDeveloper: (phaseIdx: number, reason: string) => void;
  sendPayment: (phaseIdx: number, amount: number) => void;
  addExpense: (expense: Omit<ProjectExpense, "id">) => void;
  addIssue: (draft: { title: string; description: string; priority: ProjectIssue["priority"]; phaseIndex: number | null }) => void;
  addDeadline: (draft: { note: string; priority: ProjectDeadline["priority"]; phaseIndex: number | null; date: string }) => void;
  modals: ReturnType<typeof useProjectModals>;
}) {
  const {
    payModalPhase, setPayModalPhase,
    addDevTarget, setAddDevTarget,
    removeDevPhase, setRemoveDevPhase,
    issueModalOpen, setIssueModalOpen,
    issueDraft, setIssueDraft,
    deadlineModalOpen, setDeadlineModalOpen,
    deadlineDraft, setDeadlineDraft,
    spendModalOpen, setSpendModalOpen,
  } = modals;

  return (
    <>
      <AnimatePresence>
        {payModalPhase !== null && (
          <PaymentModal
            developerName={
              bp.project.phaseStates[payModalPhase].assignment?.developerName ?? "developer"
            }
            amountAgreed={bp.project.phaseStates[payModalPhase].assignment?.amountAgreed ?? 0}
            amountPaid={bp.project.phaseStates[payModalPhase].assignment?.amountPaid ?? 0}
            feePct={content.costModel.platformFeePct}
            stripeConnected={stripeConnected}
            onNavigateSettingsPayment={() => {
              setPayModalPhase(null);
              onNavigateSettingsPayment?.();
            }}
            onSend={(amount) => {
              sendPayment(payModalPhase, amount);
              setPayModalPhase(null);
            }}
            onClose={() => setPayModalPhase(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addDevTarget && (
          <AddDeveloperModal
            developer={addDevTarget.dev}
            defaultAmount={bp.project.phaseStates[addDevTarget.phaseIdx].budget}
            onConfirm={(amount) => {
              assignDeveloper(addDevTarget.phaseIdx, addDevTarget.dev, amount);
              setAddDevTarget(null);
            }}
            onClose={() => setAddDevTarget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {removeDevPhase !== null && bp.project.phaseStates[removeDevPhase].assignment && (
          <RemoveDeveloperModal
            developerName={bp.project.phaseStates[removeDevPhase].assignment!.developerName}
            phaseName={content.phases[removeDevPhase].name}
            amountPaid={bp.project.phaseStates[removeDevPhase].assignment!.amountPaid}
            onConfirm={(reason) => {
              removeDeveloper(removeDevPhase, reason);
              setRemoveDevPhase(null);
            }}
            onClose={() => setRemoveDevPhase(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {issueModalOpen && (
          <IssueModal
            phases={content.phases}
            draft={issueDraft}
            onChange={setIssueDraft}
            onSubmit={() => {
              addIssue(issueDraft);
              setIssueDraft({ title: "", description: "", priority: "Medium", phaseIndex: null });
              setIssueModalOpen(false);
            }}
            onClose={() => setIssueModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deadlineModalOpen && (
          <DeadlineModal
            phases={content.phases}
            draft={deadlineDraft}
            onChange={setDeadlineDraft}
            onSubmit={() => {
              addDeadline(deadlineDraft);
              setDeadlineDraft({ note: "", priority: "Medium", phaseIndex: null, date: "" });
              setDeadlineModalOpen(false);
            }}
            onClose={() => setDeadlineModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {spendModalOpen && (
          <SpendHistoryModal
            expenses={bp.project.expenses}
            phases={content.phases}
            total={totalBudget}
            spent={spentBudget}
            onAdd={addExpense}
            onClose={() => setSpendModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
