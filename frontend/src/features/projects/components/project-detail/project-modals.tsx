"use client";

import { AnimatePresence } from "framer-motion";
import { PaymentModal } from "../payment-modal";
import { AddDeveloperModal, RemoveDeveloperModal } from "../add-remove-developer-modals";
import { SpendHistoryModal } from "../spend-history-modal";
import type { BlueprintContent, ProjectExpense } from "@/features/blueprints/blueprint-content";
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
  modals: ReturnType<typeof useProjectModals>;
}) {
  const {
    payModalPhase, setPayModalPhase,
    addDevTarget, setAddDevTarget,
    removeDevPhase, setRemoveDevPhase,
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
