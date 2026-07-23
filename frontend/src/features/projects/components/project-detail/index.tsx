"use client";

import { motion } from "framer-motion";
import type { Blueprint } from "@/features/blueprints/types";
import { NetworkProfileDetailScreen } from "@/features/network/components/network-profile-detail";
import type { FounderNetworkMessageTarget } from "@/features/network/types";
import type { ProjectBlueprint } from "@/features/projects/lib/project-helpers";
import { DevelopersPanel } from "../developers-panel";
import { ProjectActionBar } from "./project-action-bar";
import { ProjectSummaryBand } from "./project-summary-band";
import { PhaseBoard } from "./phase-board";
import { ProjectHealthCard } from "./project-health-card";
import { IssuesPanel } from "./issues-panel";
import { DeadlinesPanel } from "./deadlines-panel";
import { ProjectToast } from "./project-toast";
import { ProjectModals } from "./project-modals";
import { useProjectDetail } from "@/features/projects/lib/use-project-detail";
import { useProjectModals } from "@/features/projects/lib/use-project-modals";

export function ProjectDetail({
  bp,
  onUpdate,
  onBack,
  onViewBlueprint,
  onNavigateNetwork,
  onMessage,
  stripeConnected,
  onNavigateSettingsPayment,
}: {
  bp: ProjectBlueprint;
  onUpdate: (mutate: (b: Blueprint) => Blueprint) => void;
  onBack: () => void;
  onViewBlueprint?: (id: string) => void;
  onNavigateNetwork?: () => void;
  onMessage?: (contact: FounderNetworkMessageTarget) => void;
  stripeConnected: boolean;
  onNavigateSettingsPayment?: () => void;
}) {
  const {
    content,
    health,
    activeIdx,
    allComplete,
    viewedPhaseIdx,
    setViewedPhaseIdx,
    selectedDeveloper,
    setSelectedDeveloper,
    budgetEditPhase,
    setBudgetEditPhase,
    deadlineEditPhase,
    setDeadlineEditPhase,
    newDeliverable,
    setNewDeliverable,
    connections,
    networkDevs,
    matchedDevs,
    matchLoading,
    toast,
    today,
    startPhase,
    completePhase,
    reopenPhase,
    toggleDeliverable,
    addDeliverable,
    removeDeliverable,
    setPhaseDeadline,
    assignDeveloper,
    removeDeveloper,
    requestConnect,
    handleToggleDeveloperConnection,
    updatePhaseBudget,
    addExpense,
    sendPayment,
    addIssue,
    setIssueStatus,
    addDeadline,
    setDeadlineStatus,
  } = useProjectDetail({ bp, onUpdate });

  const modals = useProjectModals();

  const verdictTone =
    health.verdict === "On track"
      ? "mint"
      : health.verdict === "Attention needed"
        ? "amber"
        : "red";
  const completion = health.deliverables.total
    ? Math.round((health.deliverables.done / health.deliverables.total) * 100)
    : 0;

  const openIssues = bp.project.issues.filter((i) => i.status !== "Resolved").length;
  const phaseNameFor = (phaseIndex: number) => content.phases[phaseIndex]?.name;

  // ── Full-page developer profile view ──────────────────────────────────────
  // Clicking a developer card navigates here instead of embedding the profile
  // inside the matching panel. Pressing Back just clears selectedDeveloper —
  // ProjectDetail (and its useProjectDetail state: selected phase, matched
  // developers, connections, etc.) stays mounted throughout, so the founder
  // returns to exactly where they left off.
  if (selectedDeveloper) {
    return (
      <motion.div
        className="blueprint-scroll mx-auto flex h-full max-w-[1240px] flex-col gap-3.5 overflow-y-auto pr-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <NetworkProfileDetailScreen
          profile={selectedDeveloper}
          onBack={() => setSelectedDeveloper(null)}
          connected={Boolean(connections[selectedDeveloper.id])}
          onToggleConnection={() => handleToggleDeveloperConnection(selectedDeveloper)}
          onMessage={onMessage}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="blueprint-scroll mx-auto flex h-full max-w-[1240px] flex-col gap-3.5 overflow-y-auto pr-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ProjectActionBar
        name={bp.name}
        status={bp.project.status}
        verdict={health.verdict}
        verdictTone={verdictTone}
        onBack={onBack}
        onViewBlueprint={onViewBlueprint ? () => onViewBlueprint(bp.id) : undefined}
      />

      <ProjectSummaryBand
        ideaDesc={bp.ideaDesc}
        industry={bp.industry}
        startedAt={bp.project.startedAt}
        phaseCount={content.phases.length}
        completion={completion}
        spent={health.budget.spent}
        deliverablesDone={health.deliverables.done}
        deliverablesTotal={health.deliverables.total}
        activePhaseLabel={
          allComplete ? "All phases" : `Phase ${activeIdx + 1} of ${content.phases.length}`
        }
        activePhaseSubLabel={allComplete ? "complete" : content.phases[activeIdx].name}
        openIssues={openIssues}
        onOpenSpendHistory={() => modals.setSpendModalOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] items-start gap-4">
        <PhaseBoard
          phases={content.phases}
          phaseStates={bp.project.phaseStates}
          activeIdx={activeIdx}
          viewedPhaseIdx={viewedPhaseIdx}
          budgetEditPhase={budgetEditPhase}
          deadlineEditPhase={deadlineEditPhase}
          today={today}
          newDeliverable={newDeliverable}
          onSelectPhase={setViewedPhaseIdx}
          onStartPhase={startPhase}
          onCompletePhase={completePhase}
          onReopenPhase={reopenPhase}
          onToggleDeliverable={toggleDeliverable}
          onAddDeliverable={addDeliverable}
          onRemoveDeliverable={removeDeliverable}
          onNewDeliverableChange={setNewDeliverable}
          onSetPhaseDeadline={setPhaseDeadline}
          onUpdatePhaseBudget={updatePhaseBudget}
          onSetBudgetEditPhase={setBudgetEditPhase}
          onSetDeadlineEditPhase={setDeadlineEditPhase}
          onPay={(phaseIdx) => modals.setPayModalPhase(phaseIdx)}
          onRemoveDev={(phaseIdx) => modals.setRemoveDevPhase(phaseIdx)}
          onFindMatches={() =>
            document.getElementById("dev-panel")?.scrollIntoView({ behavior: "smooth" })
          }
        />

        <div className="flex flex-col gap-4">
          <ProjectHealthCard health={health} completion={completion} verdictTone={verdictTone} />

          <IssuesPanel
            issues={bp.project.issues}
            openIssues={openIssues}
            phaseNameFor={phaseNameFor}
            onOpenModal={() => modals.setIssueModalOpen(true)}
            onSetStatus={setIssueStatus}
          />

          <DeadlinesPanel
            deadlines={bp.project.deadlines}
            today={today}
            phaseNameFor={phaseNameFor}
            onOpenModal={() => modals.setDeadlineModalOpen(true)}
            onSetStatus={setDeadlineStatus}
          />

          <div id="dev-panel">
            <DevelopersPanel
              blueprintId={bp.id}
              phases={content.phases}
              selectedPhase={viewedPhaseIdx}
              onSelectPhase={setViewedPhaseIdx}
              connections={connections}
              matchedDevs={matchedDevs}
              networkDevs={networkDevs}
              matchLoading={matchLoading}
              onConnect={requestConnect}
              onHire={(phaseIdx, dev) => modals.setAddDevTarget({ phaseIdx, dev })}
              onMessage={onMessage}
              onViewProfile={setSelectedDeveloper}
              onBrowseNetwork={onNavigateNetwork}
            />
          </div>
        </div>
      </div>

      <ProjectModals
        bp={bp}
        content={content}
        totalBudget={health.budget.total}
        spentBudget={health.budget.spent}
        stripeConnected={stripeConnected}
        onNavigateSettingsPayment={onNavigateSettingsPayment}
        assignDeveloper={assignDeveloper}
        removeDeveloper={removeDeveloper}
        sendPayment={sendPayment}
        addExpense={addExpense}
        addIssue={addIssue}
        addDeadline={addDeadline}
        modals={modals}
      />

      <ProjectToast toast={toast} />
    </motion.div>
  );
}
