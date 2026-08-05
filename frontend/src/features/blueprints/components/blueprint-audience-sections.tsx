"use client";

import { type ReactNode, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CaretLeft,
  CaretRight,
  Lightbulb,
  ShieldCheck,
  User,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-[18px]">
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

function PersonaCard({
  persona,
  layout = "grid",
  framed = true,
}: {
  persona: Persona;
  layout?: "grid" | "carousel";
  framed?: boolean;
}) {
  const segment = personaSegment(persona.segment);
  const isCarousel = layout === "carousel";

  return (
    <motion.div
      whileHover={isCarousel ? undefined : { y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="min-w-0"
      style={
        framed
          ? cardStyle({ padding: isCarousel ? "24px" : "24px 24px" })
          : { padding: "22px 24px 24px" }
      }
    >
      <div
        className={isCarousel ? "grid gap-5 lg:grid-cols-[minmax(220px,0.68fr)_minmax(0,1fr)]" : ""}
      >
        <div
          className={
            isCarousel ? "border-bp-border-soft bg-bp-tint rounded-[18px] border px-5 py-5" : ""
          }
        >
          <div className="mb-3.5 flex items-center justify-between">
            <div
              className={`border-bp-border-soft flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border ${
                isCarousel ? "bg-bp-card" : "bg-bp-tint"
              }`}
            >
              {segment.icon}
            </div>
            <Chip tone={segment.tone}>{persona.segment}</Chip>
          </div>
          <div
            className={`text-bp-ink font-extrabold tracking-[-0.01em] ${
              isCarousel ? "text-[21px] leading-[1.12]" : "text-[15px]"
            }`}
          >
            {persona.name}
          </div>
          {persona.role ? (
            <div className="font-mono-app text-bp-label mt-1 text-[10.5px] font-bold tracking-[0.06em] uppercase">
              {persona.role}
            </div>
          ) : null}
          <p className="text-bp-muted mt-1.5 mb-0 text-[12.5px] leading-[1.55]">{persona.about}</p>
        </div>

        <div className={isCarousel ? "grid gap-3.5 sm:grid-cols-2" : "mt-4 flex flex-col gap-3"}>
          <div
            className={
              isCarousel ? "border-bp-border-soft rounded-[14px] border bg-[#fbfcfb] p-3.5" : ""
            }
          >
            <Label>What they need</Label>
            <p className="text-bp-body m-0 text-[12.5px] leading-[1.55]">{persona.goals}</p>
          </div>
          <div
            className={
              isCarousel ? "border-bp-border-soft rounded-[14px] border bg-[#fbfcfb] p-3.5" : ""
            }
          >
            <Label>What&apos;s stopping them today</Label>
            <p className="text-bp-body m-0 text-[12.5px] leading-[1.55]">{persona.pains}</p>
          </div>
          {persona.objections.length ? (
            <div
              className={
                isCarousel ? "border-bp-border-soft rounded-[14px] border bg-[#fbfcfb] p-3.5" : ""
              }
            >
              <Label>Why they hesitate</Label>
              <ul className="m-0 mt-1 flex list-none flex-col gap-1.5 p-0">
                {persona.objections.map((objection, i) => (
                  <li
                    key={i}
                    className="text-bp-body flex flex-wrap items-center gap-1.5 text-[12.5px] leading-[1.5]"
                  >
                    {objection.text}
                    {objection.basis === "assumption" ? (
                      <Chip tone="neutral">Assumption</Chip>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {persona.channels.length ? (
            <div
              className={
                isCarousel ? "border-bp-border-soft rounded-[14px] border bg-[#fbfcfb] p-3.5" : ""
              }
            >
              <Label>Where to reach them</Label>
              <div className="mt-2 grid gap-2">
                {persona.channels.map((channel, i) => (
                  <div
                    key={i}
                    className="border-bp-border-soft bg-bp-card text-bp-body flex items-start gap-2 rounded-[10px] border px-3 py-2 text-[12.5px] leading-[1.45]"
                  >
                    <span className="bg-bp-teal mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" />
                    <span>{channel}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {persona.successMetric ? (
            <div
              className={
                isCarousel
                  ? "border-bp-border-soft rounded-[14px] border bg-[#fbfcfb] p-3.5 sm:col-span-2"
                  : ""
              }
            >
              <Label>Success looks like</Label>
              <p className="text-bp-body m-0 text-[12.5px] leading-[1.55]">
                {persona.successMetric}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function PersonaCarousel({ personas }: { personas: Persona[] }) {
  const [position, setPosition] = useState({ index: 0, direction: 1 });
  const activePersona = personas[position.index];
  const hasMultiple = personas.length > 1;

  const goToPersona = (nextIndex: number) => {
    setPosition((current) => ({
      index: nextIndex,
      direction: nextIndex > current.index ? 1 : -1,
    }));
  };

  const goPrevious = () => {
    setPosition((current) => ({
      index: (current.index - 1 + personas.length) % personas.length,
      direction: -1,
    }));
  };

  const goNext = () => {
    setPosition((current) => ({
      index: (current.index + 1) % personas.length,
      direction: 1,
    }));
  };

  if (!activePersona) return null;

  return (
    <div className="border-bp-border bg-bp-card overflow-hidden rounded-[22px] border shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_18px_44px_-22px_rgba(19,36,29,0.18)]">
      <div className="border-bp-border-soft flex flex-wrap items-center justify-between gap-3 border-b bg-[#fbfcfb] px-4 py-3">
        <div className="flex min-w-[180px] flex-1 items-center gap-3">
          <div className="font-mono-app text-bp-label text-[10.5px] font-bold tracking-[0.1em] uppercase">
            Persona {position.index + 1} of {personas.length}
          </div>
          {hasMultiple ? (
            <div className="flex flex-1 items-center gap-1.5">
              {personas.map((persona, index) => (
                <button
                  key={`${persona.name}-${index}`}
                  type="button"
                  onClick={() => goToPersona(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === position.index ? "bg-bp-teal flex-[1.6]" : "bg-bp-border-soft flex-1"
                  }`}
                  aria-label={`Show persona ${index + 1}`}
                  aria-current={index === position.index ? "true" : undefined}
                />
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrevious}
            disabled={!hasMultiple}
            className="border-bp-border-soft bg-bp-card text-bp-ink hover:bg-bp-tint flex h-9 w-9 items-center justify-center rounded-[10px] border transition disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Show previous persona"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!hasMultiple}
            className="border-bp-border-soft bg-bp-card text-bp-ink hover:bg-bp-tint flex h-9 w-9 items-center justify-center rounded-[10px] border transition disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Show next persona"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      </div>

      <div className="relative min-h-[360px] overflow-hidden">
        <AnimatePresence initial={false} custom={position.direction} mode="wait">
          <motion.div
            key={`${activePersona.name}-${position.index}`}
            custom={position.direction}
            initial={{ opacity: 0, x: position.direction > 0 ? 42 : -42 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: position.direction > 0 ? -42 : 42 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <PersonaCard persona={activePersona} layout="carousel" framed={false} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function BlueprintPersonasSection({
  personas,
  display = "grid",
}: {
  personas: Persona[];
  display?: "grid" | "carousel";
}) {
  return (
    <Reveal>
      <SectionHead
        icon={<UsersThree size={18} weight="duotone" className="text-bp-teal" />}
        kicker="Audience"
        title="Target Users & Personas"
        desc="The audience segments this idea is built for - who they are, what they need, and what's holding them back today."
      />
      {display === "carousel" ? (
        <PersonaCarousel personas={personas} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-[18px]">
          {personas.map((persona) => (
            <PersonaCard key={persona.name} persona={persona} />
          ))}
        </div>
      )}
    </Reveal>
  );
}
