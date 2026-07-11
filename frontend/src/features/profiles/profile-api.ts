import { ApiError, apiFetch } from "@/lib/api";
import type { FounderProfile } from "@/features/founder-dashboard/types";
import type { DeveloperProfile, DeveloperCertification } from "@/features/developer-dashboard/profile-utils";
import type { FounderEducation } from "@/features/founder-dashboard/profile-utils";

interface WireEducation { id: string; level: string; degree: string | null; custom_degree: string | null; school: string }
interface WireReview { id: string; reviewer_name: string; rating: number; comment: string; created_at: string; updated_at: string }
interface AccountWire { email: string; first_name: string; last_name: string; phone: string | null; phone_verified: boolean; country: string | null; country_code: string | null; state_province: string | null; city: string | null; dob: string | null; gender: string | null; avatar_url: string | null }
interface FounderWire { headline: string | null; bio: string | null; description: string | null; linkedin: string | null; venture_stage: string | null; primary_goal: string | null; domains: string[]; profile_complete: boolean; stripe_connected: boolean; educations: WireEducation[] }
interface DeveloperWire { job_title: string | null; bio: string | null; experience_years: number | null; github: string | null; linkedin: string | null; portfolio_link: string | null; skills: string[]; rating_avg: number; profile_complete: boolean; educations: WireEducation[]; certifications: Array<{ id: string; name: string; issuer: string }>; reviews: WireReview[] }

const educationPayload = (items: FounderEducation[] = []) => items.filter((item) => item.level.trim()).map((item) => ({ level: item.level.trim(), degree: item.degree?.trim() || null, custom_degree: item.customDegree?.trim() || null, school: item.school?.trim() || "Not specified" }));
const educationFromWire = (items: WireEducation[]): FounderEducation[] => items.map((item) => ({ id: item.id, level: item.level, degree: item.degree ?? "", customDegree: item.custom_degree ?? "", school: item.school }));
const reviewsFromWire = (items: WireReview[] = []) => items.map((item) => ({ id: item.id, reviewer: item.reviewer_name, rating: item.rating, comment: item.comment, date: new Date(item.updated_at || item.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) }));

async function upsert<T>(path: string, body: unknown): Promise<T> {
  try { await apiFetch(path, { auth: true }); return await apiFetch<T>(path, { method: "PATCH", body, auth: true }); }
  catch (error) { if (error instanceof ApiError && error.status === 404) return apiFetch<T>(path, { method: "POST", body, auth: true }); throw error; }
}

export async function loadFounderProfile(): Promise<FounderProfile> {
  const account = await apiFetch<AccountWire>("/me", { auth: true });
  let data: FounderWire;
  try {
    data = await apiFetch<FounderWire>("/founder-profile", { auth: true });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) throw error;
    data = { headline: null, bio: null, description: null, linkedin: null, venture_stage: null, primary_goal: null, domains: [], profile_complete: false, stripe_connected: false, educations: [] };
  }
  return { firstName: account.first_name, lastName: account.last_name, email: account.email, headline: data.headline ?? "", bio: data.bio ?? "", description: data.description ?? "", linkedin: data.linkedin ?? "", ventureStage: data.venture_stage ?? "", primaryGoal: data.primary_goal ?? "", domains: data.domains, educations: educationFromWire(data.educations), education: "", dob: account.dob ?? "", gender: account.gender ?? "", phone: account.phone ?? "", country: account.country ?? "", countryCode: account.country_code ?? "", stateProvince: account.state_province ?? "", city: account.city ?? "", location: [account.city, account.country].filter(Boolean).join(", "), avatarUrl: account.avatar_url ?? "", profileComplete: data.profile_complete, stripeConnected: data.stripe_connected };
}

export async function saveFounderProfile(profile: FounderProfile): Promise<FounderProfile> {
  await apiFetch<AccountWire>("/me", { method: "PATCH", auth: true, body: { first_name: profile.firstName, last_name: profile.lastName, phone: profile.phone || null, country: profile.country || null, country_code: profile.countryCode || null, state_province: profile.stateProvince || null, city: profile.city || null, dob: profile.dob || null, gender: profile.gender || null, avatar_url: profile.avatarUrl || null } });
  await upsert<FounderWire>("/founder-profile", { headline: profile.headline?.trim() || null, bio: profile.bio?.trim() || null, description: profile.description?.trim() || null, linkedin: profile.linkedin?.trim() || null, venture_stage: profile.ventureStage?.trim() || null, primary_goal: profile.primaryGoal?.trim() || null, domains: profile.domains, profile_complete: Boolean(profile.profileComplete), educations: educationPayload(profile.educations) });
  return loadFounderProfile();
}

export async function loadDeveloperProfile(): Promise<DeveloperProfile> {
  const account = await apiFetch<AccountWire>("/me", { auth: true });
  let data: DeveloperWire;
  try {
    data = await apiFetch<DeveloperWire>("/developer-profile", { auth: true });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) throw error;
    data = { job_title: null, bio: null, experience_years: null, github: null, linkedin: null, portfolio_link: null, skills: [], rating_avg: 0, profile_complete: false, educations: [], certifications: [], reviews: [] };
  }
  return { firstName: account.first_name, lastName: account.last_name, email: account.email, phone: account.phone ?? "", country: account.country ?? "", city: account.city ?? "", avatarUrl: account.avatar_url ?? "", jobTitle: data.job_title ?? "", role: data.job_title ?? "", bio: data.bio ?? "", experience: data.experience_years?.toString() ?? "", github: data.github ?? "", linkedin: data.linkedin ?? "", linkedIn: data.linkedin ?? "", portfolioLink: data.portfolio_link ?? "", skills: data.skills, techStack: data.skills, skillEntries: data.skills.map((name, index) => ({ id: `api_skill_${index}`, kind: "Skill", name, experience: "" })), educations: educationFromWire(data.educations), certifications: data.certifications.map((item): DeveloperCertification => ({ id: item.id, name: item.name })), rating: Number(data.rating_avg) || 0, reviews: reviewsFromWire(data.reviews), profileComplete: data.profile_complete, firstTime: !data.profile_complete, location: [account.city, account.country].filter(Boolean).join(", ") };
}

export async function saveDeveloperProfile(profile: DeveloperProfile): Promise<DeveloperProfile> {
  const experience = Number.parseInt(profile.experience ?? "", 10);
  await apiFetch<AccountWire>("/me", { method: "PATCH", auth: true, body: { first_name: profile.firstName, last_name: profile.lastName, phone: profile.phone || null, country: profile.country || null, city: profile.city || null, avatar_url: profile.avatarUrl || null } });
  await upsert<DeveloperWire>("/developer-profile", { job_title: profile.jobTitle?.trim() || profile.role?.trim() || null, bio: profile.bio?.trim() || null, experience_years: Number.isFinite(experience) ? experience : null, github: profile.github?.trim() || null, linkedin: profile.linkedin?.trim() || profile.linkedIn?.trim() || null, portfolio_link: profile.portfolioLink?.trim() || null, skills: profile.techStack ?? profile.skills ?? [], profile_complete: Boolean(profile.profileComplete), educations: educationPayload(profile.educations), certifications: (profile.certifications ?? []).map((item) => ({ name: typeof item === "string" ? item : item.name, issuer: "Not specified", issue_date: null, credential_id: null, credential_url: null })) });
  return loadDeveloperProfile();
}
