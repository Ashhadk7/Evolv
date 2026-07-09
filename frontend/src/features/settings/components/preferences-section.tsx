"use client";

import { useState } from "react";
import { Check, SlidersHorizontal } from "@phosphor-icons/react";
import {
  MID,
  TEXT_BODY,
  TEXT_MUTED,
  BORDER,
  FIELD_BG,
} from "@/features/settings/lib/settings-theme";
import { Toggle } from "./toggle";

export type FounderPrefs = {
  blueprintVisibility: string;
  founderStage: string;
  matchPriority: string;
  developerRequests: boolean;
  investorIntros: boolean;
  weeklyDigest: boolean;
};

export function PreferencesSection() {
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState<FounderPrefs>({
    blueprintVisibility: "Private by default",
    founderStage: "Idea / MVP",
    matchPriority: "Technical cofounder",
    developerRequests: true,
    investorIntros: true,
    weeklyDigest: true,
  });

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={16} weight="bold" style={{ color: MID }} />
          <h4 className="text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>
            Founder Preferences
          </h4>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>
              Blueprint visibility
            </span>
            <select
              value={prefs.blueprintVisibility}
              onChange={(event) =>
                setPrefs((current) => ({ ...current, blueprintVisibility: event.target.value }))
              }
              className="h-10 w-full rounded-lg px-3 text-[13px] transition outline-none focus:ring-2 focus:ring-[#89d7b7]/30"
              style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
            >
              <option>Private by default</option>
              <option>Ask before publishing</option>
              <option>Public after approval</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>
              Startup stage
            </span>
            <select
              value={prefs.founderStage}
              onChange={(event) =>
                setPrefs((current) => ({ ...current, founderStage: event.target.value }))
              }
              className="h-10 w-full rounded-lg px-3 text-[13px] transition outline-none focus:ring-2 focus:ring-[#89d7b7]/30"
              style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
            >
              <option>Idea / MVP</option>
              <option>Prototype</option>
              <option>Pre-seed</option>
              <option>Seed</option>
              <option>Scaling</option>
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>
              Match priority
            </span>
            <select
              value={prefs.matchPriority}
              onChange={(event) =>
                setPrefs((current) => ({ ...current, matchPriority: event.target.value }))
              }
              className="h-10 w-full rounded-lg px-3 text-[13px] transition outline-none focus:ring-2 focus:ring-[#89d7b7]/30"
              style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
            >
              <option>Technical cofounder</option>
              <option>MVP developer team</option>
              <option>Investor introductions</option>
              <option>Advisor network</option>
            </select>
          </label>
        </div>
      </section>

      <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
        <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>
          Discovery Controls
        </h4>
        <div className="flex flex-col gap-3">
          {[
            {
              key: "developerRequests" as const,
              label: "Developer interest requests",
              sub: "Allow matched developers to request a conversation.",
            },
            {
              key: "investorIntros" as const,
              label: "Investor introduction suggestions",
              sub: "Let Evolv surface relevant investor intros for public blueprints.",
            },
            {
              key: "weeklyDigest" as const,
              label: "Weekly founder digest",
              sub: "Receive weekly progress, match, and blueprint summaries.",
            },
          ].map(({ key, label, sub }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 rounded-lg px-3 py-3"
              style={{ background: "#f8faf8", border: "1px solid #edf1ee" }}
            >
              <div>
                <p className="text-[13px] font-bold" style={{ color: TEXT_BODY }}>
                  {label}
                </p>
                <p className="mt-1 text-[11px]" style={{ color: TEXT_MUTED }}>
                  {sub}
                </p>
              </div>
              <Toggle
                on={prefs[key]}
                onChange={() => setPrefs((current) => ({ ...current, [key]: !current[key] }))}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={save}
          className="bp-gradient-btn mt-5 flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-extrabold"
        >
          <Check size={15} weight="bold" />
          {saved ? "Saved" : "Save Preferences"}
        </button>
      </section>
    </div>
  );
}
