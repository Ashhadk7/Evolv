export type BackendProjectStatus = "active" | "paused" | "completed" | "cancelled";
export type IssuePriority = "high" | "medium" | "low";
export type IssueStatus = "open" | "in_progress" | "in_review" | "resolved";
export type DeliverableStatus = "todo" | "in_progress" | "in_review" | "done";

export const DELIVERABLE_STATUS_LABEL: Record<DeliverableStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  in_review: "In review",
  done: "Done",
};
export type DeadlineStatus = "pending" | "met" | "missed";
export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "cancelled";
export type PaymentProvider = "manual" | "stripe";
export type MemberStatus = "invited" | "accepted" | "declined" | "revoked" | "removed";

/** A project no longer being worked on — shown apart from the active roster. */
export function isClosedStatus(status: BackendProjectStatus): boolean {
  return status === "completed" || status === "cancelled";
}

export function fmtCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
