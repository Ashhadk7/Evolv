"use client";

import { AnimatePresence } from "framer-motion";
import { PaymentModal } from "../payment-modal";
import { AddDeveloperModal, RemoveDeveloperModal } from "../add-remove-developer-modals";
import { SpendHistoryModal } from "../spend-history-modal";
import type { BlueprintContent, ProjectExpense } from "@/features/blueprints/blueprint-content";
import type { FounderContactProfile } from "@/features/network/types";
import { useProjectModals } from "@/features/projects/lib/use-project-modals";
import { ProjectBlueprint } from "@/features/projects/lib/project-helpers";
import type { ProjectMemberWire } from "@/features/projects/projects-api";

export function ProjectModals({
  bp,
  content,
  totalBudget,
  spentBudget,
  assignDeveloper,
  removeDeveloper,
  sendPayment,
  addExpense,
  modals,
}: {
  bp: ProjectBlueprint;
  content: BlueprintContent;
  totalBudget: number;
  spentBudget: number;
  assignDeveloper: (phaseIdx: number, dev: FounderContactProfile, amount: number) => void;
  removeDeveloper: (memberId: string, phaseIdx: number, reason: string) => void;
  sendPayment: (member: ProjectMemberWire, phaseIdx: number, amount: number) => void;
  addExpense: (expense: Omit<ProjectExpense, "id">) => void;
  modals: ReturnType<typeof useProjectModals>;
}) {
  const {
    payModalTarget, setPayModalTarget,
    addDevTarget, setAddDevTarget,
    removeDevTarget, setRemoveDevTarget,
    spendModalOpen, setSpendModalOpen,
  } = modals;
  const paymentExpenses: ProjectExpense[] = bp.project.phaseStates.flatMap((phase, phaseIdx) =>
    phase.assignment?.payments.map((payment, paymentIdx) => ({
      id: `payment-${phase.assignment?.developerId ?? "dev"}-${phaseIdx}-${payment.date}-${paymentIdx}`,
      label: `${phase.assignment?.developerName ?? "Developer"} - ${
        content.phases[phaseIdx]?.name ?? `Phase ${phaseIdx + 1}`
      }`,
      category: "Developer Payment" as const,
      amount: payment.amount,
      date: payment.date,
      phaseIndex: phaseIdx,
    })) ?? []
  );
  const loggedDeveloperExpenses = bp.project.expenses.filter(
    (expense) => expense.category === "Developer Payment"
  );
  const loggedOtherExpenses = bp.project.expenses.filter(
    (expense) => expense.category !== "Developer Payment"
  );
  const spendHistoryExpenses = [
    ...paymentExpenses,
    ...(paymentExpenses.length > 0 ? [] : loggedDeveloperExpenses),
    ...loggedOtherExpenses,
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <AnimatePresence>
        {payModalTarget !== null && (
          <PaymentModal
            developerName={payModalTarget.member.developer_name}
            amountAgreed={payModalTarget.member.amount_agreed_cents / 100}
            amountPaid={payModalTarget.member.amount_paid_cents / 100}
            feePct={content.costModel.platformFeePct}
            stripeConnected={payModalTarget.member.developer_stripe_ready}
            onSend={(amount) => {
              sendPayment(payModalTarget.member, payModalTarget.phaseIdx, amount);
              setPayModalTarget(null);
            }}
            onClose={() => setPayModalTarget(null)}
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
        {removeDevTarget && (
          <RemoveDeveloperModal
            developerName={
              bp.project.phaseStates[removeDevTarget.phaseIdx].assignment?.developerName ??
              "Developer"
            }
            phaseName={content.phases[removeDevTarget.phaseIdx].name}
            amountPaid={
              bp.project.phaseStates[removeDevTarget.phaseIdx].assignment?.amountPaid ?? 0
            }
            onConfirm={(reason) => {
              removeDeveloper(removeDevTarget.memberId, removeDevTarget.phaseIdx, reason);
              setRemoveDevTarget(null);
            }}
            onClose={() => setRemoveDevTarget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {spendModalOpen && (
          <SpendHistoryModal
            expenses={spendHistoryExpenses}
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
