import { ApiError, apiFetch } from "@/lib/api";
import type { FounderProfile } from "@/features/founder-dashboard/types";
import type {
  DeveloperProfile,
  DeveloperCertification,
  DeveloperSkillEntry,
} from "@/features/developer-dashboard/profile-utils";
import type { FounderEducation } from "@/features/founder-dashboard/profile-utils";
import {
  DEFAULT_RATE_CURRENCY,
  DEFAULT_RATE_PERIOD,
  formatRate,
  parseRateForm,
} from "@/features/profiles/developer-rate";
import {
  type WireEducation,
  type WireCertification,
  type WireReview,
  certificationFromWire,
  educationFromWire,
  reviewFromWire,
} from "@/features/profiles/lib/profile-wire";

interface AccountWire { email: string; first_name: string; last_name: string; phone: string | null; phone_verified: boolean; country: string | null; country_code: string | null; state_province: string | null; city: string | null; dob: string | null; gender: string | null; avatar_url: string | null }
interface FounderWire {
  headline: string | null;
  bio: string | null;
  description: string | null;
  linkedin: string | null;
  venture_stage: string | null;
  primary_goal: string | null;
  domains: string[];
  profile_complete: boolean;
  stripe_connected: boolean;
  billing_plan: string | null;
  billing_email: string | null;
  billing_currency: string | null;
  billing_budget_range: string | null;
  payment_method: string | null;
  billing_company_name: string | null;
  educations: WireEducation[];
}
interface DeveloperSkillEntryWire {
  id?: string | null;
  kind?: string | null;
  name: string;
  experience?: string | null;
}
interface DeveloperWire {
  job_title: string | null;
  bio: string | null;
  experience_years: number | null;
  availability: boolean;
  open_to_remote: boolean;
  preferred_budget: string | null;
  rate_amount: number | null;
  rate_period: string | null;
  rate_currency: string | null;
  github: string | null;
  linkedin: string | null;
  portfolio_link: string | null;
  skills: string[];
  tags: string[];
  skill_entries: DeveloperSkillEntryWire[];
  rating_avg: number;
  profile_complete: boolean;
  educations: WireEducation[];
  certifications: WireCertification[];
  reviews: WireReview[];
}
interface SaveProfileOptions { reload?: boolean; preferCreate?: boolean; saveAccount?: boolean }

const educationPayload = (items: FounderEducation[] = []) => items.filter((item) => item.level.trim()).map((item) => ({ level: item.level.trim(), degree: item.degree?.trim() || null, custom_degree: item.customDegree?.trim() || null, school: item.school?.trim() || "Not specified" }));

const developerSkillEntriesFromWire = (
  items: DeveloperSkillEntryWire[] = [],
  fallbackSkills: string[] = []
): DeveloperSkillEntry[] => {
  const entries = items
    .filter((item) => item.name?.trim())
    .map((item, index) => ({
      id: item.id || `api_skill_${index}_${item.name}`,
      kind: item.kind || "Skill",
      name: item.name.trim(),
      experience: item.experience ?? "",
    }));

  if (entries.length) return entries;

  return fallbackSkills
    .filter((skill) => skill.trim())
    .map((name, index) => ({
      id: `api_skill_${index}_${name}`,
      kind: "Skill",
      name: name.trim(),
      experience: "",
    }));
};

const developerSkillEntriesPayload = (profile: DeveloperProfile) => {
  const entries = Array.isArray(profile.skillEntries) ? profile.skillEntries : [];
  const normalizedEntries = entries
    .filter((entry) => entry.name?.trim())
    .map((entry, index) => ({
      id: entry.id || `skill_${index}`,
      kind: entry.kind?.trim() || "Skill",
      name: entry.name.trim(),
      experience: entry.experience?.trim() || null,
    }));

  if (normalizedEntries.length) return normalizedEntries;

  const fallbackSkills = Array.isArray(profile.techStack)
    ? profile.techStack
    : Array.isArray(profile.skills)
      ? profile.skills
      : [];

  return fallbackSkills
    .filter((skill) => skill.trim())
    .map((name, index) => ({
      id: `skill_${index}_${name}`,
      kind: "Skill",
      name: name.trim(),
      experience: null,
    }));
};

const certificationPayload = (items: Array<string | DeveloperCertification> = []) =>
  items
    .map((item) => ({
      name: typeof item === "string" ? item : item.name,
      image_url: typeof item === "string" ? null : item.image || null,
    }))
    .filter((item) => item.name?.trim())
    .map((item) => ({
      name: item.name.trim(),
      issuer: "Not specified",
      issue_date: null,
      credential_id: null,
      credential_url: null,
      image_url: item.image_url,
    }));

