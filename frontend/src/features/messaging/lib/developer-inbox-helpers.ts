import type {
  Contact,
  CurrentDeveloper,
  PersonType,
  StoredAppUser,
} from "@/features/messaging/types/developer-inbox-types";
import { DEFAULT_DEVELOPER_USER } from "@/features/messaging/data/developer-inbox-mock-data";

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

export function roleToPersonType(role?: string, fallbackRole?: string): PersonType {
  const value = `${role ?? ""} ${fallbackRole ?? ""}`.toLowerCase();
  return value.includes("founder") || value.includes("ceo") || value.includes("cto")
    ? "Founder"
    : "Developer";
}

export function readStoredUsers() {
  try {
    const allUsers = JSON.parse(localStorage.getItem("evolv_users") ?? "[]");
    const currentUser = JSON.parse(localStorage.getItem("evolv_user") ?? "null");
    return [currentUser, ...(Array.isArray(allUsers) ? allUsers : [])].filter(
      Boolean
    ) as StoredAppUser[];
  } catch {
    return [];
  }
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
      ? user.profile?.headline || user.profile?.bio || "Founder"
      : user.profile?.jobTitle || user.jobTitle || user.profile?.role || "Developer";

  return {
    id: `user-${email.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    role,
    personType,
    match: personType === "Founder" ? 82 : 76,
    lastMsg: "New conversation",
    lastTime: "Now",
    unread: 0,
    initials: getInitials(name),
    online: false,
    email,
    avatarUrl:
      user.profile?.avatarUrl || user.avatarUrl || user.profile?.photo || user.profile?.image,
  };
}

export function getDeveloperUser(): CurrentDeveloper {
  if (typeof window === "undefined") return DEFAULT_DEVELOPER_USER;

  try {
    const user = JSON.parse(localStorage.getItem("evolv_user") ?? "null") as StoredAppUser | null;
    if (!user) return DEFAULT_DEVELOPER_USER;
    return {
      firstName: user.firstName || user.profile?.firstName || DEFAULT_DEVELOPER_USER.firstName,
      lastName: user.lastName || user.profile?.lastName || DEFAULT_DEVELOPER_USER.lastName,
      email: user.email || user.profile?.email,
      avatarUrl:
        user.avatarUrl || user.profile?.avatarUrl || user.profile?.photo || user.profile?.image,
    };
  } catch {
    return DEFAULT_DEVELOPER_USER;
  }
}

export function getDeveloperName(currentUser?: CurrentDeveloper) {
  return `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() || "You";
}
