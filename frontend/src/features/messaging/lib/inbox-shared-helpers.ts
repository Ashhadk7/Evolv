// Inbox helpers that are byte-identical between the founder and developer
// inboxes. Role-specific logic (readStoredUsers, contactFromStoredUser,
// roleToPersonType, current-user name getters) stays in each role's own
// helpers file since the behavior genuinely differs.
import type { Contact, Message } from "@/features/messaging/types/inbox-types";

export function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function isIncomingRequest(contact: Contact) {
  return contact.requestDirection === "incoming" && contact.requestStatus !== "accepted";
}

export function isOutgoingPending(contact: Contact) {
  return contact.requestDirection === "outgoing" && contact.requestStatus === "pending";
}

export function hasSentIntro(thread: Message[]) {
  return thread.some((msg) => msg.from === "me");
}
