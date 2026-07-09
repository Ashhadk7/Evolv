"use client";

import { Lightbulb, Strategy, Warning } from "@phosphor-icons/react";
import { cardStyle, NUM } from "@/components/shared/card-style";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";
import { Chip } from "@/components/shared/chip";
import { Label } from "@/components/shared/label";

export function GapAnalysisSection({
  gaps,
  additions,
  pathToComplete,
}: {
  gaps: { title: string; text: string }[];
  additions: { title: string; impact: string; text: string }[];
  pathToComplete: string[];
}) {
  return (
    <Reveal>
      <div style={cardStyle({ borderLeft: "3px solid var(--color-bp-amber)", padding: "28px 30px" })}>
        <SectionHead
          icon={<Strategy size={18} weight="duotone" className="text-bp-amber" />}
          kicker="Opportunity"
          title="Gap Analysis & Recommendations"
          desc="Where the market falls short today — and exactly what to add to turn this into a complete, defensible product."
        />
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>What the market lacks</Label>
            <div className="flex flex-col gap-2.5">
              {gaps.map((g) => (
                <div
                  key={g.title}
                  className="border-bp-border-soft bg-bp-tint flex gap-[11px] rounded-xl border px-[15px] py-[13px]"
                >
                  <Warning size={15} weight="duotone" className="text-bp-amber mt-px shrink-0" />
                  <div>
                    <div className="text-bp-ink text-[13px] font-bold">{g.title}</div>
                    <div className="text-bp-muted mt-0.5 text-[12.5px] leading-[1.5]">{g.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label>Recommended additions</Label>
            <div className="flex flex-col gap-2.5">
              {additions.map((a) => (
                <div
                  key={a.title}
                  className="border-bp-border bg-bp-card rounded-xl border px-[15px] py-[13px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb size={15} weight="fill" className="text-bp-success" />
                      <span className="text-bp-ink text-[13px] font-bold">{a.title}</span>
                    </div>
                    <Chip tone="mint">{a.impact}</Chip>
                  </div>
                  <div className="text-bp-muted mt-1.5 text-[12.5px] leading-[1.5]">{a.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Label>Path to a complete product</Label>
          <div className="grid grid-cols-3 gap-3">
            {pathToComplete.map((s, i) => (
              <div
                key={i}
                className="border-bp-border-soft bg-bp-tint flex gap-3 rounded-xl border px-4 py-[15px]"
              >
                <div
                  style={NUM}
                  className="bg-bp-forest text-bp-mint flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold"
                >
                  {i + 1}
                </div>
                <span className="text-bp-body text-[12.5px] leading-[1.55]">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
