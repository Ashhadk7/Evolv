"use client";

import { ShieldCheck } from "@phosphor-icons/react";
import { cardStyle } from "@/components/shared/card-style";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";
import { Chip } from "@/components/shared/chip";
import { sevTone } from "./blueprint-detail-data";

export function RisksSection({
  riskRows,
}: {
  riskRows: { risk: string; sev: string; mit: string }[];
}) {
  return (
    <Reveal>
      <div style={cardStyle({ padding: "28px 30px" })}>
        <SectionHead
          icon={<ShieldCheck size={18} weight="duotone" className="text-bp-teal" />}
          kicker="Risk"
          title="Risks & Mitigations"
        />
        <div className="border-bp-border-soft overflow-hidden rounded-xl border">
          <div className="font-mono-app text-bp-label bg-bp-tint grid grid-cols-[1.4fr_0.5fr_1.8fr] gap-2.5 px-[18px] py-2.5 text-[10px] font-bold tracking-[0.08em] uppercase">
            <span>Risk</span>
            <span>Severity</span>
            <span>Mitigation</span>
          </div>
          {riskRows.map((r, i) => (
            <div
              key={i}
              className="border-bp-border-soft grid grid-cols-[1.4fr_0.5fr_1.8fr] items-start gap-2.5 border-t px-[18px] py-3.5 text-[13px]"
            >
              <span className="text-bp-ink leading-[1.45] font-semibold">{r.risk}</span>
              <span>
                <Chip tone={sevTone(r.sev)}>{r.sev}</Chip>
              </span>
              <span className="text-bp-muted leading-[1.5]">{r.mit}</span>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