export async function uploadAvatar(blob: Blob): Promise<string> {
  const form = new FormData();
  form.append("file", blob, "avatar.jpg");
  const account = await apiFetch<{ avatar_url: string | null }>("/me/avatar", {
    method: "POST",
    body: form,
    auth: true,
  });
  return account.avatar_url ?? "";
}

export async function removeAvatar(): Promise<void> {
  await apiFetch("/me/avatar", { method: "DELETE", auth: true });
}

export async function uploadCertificationImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file, file.name || "certificate");
  const { image_url } = await apiFetch<{ image_url: string }>("/me/certifications/image", {
    method: "POST",
    body: form,
    auth: true,
  });
  return image_url;
}

async function upsert<T>(
  path: string,
  body: unknown,
  { preferCreate = false }: Pick<SaveProfileOptions, "preferCreate"> = {}
): Promise<T> {
  const firstMethod = preferCreate ? "POST" : "PATCH";
  const retryMethod = preferCreate ? "PATCH" : "POST";
  const retryStatus = preferCreate ? 409 : 404;

  try {
    return await apiFetch<T>(path, { method: firstMethod, body, auth: true });
  } catch (error) {
    if (error instanceof ApiError && error.status === retryStatus) {
      return apiFetch<T>(path, { method: retryMethod, body, auth: true });
    }
    throw error;
  }
}

function experienceYearsFrom(value: string | undefined): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("<")) return 0;
  const match = trimmed.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : null;
}

function avatarUrlForAccountPatch(value: string | undefined): string | null | undefined {
  if (!value) return null;
  return value.startsWith("data:") ? undefined : value;
}

export async function loadFounderProfile(): Promise<FounderProfile> {
  const account = await apiFetch<AccountWire>("/me", { auth: true });
  let data: FounderWire;
  try {
    data = await apiFetch<FounderWire>("/founder-profile", { auth: true });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) throw error;
    data = {
      headline: null,
      bio: null,
      description: null,
      linkedin: null,
      venture_stage: null,
      primary_goal: null,
      domains: [],
      profile_complete: false,
      stripe_connected: false,
      billing_plan: null,
      billing_email: null,
      billing_currency: null,
      billing_budget_range: null,
      payment_method: null,
      billing_company_name: null,
      educations: [],
    };
  }
  return {
    firstName: account.first_name,
    lastName: account.last_name,
    email: account.email,
    headline: data.headline ?? "",
    bio: data.bio ?? "",
    description: data.description ?? "",
    linkedin: data.linkedin ?? "",
    ventureStage: data.venture_stage ?? "",
    primaryGoal: data.primary_goal ?? "",
    domains: data.domains,
    educations: educationFromWire(data.educations),
    education: "",
    dob: account.dob ?? "",
    gender: account.gender ?? "",
    phone: account.phone ?? "",
    phoneVerified: account.phone_verified,
    country: account.country ?? "",
    countryCode: account.country_code ?? "",
    stateProvince: account.state_province ?? "",
    city: account.city ?? "",
    location: [account.city, account.country].filter(Boolean).join(", "),
    avatarUrl: account.avatar_url ?? "",
    profileComplete: data.profile_complete,
    stripeConnected: data.stripe_connected,
    billingPlan: data.billing_plan ?? "",
    billingEmail: data.billing_email ?? "",
    billingCurrency: data.billing_currency ?? "",
    billingBudgetRange: data.billing_budget_range ?? "",
    paymentMethod: data.payment_method ?? "",
    billingCompanyName: data.billing_company_name ?? "",
  };
}

export async function saveFounderProfile(
  profile: FounderProfile,
  options: SaveProfileOptions = {}
): Promise<FounderProfile> {
  if (options.saveAccount !== false) {
    const avatarUrl = avatarUrlForAccountPatch(profile.avatarUrl);
    await apiFetch<AccountWire>("/me", {
      method: "PATCH",
      auth: true,
      body: {
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone || null,
        country: profile.country || null,
        country_code: profile.countryCode || null,
        state_province: profile.stateProvince || null,
        city: profile.city || null,
        dob: profile.dob || null,
        gender: profile.gender || null,
        ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
      },
    });
  }
  await upsert<FounderWire>(
    "/founder-profile",
    {
      headline: profile.headline?.trim() || null,
      bio: profile.bio?.trim() || null,
      description: profile.description?.trim() || null,
      linkedin: profile.linkedin?.trim() || null,
      venture_stage: profile.ventureStage?.trim() || null,
      primary_goal: profile.primaryGoal?.trim() || null,
      domains: profile.domains,
      profile_complete: Boolean(profile.profileComplete),
      stripe_connected: Boolean(profile.stripeConnected),
      billing_plan: profile.billingPlan?.trim() || null,
      billing_email: profile.billingEmail?.trim() || null,
      billing_currency: profile.billingCurrency?.trim() || null,
      billing_budget_range: profile.billingBudgetRange?.trim() || null,
      payment_method: profile.paymentMethod?.trim() || null,
      billing_company_name: profile.billingCompanyName?.trim() || null,
      educations: educationPayload(profile.educations),
    },
    { preferCreate: options.preferCreate }
  );
  return options.reload === false ? profile : loadFounderProfile();
}

