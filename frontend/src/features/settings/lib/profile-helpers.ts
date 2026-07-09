import type { FounderProfile } from "@/features/founder-dashboard/types";

export function getProfileName(profile: FounderProfile) {
  return `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "Founder Profile";
}

export function getProfileInitials(profile: FounderProfile) {
  return `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() || "F";
}

export function normalizeUrl(value: string) {
  if (!value.trim()) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
