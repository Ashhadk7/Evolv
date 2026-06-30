import {
  type FounderEducation,
  formatFounderEducation,
  formatFounderEducations,
} from "@/components/founder/profileUtils";

export type DeveloperEducation = FounderEducation;

export interface DeveloperProject {
  id: string;
  title: string;
  description: string;
  images: string[];
}

export interface DeveloperProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  photo?: string;
  jobTitle?: string;
  role?: string;
  experience?: string;
  bio?: string;
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
  certifications?: string[];
  projects?: DeveloperProject[];
  profileComplete?: boolean;
  firstTime?: boolean;
}

export function createBlankDeveloperProject(): DeveloperProject {
  return { id: `project_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, title: "", description: "", images: [] };
}

export function getDeveloperEducations(profile: DeveloperProfile) {
  const structured = Array.isArray(profile.educations) ? profile.educations : [];
  if (structured.length) return structured;

  const degree = profile.degreeSelection === "Other"
    ? profile.customDegreeName?.trim() ?? ""
    : profile.degreeName?.trim() ?? "";

  if (profile.educationLevel?.trim() || degree) {
    return [{
      id: "primary_education",
      level: profile.educationLevel ?? "",
      degree,
      customDegree: profile.degreeSelection === "Other" ? profile.customDegreeName ?? "" : "",
      school: "",
    }];
  }

  return [];
}

export function getDeveloperEducationSummary(profile: DeveloperProfile) {
  return formatFounderEducations(getDeveloperEducations(profile)) || profile.education?.trim() || "";
}

export function getDeveloperSkills(profile: DeveloperProfile) {
  return Array.isArray(profile.techStack)
    ? profile.techStack
    : Array.isArray(profile.skills)
      ? profile.skills
      : [];
}

export function getDeveloperRole(profile: DeveloperProfile) {
  return profile.jobTitle?.trim() || profile.role?.trim() || "";
}

export function getDeveloperLinkedIn(profile: DeveloperProfile) {
  return profile.linkedin?.trim() || profile.linkedIn?.trim() || "";
}

export function getMissingDeveloperProfileFields(profile: DeveloperProfile) {
  const missing: string[] = [];

  if (!getDeveloperRole(profile)) missing.push("professional role");
  if (!profile.experience?.trim()) missing.push("experience");
  if (!getDeveloperEducationSummary(profile)) missing.push("education");
  if (!getDeveloperSkills(profile).length) missing.push("core skills");
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
  const techStack = getDeveloperSkills(profile);
  const jobTitle = getDeveloperRole(profile);
  const linkedin = getDeveloperLinkedIn(profile);
  const certifications = Array.isArray(profile.certifications) ? profile.certifications : [];
  const projects = Array.isArray(profile.projects) ? profile.projects : [];

  return {
    ...profile,
    jobTitle,
    role: jobTitle,
    techStack,
    skills: techStack,
    linkedin,
    linkedIn: linkedin,
    educations,
    education,
    certifications,
    projects,
    avatarUrl: profile.avatarUrl || profile.photo || "",
    photo: profile.photo || profile.avatarUrl || "",
    firstTime: false,
    profileComplete: isDeveloperProfileComplete({ ...profile, jobTitle, role: jobTitle, techStack, linkedin, educations, education }),
  };
}
