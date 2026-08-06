"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Blueprint } from "@/features/blueprints/types";
import { NetworkProfileDetailScreen } from "@/features/network/components/network-profile-detail";
import type { FounderNetworkMessageTarget } from "@/features/network/types";
import type { ProjectBlueprint } from "@/features/projects/lib/project-helpers";
import { DevelopersPanel } from "../developers-panel";
import { ProjectActionBar } from "./project-action-bar";
import { ProjectSummaryBand } from "./project-summary-band";
import { PhaseBoard } from "./phase-board";
import { IssuesPanel } from "../issues/issues-panel";
import { IssueModal } from "../issues/issue-modal";
import { IssueComposer } from "../issues/issue-composer";
import { useProjectIssues } from "@/features/projects/lib/use-project-issues";
import { DeadlinesPanel } from "../deadlines/deadlines-panel";
import { DeadlineComposer } from "../deadlines/deadline-composer";
import { useProjectDeadlines } from "@/features/projects/lib/use-project-deadlines";
import { DeliverableModal } from "../deliverables/deliverable-modal";
import { DeliverableComposer } from "../deliverables/deliverable-composer";
import { useProjectDeliverables } from "@/features/projects/lib/use-project-deliverables";
import { ProjectToast } from "./project-toast";
import { ProjectModals } from "./project-modals";
import { useProjectDetail } from "@/features/projects/lib/use-project-detail";
import { useProjectModals } from "@/features/projects/lib/use-project-modals";

