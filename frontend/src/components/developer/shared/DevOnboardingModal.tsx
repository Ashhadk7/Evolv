"use client";

import { useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  GithubLogo,
  GraduationCap,
  LinkedinLogo,
  Plus,
  Trash,
  UploadSimple,
  X,
} from "@phosphor-icons/react";
import {
  EDUCATION_LEVELS,
  createBlankEducation,
  formatFounderEducations,
  getDegreeOptions,
  type FounderEducation,
} from "@/components/founder/profileUtils";
import {
  getDeveloperEducations,
  getMissingDeveloperProfileFields,
  normalizeDeveloperProfileForSave,
  createBlankDeveloperSkill,
  getDeveloperSkillEntries,
  type DeveloperProfile,
  type DeveloperSkillEntry,
} from "@/components/developer/profileUtils";

const SKILL_KINDS = ["Skill", "Tech stack", "Framework", "Tool"];
const SKILL_EXPERIENCE = ["Learning", "< 1 year", "1-2 years", "3-5 years", "5+ years"];
const FIELD_STYLE: CSSProperties = {
  background: "#f5f7f5",
  border: "1px solid #dde5e0",
  color: "#1a2e26",
};

interface Props {
  initialProfile?: DeveloperProfile;
  onComplete: (profile?: DeveloperProfile) => void;
  onSkip?: () => void;
  userName?: string;
}

function FieldLabel({ children, required = false }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-[11px] font-semibold" style={{ color: "#6b8e7e" }}>
      {children}
      {required && <span className="ml-1 align-super text-[10px] text-red-500">*</span>}
    </label>
  );
}

