import { apiFetch } from "@/lib/api";
import { getSession } from "@/features/auth/lib/session";
import type { FounderContactProfile, NetworkReview } from "@/features/network/types";
import type { DeveloperCertification } from "@/features/developer-dashboard/profile-utils";
import type { FounderEducation } from "@/features/founder-dashboard/profile-utils";

interface WireEducation { id: string; level: string; degree: string | null; custom_degree: string | null; school: string }
interface WireCertification { id: string; name: string; issuer: string; issue_date?: string | null; credential_id?: string | null; credential_url?: string | null }
interface WireReview { id: string; reviewer_name: string; rating: number; comment: string; created_at: string; updated_at: string }
interface UserSummary { id: string; email: string; role: "founder" | "developer"; first_name: string; last_name: string; city: string | null; country: string | null; avatar_url: string | null; phone_verified: boolean; profile_title: string | null; profile_bio: string | null; profile_complete: boolean; discovery_tags: string[] }
interface PublicFounderProfile { headline: string | null; bio: string | null; description: string | null; linkedin: string | null; venture_stage: string | null; primary_goal: string | null; domains: string[]; profile_complete: boolean; educations: WireEducation[] }
interface PublicDeveloperProfile { job_title: string | null; bio: string | null; experience_years: number | null; availability: boolean; open_to_remote: boolean; preferred_budget: string | null; github: string | null; linkedin: string | null; portfolio_link: string | null; skills: string[]; rating_avg: number; profile_complete: boolean; educations: WireEducation[]; certifications: WireCertification[]; reviews: WireReview[] }
interface PublicUserProfile extends UserSummary { founder_profile: PublicFounderProfile | null; developer_profile: PublicDeveloperProfile | null }
interface ConnectionRecord { id: string; status: "pending" | "accepted" | "ignored" | "rejected"; note: string | null; user: { id: string } }

export interface NetworkConnectionState {
  connectedIds: string[];
  incomingIds: string[];
  outgoingIds: string[];
  connectionIdByUser: Record<string, string>;
  requestNotes: Record<string, string>;
}

export async function loadNetworkConnections(): Promise<NetworkConnectionState> {
  const [accepted, incoming, outgoing] = await Promise.all([
    apiFetch<ConnectionRecord[]>("/connections", { auth: true }),
    apiFetch<ConnectionRecord[]>("/connections/incoming", { auth: true }),
    apiFetch<ConnectionRecord[]>("/connections/outgoing", { auth: true }),
  ]);
  const all = [...accepted, ...incoming, ...outgoing];
  return {
    connectedIds: accepted.map((item) => item.user.id),
    incomingIds: incoming.map((item) => item.user.id),
    outgoingIds: outgoing.map((item) => item.user.id),
    connectionIdByUser: Object.fromEntries(all.map((item) => [item.user.id, item.id])),
    requestNotes: Object.fromEntries(all.map((item) => [item.user.id, item.note ?? ""])),
  };
}

export const connectionApi = {
  send: (receiverId: string, note?: string) => apiFetch<ConnectionRecord>("/connections", { method: "POST", auth: true, body: { receiver_id: receiverId, note: note?.trim() || null } }),
  respond: (connectionId: string, status: "accepted" | "ignored") => apiFetch<ConnectionRecord>(`/connections/${connectionId}`, { method: "PATCH", auth: true, body: { status } }),
  remove: (connectionId: string) => apiFetch(`/connections/${connectionId}`, { method: "DELETE", auth: true }),
};

function initialsFor(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
}

function educationFromWire(items: WireEducation[] = []): FounderEducation[] {
  return items.map((item) => ({
    id: item.id,
    level: item.level,
    degree: item.degree ?? "",
    customDegree: item.custom_degree ?? "",
    school: item.school,
  }));
}

function certificationFromWire(items: WireCertification[] = []): DeveloperCertification[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
  }));
}

