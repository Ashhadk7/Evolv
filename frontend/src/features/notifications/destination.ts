import type { AppNotif } from "./types";

const KEYS = ["projectId", "issueId", "deadlineId", "deliverableId", "memberId"] as const;
const PARAM: Record<(typeof KEYS)[number], string> = {
  projectId: "project",
  issueId: "issue",
  deadlineId: "deadline",
  deliverableId: "deliverable",
  memberId: "member",
};

/**
 * Resolve a notification to a navigable destination.
 *
 * Falls back to the bare tab when the backend sent no payload, so notifications
 * created before deep-linking existed still navigate somewhere sensible.
 */
export function notificationDestination(notif: AppNotif): string {
  const payload = notif.payload;
  if (!payload) return notif.tab;

  const params = new URLSearchParams();
  for (const key of KEYS) {
    const value = payload[key];
    if (typeof value === "string" && value) params.set(PARAM[key], value);
  }

  const query = params.toString();
  return query ? `${notif.tab}?${query}` : notif.tab;
}
