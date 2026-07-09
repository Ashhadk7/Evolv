import type {
  Contact,
  CurrentFounder,
  PersonType,
  StoredAppUser,
} from "@/features/messaging/types/inbox-types";

// Identical between founder and developer inboxes — shared source of truth.
export {
  getInitials,
  formatDate,
  formatTime,
  isIncomingRequest,
  isOutgoingPending,
  hasSentIntro,
} from "@/features/messaging/lib/inbox-shared-helpers";
import { getInitials } from "@/features/messaging/lib/inbox-shared-helpers";

export function getFounderName(currentUser?: CurrentFounder) {
  return `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() || "You";
}

export function readStoredUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem("evolv_users") ?? "[]");
    return Array.isArray(parsed) ? (parsed as StoredAppUser[]) : [];
  } catch {
    return [];
  }
}

export function roleToPersonType(role?: string, fallbackRole?: string): PersonType {
  const value = `${role ?? ""} ${fallbackRole ?? ""}`.toLowerCase();
  return value.includes("founder") ? "Founder" : "Developer";
}

export function contactFromStoredUser(user: StoredAppUser): Contact | null {
  const email = user.email || user.profile?.email;
  if (!email) return null;

  const name =
    `${user.profile?.firstName ?? user.firstName ?? ""} ${user.profile?.lastName ?? user.lastName ?? ""}`.trim() ||
    email.split("@")[0];
  const personType = roleToPersonType(user.role, user.profile?.role);
  const role =
    personType === "Founder"
      ? user.profile?.headline || user.profile?.primaryGoal || user.profile?.bio || "Founder"
      : user.profile?.jobTitle || user.profile?.role || user.profile?.bio || "Developer";

  return {
    id: `user-${email.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    role,
    personType,
    match: personType === "Developer" ? 82 : 72,
    lastMsg: "New conversation",
    lastTime: "Now",
    unread: 0,
    initials: getInitials(name),
    online: false,
    email,
    avatarUrl: user.profile?.avatarUrl || user.profile?.photo || user.profile?.image,
  };
}
