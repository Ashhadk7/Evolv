"use client";

import type { ReactNode } from "react";
import { CaretRight, Megaphone } from "@phosphor-icons/react";
import { cardStyle } from "@/components/shared/card-style";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";

export function GoToMarketSection({
  gtmChannels,
  gtmPhases,
}: {
  gtmChannels: { icon: ReactNode; title: string; text: string }[];
  gtmPhases: string[];
}) {
  return (
    <Reveal>
      <div style={cardStyle({ padding: "28px 30px" })}>
        <SectionHead
          icon={<Megaphone size={18} weight="duotone" className="text-bp-teal" />}
          kicker="Distribution"
          title="Go-to-Market"
          desc="How the first users are reached, and the sequence to get from beta to scale."
        />
        <div className="mb-5 grid grid-cols-4 gap-3.5">
          {gtmChannels.map((g) => (
            <div
              key={g.title}
              className="border-bp-border-soft bg-bp-tint rounded-2xl border px-[18px] py-[18px]"
            >
              <div className="border-bp-border-soft bg-bp-card mb-3 flex h-8 w-8 items-center justify-center rounded-[9px] border">
                {g.icon}
              </div>
              <div className="text-bp-ink mb-1.5 text-[13.5px] font-bold">{g.title}</div>
              <div className="text-bp-muted text-xs leading-[1.5]">{g.text}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {gtmPhases.map((p, i, arr) => (
            <span key={p} className="inline-flex items-center gap-2">
              <span className="border-bp-border-soft bg-bp-tint text-bp-ink inline-flex items-center gap-[7px] rounded-full border px-[13px] py-2 text-[12.5px] font-semibold">
                <span className="bg-bp-forest text-bp-mint inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-extrabold">
                  {i + 1}
                </span>
                {p}
              </span>
              {i < arr.length - 1 && <CaretRight size={14} className="text-bp-label" />}
            </span>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
