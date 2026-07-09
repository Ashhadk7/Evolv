"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Lightbulb, ShieldCheck, User, UsersThree, Wallet } from "@phosphor-icons/react";
import type { Persona } from "@/features/blueprints/blueprint-content";
import { cardStyle } from "@/components/shared/card-style";
import { Chip } from "@/components/shared/chip";
import { Label } from "@/components/shared/label";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";

interface IdeaCard {
  icon: ReactNode;
  label: string;
  text: string;
}

function personaSegment(segment: Persona["segment"]): {
  icon: ReactNode;
  tone: "mint" | "amber" | "neutral";
} {
  if (segment === "Primary user") {
    return { icon: <User size={18} weight="duotone" className="text-bp-teal" />, tone: "mint" };
  }

  if (segment === "Economic buyer") {
    return {
      icon: <Wallet size={18} weight="duotone" className="text-bp-amber" />,
      tone: "amber",
    };
  }

  return {
    icon: <ShieldCheck size={18} weight="duotone" className="text-bp-muted" />,
    tone: "neutral",
  };
}

export function BlueprintIdeaSection({ infoGrid }: { infoGrid: IdeaCard[] }) {
  return (
    <Reveal>
      <SectionHead
        icon={<Lightbulb size={18} weight="duotone" className="text-bp-amber" />}
        kicker="Concept"
        title="The Idea"
        desc="The product narrative - what it is, who it serves, and how it makes money."
      />
      <div className="grid grid-cols-2 gap-[18px]">
        {infoGrid.map((card) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={cardStyle({ padding: "22px 24px" })}
          >
            <div className="mb-2.5 flex items-center gap-2.5">
              <div className="bg-bp-tint flex h-7 w-7 items-center justify-center rounded-[9px]">
                {card.icon}
              </div>
              <span className="font-mono-app text-bp-label text-[10.5px] font-bold tracking-[0.1em] uppercase">
                {card.label}
              </span>
            </div>
            <p className="text-bp-body m-0 text-[13.5px] leading-[1.65]">{card.text}</p>
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}

export function BlueprintPersonasSection({ personas }: { personas: Persona[] }) {
  return (
    <Reveal>
      <SectionHead
        icon={<UsersThree size={18} weight="duotone" className="text-bp-teal" />}
        kicker="Audience"
        title="Target Users & Personas"
        desc="The audience segments this idea is built for - who they are, what they need, and what's holding them back today."
      />
      <div className="grid grid-cols-3 gap-[18px]">
        {personas.map((persona) => {
          const segment = personaSegment(persona.segment);
          return (
            <motion.div
              key={persona.name}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              style={cardStyle({ padding: "24px 24px" })}
            >
              <div className="mb-3.5 flex items-center justify-between">
                <div className="border-bp-border-soft bg-bp-tint flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border">
                  {segment.icon}
                </div>
                <Chip tone={segment.tone}>{persona.segment}</Chip>
              </div>
              <div className="text-bp-ink text-[15px] font-extrabold tracking-[-0.01em]">
                {persona.name}
              </div>
              <p className="text-bp-muted mt-1.5 mb-4 text-[12.5px] leading-[1.55]">
                {persona.about}
              </p>
              <div className="mb-3">
                <Label>What they need</Label>
                <p className="text-bp-body m-0 text-[12.5px] leading-[1.55]">{persona.goals}</p>
              </div>
              <div>
                <Label>What&apos;s stopping them today</Label>
                <p className="text-bp-body m-0 text-[12.5px] leading-[1.55]">{persona.pains}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Reveal>
  );
}