function reviewFromWire(items: WireReview[] = []): NetworkReview[] {
  return items.map((item) => ({
    id: item.id,
    reviewer: item.reviewer_name,
    rating: item.rating,
    comment: item.comment,
    date: new Date(item.updated_at || item.created_at).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));
}

function personFromUser(user: UserSummary | PublicUserProfile): FounderContactProfile {
  const developerProfile = "developer_profile" in user ? user.developer_profile : null;
  const founderProfile = "founder_profile" in user ? user.founder_profile : null;
  const isDeveloper = user.role === "developer";
  const name = `${user.first_name} ${user.last_name}`.trim();
  const skills = developerProfile?.skills ?? founderProfile?.domains ?? user.discovery_tags;
  const role =
    developerProfile?.job_title ??
    founderProfile?.headline ??
    user.profile_title ??
    (isDeveloper ? "Developer" : "Founder");
  const bio = developerProfile?.bio ?? founderProfile?.bio ?? user.profile_bio ?? "";
  const educations = educationFromWire(developerProfile?.educations ?? founderProfile?.educations ?? []);
  const experience =
    developerProfile?.experience_years != null
      ? `${developerProfile.experience_years} yrs`
      : founderProfile?.venture_stage ?? "";
  const founderFocus = [founderProfile?.primary_goal, founderProfile?.venture_stage]
    .filter(Boolean)
    .join(" - ");

  return {
    id: user.id,
    name,
    email: user.email,
    role,
    company: "",
    type: isDeveloper ? "Developer" : "Founder",
    initials: initialsFor(user.first_name, user.last_name),
    avatarColor: "#2e7d5c",
    avatarUrl: user.avatar_url ?? undefined,
    skills,
    domains: founderProfile?.domains ?? user.discovery_tags,
    tags: skills,
    skillEntries: skills.map((skill, index) => ({
      id: `api_skill_${index}_${skill}`,
      kind: "Skill",
      name: skill,
      experience: "",
    })),
    experience,
    experienceYears: developerProfile?.experience_years?.toString(),
    mutual: 0,
    location: [user.city, user.country].filter(Boolean).join(", "),
    connected: false,
    match: 0,
    availability: isDeveloper
      ? developerProfile?.availability === false
        ? "Unavailable"
        : "Available"
      : founderProfile?.venture_stage ?? "",
    focus: skills.join(", ") || founderFocus || bio,
    bio,
    educations,
    education: "",
    github: developerProfile?.github ?? "",
    linkedin: developerProfile?.linkedin ?? founderProfile?.linkedin ?? "",
    linkedIn: developerProfile?.linkedin ?? founderProfile?.linkedin ?? "",
    portfolioLink: developerProfile?.portfolio_link ?? "",
    certifications: certificationFromWire(developerProfile?.certifications ?? []),
    highlights: [founderProfile?.primary_goal, founderProfile?.venture_stage, ...skills]
      .filter((item): item is string => Boolean(item)),
    rating: developerProfile ? Number(developerProfile.rating_avg) || 0 : undefined,
    reviews: developerProfile ? reviewFromWire(developerProfile.reviews) : undefined,
    online: false,
  };
}

export async function loadNetworkPeople(): Promise<FounderContactProfile[]> {
  const response = await apiFetch<{ items: UserSummary[] }>("/users?limit=100&offset=0", { auth: true });
  const currentUserId = getSession()?.user.id;
  return response.items.filter((user) => user.id !== currentUserId).map(personFromUser);
}

export async function loadNetworkProfile(userId: string): Promise<FounderContactProfile> {
  const response = await apiFetch<PublicUserProfile>(`/users/${userId}/profile`, { auth: true });
  return personFromUser(response);
}

export async function saveDeveloperReview(
  userId: string,
  payload: { rating: number; comment: string }
): Promise<NetworkReview> {
  const response = await apiFetch<WireReview>(`/users/${userId}/developer-reviews`, {
    method: "POST",
    auth: true,
    body: payload,
  });
  return reviewFromWire([response])[0];
}
