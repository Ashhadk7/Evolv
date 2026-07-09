"use client";

import { CheckCircle, Warning } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { EASE } from "@/components/shared/card-style";
import {
  buildBlueprintContent,
  computeProjectHealth,
  type ProjectState,
} from "@/features/blueprints/blueprint-content";
import { fmtMoney, fmtDate } from "@/features/blueprints/blueprint-content";
import { currentPhaseIndex, type ProjectBlueprint } from "@/features/projects/lib/project-helpers";
import { DarkMeter } from "./dark-meter";

const PROJECT_LIVE_LABEL: Record<ProjectState["status"], string> = {
  ONBOARDING: "Project onboarding",
  IN_DEVELOPMENT: "Build in progress",
  COMPLETED: "Project complete",
};

export function ProjectListCard({
  bp,
  idx,
  onClick,
}: {
  bp: ProjectBlueprint;
  idx: number;
  onClick: () => void;
}) {
  const content = buildBlueprintContent(bp);
  const health = computeProjectHealth(content, bp.project);
  const phaseIdx = currentPhaseIndex(bp.project);
  const currentPhase = content.phases[phaseIdx];
  const currentAssignment = bp.project.phaseStates[phaseIdx]?.assignment;
  const completion = health.deliverables.total
    ? Math.round((health.deliverables.done / health.deliverables.total) * 100)
    : 0;
  const phasesComplete = bp.project.phaseStates.filter((ps) => ps.status === "Complete").length;
  const live = bp.project.status === "IN_DEVELOPMENT";

  const meters = [
    {
      label: "Deliverables",
      value: completion,
      display: `${health.deliverables.done}/${health.deliverables.total}`,
    },
    { label: "Budget deployed", value: health.budget.pct, display: fmtMoney(health.budget.spent) },
    {
      label: "Phases complete",
      value: Math.round((phasesComplete / (bp.project.phaseStates.length || 1)) * 100),
      display: `${phasesComplete}/${bp.project.phaseStates.length}`,
    },
  ];

  const stackTags = [
    bp.techStack.frontend,
    bp.techStack.backend,
    bp.techStack.db,
    bp.techStack.hosting || "Vercel",
  ]
    .map((s) => s.split(",")[0].trim())
    .filter(Boolean);

  const currentDeadline = bp.project.phaseStates[phaseIdx]?.deadline;
  const insight =
    bp.project.status === "COMPLETED"
      ? "All phases complete — every milestone shipped and paid out."
      : currentAssignment
        ? `${currentPhase?.name} in progress with ${currentAssignment.developerName}${currentDeadline ? ` — due ${fmtDate(currentDeadline)}` : ""}.`
        : `Next: assign a developer for ${currentPhase?.name} — ${fmtMoney(currentPhase?.cost ?? 0)} milestone.`;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08, duration: 0.5, ease: EASE }}
      whileHover={{ y: -5 }}
      className="text-left cursor-pointer overflow-hidden rounded-2xl p-0 bg-gradient-to-br from-[#2a4c40] to-[#1a332b] border border-[#89d7b7]/18 shadow-[inset_0_0_0_1px_rgba(137,215,183,0.08),0_22px_46px_-18px_rgba(17,34,27,0.5),0_6px_18px_rgba(17,34,27,0.16)]"
    >
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#fff4e1]/09 bg-[#fff4e1]/03">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/55" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/55" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/55" />
        </div>
        <span className="font-mono text-[10px] tracking-wider text-[#fff4e1]/40">
          {bp.id}.project
        </span>
        <div className="w-[46px]" />
      </div>

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="relative flex w-1.5 h-1.5">
                {live && (
                  <motion.span
                    animate={{ scale: [1, 2.1], opacity: [0.55, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    className={`absolute inset-0 rounded-full ${bp.project.status === "ONBOARDING" ? "bg-bp-amber" : "bg-[#89d7b7]"}`}
                  />
                )}
                <span
                  className={`relative w-1.5 h-1.5 rounded-full ${bp.project.status === "ONBOARDING" ? "bg-bp-amber" : "bg-[#89d7b7]"}`}
                />
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#89d7b7]/78">
                {PROJECT_LIVE_LABEL[bp.project.status]}
              </span>
            </div>
            <div className="text-[15.5px] font-bold text-[#fff4e1]/97 tracking-[-0.01em] leading-tight">
              {bp.name}
            </div>
            <div className="text-[11px] text-[#fff4e1]/50 mt-0.75">
              {bp.industry} · {currentPhase?.name}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[34px] font-bold leading-none text-[#9fe3c6] tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
              {completion}
              <span className="text-base">%</span>
            </div>
            <div className="text-[9px] uppercase tracking-widest text-[#fff4e1]/42 mt-0.75">
              Complete
            </div>
          </div>
        </div>

        {/* Metric meters */}
        <div className="flex flex-col gap-2.5 mb-4">
          {meters.map((m, i) => (
            <div key={m.label}>
              <div className="flex justify-between mb-1 text-[10px]">
                <span className="text-[#fff4e1]/55">{m.label}</span>
                <span className="text-[#9fe3c6]/90 tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">{m.display}</span>
              </div>
              <DarkMeter value={m.value} delay={0.3 + i * 0.1} />
            </div>
          ))}
        </div>

        {/* Stack tags — from the blueprint this project was built on */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {stackTags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg px-2 py-0.75 text-[10px] text-[#9fe3c6]/85 bg-[#89d7b7]/10 border border-[#89d7b7]/20"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Next-action insight */}
        <div className="flex items-start gap-2 rounded-xl p-[10px_12px] bg-[#89d7b7]/09 border border-[#89d7b7]/16">
          {currentAssignment || bp.project.status === "COMPLETED" ? (
            <CheckCircle size={11} weight="fill" className="text-[#9fe3c6] shrink-0 mt-0.5" />
          ) : (
            <Warning size={11} weight="fill" className="text-[#eec06a] shrink-0 mt-0.5" />
          )}
          <p className="text-[10.5px] leading-relaxed m-0 text-[#fff4e1]/62">
            {insight}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
