import { apiFetch } from "@/lib/api";
import type { FounderContactProfile } from "@/features/network/types";

interface MatchedDeveloperResponse {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  job_title: string | null;
  skills: string[];
  experience_years: number | null;
  availability: boolean;
  open_to_remote: boolean;
  rating_avg: number;
  rate: { amount: number; period: string; currency: string } | null;
  match_score: number;
  semantic_score?: number | null;
}

interface MatchListResponse {
  total: number;
  items: MatchedDeveloperResponse[];
}

interface RoleMatchResponse {
  role_title: string;
  required_skills: string[];
  total_matches: number;
  matches: MatchedDeveloperResponse[];
}

export interface BlueprintMatchesResponse {
  blueprint_id: string;
  blueprint_name: string | null;
  total_roles: number;
  roles: RoleMatchResponse[];
}

function initialsFor(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "D";
}

function formatRate(rate: MatchedDeveloperResponse["rate"]): string | undefined {
  if (!rate) return undefined;
  return `${rate.currency} ${rate.amount.toLocaleString("en-US")}/${rate.period}`;
}

export function matchedDeveloperToProfile(dev: MatchedDeveloperResponse): FounderContactProfile {
  const name = `${dev.first_name} ${dev.last_name}`.trim();
  const experienceLabel = dev.experience_years != null ? `${dev.experience_years} yrs` : "";

  return {
    id: dev.user_id,
    name,
    role: dev.job_title ?? "Developer",
    company: "",
    type: "Developer",
    initials: initialsFor(dev.first_name, dev.last_name),
    avatarColor: "#2e7d5c",
    avatarUrl: dev.avatar_url ?? undefined,
    skills: dev.skills,
    tags: dev.skills,
    skillEntries: dev.skills.map((skill, index) => ({
      id: `match_skill_${index}_${skill}`,
      kind: "Skill",
      name: skill,
      experience: experienceLabel,
    })),
    experience: experienceLabel,
    rateLabel: formatRate(dev.rate),
    experienceYears: dev.experience_years?.toString(),
    mutual: 0,
    location: dev.open_to_remote ? "Remote" : "",
    connected: false,
    match: dev.match_score,
    availability: dev.availability ? "Available" : "Unavailable",
    focus: dev.skills.join(", "),
    bio: "",
    highlights: dev.skills.slice(0, 3),
    rating: Number(dev.rating_avg) || 0,
    reviews: [],
    online: false,
  };
}

export async function fetchMatchingDevelopers(
  skills: string[],
  options: { minExperience?: number; limit?: number } = {}
): Promise<FounderContactProfile[]> {
  const { minExperience = 0, limit = 10 } = options;
  const params = new URLSearchParams({
    skills: skills.join(","),
    min_experience: String(minExperience),
    limit: String(limit),
  });
  const response = await apiFetch<MatchListResponse>(`/matching?${params.toString()}`, {
    auth: true,
  });
  return response.items.map(matchedDeveloperToProfile);
}

export async function fetchBlueprintMatches(
  blueprintId: string,
  options: { minExperience?: number; limit?: number } = {}
): Promise<BlueprintMatchesResponse> {
  const { minExperience = 0, limit = 10 } = options;
  const params = new URLSearchParams({
    min_experience: String(minExperience),
    limit: String(limit),
  });
  return apiFetch<BlueprintMatchesResponse>(
    `/blueprints/${blueprintId}/matches?${params.toString()}`,
    { auth: true }
  );
}
