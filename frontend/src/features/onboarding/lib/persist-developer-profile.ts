import {
  normalizeDeveloperProfileForSave,
  type DeveloperProfile,
} from "@/features/developer-dashboard/profile-utils";

export function persistDeveloperProfile(profile: DeveloperProfile) {
  const normalized = normalizeDeveloperProfileForSave(profile);
  try {
    const raw = localStorage.getItem("evolv_user");
    const existing = raw ? JSON.parse(raw) : {};
    localStorage.setItem("evolv_user", JSON.stringify({ ...existing, ...normalized }));
  } catch {
    /* ignore */
  }
  return normalized;
}
