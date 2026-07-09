import type { FounderContactProfile } from "@/features/network/types";

export function formatProfileLink(value: string) {
  return value
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

export function getEmailUrl(value: string) {
  return value ? `mailto:${value}` : "";
}

export function getExternalUrl(value: string) {
  if (!value) return "";
  return value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
}

export function getProfileLinkedIn(profile: FounderContactProfile) {
  return profile.linkedin?.trim() || profile.linkedIn?.trim() || "";
}

export function getPublicProfileDomains(profile: FounderContactProfile) {
  const domains = Array.isArray(profile.domains)
    ? profile.domains.map((domain) => domain.trim()).filter(Boolean)
    : [];

  return domains.length ? domains : profile.skills;
}
