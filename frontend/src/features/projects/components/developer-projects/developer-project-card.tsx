"use client";

import { CheckCircle, Warning } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { EASE } from "@/components/shared/card-style";
import { fmtDate } from "@/features/blueprints/blueprint-content";
import {
  fmtCents,
  type DeveloperProjectSummary,
} from "@/features/projects/developer-projects-api";
import { DarkMeter } from "../dark-meter";

const STATUS_LABEL: Record<DeveloperProjectSummary["status"], string> = {
  active: "Build in progress",
  paused: "Project onboarding",
  completed: "Project complete",
  cancelled: "Project cancelled",
};

export function DeveloperProjectCard({
  project,
  idx,
  onClick,
}: {
  project: DeveloperProjectSummary;
  idx: number;
  onClick: () => void;
}) {
  const completion = project.deliverables_total
    ? Math.round((project.deliverables_done / project.deliverables_total) * 100)
    : 0;
  const paidPct = project.earnings.agreed_cents
    ? Math.round((project.earnings.paid_cents / project.earnings.agreed_cents) * 100)
    : 0;
  const live = project.status === "active";

  const meters = [
    {
      label: "Deliverables",
      value: completion,
      display: `${project.deliverables_done}/${project.deliverables_total}`,
    },
    {
      label: "Earnings received",
      value: paidPct,
      display: fmtCents(project.earnings.paid_cents, project.earnings.currency),
    },
  ];

  const phaseLabel = project.my_phase_indices.map((i) => `Phase ${i + 1}`).join(" · ");

  const insight =
    project.status === "completed"
      ? "All phases complete — every deliverable shipped."
      : project.open_issues > 0
        ? `${project.open_issues} open ${project.open_issues === 1 ? "issue" : "issues"} on this project${project.next_deadline ? ` — next due ${fmtDate(project.next_deadline)}` : ""}.`
        : project.next_deadline
          ? `On track — next deadline ${fmtDate(project.next_deadline)}.`
          : "On track — no deadlines set yet.";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08, duration: 0.5, ease: EASE }}
      whileHover={{ y: -5 }}
      className="cursor-pointer overflow-hidden rounded-2xl border border-[#89d7b7]/18 bg-gradient-to-br from-[#2a4c40] to-[#1a332b] p-0 text-left shadow-[inset_0_0_0_1px_rgba(137,215,183,0.08),0_22px_46px_-18px_rgba(17,34,27,0.5),0_6px_18px_rgba(17,34,27,0.16)]"
    >
      <div className="flex items-center justify-between border-b border-[#fff4e1]/09 bg-[#fff4e1]/03 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/55" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/55" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/55" />
        </div>
        <span className="font-mono text-[10px] tracking-wider text-[#fff4e1]/40">
          {phaseLabel || "unassigned"}
        </span>
        <div className="w-[46px]" />
      </div>

      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                {live && (
                  <motion.span
                    animate={{ scale: [1, 2.1], opacity: [0.55, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full bg-[#89d7b7]"
                  />
                )}
                <span className="relative h-1.5 w-1.5 rounded-full bg-[#89d7b7]" />
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#89d7b7]/78">
                {STATUS_LABEL[project.status]}
              </span>
            </div>
            <div className="text-[15.5px] font-bold leading-tight tracking-[-0.01em] text-[#fff4e1]/97">
              {project.title}
            </div>
            <div className="mt-0.75 text-[11px] font-semibold text-[#9fe3c6]/72">
              Founder: {project.founder_name}
            </div>
            <div className="mt-0.75 text-[11px] text-[#fff4e1]/50">
              Your agreed fee {fmtCents(project.earnings.agreed_cents, project.earnings.currency)}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[34px] font-bold leading-none text-[#9fe3c6] tabular-nums">
              {completion}
              <span className="text-base">%</span>
            </div>
            <div className="mt-0.75 text-[9px] uppercase tracking-widest text-[#fff4e1]/42">
              Complete
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-2.5">
          {meters.map((m, i) => (
            <div key={m.label}>
              <div className="mb-1 flex justify-between text-[10px]">
                <span className="text-[#fff4e1]/55">{m.label}</span>
                <span className="tabular-nums text-[#9fe3c6]/90">{m.display}</span>
              </div>
              <DarkMeter value={m.value} delay={0.3 + i * 0.1} />
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-[#89d7b7]/16 bg-[#89d7b7]/09 p-[10px_12px]">
          {project.open_issues === 0 ? (
            <CheckCircle size={11} weight="fill" className="mt-0.5 shrink-0 text-[#9fe3c6]" />
          ) : (
            <Warning size={11} weight="fill" className="mt-0.5 shrink-0 text-[#eec06a]" />
          )}
          <p className="m-0 text-[10.5px] leading-relaxed text-[#fff4e1]/62">{insight}</p>
        </div>
      </div>
    </motion.button>
  );
}
