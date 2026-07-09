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
    <div className="flex shrink-0 items-center gap-3">
      <button onClick={onBack} className="bp-primary-btn">
        <ArrowLeft size={15} weight="bold" /> Projects
      </button>
      <div className="bg-bp-border h-5 w-px" />
      <span className="text-bp-ink text-[15px] font-bold">{name}</span>
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
        <button onClick={onViewBlueprint} className="bp-primary-btn ml-auto">
          View full spec <CaretRight size={12} weight="bold" />
        </button>
      )}
    </div>
  );
}
