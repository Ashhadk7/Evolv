import type { CurrentFounder, PersonType } from "@/features/messaging/types/inbox-types";

// Identical between founder and developer inboxes - shared source of truth.
export {
  getInitials,
  formatDate,
  formatTime,
  isIncomingRequest,
  isOutgoingPending,
  hasSentIntro,
} from "@/features/messaging/lib/inbox-shared-helpers";

export function getFounderName(currentUser?: CurrentFounder) {
  return `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() || "You";
}

export function roleToPersonType(role?: string, fallbackRole?: string): PersonType {
  const value = `${role ?? ""} ${fallbackRole ?? ""}`.toLowerCase();
  return value.includes("founder") ? "Founder" : "Developer";
}
