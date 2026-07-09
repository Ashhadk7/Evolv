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
  preferredBudget: "$180K – $250K",
  experienceYears: "5",
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
  rating: 5,
  reviews: [
    {
      id: "review-1",
      reviewer: "Asad Ahmed",
      rating: 5,
      date: "Jun 2026",
      comment:
        "Clear communication, thoughtful engineering decisions, and strong ownership from scope to delivery.",
    },
    {
      id: "review-2",
      reviewer: "Priya Sharma",
      rating: 5,
      date: "May 2026",
      comment:
        "Great collaborator for early-stage product work. Shipped fast without losing sight of maintainability.",
    },
  ],
};

export type DeveloperNotificationPrefs = {
  newMatch: boolean;
  applicationUpdate: boolean;
  messageReceived: boolean;
  weeklyDigest: boolean;
  founderViewed: boolean;
  marketingEmails: boolean;
};

export const defaultNotifications: DeveloperNotificationPrefs = {
  newMatch: true,
  applicationUpdate: true,
  messageReceived: true,
  weeklyDigest: true,
  founderViewed: false,
  marketingEmails: false,
};

export const getProfileName = (profile: Partial<DeveloperSettingsProfile>) =>
  profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Developer";

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
  user: Partial<DeveloperSettingsProfile> = {}
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
