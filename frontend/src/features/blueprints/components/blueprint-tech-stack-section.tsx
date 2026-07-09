"use client";

import { motion } from "framer-motion";
import { Cube, PencilSimple } from "@phosphor-icons/react";
import type {
  StackCat,
  StackLayerKey,
  TechStackModel,
} from "@/features/blueprints/blueprint-content";
import { cardStyle } from "@/components/shared/card-style";
import { Label } from "@/components/shared/label";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";
import { ArchitectureDiagram } from "./architecture-diagram";
import { TechStackPill } from "./tech-stack-pill";

interface ArchitectureModel {
  nodes: { id: string; label: string }[];
  edges: { from: string; to: string }[];
}

export function BlueprintTechStackSection({
  editing,
  draftTechStack,
  architecture,
  stack,
  onToggleEditing,
  onChangeLayer,
}: {
  editing: boolean;
  draftTechStack: TechStackModel;
  architecture: ArchitectureModel;
  stack: StackCat[];
  onToggleEditing: () => void;
  onChangeLayer: (key: StackLayerKey, value: string) => void;
}) {
  return (
    <Reveal>
      <SectionHead
        icon={<Cube size={18} weight="duotone" className="text-bp-teal" />}
        kicker="Engineering"
        title="Recommended Tech Stack & Architecture"
        desc="A complete, opinionated stack - editable where you know better than the AI, plus the system diagram it produces."
        right={
          <button
            onClick={onToggleEditing}
            className={`bp-icon-btn flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[11px] border ${
              editing ? "border-bp-forest bg-bp-forest" : "border-bp-border bg-bp-card"
            }`}
            title="Edit tech stack"
          >
            <PencilSimple
              size={16}
              weight="bold"
              className={editing ? "text-bp-mint" : "text-bp-teal"}
            />
          </button>
        }
      />
      <div style={cardStyle({ padding: "20px 24px", marginBottom: 18 })}>
        <div className="flex items-center justify-between">
          <Label>Core choices{editing ? " - click a layer to change it" : ""}</Label>
        </div>
        <div className="mt-1 flex flex-wrap items-start gap-2.5">
          <TechStackPill
            label="Frontend"
            layer={draftTechStack.frontend}
            editing={editing}
            onChange={(value) => onChangeLayer("frontend", value)}
          />
          <TechStackPill
            label="Backend"
            layer={draftTechStack.backend}
            editing={editing}
            onChange={(value) => onChangeLayer("backend", value)}
          />
          <TechStackPill
            label="Database"
            layer={draftTechStack.database}
            editing={editing}
            onChange={(value) => onChangeLayer("database", value)}
          />
          <TechStackPill
            label="Vector DB"
            layer={draftTechStack.vectorDb}
            editing={editing}
            onChange={(value) => onChangeLayer("vectorDb", value)}
          />
          <TechStackPill
            label="AI Provider"
            layer={draftTechStack.aiProvider}
            editing={editing}
            onChange={(value) => onChangeLayer("aiProvider", value)}
          />
          <TechStackPill
            label="Hosting"
            layer={draftTechStack.hosting}
            editing={editing}
            onChange={(value) => onChangeLayer("hosting", value)}
          />
        </div>
      </div>
      <div style={cardStyle({ padding: "20px 24px", marginBottom: 18 })}>
        <Label>System architecture</Label>
        <div className="mt-2 flex justify-center">
          <ArchitectureDiagram nodes={architecture.nodes} edges={architecture.edges} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-[18px]">
        {stack.map((category) => (
          <motion.div
            key={category.name}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={cardStyle({ padding: "22px 24px" })}
          >
            <div className="mb-1 flex items-center gap-[11px]">
              <div className="border-bp-border-soft bg-bp-tint flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border">
                {category.icon}
              </div>
              <div>
                <div className="text-bp-ink text-[14.5px] font-extrabold">{category.name}</div>
                <div className="font-mono-app text-bp-teal mt-px text-[11px]">
                  {category.primary}
                </div>
              </div>
            </div>
            <div className="mt-3.5 flex flex-col">
              {category.rows.map((row, index) => (
                <div
                  key={row.k}
                  className={`flex justify-between gap-3 py-2.5 ${
                    index === 0 ? "border-t-0" : "border-bp-border-soft border-t"
                  }`}
                >
                  <span className="font-mono-app text-bp-label shrink-0 text-[11.5px]">
                    {row.k}
                  </span>
                  <span className="text-bp-ink text-right text-[12.5px] font-semibold">
                    {row.v}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}
