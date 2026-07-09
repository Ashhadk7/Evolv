"use client";

import { GraduationCap, Plus, Trash } from "@phosphor-icons/react";
import {
  EDUCATION_LEVELS,
  createBlankEducation,
  getDegreeOptions,
  type FounderEducation,
} from "@/features/founder-dashboard/profile-utils";
import {
  MID,
  TEXT_BODY,
  TEXT_MUTED,
  BORDER,
  FIELD_BG,
} from "@/features/settings/lib/settings-theme";

export function EducationEditor({
  educations,
  onChange,
}: {
  educations: FounderEducation[];
  onChange: (next: FounderEducation[]) => void;
}) {
  const update = (id: string, patch: Partial<FounderEducation>) => {
    onChange(
      educations.map((education) => {
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

  return (
    <div className="flex flex-col gap-3">
      {educations.map((education, index) => {
        const degreeOptions = getDegreeOptions(education.level);
        return (
          <div
            key={education.id}
            className="rounded-xl border bg-white p-4"
            style={{ borderColor: BORDER }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span
                className="inline-flex items-center gap-2 text-[12px] font-bold"
                style={{ color: TEXT_BODY }}
              >
                <GraduationCap size={14} weight="bold" style={{ color: MID }} />
                Education {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onChange(educations.filter((item) => item.id !== education.id))}
                className="rounded-lg p-1.5 transition hover:bg-red-50"
                aria-label="Remove education"
                style={{ color: "#c0392b" }}
              >
                <Trash size={14} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span
                  className="mb-1.5 block text-[11px] font-semibold"
                  style={{ color: TEXT_MUTED }}
                >
                  Education level
                </span>
                <select
                  value={education.level}
                  onChange={(event) => update(education.id, { level: event.target.value })}
                  className="h-10 w-full rounded-lg px-3 text-[13px] transition outline-none focus:ring-2 focus:ring-[#89d7b7]/30"
                  style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
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
                <span
                  className="mb-1.5 block text-[11px] font-semibold"
                  style={{ color: TEXT_MUTED }}
                >
                  Degree / program
                </span>
                <select
                  value={education.degree}
                  onChange={(event) => update(education.id, { degree: event.target.value })}
                  disabled={!education.level}
                  className="h-10 w-full rounded-lg px-3 text-[13px] transition outline-none focus:ring-2 focus:ring-[#89d7b7]/30 disabled:cursor-not-allowed disabled:text-[#1a2e26]/35"
                  style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
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
                  className="h-10 rounded-lg px-3 text-[13px] transition outline-none focus:ring-2 focus:ring-[#89d7b7]/30"
                  style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
                />
              )}
              <input
                value={education.school ?? ""}
                onChange={(event) => update(education.id, { school: event.target.value })}
                placeholder="School / university"
                className="h-10 rounded-lg px-3 text-[13px] transition outline-none focus:ring-2 focus:ring-[#89d7b7]/30"
                style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...educations, createBlankEducation()])}
        className="flex h-10 items-center justify-center gap-2 rounded-xl border bg-white text-[12px] font-bold transition hover:bg-[#f8faf8]"
        style={{ borderColor: BORDER, color: MID }}
      >
        <Plus size={14} weight="bold" />
        Add education
      </button>
    </div>
  );
}
