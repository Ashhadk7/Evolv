import type { NetworkReview } from "@/features/network/types";

export const REVIEW_STORAGE_KEY = "evolv_founder_network_reviews";

export function loadStoredReviews(profileId: string): NetworkReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, NetworkReview[]>) : {};
    return Array.isArray(parsed[profileId]) ? parsed[profileId] : [];
  } catch {
    return [];
  }
}

export function saveStoredReviews(profileId: string, reviews: NetworkReview[]) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, NetworkReview[]>) : {};
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify({ ...parsed, [profileId]: reviews }));
  } catch {
    /* ignore storage errors */
  }
}
