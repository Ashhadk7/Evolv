"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

export interface DeveloperProfile {
  firstName: string;
  lastName: string;
  jobTitle: string;
  location: string;
  experience: string;
  bio: string;
  techStack: string[];
  workType: string;
  openToOpportunities: boolean;
  linkedin: string;
  github: string;
  dob: string;
  gender: string;
  avatarUrl?: string;
  profileComplete?: boolean;
}

interface Props {
  initialProfile?: Partial<DeveloperProfile>;
  onComplete: (p: DeveloperProfile) => void;
  onSkip?: () => void;
  userName?: string;
}

const TECH_OPTIONS = [
  "React", "TypeScript", "JavaScript", "Python", "Node.js",
  "FastAPI", "Django", "PostgreSQL", "MongoDB", "Docker",
  "AWS", "GCP", "AI/ML", "GraphQL", "Next.js",
  "Go", "Rust", "Vue.js", "Solidity", "Kubernetes",
];

const EXPERIENCE_OPTIONS = [
  "< 1 year", "1–2 years", "3–5 years", "5–8 years", "8+ years",
];

const INPUT_STYLE: React.CSSProperties = {
  background: "#f5f7f5",
  border: "1px solid #dde5e0",
  color: "#1a2e26",
};

const DEFAULT_PROFILE: DeveloperProfile = {
  firstName: "", lastName: "", jobTitle: "", location: "",
  experience: "", bio: "", techStack: [], workType: "Remote",
  openToOpportunities: true, linkedin: "", github: "",
  dob: "", gender: "", avatarUrl: "", profileComplete: false,
};

