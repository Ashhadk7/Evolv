// Feature-local data + pure helpers for the developer Settings page.
import {
  getDeveloperCertifications,
  getDeveloperEducations,
  getDeveloperSkillEntries,
  type DeveloperCertification,
  type DeveloperEducation,
  type DeveloperProfile,
  type DeveloperSkillEntry,
} from "@/features/developer-dashboard/profile-utils";
import type { NotificationPreferences } from "@/features/notifications/notifications-api";

export type DeveloperSettingsReview = {
  id: string;
  reviewer: string;
  rating: number;
  date: string;
  comment: string;
};

export type DeveloperSettingsProfile = DeveloperProfile & {
  name: string;
  location: string;
  availability: boolean;
  openToRemote: boolean;
  preferredBudget: string;
  experienceYears: string;
  rating: number;
  reviews: DeveloperSettingsReview[];
  skillEntries: DeveloperSkillEntry[];
  educations: DeveloperEducation[];
  certifications: DeveloperCertification[];
  portfolioLink: string;
};

export const PROFILE_TAGS = [
  "Web Developer",
  "UI/UX",
  "Frontend",
  "Backend",
  "Full Stack",
  "AI Engineer",
  "Mobile Developer",
  "DevOps",
  "Blockchain",
  "Data Engineer",
  "Product-minded",
];
export const SKILL_KINDS = ["Skill", "Tech stack", "Framework", "Tool"];
export const SKILL_EXPERIENCE = ["Learning", "< 1 year", "1-2 years", "3-5 years", "5+ years"];

export const defaultProfile: DeveloperSettingsProfile = {
  name: "",
  email: "",
  role: "",
  location: "",
  bio: "",
  techStack: [],
  availability: true,
  openToRemote: true,
  preferredBudget: "",
  experienceYears: "",
  avatarUrl: "",
  tags: [],
  skillEntries: [],
  education: "",
  educationLevel: "",
  degreeName: "",
  degreeSelection: "",
  customDegreeName: "",
  educations: [],
  github: "",
  linkedin: "",
  portfolioLink: "",
  certifications: [],
  rating: 0,
  reviews: [],
};

export type DeveloperNotificationPrefs = Pick<
  NotificationPreferences,
  | "newMatch"
  | "blueprintPublished"
  | "applicationUpdate"
  | "connectionRequest"
  | "connectionAccepted"
  | "messageReceived"
  | "weeklyDigest"
  | "founderViewed"
  | "marketingEmails"
  | "sound"
>;

export const defaultNotifications: DeveloperNotificationPrefs = {
  newMatch: true,
  blueprintPublished: true,
  applicationUpdate: true,
  connectionRequest: true,
  connectionAccepted: true,
  messageReceived: true,
  weeklyDigest: true,
  founderViewed: false,
  marketingEmails: false,
  sound: true,
};

export const getProfileName = (profile: Partial<DeveloperSettingsProfile>) =>
  profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Your profile";

export const getProfileInitials = (profile: Partial<DeveloperSettingsProfile>) => {
  const name = getProfileName(profile);
  const fromName = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  return (fromName || "D").toUpperCase();
};

export const formatProfileLink = (value: string) =>
  value
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
export const getExternalUrl = (value: string) => {
  if (!value) return "";
  return value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
};

export const hydrateDeveloperProfile = (
  user: Partial<DeveloperProfile> & { name?: string; location?: string } = {}
): DeveloperSettingsProfile => {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const hydrated: DeveloperSettingsProfile = {
    ...defaultProfile,
    ...user,
    name: name || user.name || "",
    email: user.email || "",
    avatarUrl: user.avatarUrl || user.photo || "",
    photo: user.photo || user.avatarUrl || "",
    role: user.jobTitle || user.role || "",
    bio: user.bio || "",
    availability:
      typeof user.availability === "boolean" ? user.availability : defaultProfile.availability,
    openToRemote:
      typeof user.openToRemote === "boolean" ? user.openToRemote : defaultProfile.openToRemote,
    preferredBudget: user.preferredBudget || "",
    experienceYears: user.experienceYears || user.experience || "",
    tags: Array.isArray(user.tags) ? user.tags : [],
    techStack: Array.isArray(user.techStack)
      ? user.techStack
      : Array.isArray(user.skills)
        ? user.skills
        : [],
    skillEntries: getDeveloperSkillEntries(user),
    educations: getDeveloperEducations(user),
    linkedin: user.linkedin || user.linkedIn || "",
    linkedIn: user.linkedIn || user.linkedin || "",
    certifications: getDeveloperCertifications(user),
  };
  return hydrated;
};
