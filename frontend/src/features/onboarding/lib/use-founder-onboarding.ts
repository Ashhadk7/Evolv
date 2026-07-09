import { useMemo, useState } from "react";
import {
  formatFounderEducations,
  getFounderEducations,
  getMissingFounderProfileFields,
  normalizeFounderProfileForSave,
  type FounderEducation,
} from "@/features/founder-dashboard/profile-utils";
import type { FounderProfile } from "@/features/founder-dashboard/types";
import { getInitials } from "@/features/onboarding/components/onboarding-helpers";

export function useFounderOnboarding({
  initialProfile,
  onComplete,
  onSkip,
}: {
  initialProfile: FounderProfile;
  onComplete: (p: FounderProfile) => void;
  onSkip: () => void;
}) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<FounderProfile>(() => ({
    ...initialProfile,
    domains: Array.isArray(initialProfile.domains) ? initialProfile.domains : [],
    educations: getFounderEducations(initialProfile),
  }));

  const fullName = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "Founder";
  const initials = getInitials(profile, "F");
  const educations = useMemo(() => getFounderEducations(profile), [profile]);
  const baseInput =
    "w-full rounded-lg px-4 py-2.5 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/25 bg-[#f5f7f5] border border-[#dde5e0] text-[#1a2e26]";

  const set = (key: keyof FounderProfile, value: string) =>
    setProfile((current) => ({ ...current, [key]: value }));

  const toggleDomain = (domain: string) =>
    setProfile((current) => {
      const domains = Array.isArray(current.domains) ? current.domains : [];
      return {
        ...current,
        domains: domains.includes(domain)
          ? domains.filter((item) => item !== domain)
          : [...domains, domain],
      };
    });

  const handlePhotoUpload = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfile((current) => ({ ...current, avatarUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const updateEducations = (next: FounderEducation[]) => {
    setProfile((current) => ({
      ...current,
      educations: next,
      education: formatFounderEducations(next),
    }));
  };

  const handleComplete = () => {
    const normalized = normalizeFounderProfileForSave(profile) as FounderProfile;
    const missing = getMissingFounderProfileFields(normalized);
    if (missing.length) {
      setError(
        "Please fill founder headline, short bio, domains of interest, and education before sending messages or connection requests."
      );
      return;
    }

    setError("");
    onComplete(normalized);
  };

  return {
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
  };
}
