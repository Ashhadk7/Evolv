"use client";

import { ChartLineUp, Clock, SealCheck, TrendUp, Warning } from "@phosphor-icons/react";
import type { MarketAnalysis } from "@/features/blueprints/blueprint-content";
import { cardStyle, NUM } from "@/components/shared/card-style";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";
import { Chip } from "@/components/shared/chip";
import { Label } from "@/components/shared/label";

export function MarketAnalysisSection({ marketAnalysis }: { marketAnalysis: MarketAnalysis }) {
  return (
    <Reveal>
      <div style={cardStyle({ padding: "28px 30px" })}>
        <SectionHead
          icon={<ChartLineUp size={18} weight="duotone" className="text-bp-teal" />}
          kicker="Market"
          title="Market Analysis"
          desc="Total category size, the reachable wedge, and what an early team could plausibly capture."
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
          {[
            {
              l: "Total market",
              v: marketAnalysis.totalMarket,
              sub: "Broad category demand",
            },
            {
              l: "Reachable wedge",
              v: marketAnalysis.reachableMarket,
              sub: "First focused segment",
            },
            {
              l: "3-year capture",
              v: marketAnalysis.realisticCapture,
              sub: "Directional early upside",
            },
          ].map((m, i) => (
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
        <div className="mt-[22px]">
          <Label>Opportunity logic</Label>
          <p className="text-bp-body m-0 text-[13.5px] leading-[1.65]">{marketAnalysis.insight}</p>
        </div>
        <div className="mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5">
          {[
            {
              label: "Growth",
              icon: <TrendUp size={15} weight="duotone" className="text-bp-success" />,
              text: marketAnalysis.growth,
            },
            {
              label: "Why now",
              icon: <Clock size={15} weight="duotone" className="text-bp-teal" />,
              text: marketAnalysis.whyNow,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border-bp-border-soft bg-bp-tint flex gap-2.5 rounded-xl border px-[15px] py-[13px]"
            >
              <div className="border-bp-border-soft bg-bp-card flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border">
                {item.icon}
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
        <div className="mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
          <div>
            <Label>Demand signals</Label>
            <div className="flex flex-col gap-2">
              {marketAnalysis.demandSignals.map((s, i) => (
                <div key={i} className="flex gap-[9px]">
                  <SealCheck size={14} weight="fill" className="text-bp-success mt-0.5 shrink-0" />
                  <span className="text-bp-body text-[12.5px] leading-[1.5]">{s}</span>
                </div>
              ))}
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
      </div>
    </Reveal>
  );
}
