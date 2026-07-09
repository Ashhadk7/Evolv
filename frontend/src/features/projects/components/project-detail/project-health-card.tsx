"use client";

import { ShieldCheck } from "@phosphor-icons/react";
import { Chip } from "@/components/shared/chip";
import { MeterBar } from "@/components/shared/meter-bar";
import { fmtMoney } from "@/features/blueprints/blueprint-content";
import type { ProjectHealth } from "@/features/blueprints/blueprint-content";

export function ProjectHealthCard({
  health,
  completion,
  verdictTone,
}: {
  health: ProjectHealth;
  completion: number;
  verdictTone: "mint" | "amber" | "red";
}) {
  const borderToneClass =
    verdictTone === "mint"
      ? "border-l-bp-mint"
      : verdictTone === "amber"
        ? "border-l-bp-amber"
        : "border-l-bp-red";

  return (
    <div
      className={`bg-bp-card border border-bp-border rounded-2xl shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)] p-[16px_20px] shrink-0 border-l-[3px] ${borderToneClass}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="bg-bp-tint flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg">
          <ShieldCheck size={13} weight="duotone" className="text-bp-teal" />
        </div>
        <span className="text-bp-ink text-[13px] font-extrabold">Project Health</span>
        <span className="ml-auto">
          <Chip tone={verdictTone}>{health.verdict}</Chip>
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        <div>
          <div className="mb-1 flex justify-between text-[11px]">
            <span className="text-bp-muted">Budget deployed</span>
            <span className="text-bp-ink font-bold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
              {health.budget.pct}% · {fmtMoney(health.budget.spent)}
            </span>
          </div>
          <MeterBar value={health.budget.pct} height={4} />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[11px]">
            <span className="text-bp-muted">Deliverables</span>
            <span className="text-bp-ink font-bold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
              {health.deliverables.done}/{health.deliverables.total}
            </span>
          </div>
          <MeterBar value={completion} height={4} />
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-bp-muted">Schedule</span>
          <span
            className={`font-bold ${health.timeline.delayedCount > 0 ? "text-bp-red" : "text-bp-success"}`}
          >
            {health.timeline.delayedCount > 0
              ? `${health.timeline.delayedCount} phase${health.timeline.delayedCount === 1 ? "" : "s"} overdue`
              : "On schedule"}
          </span>
        </div>
        {health.developers.map((d) => (
          <div key={d.developerId} className="flex justify-between text-[11px]">
            <span className="text-bp-muted max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">
              {d.developerName}
            </span>
            <span
              className={`font-bold tabular-nums font-feature-settings-[_tnum_1,_ss01_1] ${d.phasesOverdue > 0 ? "text-bp-red" : "text-bp-success"}`}
            >
              {d.phasesComplete}/{d.phasesAssigned} phases
              {d.phasesOverdue > 0 ? ` · ${d.phasesOverdue} late` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
