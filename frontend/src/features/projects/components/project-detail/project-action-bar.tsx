"use client";

import { ArrowLeft, CaretRight, CheckCircle, Warning } from "@phosphor-icons/react";
import { Chip } from "@/components/shared/chip";
import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/features/blueprints/blueprint-content";

export function ProjectActionBar({
  name,
  status,
  verdict,
  verdictTone,
  onBack,
  onViewBlueprint,
}: {
  name: string;
  status: ProjectStatus;
  verdict: "On track" | "Attention needed" | "At risk";
  verdictTone: "mint" | "amber" | "red";
  onBack: () => void;
  onViewBlueprint?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3 shrink-0">
      <button onClick={onBack} className="bp-primary-btn !px-3 !py-1.5 !text-xs md:!text-sm">
        <ArrowLeft size={14} weight="bold" /> Projects
      </button>
      <div className="bg-bp-border hidden sm:block h-5 w-px" />
      <span className="text-bp-ink text-sm md:text-[15px] font-bold truncate max-w-[150px] sm:max-w-none">{name}</span>
      <Chip
        tone={status === "IN_DEVELOPMENT" ? "mint" : status === "ONBOARDING" ? "amber" : "neutral"}
      >
        {PROJECT_STATUS_LABEL[status]}
      </Chip>
      <Chip
        tone={verdictTone}
        icon={
          verdict === "On track" ? (
            <CheckCircle size={11} weight="fill" />
          ) : (
            <Warning size={11} weight="fill" />
          )
        }
      >
        {verdict}
      </Chip>
      {onViewBlueprint && (
        <button onClick={onViewBlueprint} className="bp-primary-btn ml-auto !px-3 !py-1.5 !text-xs md:!text-sm">
          View full spec <CaretRight size={12} weight="bold" />
        </button>
      )}
    </div>
  );
}
