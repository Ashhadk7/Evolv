"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bug, CaretRight, ChartPie, CheckCircle, ListChecks } from "@phosphor-icons/react";
import { Kicker } from "@/components/shared/kicker";
import { todayISO } from "@/features/blueprints/blueprint-content";
import { useDeveloperBlueprint } from "@/features/developer-dashboard/components/discover/use-developer-blueprint";
import { fmtCents, type DeveloperProjectDetail } from "@/features/projects/developer-projects-api";
import { useProjectDeadlines } from "@/features/projects/lib/use-project-deadlines";
import { useProjectDeliverables } from "@/features/projects/lib/use-project-deliverables";
import { useProjectIssues } from "@/features/projects/lib/use-project-issues";
import { DeadlinesPanel } from "../deadlines/deadlines-panel";
import { DeliverableModal } from "../deliverables/deliverable-modal";
import { IssueModal } from "../issues/issue-modal";
import { IssuesPanel } from "../issues/issues-panel";
import { EarningsModal } from "./earnings-modal";
import { DeveloperPhaseBoard } from "./phase-board";

const CARD =
  "bg-bp-card border-bp-border rounded-2xl border shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)]";

/** Static widths keyed by decile — Tailwind only emits classes it can read whole. */
const COMPLETION_WIDTH = [
  "w-0",
  "w-[10%]",
  "w-[20%]",
  "w-[30%]",
  "w-[40%]",
  "w-[50%]",
  "w-[60%]",
  "w-[70%]",
  "w-[80%]",
  "w-[90%]",
  "w-full",
];

