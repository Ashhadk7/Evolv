"use client";

import { motion } from "framer-motion";
import { Bug, X } from "@phosphor-icons/react";
import { Label } from "@/components/shared/label";
import type { BlueprintContent, ProjectIssue } from "@/features/blueprints/blueprint-content";

export function IssueModal({
  phases,
  draft,
  onChange,
  onSubmit,
  onClose,
}: {
  phases: BlueprintContent["phases"];
  draft: {
    title: string;
    description: string;
    priority: ProjectIssue["priority"];
    phaseIndex: number | null;
  };
  onChange: (d: typeof draft) => void;
  onSubmit: () => void;
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
        className="bg-bp-card border border-bp-border rounded-2xl shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)] p-[26px_26px_22px] w-[min(480px,100%)] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Bug size={17} weight="duotone" className="text-bp-red" />
            <span className="text-bp-ink text-[16px] font-extrabold">
              Raise an issue
            </span>
          </div>
          <button
            onClick={onClose}
            className="bg-bp-tint w-[30px] h-[30px] flex items-center justify-center rounded-lg border border-bp-border-soft cursor-pointer"
          >
            <X size={13} className="text-bp-muted" />
          </button>
        </div>

        <Label>Title</Label>
        <input
          value={draft.title}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
          placeholder="e.g. Dashboard chart doesn't update on filter change"
          className="text-bp-ink w-full text-[13px] p-[10px_12px] rounded-lg border border-bp-border outline-none mb-3.5 font-inherit"
        />
        <Label>What needs to change</Label>
        <textarea
          value={draft.description}
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
          placeholder="Describe the fix the developer needs to make…"
          className="text-bp-ink w-full min-h-[80px] text-[13px] p-[10px_12px] rounded-lg border border-bp-border outline-none mb-3.5 font-inherit resize-y"
        />
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <Label>Priority</Label>
            <select
              value={draft.priority}
              onChange={(e) =>
                onChange({ ...draft, priority: e.target.value as ProjectIssue["priority"] })
              }
              className="text-bp-ink bg-bp-card w-full text-[13px] p-[9px_10px] rounded-lg border border-bp-border outline-none font-inherit"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <Label>Phase (optional)</Label>
            <select
              value={draft.phaseIndex === null ? "" : draft.phaseIndex}
              onChange={(e) =>
                onChange({
                  ...draft,
                  phaseIndex: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className="text-bp-ink bg-bp-card w-full text-[13px] p-[9px_10px] rounded-lg border border-bp-border outline-none font-inherit"
            >
              <option value="">General</option>
              {phases.map((p, i) => (
                <option key={p.name} value={i}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={!draft.title.trim()}
          className="bp-gradient-btn w-full text-[13.5px] font-bold p-[11px] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Raise issue
        </button>
      </motion.div>
    </motion.div>
  );
}
