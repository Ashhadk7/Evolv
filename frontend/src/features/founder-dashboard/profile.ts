// ─────────────────────────────────────────────────────────────────────────────
// Founder profile: defaults, storage keys, and the merge logic.
// Extracted verbatim out of the 400-line FounderDashboard view so the profile
// rules live in one testable place (and can be reused by real routes later).
// ─────────────────────────────────────────────────────────────────────────────
import { normalizeFounderProfileForSave } from "@/features/founder-dashboard/profile-utils";
import type { FounderProfile } from "./types";

export const STORAGE_KEY_PROFILE = "evolv_founder_profile";
export const STORAGE_KEY_BLUEPRINTS = "evolv_founder_blueprints";

export const DEFAULT_FOUNDER_PROFILE: FounderProfile = {
  firstName: "",
  lastName: "",
  bio: "",
  domains: [],
  linkedin: "",
  dob: "",
  gender: "",
  phone: "",
  education: "",
  educationLevel: "",
  degreeName: "",
  degreeSelection: "",
  customDegreeName: "",
  educations: [],
  description: "",
  headline: "",
  location: "",
  country: "",
  countryCode: "",
  stateProvince: "",
  city: "",
  primaryGoal: "",
  email: "",
  avatarUrl: "",
  profileComplete: false,
  stripeConnected: false,
};

export type StoredFounderRecord = Partial<FounderProfile> & {
  profile?: Partial<FounderProfile>;
  role?: string;
};

export function mergeFounderProfiles(
  ...profiles: Array<Partial<FounderProfile> | null | undefined>
): FounderProfile {
  const merged: FounderProfile = { ...DEFAULT_FOUNDER_PROFILE, domains: [] };
  const target = merged as unknown as Record<string, unknown>;

  profiles.forEach((profile) => {
    if (!profile) return;

    Object.entries(profile).forEach(([key, value]) => {
      if (key === "idNumber") return;
      if (key === "domains") {
        if (Array.isArray(value) && value.length > 0) target.domains = value;
        return;
      }
      if (key === "educations") {
        if (Array.isArray(value) && value.length > 0) target.educations = value;
        return;
      }
      if (key === "profileComplete") {
        if (value === true) target.profileComplete = true;
        return;
      }
      if (typeof value === "string" && value.trim()) target[key] = value;
      else if (value !== undefined && value !== null && typeof value !== "string")
        target[key] = value;
    });
  });

  merged.domains = Array.isArray(merged.domains) ? merged.domains : [];
  merged.educations = Array.isArray(merged.educations) ? merged.educations : [];
  merged.bio = merged.bio || merged.headline || "";
  merged.description = merged.description || "";
  return normalizeFounderProfileForSave(merged) as FounderProfile;
}
