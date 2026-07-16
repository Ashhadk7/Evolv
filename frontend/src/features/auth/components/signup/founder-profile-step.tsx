"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";
import { DomainSearch } from "@/features/auth/components/domain-search";
import { TextArea } from "@/features/auth/components/text-area";
import { TextInput } from "@/features/auth/components/text-input";
import { BRAND_DARK, BRAND_INK, BRAND_MINT, EDUCATION_LEVELS, PRIMARY_GOALS } from "./constants";
import { ProfileCompletionMeter } from "./profile-completion-meter";
import { StaticSelect } from "./static-select";
import type { FounderSignupProfile } from "./types";

export function FounderProfileStep({
  founder,
  degreeOptions,
  profileCompleteness,
  onFieldChange,
  onDomainToggle,
}: {
  founder: FounderSignupProfile;
  degreeOptions: string[];
  profileCompleteness: number;
  onFieldChange: (field: Exclude<keyof FounderSignupProfile, "domains">, value: string) => void;
  onDomainToggle: (domain: string) => void;
}) {
  return (
    <motion.div
      key="founder"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="grid gap-8"
    >
      <ProfileCompletionMeter label="Profile completion" value={profileCompleteness} />

      <div className="grid gap-5">
        <TextInput
          label="Founder headline"
          value={founder.headline}
          onChange={(value) => onFieldChange("headline", value)}
          placeholder="Building AI diagnostics for rural hospitals"
        />
        <TextArea
          label="Short bio"
          value={founder.bio}
          onChange={(value) => onFieldChange("bio", value)}
          placeholder="Tell developers who you are, what problem you're solving, and what kind of collaboration you're looking for."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StaticSelect
          label="Highest education"
          value={founder.educationLevel}
          onChange={(value) => {
            onFieldChange("educationLevel", value);
            onFieldChange("degreeName", "");
            onFieldChange("customDegreeName", "");
          }}
          placeholder="Select education level"
          options={EDUCATION_LEVELS}
        />
        <StaticSelect
          label="Degree / program"
          value={founder.degreeName}
          onChange={(value) => {
            onFieldChange("degreeName", value);
            if (value !== "Other") onFieldChange("customDegreeName", "");
          }}
          placeholder={founder.educationLevel ? "Select degree" : "Select education first"}
          options={degreeOptions}
          disabled={!founder.educationLevel}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {founder.degreeName === "Other" && (
          <TextInput
            label="Other degree"
            value={founder.customDegreeName}
            onChange={(value) => onFieldChange("customDegreeName", value)}
            placeholder="Write your degree name"
          />
        )}
        <TextInput
          label="LinkedIn (optional)"
          value={founder.linkedin}
          onChange={(value) => onFieldChange("linkedin", value)}
          placeholder="https://linkedin.com/in/..."
        />
      </div>

      <div
        className="rounded-xl border bg-white px-5 py-5"
        style={{ borderColor: "rgba(15,28,24,0.1)" }}
      >
        <DomainSearch selected={founder.domains} onToggle={onDomainToggle} />
      </div>

      <div>
        <p className="mb-1 text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>
          What&apos;s your primary goal on Evolv?
        </p>
        <p className="mb-3 text-[12px]" style={{ color: "rgba(15,28,24,0.4)" }}>
          Pick one - you can always change this later.
        </p>
        <div className="grid gap-2.5">
          {PRIMARY_GOALS.map((goal) => {
            const active = founder.primaryGoal === goal;
            return (
              <button
                key={goal}
                type="button"
                onClick={() => onFieldChange("primaryGoal", active ? "" : goal)}
                className="flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition"
                style={{
                  background: active ? BRAND_DARK : "#fff",
                  borderColor: active ? BRAND_DARK : "rgba(15,28,24,0.1)",
                  boxShadow: active ? "0 4px 16px rgba(26,49,44,0.2)" : "none",
                }}
              >
                <span
                  className="text-[13.5px] leading-snug font-semibold"
                  style={{ color: active ? BRAND_MINT : BRAND_INK }}
                >
                  {goal}
                </span>
                <span className="ml-4 shrink-0">
                  {active ? (
                    <CheckCircle size={18} weight="fill" style={{ color: BRAND_MINT }} />
                  ) : (
                    <span
                      className="block h-[18px] w-[18px] rounded-full border"
                      style={{ borderColor: "rgba(15,28,24,0.2)" }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
