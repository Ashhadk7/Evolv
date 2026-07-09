"use client";

import { motion } from "framer-motion";
import { SearchableSkills } from "./searchable-skills";
import { StaticSelect } from "./static-select";
import { TextArea } from "@/features/auth/components/text-area";
import { TextInput } from "@/features/auth/components/text-input";
import { BRAND_INK, EDUCATION_LEVELS, SKILLS } from "./constants";
import { ProfileCompletionMeter } from "./profile-completion-meter";
import type { DeveloperSignupProfile } from "./types";

export function DeveloperProfileStep({
  developer,
  degreeOptions,
  profileCompleteness,
  onFieldChange,
  onSkillToggle,
}: {
  developer: DeveloperSignupProfile;
  degreeOptions: string[];
  profileCompleteness: number;
  onFieldChange: (field: Exclude<keyof DeveloperSignupProfile, "skills">, value: string) => void;
  onSkillToggle: (skill: string) => void;
}) {
  return (
    <motion.div
      key="developer"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="grid gap-5"
    >
      <ProfileCompletionMeter label="Profile strength" value={profileCompleteness} />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Professional role"
          value={developer.jobTitle}
          onChange={(value) => onFieldChange("jobTitle", value)}
          placeholder="Full Stack Developer"
        />
        <label className="block">
          <span
            className="mb-1.5 block text-[12px] font-semibold"
            style={{ color: "rgba(15,28,24,0.68)" }}
          >
            Experience
          </span>
          <select
            value={developer.experience}
            onChange={(event) => onFieldChange("experience", event.target.value)}
            className="h-11 w-full rounded-lg border bg-white px-4 text-[14px] outline-none focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
            style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}
          >
            <option value="">Select experience</option>
            {["< 1 year", "1-2 years", "3-5 years", "5-8 years", "8+ years"].map((experience) => (
              <option key={experience}>{experience}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StaticSelect
          label="Highest education"
          value={developer.educationLevel}
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
          value={developer.degreeName}
          onChange={(value) => {
            onFieldChange("degreeName", value);
            if (value !== "Other") onFieldChange("customDegreeName", "");
          }}
          placeholder={developer.educationLevel ? "Select degree" : "Select education first"}
          options={degreeOptions}
          disabled={!developer.educationLevel}
        />
      </div>

      {developer.degreeName === "Other" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Other degree"
            value={developer.customDegreeName}
            onChange={(value) => onFieldChange("customDegreeName", value)}
            placeholder="Write your degree name"
          />
        </div>
      )}

      <SearchableSkills skills={SKILLS} selected={developer.skills} onToggle={onSkillToggle} />
      <TextArea
        label="Professional summary"
        value={developer.bio}
        onChange={(value) => onFieldChange("bio", value)}
        placeholder="Summarize the products you build, your strongest stack, and the startup environments you prefer."
      />
      <div className="grid h-25 gap-4 sm:grid-cols-2">
        <TextInput
          label="GitHub"
          value={developer.github}
          onChange={(value) => onFieldChange("github", value)}
          placeholder="https://github.com/..."
        />
        <TextInput
          label="LinkedIn"
          value={developer.linkedIn}
          onChange={(value) => onFieldChange("linkedIn", value)}
          placeholder="https://linkedin.com/in/..."
        />
      </div>
    </motion.div>
  );
}