export function DevOnboardingModal({ initialProfile = {}, onComplete, onSkip, userName }: Props) {
  const [step, setStep]       = useState(1);
  const [profile, setProfile] = useState<DeveloperProfile>(() => {
    const p = { ...DEFAULT_PROFILE, ...initialProfile };
    if (userName && !p.firstName) {
      const parts = userName.split(" ");
      p.firstName = parts[0] || "";
      p.lastName = parts.slice(1).join(" ") || "";
    }
    return p;
  });
  const fileRef               = useRef<HTMLInputElement>(null);

  const set = (key: keyof DeveloperProfile, val: string | boolean | string[]) =>
    setProfile((p) => ({ ...p, [key]: val }));

  const toggleTech = (t: string) =>
    setProfile((p) => ({
      ...p,
      techStack: p.techStack.includes(t)
        ? p.techStack.filter((x) => x !== t)
        : [...p.techStack, t],
    }));

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("avatarUrl", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSkipClick = () => {
    if (onSkip) {
      onSkip();
    } else {
      // Default fallback logic: mark complete with defaults or close
      onComplete({ ...profile, profileComplete: true });
    }
  };

  const baseInput =
    "w-full rounded-lg px-4 py-2.5 text-[13px] outline-none focus:ring-1 focus:ring-[#0f1c18]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,28,24,0.65)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="bg-white rounded-2xl overflow-hidden font-sans"
        style={{ width: 560, maxHeight: "90vh", border: "1px solid #e0e8e3", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-5" style={{ borderBottom: "1px solid #eaf0eb" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex gap-1.5 mb-3">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: step >= s ? 28 : 14,
                      background: step >= s ? "#0f1c18" : "#dde5e0",
                    }}
                  />
                ))}
              </div>
              <h2 className="text-[1.15rem] font-bold" style={{ color: "#1a2e26", margin: 0 }}>
                {step === 1 ? "Set up your Developer profile" : "Skills & preferences"}
              </h2>
              <p className="text-[12px] mt-0.5" style={{ color: "#7a9e8e", margin: 0 }}>
                {step === 1
                  ? "Step 1 of 2 · Required"
                  : "Step 2 of 2 · Select your tech stack"}
              </p>
            </div>
            <button
              onClick={handleSkipClick}
              className="rounded-lg p-1.5 transition-colors hover:bg-[#f5f7f5] border-none bg-transparent cursor-pointer"
            >
              <Icon icon="solar:close-square-bold-duotone" width={18} style={{ color: "#7a9e8e" }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-5 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="h-16 w-16 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-[#e8f0eb] overflow-hidden"
                      style={{
                        background: profile.avatarUrl ? "transparent" : "#f0f5f2",
                        border: "2px dashed #89d7b7",
                      }}
                    >
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Icon icon="solar:camera-add-bold-duotone" width={22} style={{ color: "#89d7b7" }} />
                      )}
                    </div>
                    <span className="text-[11px]" style={{ color: "#7a9e8e" }}>
                      Upload photo
                    </span>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatar}
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  {(["firstName", "lastName"] as const).map((key) => (
                    <div key={key}>
                      <label className="text-[11px] font-medium mb-1 block" style={{ color: "#6b8e7e" }}>
                        {key === "firstName" ? "First Name" : "Last Name"}{" "}
                        <span style={{ color: "#e05c5c" }}>*</span>
                      </label>
                      <input
                        className={baseInput}
                        style={INPUT_STYLE}
                        value={profile[key]}
                        onChange={(e) => set(key, e.target.value)}
                        placeholder={key === "firstName" ? "Sara" : "Ahmed"}
                      />
                    </div>
                  ))}
                </div>

                {/* Job Title */}
                <div>
                  <label className="text-[11px] font-medium mb-1 block" style={{ color: "#6b8e7e" }}>
                    Role / Title <span style={{ color: "#e05c5c" }}>*</span>
                  </label>
                  <input
                    className={baseInput}
                    style={INPUT_STYLE}
                    value={profile.jobTitle}
                    onChange={(e) => set("jobTitle", e.target.value)}
                    placeholder="e.g. Full Stack Developer, AI Engineer"
                  />
                </div>

                {/* Location + Experience */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium mb-1 block" style={{ color: "#6b8e7e" }}>
                      Location
                    </label>
                    <input
                      className={baseInput}
                      style={INPUT_STYLE}
                      value={profile.location}
                      onChange={(e) => set("location", e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium mb-1 block" style={{ color: "#6b8e7e" }}>
                      Experience
                    </label>
                    <select
                      className={baseInput}
                      style={INPUT_STYLE}
                      value={profile.experience}
                      onChange={(e) => set("experience", e.target.value)}
                    >
                      <option value="">Select…</option>
                      {EXPERIENCE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-[11px] font-medium mb-1 block" style={{ color: "#6b8e7e" }}>
                    Bio / Tagline
                  </label>
                  <textarea
                    className="w-full rounded-lg px-4 py-2.5 text-[13px] outline-none resize-none focus:ring-1 focus:ring-[#0f1c18]"
                    style={{ ...INPUT_STYLE, minHeight: 72 }}
                    value={profile.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="e.g. Passionate AI engineer with 5 years building production-grade ML systems"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                {/* Tech Stack */}
                <div>
                  <label className="text-[11px] font-medium mb-2 block" style={{ color: "#6b8e7e" }}>
                    Tech Stack <span style={{ color: "#e05c5c" }}>*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TECH_OPTIONS.map((t) => {
                      const sel = profile.techStack.includes(t);
                      return (
                        <button
                          key={t}
                          onClick={() => toggleTech(t)}
                          className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer"
                          style={{
                            background: sel ? "#1a312c" : "#f0f5f2",
                            color: sel ? "#89d7b7" : "#428475",
                            border: `1px solid ${sel ? "rgba(137,215,183,0.25)" : "#dde5e0"}`,
                          }}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* LinkedIn + GitHub */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium mb-1 block" style={{ color: "#6b8e7e" }}>
                      LinkedIn
                    </label>
                    <input
                      className={baseInput}
                      style={INPUT_STYLE}
                      value={profile.linkedin}
                      onChange={(e) => set("linkedin", e.target.value)}
                      placeholder="linkedin.com/in/yourname"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium mb-1 block" style={{ color: "#6b8e7e" }}>
                      GitHub
                    </label>
                    <input
                      className={baseInput}
                      style={INPUT_STYLE}
                      value={profile.github}
                      onChange={(e) => set("github", e.target.value)}
                      placeholder="github.com/username"
                    />
                  </div>
                </div>

                {/* DOB + Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium mb-1 block" style={{ color: "#6b8e7e" }}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className={baseInput}
                      style={INPUT_STYLE}
                      value={profile.dob}
                      onChange={(e) => set("dob", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium mb-1 block" style={{ color: "#6b8e7e" }}>
                      Gender
                    </label>
                    <select
                      className={baseInput}
                      style={INPUT_STYLE}
                      value={profile.gender}
                      onChange={(e) => set("gender", e.target.value)}
                    >
                      <option value="">Select…</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Work type */}
                <div>
                  <label className="text-[11px] font-medium mb-2 block" style={{ color: "#6b8e7e" }}>
                    Preferred Work Type
                  </label>
                  <div className="flex gap-2">
                    {(["Remote", "Hybrid", "Onsite"] as const).map((wt) => {
                      const sel = profile.workType === wt;
                      return (
                        <button
                          key={wt}
                          onClick={() => set("workType", wt)}
                          className="flex-1 py-2 rounded-lg text-[12px] font-medium transition-all cursor-pointer"
                          style={{
                            background: sel ? "#1a312c" : "#f0f5f2",
                            color: sel ? "#89d7b7" : "#428475",
                            border: `1px solid ${sel ? "rgba(137,215,183,0.25)" : "#dde5e0"}`,
                          }}
                        >
                          {wt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Open to opportunities toggle */}
                <div
                  className="flex items-center justify-between rounded-xl p-3"
                  style={{ background: "#f5f7f5", border: "1px solid #dde5e0" }}
                >
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "#1a2e26", margin: 0 }}>
                      Open to Opportunities
                    </p>
                    <p className="text-[11px]" style={{ color: "#7a9e8e", margin: 0 }}>
                      Founders can see you are actively looking
                    </p>
                  </div>
                  <button
                    onClick={() => set("openToOpportunities", !profile.openToOpportunities)}
                    className="rounded-full transition-all duration-200 shrink-0"
                    style={{
                      width: 44,
                      height: 24,
                      background: profile.openToOpportunities ? "#1a312c" : "#d4dfd9",
                      position: "relative",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <motion.span
                      animate={{ x: profile.openToOpportunities ? 20 : 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 26 }}
                      style={{
                        position: "absolute",
                        top: 2,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: profile.openToOpportunities ? "#89d7b7" : "#ffffff",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                      }}
                    />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div
          className="px-7 py-4 flex items-center justify-between"
          style={{ borderTop: "1px solid #eaf0eb" }}
        >
          <button
            onClick={handleSkipClick}
            className="text-[13px] transition-colors hover:underline border-none bg-transparent cursor-pointer"
            style={{ color: "#7a9e8e" }}
          >
            Skip for now
          </button>
          <div className="flex gap-2">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[#e8f0eb] border-none cursor-pointer"
                style={{ background: "#f0f5f2", color: "#1a2e26" }}
              >
                Back
              </button>
            )}
            <motion.button
              onClick={() => {
                if (step === 1) {
                  if (!profile.firstName || !profile.lastName || !profile.jobTitle) {
                    alert("Please fill in your first name, last name, and role.");
                    return;
                  }
                  setStep(2);
                } else {
                  if (profile.techStack.length === 0) {
                    alert("Please select at least one technology.");
                    return;
                  }
                  // Save to localStorage
                  try {
                    const existing = JSON.parse(localStorage.getItem("evolv_user") || "{}");
                    const next = {
                      ...existing,
                      ...profile,
                      profileComplete: true,
                      firstTime: false,
                    };
                    localStorage.setItem("evolv_user", JSON.stringify(next));
                    localStorage.setItem("evolv_developer_profile", JSON.stringify({ ...profile, profileComplete: true }));
                  } catch { /* ignore */ }
                  onComplete({ ...profile, profileComplete: true });
                }
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold cursor-pointer border-none"
              style={{ background: "#1a312c", color: "#89d7b7" }}
            >
              {step === 1 ? "Continue" : "Complete Setup"}
              <Icon
                icon={step === 1 ? "solar:arrow-right-bold" : "solar:check-circle-bold-duotone"}
                width={14}
                style={{ color: "#89d7b7" }}
              />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
