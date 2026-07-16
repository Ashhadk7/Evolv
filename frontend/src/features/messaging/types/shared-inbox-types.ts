// Inbox types shared verbatim (or as a strict superset) between the founder
// and developer inboxes. Each role's own types file re-exports these under
// its existing names so no call site has to change.
export type PersonType = "Founder" | "Developer";
export type InboxFilter = "general" | "unread" | "requests" | "pending";
export type RequestStatus = "pending" | "accepted" | "rejected";
export type RequestDirection = "incoming" | "outgoing";

export interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  date: string;
  subject?: string;
}

export interface Contact {
  id: string;
  participantId?: string;
  name: string;
  role: string;
  personType: PersonType;
  match: number;
  lastMsg: string;
  lastTime: string;
  unread: number;
  initials: string;
  online: boolean;
  email?: string;
  avatarUrl?: string;
  subject?: string;
  requestStatus?: RequestStatus;
  requestDirection?: RequestDirection;
}

// Contact passed from Network → Inbox when starting a conversation.
export interface InboxLaunchContact {
  id: string;
  conversationId?: string;
  participantId?: string;
  name: string;
  role: string;
  match?: number;
  initials?: string;
  online?: boolean;
  email?: string;
  avatarUrl?: string;
  personType?: PersonType;
  requestStatus?: RequestStatus;
  requestDirection?: RequestDirection;
  initialMessage?: string;
  subject?: string;
}

export interface CurrentInboxUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
}

// Superset of the founder and developer `profile` shapes stored under
// `evolv_users` / `evolv_user` — every field is optional either way, so a
// shared superset is safe for both roles' `readStoredUsers`/`contactFromStoredUser`.
export interface StoredProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  jobTitle?: string;
  headline?: string;
  bio?: string;
  location?: string;
  primaryGoal?: string;
  avatarUrl?: string;
  photo?: string;
  image?: string;
}

export interface StoredAppUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  jobTitle?: string;
  avatarUrl?: string;
  profile?: StoredProfile;
}
