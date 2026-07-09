"use client";

import { motion } from "framer-motion";
import { ArrowRight, X } from "@phosphor-icons/react";
import { Kicker } from "@/components/shared/kicker";
import { Chip } from "@/components/shared/chip";
import type { Blueprint } from "@/features/blueprints/types";

export function StartProjectModal({
  blueprints,
  onPick,
  onClose,
}: {
  blueprints: Blueprint[];
  onPick: (bp: Blueprint) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-[#0f1c18]/45 backdrop-blur-[3px] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-bp-card border border-bp-border rounded-2xl shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)] p-[28px_28px_22px] w-[min(560px,100%)] max-h-[80vh] flex flex-col"
      >
        <div className="flex items-start justify-between mb-4.5">
          <div>
            <Kicker>New Project</Kicker>
            <h2 className="text-bp-ink text-[19px] font-extrabold">
              Select a blueprint to start building
            </h2>
            <p className="text-bp-muted text-[12.5px] mt-1.5 max-w-[420px]">
              Starting a project unpublishes this blueprint from public discovery and turns it into
              a live build you manage phase by phase.
            </p>
          </div>
          <button
            onClick={onClose}
            className="bp-icon-btn bg-bp-tint w-[34px] h-[34px] flex items-center justify-center rounded-lg border border-bp-border-soft cursor-pointer shrink-0"
          >
            <X size={15} className="text-bp-muted" />
          </button>
        </div>

        <div className="overflow-y-auto flex flex-col gap-2.5">
          {blueprints.length === 0 && (
            <div className="text-bp-muted bg-bp-tint px-[18px] py-[28px] text-center text-[13px] rounded-xl border border-bp-border-soft">
              All your blueprints are already projects — head to Workspace to draft a new idea
              first.
            </div>
          )}
          {blueprints.map((bp) => (
            <button
              key={bp.id}
              onClick={() => onPick(bp)}
              className="bg-bp-tint flex items-center gap-3.5 w-full text-left p-[13px_15px] rounded-xl border border-bp-border-soft cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-bp-ink text-[13.5px] font-bold">
                    {bp.name}
                  </span>
                  <Chip>{bp.industry}</Chip>
                </div>
                <div className="text-bp-muted text-[11.5px] mt-0.75 whitespace-nowrap overflow-hidden text-ellipsis">
                  {bp.ideaDesc}
                </div>
              </div>
              <span className="text-bp-success text-[13px] font-extrabold shrink-0">
                {bp.viability}
              </span>
              <ArrowRight size={14} className="text-bp-label flex-shrink-0" />
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
