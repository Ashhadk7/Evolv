"use client";

import { ArrowRight, Gauge, SealCheck, Warning } from "@phosphor-icons/react";
import type { Blueprint } from "@/features/blueprints/types";
import { NUM, cardStyle } from "@/components/shared/card-style";
import { Chip } from "@/components/shared/chip";
import { Kicker } from "@/components/shared/kicker";
import { Label } from "@/components/shared/label";
import { MeterBar } from "@/components/shared/meter-bar";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";
import { ViabilityGauge } from "@/components/shared/viability-gauge";
import { SourceChips } from "@/components/shared/source-evidence";
import type { ResearchSourceRef } from "@/features/blueprints/blueprint-content";

interface SubScore {
  label: string;
  value: number;
  note?: string;
  sourceIndexes?: number[];
}

const VERDICT_TONE: Record<string, "mint" | "amber" | "red"> = {
  Build: "mint",
  "Validate first": "amber",
  Rethink: "red",
};

export function BlueprintHeroSection({
  bp,
  stageLabel,
  tagline,
  verdict,
  phasesCount,
  buildWeeks,
  viabilityScore,
  viabilityReasoning,
  subScoreRow,
  combinedSources,
}: {
  bp: Blueprint;
  stageLabel: string;
  tagline?: string;
  verdict?: string;
  phasesCount: number;
  buildWeeks: number;
  viabilityScore: number;
  viabilityReasoning: string;
  subScoreRow: SubScore[];
  combinedSources?: ResearchSourceRef[];
}) {
  return (
    <Reveal y={14}>
      <div style={cardStyle({ position: "relative", overflow: "hidden", padding: "40px 44px" })}>
        <div className="pointer-events-none absolute -top-[120px] -right-20 h-[360px] w-[360px] bg-[radial-gradient(circle,rgba(137,215,183,0.16),transparent_70%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-10">
          <div className="min-w-[300px] flex-[1_1_420px]">
            <Kicker>Venture Blueprint · {stageLabel}</Kicker>
            <h1 className="text-bp-ink text-[38px] leading-[1.04] font-extrabold tracking-[-0.032em]">
              {bp.name}
            </h1>
            {tagline && (
              <p className="text-bp-muted mt-1.5 mb-0 text-[15px] leading-[1.4] italic">
                {tagline}
              </p>
            )}
            <div className="mt-3.5 flex flex-wrap gap-2">
              <Chip
                tone="mint"
                icon={<span className="inline-block h-[5px] w-[5px] rounded-full bg-[#89d7b7]" />}
              >
                {bp.industry}
              </Chip>
              {verdict ? (
                <Chip tone={VERDICT_TONE[verdict] ?? "neutral"}>Verdict: {verdict}</Chip>
              ) : (
                <Chip>{stageLabel}</Chip>
              )}
              <Chip>Updated {bp.updatedAt}</Chip>
            </div>
            <p className="text-bp-body mt-4.5 max-w-[540px] text-base leading-[1.7]">
              {bp.ideaDesc}
            </p>
            <div className="font-mono-app text-bp-label mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
              <span>{phasesCount} milestones</span>
              <span>·</span>
              <span>{buildWeeks}-week build</span>
              <span>·</span>
              <span>{bp.devMatches} developer matches</span>
            </div>
          </div>
          <div className="flex max-w-[356px] min-w-[330px] flex-[0_0_auto] flex-col gap-4">
            <div className="flex items-center justify-center">
              <ViabilityGauge score={viabilityScore} />
            </div>
            <p className="text-bp-body m-0 text-[12.5px] leading-[1.6]">{viabilityReasoning}</p>
            <div
              className="border-bp-border-soft grid gap-3.5 border-t pt-3.5"
              style={{
                gridTemplateColumns: `repeat(${Math.min(subScoreRow.length, 3)}, 1fr)`,
              }}
            >
              {subScoreRow.map((score) => (
                <div
                  key={score.label}
                  className="flex flex-col gap-1.5"
                  title={score.note || undefined}
                >
                  <span style={NUM} className="text-bp-ink text-base leading-none font-bold">
                    {score.value}
                    {score.sourceIndexes && score.sourceIndexes.length > 0 && combinedSources && combinedSources.length > 0 && (
                      <SourceChips indexes={score.sourceIndexes} sources={combinedSources} />
                    )}
                  </span>
                  <MeterBar value={score.value} height={3} />
                  <span className="font-mono-app text-bp-label text-[9px] tracking-[0.06em] whitespace-nowrap uppercase">
                    {score.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function BlueprintVentureAssessmentSection({
  bp,
  strengths,
  risks,
}: {
  bp: Blueprint;
  strengths: string[];
  risks: string[];
}) {
  return (
    <Reveal>
      <div style={cardStyle({ borderLeft: "3px solid var(--color-bp-mint)", padding: "28px 30px" })}>
        <SectionHead
          icon={<Gauge size={18} weight="duotone" className="text-bp-success" />}
          kicker="AI Analysis"
          title="Venture Assessment"
        />
        <div className="grid grid-cols-[1fr_1fr_1.1fr] gap-[30px]">
          <div>
            <Label>Strengths</Label>
            {strengths.map((strength) => (
              <div key={strength} className="mb-[11px] flex gap-[9px]">
                <SealCheck size={15} weight="fill" className="text-bp-success mt-px shrink-0" />
                <span className="text-bp-body text-[13px] leading-[1.5]">{strength}</span>
              </div>
            ))}
          </div>
          <div>
            <Label>Risks</Label>
            {risks.map((risk, index) => (
              <div key={index} className="mb-[11px] flex gap-[9px]">
                <Warning
                  size={15}
                  weight="fill"
                  className={`mt-px shrink-0 ${index === 0 ? "text-bp-red" : "text-bp-amber"}`}
                />
                <span className="text-bp-body text-[13px] leading-[1.5]">{risk}</span>
              </div>
            ))}
          </div>
          <div>
            <Label>Recommendation</Label>
            <div className="border-bp-amber-line bg-bp-amber-bg flex gap-2.5 rounded-xl border px-[15px] py-[13px]">
              <ArrowRight size={15} weight="bold" className="text-bp-amber mt-0.5 shrink-0" />
              <span className="text-[13px] leading-[1.55] text-[#7a5c10]">{bp.aiRecommend}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-[7px]">
              <Chip tone="mint">Market Leader</Chip>
              <Chip tone="mint">High Growth</Chip>
              <Chip tone="amber">Medium Risk</Chip>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
