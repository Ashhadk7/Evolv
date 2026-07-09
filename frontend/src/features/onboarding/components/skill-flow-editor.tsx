"use client";

import { Plus, Trash } from "@phosphor-icons/react";
import type { DeveloperSkillEntry } from "@/features/developer-dashboard/profile-utils";
import { createBlankDeveloperSkill } from "@/features/developer-dashboard/profile-utils";
import {
  SKILL_KINDS,
  SKILL_EXPERIENCE,
} from "@/features/onboarding/data/developer-onboarding-data";
import { FieldLabel } from "./onboarding-helpers";

export function SkillFlowEditor({
  entries,
  onChange,
}: {
  entries: DeveloperSkillEntry[];
  onChange: (next: DeveloperSkillEntry[]) => void;
}) {
  const rows = entries.length ? entries : [];
  const update = (id: string, patch: Partial<DeveloperSkillEntry>) =>
    onChange(rows.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));

  const fieldStyleClass = "bg-[#f5f7f5] border border-[#dde5e0] text-[#1a2e26]";

  return (
    <div className="flex flex-col gap-3">
      <FieldLabel required>Skills, tech stack, and frameworks</FieldLabel>
      {rows.map((entry, index) => (
        <div
          key={entry.id}
          className="rounded-xl border bg-white p-[15px] border-[#dde5e0]"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[12px] font-bold text-[#1a2e26]">
              Profile skill {index + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(rows.filter((item) => item.id !== entry.id))}
              className="rounded-lg p-1.5 transition hover:bg-red-50 text-[#c0392b]"
              aria-label="Remove skill"
            >
              <Trash size={14} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-[0.9fr_1.2fr_0.9fr]">
            <select
              value={entry.kind}
              onChange={(event) => update(entry.id, { kind: event.target.value })}
              className={`h-10 rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#89d7b7]/25 ${fieldStyleClass}`}
            >
              {SKILL_KINDS.map((kind) => (
                <option key={kind}>{kind}</option>
              ))}
            </select>
            <input
              value={entry.name}
              onChange={(event) => update(entry.id, { name: event.target.value })}
              placeholder="React, Figma, Laravel..."
              className={`h-10 rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#89d7b7]/25 ${fieldStyleClass}`}
            />
            <select
              value={entry.experience}
              onChange={(event) => update(entry.id, { experience: event.target.value })}
              className={`h-10 rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#89d7b7]/25 ${fieldStyleClass}`}
            >
              <option value="">Experience</option>
              {SKILL_EXPERIENCE.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, createBlankDeveloperSkill()])}
        className="flex h-10 items-center justify-center gap-2 rounded-xl border bg-white text-[12px] font-bold transition hover:bg-[#f8faf8] border-[#dbe7e0] text-[#428475]"
      >
        <Plus size={14} weight="bold" />
        Add skill / stack / framework
      </button>
    </div>
  );
}
