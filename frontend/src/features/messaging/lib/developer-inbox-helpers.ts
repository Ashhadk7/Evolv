import type {
  CurrentDeveloper,
  PersonType,
  StoredAppUser,
} from "@/features/messaging/types/developer-inbox-types";

const EMPTY_DEVELOPER_USER: CurrentDeveloper = {
  firstName: "",
  lastName: "",
  email: "",
};

// Identical between founder and developer inboxes - shared source of truth.
export {
  getInitials,
  formatDate,
  formatTime,
  isIncomingRequest,
  isOutgoingPending,
  hasSentIntro,
} from "@/features/messaging/lib/inbox-shared-helpers";

export function roleToPersonType(role?: string, fallbackRole?: string): PersonType {
  const value = `${role ?? ""} ${fallbackRole ?? ""}`.toLowerCase();
  return value.includes("founder") || value.includes("ceo") || value.includes("cto")
    ? "Founder"
    : "Developer";
}

export function getDeveloperUser(): CurrentDeveloper {
  if (typeof window === "undefined") return EMPTY_DEVELOPER_USER;

  try {
    const user = JSON.parse(localStorage.getItem("evolv_user") ?? "null") as StoredAppUser | null;
    if (!user) return EMPTY_DEVELOPER_USER;
    return {
      firstName: user.firstName || user.profile?.firstName || EMPTY_DEVELOPER_USER.firstName,
      lastName: user.lastName || user.profile?.lastName || EMPTY_DEVELOPER_USER.lastName,
      email: user.email || user.profile?.email,
      avatarUrl:
        user.avatarUrl || user.profile?.avatarUrl || user.profile?.photo || user.profile?.image,
    };
  } catch {
    return EMPTY_DEVELOPER_USER;
  }
}

export function getDeveloperName(currentUser?: CurrentDeveloper) {
  return `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() || "You";
}
