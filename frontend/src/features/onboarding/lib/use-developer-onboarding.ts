import { useMemo, useState } from "react";
import {
  getDeveloperEducations,
  getMissingDeveloperProfileDetailFields,
  normalizeDeveloperProfileForSave,
  getDeveloperSkillEntries,
  type DeveloperProfile,
  type DeveloperSkillEntry,
} from "@/features/developer-dashboard/profile-utils";
import {
  formatFounderEducations,
  type FounderEducation,
} from "@/features/founder-dashboard/profile-utils";
import { getInitials } from "@/features/onboarding/components/onboarding-helpers";

export function useDeveloperOnboarding({
  initialProfile,
  onComplete,
  onSkip,
  userName = "",
}: {
  initialProfile?: DeveloperProfile;
  onComplete: (profile?: DeveloperProfile) => void;
  onSkip?: () => void;
  userName?: string;
}) {
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

  const fullName = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "Your profile";
  const initials = getInitials(profile, "D");
  const educations = useMemo(() => getDeveloperEducations(profile), [profile]);
  const skillEntries = useMemo(() => getDeveloperSkillEntries(profile), [profile]);
  const baseInput =
    "w-full rounded-lg px-4 py-2.5 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/25 bg-[#f5f7f5] border border-[#dde5e0] text-[#1a2e26]";

  const set = (key: keyof DeveloperProfile, value: string) =>
    setProfile((current) => ({ ...current, [key]: value }));

  const updateSkillEntries = (next: DeveloperSkillEntry[]) =>
    setProfile((current) => ({
      ...current,
      skillEntries: next,
      techStack: next.map((entry) => entry.name).filter(Boolean),
    }));

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
        setProfile((current) => ({
          ...current,
          avatarUrl: reader.result as string,
          photo: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSkip = () => {
    if (onSkip) onSkip();
    else onComplete();
  };

  const handleComplete = () => {
    const normalized = normalizeDeveloperProfileForSave(profile);
    const missing = getMissingDeveloperProfileDetailFields(normalized);
    if (missing.length) {
      setError(
        `Please fill ${missing.join(", ")} before using applications, messages, or network actions.`
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
    skillEntries,
    baseInput,
    set,
    updateSkillEntries,
    updateEducations,
    handlePhotoUpload,
    handleSkip,
    handleComplete,
  };
}