export async function loadDeveloperProfile(): Promise<DeveloperProfile> {
  const account = await apiFetch<AccountWire>("/me", { auth: true });
  let data: DeveloperWire;
  try {
    data = await apiFetch<DeveloperWire>("/developer-profile", { auth: true });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) throw error;
    data = { job_title: null, bio: null, experience_years: null, availability: true, open_to_remote: false, preferred_budget: null, rate_amount: null, rate_period: null, rate_currency: null, github: null, linkedin: null, portfolio_link: null, skills: [], tags: [], skill_entries: [], rating_avg: 0, profile_complete: false, educations: [], certifications: [], reviews: [] };
  }
  const experienceYears = data.experience_years?.toString() ?? "";
  const skillEntries = developerSkillEntriesFromWire(data.skill_entries, data.skills);
  const skills = data.skills.length ? data.skills : skillEntries.map((entry) => entry.name);

  return {
    firstName: account.first_name,
    lastName: account.last_name,
    email: account.email,
    phone: account.phone ?? "",
    phoneVerified: account.phone_verified,
    country: account.country ?? "",
    city: account.city ?? "",
    avatarUrl: account.avatar_url ?? "",
    jobTitle: data.job_title ?? "",
    role: data.job_title ?? "",
    bio: data.bio ?? "",
    experience: experienceYears,
    experienceYears,
    availability: data.availability,
    openToRemote: data.open_to_remote,
    preferredBudget: data.preferred_budget ?? "",
    rateAmount: data.rate_amount ? String(data.rate_amount) : "",
    ratePeriod: data.rate_period ?? DEFAULT_RATE_PERIOD,
    rateCurrency: data.rate_currency ?? DEFAULT_RATE_CURRENCY,
    github: data.github ?? "",
    linkedin: data.linkedin ?? "",
    linkedIn: data.linkedin ?? "",
    portfolioLink: data.portfolio_link ?? "",
    tags: data.tags ?? [],
    skills,
    techStack: skills,
    skillEntries,
    educations: educationFromWire(data.educations),
    certifications: certificationFromWire(data.certifications),
    rating: Number(data.rating_avg) || 0,
    reviews: reviewFromWire(data.reviews),
    profileComplete: data.profile_complete,
    firstTime: !data.profile_complete,
    location: [account.city, account.country].filter(Boolean).join(", "),
  };
}

export async function saveDeveloperProfile(
  profile: DeveloperProfile,
  options: SaveProfileOptions = {}
): Promise<DeveloperProfile> {
  const experience = experienceYearsFrom(profile.experienceYears ?? profile.experience);
  const skillEntries = developerSkillEntriesPayload(profile);
  const skills = skillEntries.map((entry) => entry.name);
  if (options.saveAccount !== false) {
    const avatarUrl = avatarUrlForAccountPatch(profile.avatarUrl);
    await apiFetch<AccountWire>("/me", { method: "PATCH", auth: true, body: { first_name: profile.firstName, last_name: profile.lastName, phone: profile.phone || null, country: profile.country || null, city: profile.city || null, ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}) } });
  }
  const developerRate = parseRateForm(profile.rateAmount, profile.ratePeriod, profile.rateCurrency);
  await upsert<DeveloperWire>("/developer-profile", { job_title: profile.jobTitle?.trim() || profile.role?.trim() || null, bio: profile.bio?.trim() || null, experience_years: experience, availability: typeof profile.availability === "boolean" ? profile.availability : true, open_to_remote: profile.openToRemote ?? false, preferred_budget: formatRate(developerRate) || profile.preferredBudget?.trim() || null, rate_amount: developerRate?.amount ?? null, rate_period: developerRate?.period ?? null, rate_currency: developerRate?.currency ?? null, github: profile.github?.trim() || null, linkedin: profile.linkedin?.trim() || profile.linkedIn?.trim() || null, portfolio_link: profile.portfolioLink?.trim() || null, skills, tags: Array.isArray(profile.tags) ? profile.tags.filter((tag) => tag.trim()) : [], skill_entries: skillEntries, profile_complete: Boolean(profile.profileComplete), educations: educationPayload(profile.educations), certifications: certificationPayload(profile.certifications) }, { preferCreate: options.preferCreate });
  return options.reload === false ? profile : loadDeveloperProfile();
}
