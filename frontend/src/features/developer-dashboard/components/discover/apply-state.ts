import type { Opportunity } from "./types";

export function canApply(opportunity: Opportunity): boolean {
  return !opportunity.applied && opportunity.engagementStatus === null;
}

export function applyButtonLabel(
  opportunity: Opportunity,
  mode: "short" | "long" = "short"
): string {
  if (opportunity.engagementStatus === "accepted") return "Already working";
  if (opportunity.engagementStatus === "invited") return "Invite pending";
  if (opportunity.engagementStatus === "countered") return "Counter pending";
  if (opportunity.applied) return "Applied";
  return mode === "long" ? "Apply to build" : "Apply";
}

export function engagementNotice(opportunity: Opportunity): string | null {
  const projectTitle = opportunity.engagementProjectTitle ?? opportunity.name;
  if (opportunity.engagementStatus === "accepted") {
    return `You are already working on ${projectTitle}.`;
  }
  if (opportunity.engagementStatus === "invited") {
    return `You already have an invitation for ${projectTitle}.`;
  }
  if (opportunity.engagementStatus === "countered") {
    return `Your counter-offer for ${projectTitle} is waiting for the founder.`;
  }
  return null;
}
