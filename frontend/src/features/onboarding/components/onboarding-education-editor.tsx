"use client";

import { GraduationCap, Plus, Trash } from "@phosphor-icons/react";
import {
  EDUCATION_LEVELS,
  createBlankEducation,
  getDegreeOptions,
  type FounderEducation,
} from "@/features/founder-dashboard/profile-utils";
import { FieldLabel } from "./onboarding-helpers";

export function EducationEditor({
  educations,
  onChange,
  requiredLabels = false,
}: {
  educations: FounderEducation[];
  onChange: (next: FounderEducation[]) => void;
  requiredLabels?: boolean;
}) {
  const rows = educations.length ? educations : [];

  const update = (id: string, patch: Partial<FounderEducation>) => {
    onChange(
      rows.map((education) => {
        if (education.id !== id) return education;
        const next = { ...education, ...patch };
        if (patch.level !== undefined) {
          next.degree = "";
          next.customDegree = "";
        }
        if (patch.degree && patch.degree !== "Other") next.customDegree = "";
        return next;
      })
    );
  };

  const fieldStyleClass = "bg-[#f5f7f5] border border-[#dde5e0] text-[#1a2e26]";

  return (
    <div className="flex flex-col gap-3">
      {rows.map((education, index) => {
        const degreeOptions = getDegreeOptions(education.level);
        return (
          <div
            key={education.id}
            className="rounded-xl border bg-white p-3.5 border-[#dde5e0]"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[12px] font-bold text-[#1a2e26]">
                <GraduationCap size={14} weight="bold" className="text-[#428475]" />
                Education {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onChange(rows.filter((item) => item.id !== education.id))}
                className="rounded-lg p-1.5 transition hover:bg-red-50 text-[#c0392b]"
                aria-label="Remove education"
              >
                <Trash size={14} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <FieldLabel required={requiredLabels}>Education level</FieldLabel>
                <select
                  value={education.level}
                  onChange={(event) => update(education.id, { level: event.target.value })}
                  className={`h-10 w-full rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#89d7b7]/25 ${fieldStyleClass}`}
                >
                  <option value="">Select level</option>
                  {EDUCATION_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <FieldLabel required={requiredLabels}>Degree / program</FieldLabel>
                <select
                  value={education.degree}
                  onChange={(event) => update(education.id, { degree: event.target.value })}
                  disabled={!education.level}
                  className={`h-10 w-full rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#89d7b7]/25 disabled:cursor-not-allowed disabled:text-[#1a2e26]/35 ${fieldStyleClass}`}
                >
                  <option value="">
                    {education.level ? "Select degree" : "Select level first"}
                  </option>
                  {degreeOptions.map((degree) => (
                    <option key={degree} value={degree}>
                      {degree}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div
              className={`mt-3 grid gap-3 ${education.degree === "Other" ? "sm:grid-cols-2" : ""}`}
            >
              {education.degree === "Other" && (
                <input
                  value={education.customDegree ?? ""}
                  onChange={(event) => update(education.id, { customDegree: event.target.value })}
                  placeholder="Write degree name"
                  className={`h-10 rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#89d7b7]/25 ${fieldStyleClass}`}
                />
              )}
              <input
                value={education.school ?? ""}
                onChange={(event) => update(education.id, { school: event.target.value })}
                placeholder="School / university"
                className={`h-10 rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#89d7b7]/25 ${fieldStyleClass}`}
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...rows, createBlankEducation()])}
        className="flex h-10 items-center justify-center gap-2 rounded-xl border bg-white text-[12px] font-bold transition hover:bg-[#f8faf8] border-[#dbe7e0] text-[#428475]"
      >
        <Plus size={14} weight="bold" />
        Add education
      </button>
    </div>
  );
}
