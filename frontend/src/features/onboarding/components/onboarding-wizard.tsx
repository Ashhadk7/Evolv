"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, LinkedinLogo, X } from "@phosphor-icons/react";
import type { FounderProfile } from "@/features/founder-dashboard/types";
import { FieldLabel } from "@/features/onboarding/components/onboarding-helpers";
import { EducationEditor } from "@/features/onboarding/components/onboarding-education-editor";
import { useFounderOnboarding } from "@/features/onboarding/lib/use-founder-onboarding";
import { FounderStepIdentity } from "./founder-step-identity";

export type { FounderProfile };

interface Props {
  initialProfile: FounderProfile;
  onComplete: (p: FounderProfile) => void;
  onSkip: () => void;
}

export function OnboardingWizard({ initialProfile, onComplete, onSkip }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    step,
    setStep,
    error,
    setError,
    profile,
    fullName,
    initials,
    educations,
    baseInput,
    set,
    toggleDomain,
    handlePhotoUpload,
    updateEducations,
    handleComplete,
  } = useFounderOnboarding({ initialProfile, onComplete, onSkip });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#0f1c18]/62">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="w-full max-w-[620px] max-h-[90vh] border border-[#dfe9e3] rounded-2xl flex flex-col bg-white overflow-hidden"
      >
        <div className="px-7 pt-6 pb-5 border-b border-[#eaf0eb]">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex gap-1.5">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      step >= item ? "w-[30px] bg-[#1a312c]" : "w-[14px] bg-[#dde5e0]"
                    }`}
                  />
                ))}
              </div>
              <h2 className="text-[1.15rem] font-bold text-[#1a2e26]">
                Complete founder profile
              </h2>
              <p className="mt-1 text-[12px] text-[#7a9e8e]">
                Step {step} of 2
              </p>
            </div>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-lg p-1.5 transition hover:bg-[#f5f7f5]"
              aria-label="Close setup"
            >
              <X size={16} className="text-[#7a9e8e]" />
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
              >
                <FounderStepIdentity
                  profile={profile}
                  set={set}
                  toggleDomain={toggleDomain}
                  fileInputRef={fileInputRef}
                  handlePhotoUpload={handlePhotoUpload}
                  initials={initials}
                  fullName={fullName}
                  baseInput={baseInput}
                />
              </motion.div>
            ) : (
              <motion.div
                key="education"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col gap-4"
              >
                <EducationEditor educations={educations} onChange={updateEducations} />

                <div>
                  <FieldLabel>
                    LinkedIn <span className="text-[#9bb0a7] font-medium">(optional)</span>
                  </FieldLabel>
                  <div className="relative">
                    <LinkedinLogo
                      size={15}
                      weight="bold"
                      className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#428475]"
                    />
                    <input
                      value={profile.linkedin}
                      onChange={(event) => set("linkedin", event.target.value)}
                      className={`${baseInput} pl-[42px]`}
                      placeholder="https://linkedin.com/in/yourname"
                    />
                  </div>
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

        <div className="flex items-center justify-between px-7 py-4 border-t border-[#eaf0eb]">
          <button
            type="button"
            onClick={onSkip}
            className="text-[13px] font-semibold transition hover:underline text-[#7a9e8e]"
          >
            Skip for now
          </button>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                className="flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition hover:bg-[#e8f0eb] bg-[#f0f5f2] text-[#1a2e26]"
              >
                <ArrowLeft size={14} weight="bold" />
                Back
              </button>
            )}
            <motion.button
              type="button"
              onClick={() => {
                if (step === 1) {
                  setError("");
                  setStep(2);
                  return;
                }
                handleComplete();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 24 }}
              className="bp-gradient-btn flex h-10 items-center gap-2 rounded-xl px-5 text-[13px] font-bold"
            >
              {step === 1 ? "Next" : "Complete profile"}
              {step === 1 ? (
                <ArrowRight size={14} weight="bold" />
              ) : (
                <CheckCircle size={14} weight="bold" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