export function ProjectDetail({
  bp,
  initialIssueId = null,
  initialDeliverableId = null,
  onUpdate,
  onBack,
  onViewBlueprint,
  onNavigateNetwork,
  onMessage,
  stripeConnected,
  onNavigateSettingsPayment,
}: {
  bp: ProjectBlueprint;
  initialIssueId?: string | null;
  initialDeliverableId?: string | null;
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
    connections,
    networkDevs,
    matchedDevs,
    matchLoading,
    pendingInvites,
    acceptedMembers,
    revokeInvite,
    toast,
    today,
    startPhase,
    completePhase,
    reopenPhase,
    setPhaseDeadline,
    assignDeveloper,
    removeDeveloper,
    requestConnect,
    handleToggleDeveloperConnection,
    updatePhaseBudget,
    addExpense,
    sendPayment,
  } = useProjectDetail({ bp, onUpdate });

  const modals = useProjectModals();
  const issueState = useProjectIssues(bp._projectId, {
    withAssignees: true,
    initialIssueId,
  });
  const deadlineState = useProjectDeadlines(bp._projectId);
  const deliverableState = useProjectDeliverables(bp._projectId, { initialDeliverableId });

  // The deadline calendar derives entries from issue and deliverable due dates
  // (never duplicates them), so any change to either must refresh it too.
  const reloadIssuesAndDeadlines = () =>
    Promise.all([issueState.reload(), deadlineState.reload()]);
  const reloadDeliverablesAndDeadlines = () =>
    Promise.all([deliverableState.reload(), deadlineState.reload()]);

  const verdictTone =
    health.verdict === "On track"
      ? "mint"
      : health.verdict === "Attention needed"
        ? "amber"
        : "red";
  // Deliverables now live in the relational table, not the blob health reads
  // from — the live list already loaded here is the real count.
  const deliverablesDone = deliverableState.deliverables.filter((d) => d.done).length;
  const deliverablesTotal = deliverableState.deliverables.length;
  const completion = deliverablesTotal
    ? Math.round((deliverablesDone / deliverablesTotal) * 100)
    : 0;
  const displayHealth = {
    ...health,
    deliverables: { done: deliverablesDone, total: deliverablesTotal },
  };

  const openIssues = issueState.issues.filter((i) => i.status !== "resolved").length;
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
        deliverablesDone={deliverablesDone}
        deliverablesTotal={deliverablesTotal}
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
          pendingInvites={pendingInvites}
          acceptedMembers={acceptedMembers}
          deliverablesByPhase={deliverableState.byPhase}
          deliverablesLoading={deliverableState.loading}
          activeIdx={activeIdx}
          viewedPhaseIdx={viewedPhaseIdx}
          budgetEditPhase={budgetEditPhase}
          deadlineEditPhase={deadlineEditPhase}
          today={today}
          onSelectPhase={setViewedPhaseIdx}
          onStartPhase={startPhase}
          onCompletePhase={completePhase}
          onReopenPhase={reopenPhase}
          onOpenDeliverable={deliverableState.setOpenDeliverableId}
          onCreateDeliverable={(phaseIdx) => deliverableState.openComposer(phaseIdx)}
          onSetPhaseDeadline={setPhaseDeadline}
          onUpdatePhaseBudget={updatePhaseBudget}
          onSetBudgetEditPhase={setBudgetEditPhase}
          onSetDeadlineEditPhase={setDeadlineEditPhase}
          onPay={(member, phaseIdx) => modals.setPayModalTarget({ member, phaseIdx })}
          onRemoveDev={(memberId, phaseIdx) =>
            modals.setRemoveDevTarget({ memberId, phaseIdx })
          }
          onRevokeInvite={revokeInvite}
          onFindMatches={() =>
            document.getElementById("dev-panel")?.scrollIntoView({ behavior: "smooth" })
          }
        />

        <div className="flex flex-col gap-4">
          <IssuesPanel
            issues={issueState.issues}
            loading={issueState.loading}
            phaseNameFor={phaseNameFor}
            onOpenIssue={issueState.setOpenIssueId}
            onCreate={() => issueState.openComposer()}
          />

          <DeadlinesPanel
            deadlines={deadlineState.deadlines}
            loading={deadlineState.loading}
            today={today}
            phaseNameFor={phaseNameFor}
            busyId={deadlineState.busyId}
            onCreate={() => deadlineState.openComposer()}
            onEdit={(deadline) => deadlineState.openComposer(deadline)}
            onDelete={deadlineState.remove}
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
              hiredInPhase={new Set(
                (acceptedMembers.get(viewedPhaseIdx) ?? []).map((m) => m.developer_id)
              )}
              pendingInPhase={new Set(
                (pendingInvites.get(viewedPhaseIdx) ?? []).map((m) => m.developer_id)
              )}
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
        modals={modals}
      />

      <AnimatePresence>
        {issueState.openIssueId && (
          <IssueModal
            issueId={issueState.openIssueId}
            phaseNameFor={phaseNameFor}
            onClose={() => issueState.setOpenIssueId(null)}
            onChanged={reloadIssuesAndDeadlines}
            onEdit={(issue) => issueState.openComposer(issue)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deliverableState.openDeliverableId && (
          <DeliverableModal
            deliverableId={deliverableState.openDeliverableId}
            phaseNameFor={phaseNameFor}
            onClose={() => deliverableState.setOpenDeliverableId(null)}
            onChanged={reloadDeliverablesAndDeadlines}
            onEdit={(deliverable) =>
              deliverableState.openComposer(deliverable.phase_index, deliverable)
            }
          />
        )}
      </AnimatePresence>

      {deadlineState.composing && bp._projectId && (
        <DeadlineComposer
          projectId={bp._projectId}
          phases={content.phases}
          assignees={issueState.assignees}
          editing={deadlineState.editing}
          onSaved={deadlineState.reload}
          onClose={deadlineState.closeComposer}
        />
      )}

      {issueState.composing && bp._projectId && (
        <IssueComposer
          projectId={bp._projectId}
          phases={content.phases}
          assignees={issueState.assignees}
          editing={issueState.editing}
          onSaved={reloadIssuesAndDeadlines}
          onClose={issueState.closeComposer}
        />
      )}

      {deliverableState.composing && bp._projectId && (
        <DeliverableComposer
          projectId={bp._projectId}
          phaseIndex={deliverableState.composerPhase}
          phaseName={phaseNameFor(deliverableState.composerPhase) ?? "This phase"}
          editing={deliverableState.editing}
          onSaved={reloadDeliverablesAndDeadlines}
          onClose={deliverableState.closeComposer}
        />
      )}

      <ProjectToast toast={toast} />
    </motion.div>
  );
}
