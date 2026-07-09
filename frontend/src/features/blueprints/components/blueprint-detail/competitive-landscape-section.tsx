"use client";

import { motion } from "framer-motion";
import { Buildings, Trophy } from "@phosphor-icons/react";
import type { CompetitorRow, SimilarStartup } from "@/features/blueprints/blueprint-content";
import { cardStyle } from "@/components/shared/card-style";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";
import { Label } from "@/components/shared/label";

export function CompetitiveLandscapeSection({
  bpName,
  competitorRows,
  similarStartups,
}: {
  bpName: string;
  competitorRows: CompetitorRow[];
  similarStartups: SimilarStartup[];
}) {
  return (
    <Reveal>
      <div style={cardStyle({ padding: "28px 30px" })}>
        <SectionHead
          icon={<Trophy size={18} weight="duotone" className="text-bp-amber" />}
          kicker="Competition"
          title="Competitive Landscape"
          desc="Direct competitors show what buyers already pay for; comparable startups show the broader category proof and likely outcomes."
        />
        <div className="border-bp-border-soft overflow-hidden rounded-xl border">
          <div className="font-mono-app text-bp-label bg-bp-tint grid grid-cols-[1.1fr_1fr_1.35fr_1.35fr_1.35fr] gap-2.5 px-[18px] py-2.5 text-[10px] font-bold tracking-[0.08em] uppercase">
            <span>Player</span>
            <span>Pricing</span>
            <span>Why they win</span>
            <span>Where they fall short</span>
            <span>Opening for {bpName}</span>
          </div>
          {competitorRows.map((c, i) => (
            <div
              key={c.name + i}
              className="border-bp-border-soft text-bp-ink grid grid-cols-[1.1fr_1fr_1.35fr_1.35fr_1.35fr] items-start gap-2.5 border-t px-[18px] py-3.5 text-[12.5px]"
            >
              <span className="font-bold">{c.name}</span>
              <span className="text-bp-muted">{c.pricing}</span>
              <span className="text-bp-muted leading-[1.5]">{c.strengths.join("; ")}</span>
              <span className="text-bp-muted leading-[1.5]">{c.weaknesses.join("; ")}</span>
              <span className="text-bp-body leading-[1.5]">{c.gap}</span>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Label>Category proof</Label>
          <div
            className="grid gap-3.5"
            style={{ gridTemplateColumns: `repeat(${similarStartups.length}, 1fr)` }}
          >
            {similarStartups.map((s) => (
              <motion.div
                key={s.name}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="border-bp-border-soft bg-bp-tint rounded-xl border px-[18px] py-4"
              >
                <div className="mb-2 flex items-center gap-2.5">
                  <Buildings size={15} weight="duotone" className="text-bp-success shrink-0" />
                  <div className="text-bp-ink text-[13.5px] font-extrabold">{s.name}</div>
                </div>
                <p className="text-bp-body m-0 text-[12.2px] leading-[1.55]">{s.oneLiner}</p>
                <div className="border-bp-border-soft bg-bp-card mt-[11px] flex gap-2 rounded-[9px] border px-2.5 py-2.5">
                  <Trophy size={13} weight="fill" className="text-bp-success mt-px shrink-0" />
                  <span className="text-bp-muted text-[11.7px] leading-[1.45]">{s.outcome}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
