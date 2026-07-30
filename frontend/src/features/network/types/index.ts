import type {
  DeveloperCertification,
  DeveloperEducation,
  DeveloperSkillEntry,
} from "@/features/developer-dashboard/profile-utils";

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
  avatarUrl?: string;
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
  rateLabel?: string;
  reviews?: NetworkReview[];
  online?: boolean;
}

export interface NetworkMessageTarget {
  id: string;
  conversationId?: string;
  participantId?: string;
  name: string;
  role: string;
  match: number;
  initials: string;
  online?: boolean;
  personType?: "Founder" | "Developer";
  email?: string;
  avatarUrl?: string;
  requestStatus?: "pending" | "accepted" | "rejected";
  requestDirection?: "incoming" | "outgoing";
  initialMessage?: string;
  subject?: string;
}

export type FounderNetworkMessageTarget = NetworkMessageTarget;
export type DeveloperNetworkMessageTarget = NetworkMessageTarget;

export type NetworkTabFilter = "all" | "developers" | "founders";

export interface StoredNetworkState {
  connected: Record<string, boolean>;
  pendingIds: string[];
  ignoredIds: string[];
  outgoingIds: string[];
  requestNotes: Record<string, string>;
}
