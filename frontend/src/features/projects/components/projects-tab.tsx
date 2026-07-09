"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Buildings,
  CalendarBlank,
  ChartBar,
  CheckCircle,
  Coins,
  Plus,
} from "@phosphor-icons/react";
import { Kicker } from "@/components/shared/kicker";
import { Label } from "@/components/shared/label";
import type { Blueprint } from "@/features/blueprints/types";
import { fmtMoney } from "@/features/blueprints/blueprint-content";
import { ProjectListCard } from "./project-list-card";
import { StartProjectModal } from "./start-project-modal";
import { ProjectDetail } from "./project-detail";
import { useProjectsTab } from "@/features/projects/lib/use-projects-tab";
import type { FounderNetworkMessageTarget } from "@/features/network/types";

export function ProjectsTab({
  blueprints: rawBlueprints,
  onBlueprintsChange,
  onViewBlueprint,
  onNavigateNetwork,
  onMessage,
  stripeConnected,
  onNavigateSettingsPayment,
}: {
  blueprints: Blueprint[];
  onBlueprintsChange: (bps: Blueprint[]) => void;
  onViewBlueprint?: (id: string) => void;
  onNavigateNetwork?: () => void;
  onMessage?: (contact: FounderNetworkMessageTarget) => void;
  stripeConnected: boolean;
  onNavigateSettingsPayment?: () => void;
}) {
  const {
    selectedId,
    setSelectedId,
    pickerOpen,
    setPickerOpen,
    toast,
    projectBlueprints,
    startableBlueprints,
    startProject,
    selected,
    activeCount,
    totalDeployed,
    avgCompletion,
    deadlinesThisWeek,
    summaries,
    updateBlueprint,
  } = useProjectsTab({ blueprints: rawBlueprints, onBlueprintsChange });

  if (selected) {
    return (
      <div className="bg-bp-page h-full px-[28px] pt-[16px] pb-[18px] overflow-hidden">
        <ProjectDetail
          bp={selected}
          onUpdate={(mutate) => updateBlueprint(selected.id, mutate)}
          onBack={() => setSelectedId(null)}
          onViewBlueprint={onViewBlueprint}
          onNavigateNetwork={onNavigateNetwork}
          onMessage={onMessage}
          stripeConnected={stripeConnected}
          onNavigateSettingsPayment={onNavigateSettingsPayment}
        />
      </div>
    );
  }

  const kpis = [
    {
      label: "Active Projects",
      value: String(activeCount),
      icon: <Buildings size={16} weight="duotone" className="text-bp-teal" />,
    },
    {
      label: "Budget Deployed",
      value: fmtMoney(totalDeployed),
      icon: <Coins size={16} weight="duotone" className="text-bp-success" />,
    },
    {
      label: "Avg. Completion",
      value: `${avgCompletion}%`,
      icon: <ChartBar size={16} weight="duotone" className="text-bp-teal" />,
    },
    {
      label: "Due This Week",
      value: String(deadlinesThisWeek),
      icon: (
        <CalendarBlank
          size={16}
          weight="duotone"
          className={deadlinesThisWeek > 0 ? "text-bp-amber" : "text-bp-teal"}
        />
      ),
    },
  ];

  const bpCardClass =
    "bg-bp-card border border-bp-border rounded-2xl shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)]";

  return (
    <div className="blueprint-scroll bg-bp-page h-full overflow-y-auto px-[28px] pt-[24px] pb-[60px]">
      <div className="max-w-[1180px] mx-auto flex flex-col gap-[22px]">
        <div className="flex items-start justify-between gap-5 flex-wrap">
          <div>
            <Kicker>Build Tracker</Kicker>
            <h1 className="text-bp-ink text-[27px] font-extrabold tracking-[-0.02em]">
              Projects
            </h1>
            <p className="text-bp-muted text-[13.5px] mt-1.5 max-w-[520px]">
              Track everything you&apos;re building — assign a developer per phase, manage payments,
              and watch progress in real time.
            </p>
          </div>
          <button
            onClick={() => setPickerOpen(true)}
            className="bp-primary-btn shrink-0"
          >
            <Plus size={15} weight="bold" /> New Project
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className={`${bpCardClass} p-[16px_18px]`}>
              <div className="flex items-center justify-between">
                <Label>{k.label}</Label>
                {k.icon}
              </div>
              <div className="text-bp-ink text-[21px] font-extrabold">
                {k.value}
              </div>
            </div>
          ))}
        </div>

        {summaries.length === 0 ? (
          <div className={`${bpCardClass} p-[48px_32px] flex flex-col items-center text-center gap-3.5 border-[1.5px] border-dashed border-bp-border`}>
            <div className="bg-bp-tint w-[52px] h-[52px] rounded-[15px] flex items-center justify-center">
              <Buildings size={24} weight="duotone" className="text-bp-teal" />
            </div>
            <div>
              <div className="text-bp-ink text-[16px] font-extrabold">
                No projects yet
              </div>
              <p className="text-bp-muted text-[13px] mt-1.5 max-w-[360px]">
                Projects appear here once you start one from a blueprint — assign developers, track
                deliverables, and manage payments per phase.
              </p>
            </div>
            <button onClick={() => setPickerOpen(true)} className="bp-primary-btn">
              <Plus size={14} weight="bold" /> Start your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {projectBlueprints.map((bp, i) => (
              <ProjectListCard key={bp.id} bp={bp} idx={i} onClick={() => setSelectedId(bp.id)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {pickerOpen && (
          <StartProjectModal
            blueprints={startableBlueprints}
            onPick={startProject}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="bg-bp-forest text-bp-mint fixed bottom-[30px] left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2 text-[13px] font-semibold px-5 py-[11px] rounded-xl shadow-[0_14px_40px_rgba(11,34,27,0.42)]"
          >
            <CheckCircle size={16} weight="fill" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
