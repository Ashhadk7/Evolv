"use client";

import { CaretRight } from "@phosphor-icons/react";
import { Kicker } from "@/components/shared/kicker";
import { Chip } from "@/components/shared/chip";
import { ViabilityGauge } from "@/components/shared/viability-gauge";
import { fmtDate, fmtMoney } from "@/features/blueprints/blueprint-content";

export function ProjectSummaryBand({
  ideaDesc,
  industry,
  startedAt,
  phaseCount,
  completion,
  spent,
  deliverablesDone,
  deliverablesTotal,
  activePhaseLabel,
  activePhaseSubLabel,
  openIssues,
  onOpenSpendHistory,
}: {
  ideaDesc: string;
  industry: string;
  startedAt: string;
  phaseCount: number;
  completion: number;
  spent: number;
  deliverablesDone: number;
  deliverablesTotal: number;
  activePhaseLabel: string;
  activePhaseSubLabel: string;
  openIssues: number;
  onOpenSpendHistory: () => void;
}) {
  return (
    <div
      className="bg-gradient-to-br from-[#e8f5ef] to-[#f4faf7] border border-bp-mint shadow-[0_8px_32px_-8px_rgba(66,132,117,0.15)] p-4 md:p-[16px_24px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-7 shrink-0 rounded-2xl"
    >
      <div className="w-full sm:min-w-[260px] sm:flex-[1_1_300px]">
        <Kicker>Project Summary · Started {fmtDate(startedAt)}</Kicker>
        <p className="text-bp-body mt-1.5 line-clamp-2 text-[12px] md:text-[13px] leading-[1.6]">{ideaDesc}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <Chip tone="mint">{industry}</Chip>
          <Chip>{phaseCount} milestones</Chip>
        </div>
      </div>
      <div className="flex flex-wrap sm:flex-nowrap shrink-0 items-center gap-4 sm:gap-[26px] w-full sm:w-auto">
        <ViabilityGauge score={completion} label="COMPLETE" size={80} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-[30px] sm:gap-y-3">
          <button
            onClick={onOpenSpendHistory}
            className="cursor-pointer border-none bg-transparent p-0 text-left"
          >
            <div
              className="text-bp-ink flex items-baseline gap-1 text-sm md:text-base leading-[1.1] font-extrabold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]"
            >
              Spent: {fmtMoney(spent)} <CaretRight size={10} className="text-bp-teal" />
            </div>
            <div className="text-bp-teal mt-0.5 text-[10px] font-semibold whitespace-nowrap">
              view history
            </div>
          </button>
          {[
            {
              v: `${deliverablesDone}/${deliverablesTotal}`,
              s: "deliverables done",
            },
            {
              v: activePhaseLabel,
              s: activePhaseSubLabel,
            },
            { v: String(openIssues), s: `open issue${openIssues === 1 ? "" : "s"}` },
          ].map((x) => (
            <div key={x.s}>
              <div className="text-bp-ink text-sm md:text-base leading-[1.1] font-extrabold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
                {x.v}
              </div>
              <div className="text-bp-label mt-0.5 text-[10px] whitespace-nowrap">{x.s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
