"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CheckCircle, UploadSimple } from "@phosphor-icons/react";

export interface FounderProfile {
  firstName: string;
  lastName: string;
  bio: string;
  domains: string[];
  linkedin: string;
  dob: string;
  gender: string;
  phone: string;
  education: string;
  description: string;
  email: string;
  avatarUrl?: string;
  profileComplete?: boolean;
  ventureStage?: string;
}

interface Props {
  initialProfile: FounderProfile;
  onComplete: (p: FounderProfile) => void;
  onSkip: () => void;
}

const DOMAINS = [
  "AI", "SaaS", "MedTech", "FinTech", "CleanTech",
  "Web3", "EdTech", "E-commerce", "Deep Tech", "B2B",
];

const INPUT_STYLE: React.CSSProperties = {
  background: "#f5f7f5",
  border: "1px solid #dde5e0",
  color: "#1a2e26",
};

export function OnboardingWizard({ initialProfile, onComplete, onSkip }: Props) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<FounderProfile>(initialProfile);

  const set = (key: keyof FounderProfile, val: string) =>
    setProfile((p) => ({ ...p, [key]: val }));

  const toggleDomain = (d: string) =>
    setProfile((p) => ({
      ...p,
      domains: p.domains.includes(d)
        ? p.domains.filter((x) => x !== d)
        : [...p.domains, d],
    }));

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
        className="bg-white rounded-2xl overflow-hidden"
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
              <h2 className="text-[1.15rem] font-bold" style={{ color: "#1a2e26" }}>
                {step === 1 ? "Set up your Founder profile" : "A few more details"}
              </h2>
              <p className="text-[12px] mt-0.5" style={{ color: "#7a9e8e" }}>
                {step === 1 ? "Step 1 of 2 · Required" : "Step 2 of 2 · Optional — fill in later if you like"}
              </p>
            </div>
            <button
              onClick={onSkip}
              className="rounded-lg p-1.5 transition-colors hover:bg-[#f5f7f5]"
            >
              <X size={16} style={{ color: "#7a9e8e" }} />
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
                      className="h-16 w-16 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-[#e8f0eb]"
                      style={{
                        background: "#f0f5f2",
                        border: "2px dashed #89d7b7",
                      }}
                    >
                      <UploadSimple size={22} style={{ color: "#89d7b7" }} />
                    </div>
                    <span className="text-[11px]" style={{ color: "#7a9e8e" }}>
                      Upload photo
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  {(["firstName", "lastName"] as const).map((key) => (
                    <div key={key}>
                      <label
                        className="text-[11px] font-medium mb-1 block"
                        style={{ color: "#6b8e7e" }}
                      >
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

                {/* Bio */}
                <div>
                  <label className="text-[11px] font-medium mb-1 block" style={{ color: "#6b8e7e" }}>
                    Bio Line <span style={{ color: "#e05c5c" }}>*</span>
                  </label>
                  <input
                    className={baseInput}
                    style={INPUT_STYLE}
                    value={profile.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Building the future of healthcare diagnostics"
                  />
                </div>

                {/* Domains */}
                <div>
                  <label className="text-[11px] font-medium mb-2 block" style={{ color: "#6b8e7e" }}>
                    Domains / Interests <span style={{ color: "#e05c5c" }}>*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DOMAINS.map((d) => {
                      const sel = profile.domains.includes(d);
                      return (
                        <button
                          key={d}
                          onClick={() => toggleDomain(d)}
                          className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                          style={{
                            background: sel ? "#0f1c18" : "#f0f5f2",
                            color: sel ? "#89d7b7" : "#428475",
                            border: `1px solid ${sel ? "#0f1c18" : "#dde5e0"}`,
                          }}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
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

                <div>
                  <label className="text-[11px] font-medium mb-1 block" style={{ color: "#6b8e7e" }}>
                    LinkedIn Profile
                  </label>
                  <input
                    className={baseInput}
                    style={INPUT_STYLE}
                    value={profile.linkedin}
                    onChange={(e) => set("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/yourname"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium mb-1 block" style={{ color: "#6b8e7e" }}>
                    Phone Number
                  </label>
                  <input
                    className={baseInput}
                    style={INPUT_STYLE}
                    value={profile.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+92 300 0000000"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium mb-1 block" style={{ color: "#6b8e7e" }}>
                    Education
                  </label>
                  <input
                    className={baseInput}
                    style={INPUT_STYLE}
                    value={profile.education}
                    onChange={(e) => set("education", e.target.value)}
                    placeholder="BSc Computer Science, LUMS"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium mb-1 block" style={{ color: "#6b8e7e" }}>
                    Description
                  </label>
                  <textarea
                    className="w-full rounded-lg px-4 py-2.5 text-[13px] outline-none resize-none focus:ring-1 focus:ring-[#0f1c18]"
                    style={{ ...INPUT_STYLE, minHeight: 80 }}
                    value={profile.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Tell developers and investors about your journey..."
                  />
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
            onClick={onSkip}
            className="text-[13px] transition-colors hover:underline"
            style={{ color: "#7a9e8e" }}
          >
            Skip for now
          </button>
          <div className="flex gap-2">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[#e8f0eb]"
                style={{ background: "#f0f5f2", color: "#1a2e26" }}
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step === 1) {
                  if (!profile.firstName || !profile.lastName || !profile.bio || profile.domains.length === 0) {
                    alert("Please fill in all required fields and select at least one domain.");
                    return;
                  }
                  setStep(2);
                } else {
                  onComplete({ ...profile, profileComplete: true });
                }
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: "#0f1c18", color: "#89d7b7" }}
            >
              {step === 1 ? "Continue" : "Complete Setup"}
              {step === 1 ? (
                <ArrowRight size={14} weight="bold" />
              ) : (
                <CheckCircle size={14} weight="bold" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
