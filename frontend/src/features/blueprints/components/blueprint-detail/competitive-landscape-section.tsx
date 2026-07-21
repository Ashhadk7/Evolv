"use client";

import { Trophy } from "@phosphor-icons/react";
import type {
  CompetitorInsight,
  CompetitorRow,
} from "@/features/blueprints/blueprint-content";
import { cardStyle } from "@/components/shared/card-style";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";
import { Label } from "@/components/shared/label";
import { ResearchFooter, SourceChips } from "@/components/shared/source-evidence";

export function CompetitiveLandscapeSection({
  bpName,
  competitorRows,
  insight,
}: {
  bpName: string;
  competitorRows: CompetitorRow[];
  insight: CompetitorInsight;
}) {
  return (
    <Reveal>
      <div style={cardStyle({ padding: "28px 30px" })}>
        <SectionHead
          icon={<Trophy size={18} weight="duotone" className="text-bp-amber" />}
          kicker="Competition"
          title="Competitive Landscape"
          desc="Named competitors found in live research — every named player links back to the sources that support it."
        />
        {competitorRows.length ? (
          <div className="border-bp-border-soft overflow-hidden rounded-xl border">
            <div className="font-mono-app text-bp-label bg-bp-tint grid grid-cols-[1.1fr_0.7fr_1.35fr_1.35fr_1.35fr] gap-2.5 px-[18px] py-2.5 text-[10px] font-bold tracking-[0.08em] uppercase">
              <span>Player</span>
              <span>Type</span>
              <span>Why they win</span>
              <span>Where they fall short</span>
              <span>Opening for {bpName}</span>
            </div>
            {competitorRows.map((c, i) => (
              <div
                key={c.name + i}
                className="border-bp-border-soft text-bp-ink grid grid-cols-[1.1fr_0.7fr_1.35fr_1.35fr_1.35fr] items-start gap-2.5 border-t px-[18px] py-3.5 text-[12.5px]"
              >
                <span className="font-bold">
                  {c.name}
                  <SourceChips indexes={c.sourceIndexes} sources={insight.sources} />
                </span>
                <span className="text-bp-muted">{c.type}</span>
                <span className="text-bp-muted leading-[1.5]">{c.strengths.join("; ")}</span>
                <span className="text-bp-muted leading-[1.5]">{c.weaknesses.join("; ")}</span>
                <span className="text-bp-body leading-[1.5]">{c.gap}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-bp-muted text-[12.5px]">
            No competitor research available for this blueprint — regenerate it to run live
            competitor analysis.
          </p>
        )}
        {insight.analysis && (
          <div className="mt-5">
            <Label>Full analysis</Label>
            <p className="text-bp-body m-0 text-[13px] leading-[1.7]">{insight.analysis}</p>
          </div>
        )}
        <ResearchFooter
          sources={insight.sources}
          retrievedAt={insight.retrievedAt}
          confidence={insight.confidence}
          assumptions={insight.assumptions}
        />
      </div>
    </Reveal>
  );
}