export function DeveloperProjectDetailView({
  project,
  onBack,
  initialIssueId = null,
  initialDeliverableId = null,
}: {
  project: DeveloperProjectDetail;
  onBack: () => void;
  initialIssueId?: string | null;
  initialDeliverableId?: string | null;
}) {
  const { document } = useDeveloperBlueprint(project.blueprint_id);
  const phaseContent = document?.content.phases ?? [];
  const today = todayISO();

  const firstMine = project.my_phase_indices[0] ?? 0;
  const [expandedIndex, setExpandedIndex] = useState(firstMine);
  const [earningsOpen, setEarningsOpen] = useState(false);
  const issueState = useProjectIssues(project.id, { initialIssueId });
  const deadlineState = useProjectDeadlines(project.id);
  const deliverableState = useProjectDeliverables(project.id, { initialDeliverableId });

  const reloadDeliverablesAndDeadlines = () =>
    Promise.all([deliverableState.reload(), deadlineState.reload()]);

  const deliverablesDone = deliverableState.deliverables.filter((d) => d.done).length;
  const deliverablesTotal = deliverableState.deliverables.length;
  const completion = deliverablesTotal
    ? Math.round((deliverablesDone / deliverablesTotal) * 100)
    : 0;
  const phaseNameFor = (index: number) => phaseContent[index]?.name;

  const earnings = project.earnings;
  const paidPct = earnings.agreed_cents
    ? Math.round((earnings.paid_cents / earnings.agreed_cents) * 100)
    : 0;

  const stats = [
    {
      label: "Completion",
      value: `${completion}%`,
      icon: <ChartPie size={14} weight="duotone" className="text-bp-mint" />,
    },
    {
      label: "Deliverables",
      value: `${deliverablesDone}/${deliverablesTotal}`,
      icon: <ListChecks size={14} weight="duotone" className="text-bp-mint" />,
    },
    {
      label: "In review",
      value: String(deliverableState.deliverables.filter((d) => d.status === "in_review").length),
      icon: <CheckCircle size={14} weight="duotone" className="text-bp-mint" />,
    },
    {
      label: "Open issues",
      value: String(project.open_issues),
      icon: <Bug size={14} weight="duotone" className="text-bp-mint" />,
    },
  ];

  return (
    <motion.div
      className="blueprint-scroll mx-auto flex h-full max-w-[1240px] flex-col gap-3.5 overflow-y-auto pr-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="bg-bp-forest shrink-0 overflow-hidden rounded-2xl shadow-[0_18px_44px_-20px_rgba(9,32,26,0.55)]">
        <div className="flex flex-wrap items-start justify-between gap-4 p-[18px_22px]">
          <div className="min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="text-bp-mint-soft hover:text-bp-mint focus-visible:ring-bp-mint mb-2.5 flex cursor-pointer items-center gap-1.5 rounded-md border-none bg-transparent p-0 text-[11.5px] font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <ArrowLeft size={13} weight="bold" /> All projects
            </button>
            <span className="text-bp-mint/70 text-[10px] font-semibold tracking-[0.14em] uppercase">
              Your engagement
            </span>
            <h1 className="mt-1 text-[23px] font-extrabold tracking-[-0.02em] text-white">
              {project.title}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {project.my_phase_indices.map((index) => (
                <span
                  key={index}
                  className="text-bp-mint rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold"
                >
                  {phaseNameFor(index) ?? `Phase ${index + 1}`}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEarningsOpen(true)}
            aria-label="View payment history"
            className="focus-visible:ring-bp-mint w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.07] p-[12px_16px] text-left transition-colors hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:outline-none sm:w-auto sm:min-w-[280px]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-bp-mint/70 text-[10px] font-semibold tracking-[0.14em] uppercase">
                Your earnings
              </span>
              <span className="text-bp-mint/60 flex items-center gap-1 text-[10.5px] font-bold">
                History <CaretRight size={9} weight="bold" />
              </span>
            </div>

            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-bp-mint text-[26px] leading-none font-extrabold tabular-nums">
                {fmtCents(earnings.paid_cents, earnings.currency)}
              </span>
              <span className="text-[12px] font-semibold text-white/50">
                of {fmtCents(earnings.agreed_cents, earnings.currency)}
              </span>
            </div>

            <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-white/15">
              <div
                className={`bg-bp-mint h-full rounded-full transition-[width] duration-500 ${COMPLETION_WIDTH[Math.round(paidPct / 10)]}`}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-white/55">
                {fmtCents(earnings.outstanding_cents, earnings.currency)} outstanding
              </span>
              {earnings.engagements.length > 1 && (
                <span className="text-bp-mint/70 font-semibold">
                  across {earnings.engagements.length} phases
                </span>
              )}
            </div>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-bp-forest p-[12px_22px]">
              <div className="mb-1 flex items-center gap-1.5">
                {stat.icon}
                <span className="text-bp-mint/70 text-[10px] font-semibold tracking-[0.1em] uppercase">
                  {stat.label}
                </span>
              </div>
              <div className="text-[18px] font-extrabold tabular-nums text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </header>

      {document && (
        <div className={`${CARD} shrink-0 p-[14px_18px]`}>
          <p className="text-bp-body m-0 text-[12.5px] leading-relaxed">
            {document.blueprint.ideaDesc}
          </p>
        </div>
      )}

      <div className="grid shrink-0 grid-cols-1 items-start gap-4 pb-1 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-3.5">
          <Kicker>Development roadmap</Kicker>
          <DeveloperPhaseBoard
            phases={project.phases}
            phaseContent={phaseContent}
            deliverablesByPhase={deliverableState.byPhase}
            deliverablesLoading={deliverableState.loading}
            expandedIndex={expandedIndex}
            today={today}
            onSelectPhase={setExpandedIndex}
            onOpenDeliverable={deliverableState.setOpenDeliverableId}
          />
        </div>

        <div className="flex flex-col gap-4">
          <IssuesPanel
            issues={issueState.issues}
            loading={issueState.loading}
            phaseNameFor={phaseNameFor}
            onOpenIssue={issueState.setOpenIssueId}
            showMineFilter
          />
          <DeadlinesPanel
            deadlines={deadlineState.deadlines}
            loading={deadlineState.loading}
            today={today}
            phaseNameFor={phaseNameFor}
            busyId={deadlineState.busyId}
            onToggleMet={deadlineState.toggleMet}
          />
        </div>
      </div>

      <AnimatePresence>
        {issueState.openIssueId && (
          <IssueModal
            issueId={issueState.openIssueId}
            phaseNameFor={phaseNameFor}
            onClose={() => issueState.setOpenIssueId(null)}
            onChanged={() => Promise.all([issueState.reload(), deadlineState.reload()])}
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
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {earningsOpen && (
          <EarningsModal
            earnings={earnings}
            phaseNameFor={phaseNameFor}
            onClose={() => setEarningsOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