function getInitials(profile: DeveloperProfile) {
  return `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() || "D";
}

function SkillFlowEditor({
  entries,
  onChange,
}: {
  entries: DeveloperSkillEntry[];
  onChange: (next: DeveloperSkillEntry[]) => void;
}) {
  const rows = entries.length ? entries : [];
  const update = (id: string, patch: Partial<DeveloperSkillEntry>) =>
    onChange(rows.map((entry) => entry.id === id ? { ...entry, ...patch } : entry));

  return (
    <div className="flex flex-col gap-3">
      <FieldLabel required>Skills, tech stack, and frameworks</FieldLabel>
      {rows.map((entry, index) => (
        <div key={entry.id} className="rounded-xl border bg-white p-3.5" style={{ borderColor: "#dde5e0" , padding:15}}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[12px] font-bold" style={{ color: "#1a2e26" }}>Profile skill {index + 1}</span>
            <button type="button" onClick={() => onChange(rows.filter((item) => item.id !== entry.id))} className="rounded-lg p-1.5 transition hover:bg-red-50" style={{ color: "#c0392b" }} aria-label="Remove skill">
              <Trash size={14} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-[0.9fr_1.2fr_0.9fr]">
            <select value={entry.kind} onChange={(event) => update(entry.id, { kind: event.target.value })} className="h-10 rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#89d7b7]/25" style={FIELD_STYLE}>
              {SKILL_KINDS.map((kind) => <option key={kind}>{kind}</option>)}
            </select>
            <input value={entry.name} onChange={(event) => update(entry.id, { name: event.target.value })} placeholder="React, Figma, Laravel..." className="h-10 rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#89d7b7]/25" style={FIELD_STYLE} />
            <select value={entry.experience} onChange={(event) => update(entry.id, { experience: event.target.value })} className="h-10 rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#89d7b7]/25" style={FIELD_STYLE}>
              <option value="">Experience</option>
              {SKILL_EXPERIENCE.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...rows, createBlankDeveloperSkill()])} className="flex h-10 items-center justify-center gap-2 rounded-xl border bg-white text-[12px] font-bold transition hover:bg-[#f8faf8]" style={{ borderColor: "#dbe7e0", color: "#428475" }}>
        <Plus size={14} weight="bold" />
        Add skill / stack / framework
      </button>
    </div>
  );
}

function EducationEditor({
  educations,
  onChange,
}: {
  educations: FounderEducation[];
  onChange: (next: FounderEducation[]) => void;
}) {
  const rows = educations.length ? educations : [];

  const update = (id: string, patch: Partial<FounderEducation>) => {
    onChange(rows.map((education) => {
      if (education.id !== id) return education;
      const next = { ...education, ...patch };
      if (patch.level !== undefined) {
        next.degree = "";
        next.customDegree = "";
      }
      if (patch.degree && patch.degree !== "Other") next.customDegree = "";
      return next;
    }));
  };

  return (
    <div className="flex flex-col gap-3">
      {rows.map((education, index) => {
        const degreeOptions = getDegreeOptions(education.level);
        return (
          <div key={education.id} className="rounded-xl border bg-white p-3.5" style={{ borderColor: "#dde5e0" , padding:15}}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[12px] font-bold" style={{ color: "#1a2e26" }}>
                <GraduationCap size={14} weight="bold" style={{ color: "#428475" }} />
                Education {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onChange(rows.filter((item) => item.id !== education.id))}
                className="rounded-lg p-1.5 transition hover:bg-red-50"
                aria-label="Remove education"
                style={{ color: "#c0392b" }}
              >
                <Trash size={14} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <FieldLabel required>Education level</FieldLabel>
                <select
                  value={education.level}
                  onChange={(event) => update(education.id, { level: event.target.value })}
                  className="h-10 w-full rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#89d7b7]/25"
                  style={FIELD_STYLE}
                >
                  <option value="">Select level</option>
                  {EDUCATION_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <FieldLabel required>Degree / program</FieldLabel>
                <select
                  value={education.degree}
                  onChange={(event) => update(education.id, { degree: event.target.value })}
                  disabled={!education.level}
                  className="h-10 w-full rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#89d7b7]/25 disabled:cursor-not-allowed disabled:text-[#1a2e26]/35"
                  style={FIELD_STYLE}
                >
                  <option value="">{education.level ? "Select degree" : "Select level first"}</option>
                  {degreeOptions.map((degree) => (
                    <option key={degree} value={degree}>{degree}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className={`mt-3 grid gap-3 ${education.degree === "Other" ? "sm:grid-cols-2" : ""}`}>
              {education.degree === "Other" && (
                <input
                  value={education.customDegree ?? ""}
                  onChange={(event) => update(education.id, { customDegree: event.target.value })}
                  placeholder="Write degree name"
                  className="h-10 rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#89d7b7]/25"
                  style={FIELD_STYLE}
                />
              )}
              <input
                value={education.school ?? ""}
                onChange={(event) => update(education.id, { school: event.target.value })}
                placeholder="School / university"
                className="h-10 rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#89d7b7]/25"
                style={FIELD_STYLE}
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...rows, createBlankEducation()])}
        className="flex h-10 items-center justify-center gap-2 rounded-xl border bg-white text-[12px] font-bold transition hover:bg-[#f8faf8]"
        style={{ borderColor: "#dbe7e0", color: "#428475" }}
      >
        <Plus size={14} weight="bold" />
        Add education
      </button>
    </div>
  );
}

function persistDeveloperProfile(profile: DeveloperProfile) {
  const normalized = normalizeDeveloperProfileForSave(profile);
  try {
    const raw = localStorage.getItem("evolv_user");
    const existing = raw ? JSON.parse(raw) : {};
    localStorage.setItem("evolv_user", JSON.stringify({ ...existing, ...normalized }));
  } catch { /* ignore */ }
  return normalized;
}

export const DevOnboardingModal = ({ initialProfile, onComplete, onSkip, userName = "" }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<DeveloperProfile>(() => {
    const nameParts = userName.split(" ").filter(Boolean);
    return {
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      bio: "",
      skillEntries: [],
      techStack: [],
      github: "",
      linkedin: "",
      educations: [],
      ...initialProfile,
    };
  });

  const fullName = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "Developer";
  const initials = getInitials(profile);
  const educations = useMemo(() => getDeveloperEducations(profile), [profile]);
  const skillEntries = useMemo(() => getDeveloperSkillEntries(profile), [profile]);
  const baseInput = "w-full rounded-lg px-4 py-2.5 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/25";

  const set = (key: keyof DeveloperProfile, value: string) =>
    setProfile((current) => ({ ...current, [key]: value }));

  const updateSkillEntries = (next: DeveloperSkillEntry[]) =>
    setProfile((current) => ({ ...current, skillEntries: next, techStack: next.map((entry) => entry.name).filter(Boolean) }));

  const updateEducations = (next: FounderEducation[]) => {
    setProfile((current) => ({
      ...current,
      educations: next,
      education: formatFounderEducations(next),
    }));
  };

  const handlePhotoUpload = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfile((current) => ({ ...current, avatarUrl: reader.result as string, photo: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSkip = () => {
    try {
      const raw = localStorage.getItem("evolv_user");
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem("evolv_user", JSON.stringify({ ...existing, firstTime: false, profileComplete: false }));
    } catch { /* ignore */ }
    if (onSkip) onSkip();
    else onComplete();
  };

  const handleComplete = () => {
    const normalized = normalizeDeveloperProfileForSave(profile);
    const missing = getMissingDeveloperProfileFields(normalized);
    if (missing.length) {
      setError(`Please fill ${missing.join(", ")} before using applications, messages, or network actions.`);
      return;
    }

    setError("");
    const savedProfile = persistDeveloperProfile(normalized);
    onComplete(savedProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(15,28,24,0.62)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="w-full overflow-hidden bg-white"
        style={{ maxWidth: 620, maxHeight: "90vh", border: "1px solid #dfe9e3", borderRadius: 16, display: "flex", flexDirection: "column" }}
      >
        <div className="px-7 pt-6 pb-5" style={{ borderBottom: "1px solid #eaf0eb" }}>
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex gap-1.5">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{ width: step >= item ? 30 : 14, background: step >= item ? "#1a312c" : "#dde5e0" }}
                  />
                ))}
              </div>
              <h2 className="text-[1.15rem] font-bold" style={{ color: "#1a2e26" }}>
                Complete developer profile
              </h2>
              <p className="mt-1 text-[12px]" style={{ color: "#7a9e8e" }}>
                Step {step} of 3
              </p>
            </div>
            <button type="button" onClick={handleSkip} className="rounded-lg p-1.5 transition hover:bg-[#f5f7f5]" aria-label="Close setup">
              <X size={16} style={{ color: "#7a9e8e" }} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-5">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="identity"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col gap-4"
              >
                <div className="flex justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full transition hover:opacity-90"
                      style={{ background: "#f0f5f2", border: "2px dashed #89d7b7", color: "#1a312c" }}
                      aria-label="Upload profile image"
                    >
                      {profile.avatarUrl || profile.photo ? (
                        <img src={profile.avatarUrl || profile.photo} alt={`${fullName} profile`} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[1.2rem] font-extrabold">{initials}</span>
                      )}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handlePhotoUpload(event.target.files?.[0])} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: "#428475" }}>
                      <UploadSimple size={13} weight="bold" />
                      Upload photo
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel>First name</FieldLabel>
                    <input value={profile.firstName ?? ""} onChange={(event) => set("firstName", event.target.value)} className={baseInput} style={FIELD_STYLE} placeholder="Sara" />
                  </div>
                  <div>
                    <FieldLabel>Last name</FieldLabel>
                    <input value={profile.lastName ?? ""} onChange={(event) => set("lastName", event.target.value)} className={baseInput} style={FIELD_STYLE} placeholder="Ahmed" />
                  </div>
                </div>

                <div>
                  <FieldLabel required>Professional role</FieldLabel>
                  <input value={profile.jobTitle ?? profile.role ?? ""} onChange={(event) => set("jobTitle", event.target.value)} className={baseInput} style={FIELD_STYLE} placeholder="Full Stack Developer" />
                </div>

                <div>
                  <FieldLabel>Professional summary</FieldLabel>
                  <textarea
                    value={profile.bio ?? ""}
                    onChange={(event) => set("bio", event.target.value)}
                    className={`${baseInput} resize-none`}
                    style={{ ...FIELD_STYLE, minHeight: 92 }}
                    placeholder="Summarize what you build, your strongest stack, and the startup environments you prefer."
                  />
                </div>
              </motion.div>
            ) : step === 2 ? (
              <motion.div
                key="skills"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col gap-4"
              >
                <SkillFlowEditor entries={skillEntries} onChange={updateSkillEntries} />
                <EducationEditor educations={educations} onChange={updateEducations} />
              </motion.div>
            ) : (
              <motion.div
                key="background"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col gap-4"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel required>GitHub</FieldLabel>
                    <div className="relative">
                      <GithubLogo size={15} weight="bold" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#428475" }} />
                      <input value={profile.github ?? ""} onChange={(event) => set("github", event.target.value)} className={baseInput} style={{ ...FIELD_STYLE, paddingLeft: 42 }} placeholder="https://github.com/yourname" />
                    </div>
                  </div>
                  <div>
                    <FieldLabel required>LinkedIn</FieldLabel>
                    <div className="relative">
                      <LinkedinLogo size={15} weight="bold" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#428475" }} />
                      <input value={profile.linkedin ?? profile.linkedIn ?? ""} onChange={(event) => set("linkedin", event.target.value)} className={baseInput} style={{ ...FIELD_STYLE, paddingLeft: 42 }} placeholder="https://linkedin.com/in/yourname" />
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel>Portfolio link</FieldLabel>
                  <input value={profile.portfolioLink ?? ""} onChange={(event) => set("portfolioLink", event.target.value)} className={baseInput} style={FIELD_STYLE} placeholder="https://yourportfolio.com" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[12px] font-medium text-red-700"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between px-7 py-4" style={{ borderTop: "1px solid #eaf0eb" }}>
          <button type="button" onClick={handleSkip} className="text-[13px] font-semibold transition hover:underline" style={{ color: "#7a9e8e" }}>
            Skip for now
          </button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep((current) => current - 1);
                }}
                className="flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition hover:bg-[#e8f0eb]"
                style={{ background: "#f0f5f2", color: "#1a2e26" }}
              >
                <ArrowLeft size={14} weight="bold" />
                Back
              </button>
            )}
            <motion.button
              type="button"
              onClick={() => {
                if (step < 3) {
                  setError("");
                  setStep((current) => current + 1);
                  return;
                }
                handleComplete();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 24 }}
              className="flex h-10 items-center gap-2 rounded-xl px-5 text-[13px] font-bold"
              style={{ background: "#1a312c", color: "#89d7b7" }}
            >
              {step < 3 ? "Next" : "Complete profile"}
              {step < 3 ? <ArrowRight size={14} weight="bold" /> : <CheckCircle size={14} weight="bold" />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
