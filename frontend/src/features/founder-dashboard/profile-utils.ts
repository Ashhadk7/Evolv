export interface FounderEducation {
  id: string;
  level: string;
  degree: string;
  customDegree?: string;
  school?: string;
}

export interface FounderProfileShape {
  firstName?: string;
  lastName?: string;
  headline?: string;
  bio?: string;
  domains?: string[];
  linkedin?: string;
  education?: string;
  educationLevel?: string;
  degreeName?: string;
  degreeSelection?: string;
  customDegreeName?: string;
  educations?: FounderEducation[];
  profileComplete?: boolean;
}

export const EDUCATION_LEVELS = [
  "Student",
  "Intermediate / Higher Secondary",
  "Diploma",
  "Undergraduate",
  "Bachelor's",
  "Master's",
  "MBA",
  "MPhil",
  "PhD / Doctorate",
  "Professional Certification",
  "Self-taught / Bootcamp",
  "Prefer not to say",
  "Other",
];

export const DEGREE_OPTIONS_BY_LEVEL: Record<string, string[]> = {
  Student: ["Currently studying", "No formal degree yet", "Other"],
  "Intermediate / Higher Secondary": [
    "High School / Secondary School",
    "Intermediate / FSc",
    "Intermediate / FA",
    "A-Levels",
    "GED / Equivalent",
    "Other",
  ],
  Diploma: [
    "Diploma in Business",
    "Diploma in Computer Science",
    "Diploma in Information Technology",
    "Diploma in Engineering",
    "Diploma in Design",
    "Associate Degree",
    "Other",
  ],
  Undergraduate: [
    "Undergraduate - Business",
    "Undergraduate - Computer Science",
    "Undergraduate - Engineering",
    "Undergraduate - Arts",
    "Undergraduate - Medicine",
    "Undergraduate - Law",
    "Other",
  ],
  "Bachelor's": [
    "BA",
    "BSc",
    "BBA",
    "BCom",
    "BS Computer Science",
    "BS Software Engineering",
    "BS Information Technology",
    "BS Data Science",
    "BS Artificial Intelligence",
    "BS Cybersecurity",
    "BS Electrical Engineering",
    "BS Mechanical Engineering",
    "BS Civil Engineering",
    "BS Biomedical Engineering",
    "BEng / BE",
    "BTech",
    "BArch",
    "BFA",
    "LLB",
    "MBBS",
    "BDS",
    "Pharm-D",
    "BEd",
    "Other",
  ],
  "Master's": [
    "MA",
    "MSc",
    "MCom",
    "MEd",
    "MS Computer Science",
    "MS Software Engineering",
    "MS Data Science",
    "MS Artificial Intelligence",
    "MS Cybersecurity",
    "MS Electrical Engineering",
    "MS Mechanical Engineering",
    "MEng / ME",
    "MPH",
    "LLM",
    "Other",
  ],
  MBA: [
    "MBA",
    "Executive MBA",
    "MBA Finance",
    "MBA Marketing",
    "MBA Entrepreneurship",
    "MBA Technology Management",
    "Other",
  ],
  MPhil: [
    "MPhil",
    "MPhil Computer Science",
    "MPhil Business",
    "MPhil Economics",
    "MPhil Education",
    "MPhil Psychology",
    "Other",
  ],
  "PhD / Doctorate": [
    "PhD",
    "DBA",
    "EdD",
    "MD",
    "Doctorate in Engineering",
    "Doctorate in Computer Science",
    "Other",
  ],
  "Professional Certification": [
    "CA",
    "ACCA",
    "CFA",
    "CPA",
    "PMP",
    "AWS Certification",
    "Google Certification",
    "Microsoft Certification",
    "Other",
  ],
  "Self-taught / Bootcamp": [
    "Self-taught",
    "Coding Bootcamp",
    "Design Bootcamp",
    "Founder Fellowship",
    "Online Certification",
    "Other",
  ],
  "Prefer not to say": ["Prefer not to say"],
  Other: ["Other"],
};

export const DEFAULT_DEGREE_OPTIONS = ["Select education level first"];

export function getDegreeOptions(level?: string) {
  return level ? (DEGREE_OPTIONS_BY_LEVEL[level] ?? ["Other"]) : DEFAULT_DEGREE_OPTIONS;
}

export function createBlankEducation(): FounderEducation {
  return {
    id: `edu_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    level: "",
    degree: "",
    customDegree: "",
    school: "",
  };
}

export function getResolvedDegree(education: FounderEducation) {
  return education.degree === "Other"
    ? (education.customDegree?.trim() ?? "")
    : education.degree.trim();
}

export function formatFounderEducation(education: FounderEducation) {
  const degree = getResolvedDegree(education);
  const main = [education.level.trim(), degree].filter(Boolean).join(" - ");
  const school = education.school?.trim();
  return [main, school].filter(Boolean).join(", ");
}

export function formatFounderEducations(educations: FounderEducation[]) {
  return educations.map(formatFounderEducation).filter(Boolean).join("; ");
}

export function getFounderEducations(profile: FounderProfileShape) {
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

export function getFounderEducationSummary(profile: FounderProfileShape) {
  return formatFounderEducations(getFounderEducations(profile)) || profile.education?.trim() || "";
}

// KEEP IN SYNC with backend ensure_complete_profile_fields (services/founder_profiles.py).
// This is the UX check; the backend is the enforced gate. Change both together.
export function getMissingFounderProfileFields(profile: FounderProfileShape) {
  const domains = Array.isArray(profile.domains) ? profile.domains : [];
  const missing: string[] = [];

  if (!profile.headline?.trim()) missing.push("founder headline");
  if (!profile.bio?.trim()) missing.push("short bio");
  if (!domains.length) missing.push("domains of interest");
  if (!getFounderEducationSummary(profile)) missing.push("education");
  if (!profile.linkedin?.trim()) missing.push("LinkedIn");

  return missing;
}

export function isFounderProfileComplete(profile: FounderProfileShape) {
  return getMissingFounderProfileFields(profile).length === 0;
}

export function normalizeFounderProfileForSave<T extends FounderProfileShape>(profile: T): T {
  const domains = Array.isArray(profile.domains) ? profile.domains : [];
  const educations = getFounderEducations(profile);
  const education = formatFounderEducations(educations) || profile.education?.trim() || "";

  return {
    ...profile,
    domains,
    educations,
    education,
    profileComplete: isFounderProfileComplete({ ...profile, domains, educations, education }),
  };
}
