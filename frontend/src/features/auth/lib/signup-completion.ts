"use client";

import {
  ApiRequestError,
  addMyDomain,
  addMySkill,
  createDeveloperProfile,
  createDomain,
  createFounderProfile,
  createSkill,
  listDomains,
  listSkills,
  type CatalogItem,
  type DeveloperProfilePayload,
  type EducationPayload,
  type FounderProfilePayload,
} from "./auth-api";
import type { PendingSignupData } from "./signup-storage";

const SIGNUP_EDUCATION_SCHOOL = "Not specified";

function clean(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function degreeName(selection: string, custom: string) {
  if (selection === "Other") return custom.trim();
  return selection.trim();
}

function buildSignupEducation(
  level: string,
  degreeSelection: string,
  customDegreeName: string
): EducationPayload[] {
  const levelValue = level.trim();
  const degreeValue = degreeName(degreeSelection, customDegreeName);
  if (!levelValue || !degreeValue) return [];

  return [
    {
      level: levelValue,
      degree: degreeSelection === "Other" ? null : degreeValue,
      custom_degree: degreeSelection === "Other" ? degreeValue : null,
      school: SIGNUP_EDUCATION_SCHOOL,
    },
  ];
}

function experienceYears(value: string) {
  if (value === "< 1 year") return 0;
  if (value === "1-2 years") return 1;
  if (value === "3-5 years") return 3;
  if (value === "5-8 years") return 5;
  if (value === "8+ years") return 8;
  return null;
}

function skillExperienceLevel(value: string) {
  if (value === "< 1 year") return "< 1 year";
  if (value === "1-2 years") return "1-2 years";
  if (value === "3-5 years") return "3-5 years";
  if (value === "5-8 years" || value === "8+ years") return "5+ years";
  return "Learning";
}

async function ignoreConflict(action: Promise<unknown>) {
  try {
    await action;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 409) return;
    throw error;
  }
}

async function ensureCatalogItem(
  name: string,
  accessToken: string,
  listItems: (accessToken: string) => Promise<CatalogItem[]>,
  createItem: (name: string, accessToken: string) => Promise<CatalogItem>
) {
  const normalized = normalizeName(name);
  const existingItems = await listItems(accessToken);
  const existing = existingItems.find((item) => normalizeName(item.name) === normalized);
  if (existing) return existing;

  try {
    return await createItem(name, accessToken);
  } catch (error) {
    if (!(error instanceof ApiRequestError) || error.status !== 409) throw error;
    const latestItems = await listItems(accessToken);
    const latest = latestItems.find((item) => normalizeName(item.name) === normalized);
    if (latest) return latest;
    throw error;
  }
}

export async function saveSignupProfileToBackend(
  pendingSignup: PendingSignupData,
  accessToken: string
) {
  if (pendingSignup.role === "founder") {
    await saveFounderSignupProfile(pendingSignup, accessToken);
    return;
  }

  await saveDeveloperSignupProfile(pendingSignup, accessToken);
}

async function saveFounderSignupProfile(
  { founder, profileComplete }: PendingSignupData,
  accessToken: string
) {
  const payload: FounderProfilePayload = {
    headline: clean(founder.headline),
    bio: clean(founder.bio),
    description: clean(founder.bio),
    linkedin: clean(founder.linkedin),
    primary_goal: clean(founder.primaryGoal),
    profile_complete: profileComplete,
    educations: buildSignupEducation(
      founder.educationLevel,
      founder.degreeName,
      founder.customDegreeName
    ),
  };

  await ignoreConflict(createFounderProfile(payload, accessToken));

  for (const domainName of founder.domains) {
    const domain = await ensureCatalogItem(domainName, accessToken, listDomains, createDomain);
    await ignoreConflict(addMyDomain({ domain_id: domain.id }, accessToken));
  }
}

async function saveDeveloperSignupProfile(
  { developer, profileComplete }: PendingSignupData,
  accessToken: string
) {
  const payload: DeveloperProfilePayload = {
    job_title: clean(developer.jobTitle),
    bio: clean(developer.bio),
    experience_years: experienceYears(developer.experience),
    availability: true,
    open_to_remote: false,
    github: clean(developer.github),
    linkedin: clean(developer.linkedIn),
    profile_complete: profileComplete,
    educations: buildSignupEducation(
      developer.educationLevel,
      developer.degreeName,
      developer.customDegreeName
    ),
  };

  await ignoreConflict(createDeveloperProfile(payload, accessToken));

  const experienceLevel = skillExperienceLevel(developer.experience);
  for (const skillName of developer.skills) {
    const skill = await ensureCatalogItem(skillName, accessToken, listSkills, createSkill);
    await ignoreConflict(
      addMySkill(
        {
          skill_id: skill.id,
          kind: "Skill",
          experience_level: experienceLevel,
        },
        accessToken
      )
    );
  }
}
