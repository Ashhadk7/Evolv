import type {
  DeveloperCertification,
  DeveloperEducation,
  DeveloperSkillEntry,
} from "@/features/developer-dashboard/profile-utils";

// ── Network profile types and data ────────────────────────────────────────────
export type NetworkType = "Developer" | "Founder";

export interface NetworkReview {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FounderContactProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  email?: string;
  type: NetworkType;
  initials: string;
  avatarColor: string;
  skills: string[];
  domains?: string[];
  tags?: string[];
  skillEntries?: DeveloperSkillEntry[];
  experience: string;
  experienceYears?: string;
  mutual: number;
  location: string;
  connected: boolean;
  match: number;
  availability: string;
  focus: string;
  bio: string;
  education?: string;
  educations?: DeveloperEducation[];
  github?: string;
  linkedin?: string;
  linkedIn?: string;
  portfolioLink?: string;
  certifications?: Array<string | DeveloperCertification>;
  highlights: string[];
  rating?: number;
  reviews?: NetworkReview[];
  online?: boolean;
}

// Target passed from Network → Inbox when starting a conversation with a contact.
// Identical for both roles, so founder/developer call sites share one shape;
// the two names are kept as aliases so neither role has to change its imports.
export interface NetworkMessageTarget {
  id: string;
  name: string;
  role: string;
  match: number;
  initials: string;
  online?: boolean;
  personType?: "Founder" | "Developer";
  requestStatus?: "pending";
  requestDirection?: "outgoing";
  initialMessage?: string;
  subject?: string;
}

export type FounderNetworkMessageTarget = NetworkMessageTarget;
export type DeveloperNetworkMessageTarget = NetworkMessageTarget;

// ── Shared network tab state ──────────────────────────────────────────────────
// Identical between the founder and developer network tabs; role differences
// live in the storage config (see features/network/lib/network-storage.ts),
// not in this shape.
export type NetworkTabFilter = "all" | "developers" | "founders";

export interface StoredNetworkState {
  connected: Record<string, boolean>;
  pendingIds: string[];
  ignoredIds: string[];
  outgoingIds: string[];
  requestNotes: Record<string, string>;
}
