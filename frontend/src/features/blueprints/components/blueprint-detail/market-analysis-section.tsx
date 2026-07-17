"use client";

import { ChartLineUp, Clock, SealCheck, Warning } from "@phosphor-icons/react";
import type { MarketAnalysis } from "@/features/blueprints/blueprint-content";
import { cardStyle, NUM } from "@/components/shared/card-style";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";
import { Chip } from "@/components/shared/chip";
import { Label } from "@/components/shared/label";
import { ResearchFooter, SourceChips } from "@/components/shared/source-evidence";

/* "sourced" | "assumption" tag under a market number — never present a guess
   as a fact. Empty basis (legacy blueprints) shows nothing. */
function basisLabel(basis: string): string {
  if (basis === "sourced") return "From cited sources";
  if (basis === "assumption") return "Agent assumption";
  return "";
}

export function MarketAnalysisSection({ marketAnalysis }: { marketAnalysis: MarketAnalysis }) {
  const tiles = [
    {
      l: "Total market",
      v: marketAnalysis.totalMarket,
      sub: basisLabel(marketAnalysis.totalMarketBasis) || "Broad category demand",
    },
    marketAnalysis.bottomUpSam
      ? {
          l: "Bottom-up wedge",
          v: marketAnalysis.bottomUpSam,
          sub: marketAnalysis.bottomUpBasis || "Customers × price for the first wedge",
        }
      : null,
    {
      l: "Growth (CAGR)",
      v: marketAnalysis.cagr,
      sub: basisLabel(marketAnalysis.cagrBasis) || "Category growth rate",
    },
  ].filter((tile): tile is { l: string; v: string; sub: string } => tile !== null);

  return (
    <Reveal>
      <div style={cardStyle({ padding: "28px 30px" })}>
        <SectionHead
          icon={<ChartLineUp size={18} weight="duotone" className="text-bp-teal" />}
          kicker="Market"
          title="Market Analysis"
          desc="Top-down category size and a bottom-up wedge estimate, with every number labeled as sourced or assumed."
          right={
            <Chip
              tone={
                marketAnalysis.demandLevel === "High"
                  ? "mint"
                  : marketAnalysis.demandLevel === "Medium"
                    ? "amber"
                    : "neutral"
              }
            >
              {marketAnalysis.demandLevel} market pull
            </Chip>
          }
        />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
          {tiles.map((m, i) => (
            <div
              key={m.l}
              className={`rounded-2xl px-[18px] py-4 ${
                i === 1
                  ? "bg-bp-forest border border-transparent"
                  : "border-bp-border-soft bg-bp-tint border"
              }`}
            >
              <div
                className={`font-mono-app mb-[7px] text-[10px] font-semibold tracking-[0.12em] uppercase ${
                  i === 1 ? "text-bp-mint-soft" : "text-bp-label"
                }`}
              >
                {m.l}
              </div>
              <div
                style={NUM}
                className={`text-[21px] font-extrabold ${i === 1 ? "text-white" : "text-bp-ink"}`}
              >
                {m.v}
              </div>
              <div
                className={`mt-1.5 text-[11.5px] leading-[1.45] ${
                  i === 1 ? "text-bp-mint-soft" : "text-bp-muted"
                }`}
              >
                {m.sub}
              </div>
            </div>
          ))}
        </div>
        {marketAnalysis.insight && (
          <div className="mt-[22px]">
            <Label>Opportunity logic</Label>
            <p className="text-bp-body m-0 text-[13.5px] leading-[1.65]">
              {marketAnalysis.insight}
            </p>
          </div>
        )}
        {(marketAnalysis.timing || marketAnalysis.whyNow) && (
          <div className="mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5">
            {[
              { label: "Timing", text: marketAnalysis.timing },
              { label: "Why now", text: marketAnalysis.whyNow },
            ]
              .filter((item) => item.text)
              .map((item) => (
                <div
                  key={item.label}
                  className="border-bp-border-soft bg-bp-tint flex gap-2.5 rounded-xl border px-[15px] py-[13px]"
                >
                  <div className="border-bp-border-soft bg-bp-card flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border">
                    <Clock size={15} weight="duotone" className="text-bp-teal" />
                  </div>
                  <div>
                    <div className="font-mono-app text-bp-label mb-1 text-[10px] font-bold tracking-[0.1em] uppercase">
                      {item.label}
                    </div>
                    <div className="text-bp-body text-[12.5px] leading-[1.55]">{item.text}</div>
                  </div>
                </div>
              ))}
          </div>
        )}
        <div className="mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
          <div>
            <Label>Demand signals</Label>
            <div className="flex flex-col gap-2">
              {marketAnalysis.demandSignals.map((s, i) => (
                <div key={i} className="flex gap-[9px]">
                  <SealCheck size={14} weight="fill" className="text-bp-success mt-0.5 shrink-0" />
                  <span className="text-bp-body text-[12.5px] leading-[1.5]">
                    {s.text}
                    <SourceChips indexes={s.sourceIndexes} sources={marketAnalysis.sources} />
                  </span>
                </div>
              ))}
              {!marketAnalysis.demandSignals.length && (
                <span className="text-bp-muted text-[12px]">
                  No demand signals available — regenerate this blueprint.
                </span>
              )}
            </div>
          </div>
          <div>
            <Label>Headwinds</Label>
            <div className="flex flex-col gap-2">
              {marketAnalysis.headwinds.map((r, i) => (
                <div key={i} className="flex gap-[9px]">
                  <Warning size={14} weight="fill" className="text-bp-amber mt-0.5 shrink-0" />
                  <span className="text-bp-body text-[12.5px] leading-[1.5]">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {marketAnalysis.analysis && (
          <div className="mt-[18px]">
            <Label>Full analysis</Label>
            <p className="text-bp-body m-0 text-[13px] leading-[1.7]">{marketAnalysis.analysis}</p>
          </div>
        )}
        <ResearchFooter
          sources={marketAnalysis.sources}
          retrievedAt={marketAnalysis.retrievedAt}
          confidence={marketAnalysis.confidence}
          assumptions={marketAnalysis.assumptions}
        />
      </div>
    </Reveal>
  );
}
