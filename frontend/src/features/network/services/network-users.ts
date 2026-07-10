import type { FounderContactProfile, NetworkType } from "@/features/network/types";

type BackendRole = "founder" | "developer";

type UserSummary = {
  id: string;
  email: string;
  role: BackendRole;
  first_name: string;
  last_name: string;
  country?: string | null;
  city?: string | null;
  avatar_url?: string | null;
  phone_verified: boolean;
};

type UserListResponse = {
  items: UserSummary[];
};

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  return baseUrl.replace(/\/+$/, "");
}

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("evolv_access_token");
}

export async function fetchNetworkPeople(viewerRole: BackendRole) {
  const token = getAccessToken();
  if (!token) throw new Error("Please sign in again to load real users.");

  const targetRole: BackendRole = viewerRole === "founder" ? "developer" : "founder";
  const url = `${getApiBaseUrl()}/users?role=${targetRole}&limit=100`;

  let response: Response;
  try {
    response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    throw new Error("Could not reach backend while loading users.");
  }

  if (!response.ok) throw new Error("Users could not be loaded.");
  const payload = (await response.json()) as UserListResponse;
  return payload.items.map(mapUserToNetworkProfile);
}

function mapUserToNetworkProfile(user: UserSummary): FounderContactProfile {
  const name = `${user.first_name} ${user.last_name}`.trim() || user.email;
  const type = toNetworkType(user.role);
  const roleLabel = type === "Developer" ? "Developer" : "Founder";
  const location = [user.city, user.country].filter(Boolean).join(", ");

  return {
    id: user.id,
    name,
    role: roleLabel,
    company: "Evolv",
    email: user.email,
    type,
    initials: getInitials(name),
    avatarColor: type === "Developer" ? "#428475" : "#7C5CBF",
    skills: [],
    experience: "",
    mutual: 0,
    location: location || "Location not added",
    connected: false,
    match: 0,
    availability: user.phone_verified ? "Phone verified" : "Phone not verified",
    focus: roleLabel,
    bio: `${name} is a verified Evolv ${roleLabel.toLowerCase()} account.`,
    highlights: [user.email],
    online: false,
  };
}

function toNetworkType(role: BackendRole): NetworkType {
  return role === "developer" ? "Developer" : "Founder";
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}
