import {
  type FounderEducation,
  formatFounderEducation,
  formatFounderEducations,
} from "@/features/founder-dashboard/profile-utils";

export type DeveloperEducation = FounderEducation;

export interface DeveloperSkillEntry {
  id: string;
  kind: string;
  name: string;
  experience: string;
}

export interface DeveloperCertification {
  id: string;
  name: string;
  image?: string;
}

export interface DeveloperProfileReview {
  id: string;
  reviewer: string;
  rating: number;
  date: string;
  comment: string;
}

export interface DeveloperProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  location?: string;
  avatarUrl?: string;
  photo?: string;
  jobTitle?: string;
  role?: string;
  experience?: string;
  bio?: string;
  tags?: string[];
  skillEntries?: DeveloperSkillEntry[];
  techStack?: string[];
  skills?: string[];
  education?: string;
  educationLevel?: string;
  degreeName?: string;
  degreeSelection?: string;
  customDegreeName?: string;
  educations?: DeveloperEducation[];
  github?: string;
  linkedin?: string;
  linkedIn?: string;
  portfolioLink?: string;
  certifications?: Array<string | DeveloperCertification>;
  rating?: number;
  reviews?: DeveloperProfileReview[];
  profileComplete?: boolean;
  firstTime?: boolean;
}

export function createBlankDeveloperSkill(): DeveloperSkillEntry {
  return {
    id: `skill_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    kind: "Tech stack",
    name: "",
    experience: "",
  };
}

export function createBlankDeveloperCertification(): DeveloperCertification {
  return {
    id: `cert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    image: "",
  };
}

export function getDeveloperEducations(profile: DeveloperProfile) {
  const structured = Array.isArray(profile.educations) ? profile.educations : [];
  if (structured.length) return structured;

  const degree =
    profile.degreeSelection === "Other"
      ? (profile.customDegreeName?.trim() ?? "")
      : (profile.degreeName?.trim() ?? "");

  if (profile.educationLevel?.trim() || degree) {
    return [
      {
        id: "primary_education",
        level: profile.educationLevel ?? "",
        degree,
        customDegree: profile.degreeSelection === "Other" ? (profile.customDegreeName ?? "") : "",
        school: "",
      },
    ];
  }

  return [];
}

export function getDeveloperEducationSummary(profile: DeveloperProfile) {
  return (
    formatFounderEducations(getDeveloperEducations(profile)) || profile.education?.trim() || ""
  );
}

export function getDeveloperSkills(profile: DeveloperProfile) {
  const entries = getDeveloperSkillEntries(profile);
  if (entries.length) return entries.map((entry) => entry.name).filter(Boolean);

  return Array.isArray(profile.techStack)
    ? profile.techStack
    : Array.isArray(profile.skills)
      ? profile.skills
      : [];
}

export function getDeveloperSkillEntries(profile: DeveloperProfile) {
  const structured = Array.isArray(profile.skillEntries) ? profile.skillEntries : [];
  if (structured.length) return structured;

  const fallbackSkills = Array.isArray(profile.techStack)
    ? profile.techStack
    : Array.isArray(profile.skills)
      ? profile.skills
      : [];

  return fallbackSkills.map((skill, index) => ({
    id: `legacy_skill_${index}_${skill}`,
    kind: "Skill",
    name: skill,
    experience: "",
  }));
}

export function getDeveloperCertifications(profile: DeveloperProfile): DeveloperCertification[] {
  const certifications = Array.isArray(profile.certifications) ? profile.certifications : [];
  return certifications.map((certification, index) => {
    if (typeof certification === "string") {
      return { id: `legacy_cert_${index}_${certification}`, name: certification, image: "" };
    }
    return {
      id: certification.id || `cert_${index}`,
      name: certification.name || "",
      image: certification.image || "",
    };
  });
}

export function getDeveloperRole(profile: DeveloperProfile) {
  return profile.jobTitle?.trim() || profile.role?.trim() || "";
}

export function getDeveloperLinkedIn(profile: DeveloperProfile) {
  return profile.linkedin?.trim() || profile.linkedIn?.trim() || "";
}

// KEEP IN SYNC with backend ensure_complete_profile_fields (services/developer_profiles.py).
// This is the UX check; the backend is the enforced gate. Change both together.
export function getMissingDeveloperProfileFields(profile: DeveloperProfile) {
  const missing: string[] = [];

  if (!getDeveloperRole(profile)) missing.push("professional role");
  if (!profile.bio?.trim()) missing.push("professional bio");
  if (!getDeveloperEducationSummary(profile)) missing.push("education");
  if (!getDeveloperSkillEntries(profile).some((entry) => entry.name?.trim()))
    missing.push("skills and tech stack");
  if (!profile.github?.trim()) missing.push("GitHub");
  if (!getDeveloperLinkedIn(profile)) missing.push("LinkedIn");

  return missing;
}

export function isDeveloperProfileComplete(profile: DeveloperProfile) {
  return getMissingDeveloperProfileFields(profile).length === 0;
}

export function formatDeveloperEducation(education: DeveloperEducation) {
  return formatFounderEducation(education);
}

export function normalizeDeveloperProfileForSave<T extends DeveloperProfile>(profile: T): T {
  const educations = getDeveloperEducations(profile);
  const education = formatFounderEducations(educations) || profile.education?.trim() || "";
  const skillEntries = getDeveloperSkillEntries(profile).filter((entry) => entry.name?.trim());
  const techStack = skillEntries.length
    ? skillEntries.map((entry) => entry.name.trim())
    : getDeveloperSkills(profile);
  const jobTitle = getDeveloperRole(profile);
  const linkedin = getDeveloperLinkedIn(profile);
  const tags = Array.isArray(profile.tags) ? profile.tags : [];
  const certifications = getDeveloperCertifications(profile).filter((certification) =>
    certification.name?.trim()
  );

  return {
    ...profile,
    jobTitle,
    role: jobTitle,
    techStack,
    skills: techStack,
    skillEntries,
    tags,
    linkedin,
    linkedIn: linkedin,
    educations,
    education,
    certifications,
    avatarUrl: profile.avatarUrl || profile.photo || "",
    photo: profile.photo || profile.avatarUrl || "",
    firstTime: false,
    profileComplete: isDeveloperProfileComplete({
      ...profile,
      jobTitle,
      role: jobTitle,
      techStack,
      skillEntries,
      linkedin,
      educations,
      education,
    }),
  };
}
