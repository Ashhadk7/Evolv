import type { FounderEducation } from "@/features/founder-dashboard/profile-utils";

// Shared "wire" shapes: the exact JSON the backend serializes for education,
// certifications, and reviews. These come from a single Pydantic schema on the
// server, so the frontend keeps a single definition too — both the public
// network profile (network-api) and the user's own profile (profile-api) import
// from here instead of each redeclaring identical interfaces and mappers.
export interface WireEducation {
  id: string;
  level: string;
  degree: string | null;
  custom_degree: string | null;
  school: string;
}

export interface WireCertification {
  id: string;
  name: string;
  issuer: string;
  issue_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
}

export interface WireReview {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export const educationFromWire = (items: WireEducation[] = []): FounderEducation[] =>
  items.map((item) => ({
    id: item.id,
    level: item.level,
    degree: item.degree ?? "",
    customDegree: item.custom_degree ?? "",
    school: item.school,
  }));

export const reviewFromWire = (items: WireReview[] = []) =>
  items.map((item) => ({
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
