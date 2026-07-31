// Types + mock data for the founder dashboard overview, extracted from
// features/founder-dashboard/components/dashboard-overview.tsx.
"use client";

import type { ReactNode } from "react";
import { Lightning, Users, Warning } from "@phosphor-icons/react";
import { computeProjectHealth, type BlueprintContent } from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";

// Re-export the real domain type instead of a parallel mock shape — these
// widgets now read real fields (`.project`, tech stack, mvp plan) off it via
// `buildBlueprintContent`/`computeProjectHealth`, which only typecheck
// against the real Blueprint.
export type { Blueprint } from "@/features/blueprints/types";

export interface Metric {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaUp: boolean;
  sub: string;
  trend: number[];
  accentColor: string;
}

export interface RoadmapMilestone {
  phase: string;
  title: string;
  status: "completed" | "active" | "upcoming";
  date?: string;
  color: string;
}

export interface PipelineRow {
  label: string;
  value: number;
  badge?: string;
  badgeColor?: string;
}

export type AIState = "profile_incomplete" | "high_viability" | "recruiting";

export const PIPELINE: PipelineRow[] = [
  { label: "Total Matches", value: 12, badge: "Active", badgeColor: "#89d7b7" },
  { label: "Pending Requests", value: 4, badge: "New", badgeColor: "#C4973A" },
  { label: "In Conversation", value: 2 },
  { label: "Accepted", value: 1, badge: "Hired", badgeColor: "#428475" },
];

export const METRICS: Metric[] = [
  {
    id: "viability",
    label: "Avg Viability",
    value: "76",
    delta: "+4%",
    deltaUp: true,
    sub: "+2% this week",
    trend: [58, 62, 65, 68, 70, 69, 73, 74, 76],
    accentColor: "#428475",
  },
  {
    id: "matches",
    label: "Developer Matches",
    value: "12",
    delta: "+3",
    deltaUp: true,
    sub: "3 pending",
    trend: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    accentColor: "#89d7b7",
  },
  {
    id: "refinements",
    label: "Total Impressions",
    value: "312",
    delta: "+12%",
    deltaUp: true,
    sub: "Total views",
    trend: [12, 18, 22, 25, 30, 34, 38, 40, 42],
    accentColor: "#7C5CBF",
  },
  {
    id: "milestones",
    label: "Ongoing Projects",
    value: "3",
    delta: "Active",
    deltaUp: true,
    sub: "3 in motion",
    trend: [2, 3, 4, 4, 5, 6, 7, 7, 8],
    accentColor: "#C4973A",
  },
];

export const AI_CONTENT = {
  profile_incomplete: {
    icon: <Warning size={16} weight="fill" style={{ color: "#C4973A" }} />,
    heading: "Complete your profile",
    body: "Investors and developers are 3× more likely to engage with a fully filled-out founder profile.",
    tags: ["Profile strength: 40%", "Missing bio & links"],
    cta: "Complete profile",
    accentBg: "rgba(196,151,58,0.08)",
    accentText: "#C4973A",
    accentLabel: "Action Needed",
  },
  high_viability: {
    icon: <Lightning size={16} weight="fill" style={{ color: "#89d7b7" }} />,
    heading: "High-viability opportunity detected",
    body: "Your top blueprint scores above 70 — developer demand for your sector is up 17% this month.",
    tags: ["Market signal: Strong", "HealthTech · Series A ready"],
    cta: "Publish blueprint",
    accentBg: "rgba(137,215,183,0.07)",
    accentText: "#2e7d5c",
    accentLabel: "Opportunity",
  },
  recruiting: {
    icon: <Users size={16} weight="fill" style={{ color: "#7C5CBF" }} />,
    heading: "Talent pool is hot right now",
    body: "12 developers match your current blueprints. 4 pending requests are waiting for your response.",
    tags: ["12 active matches", "4 pending requests"],
    cta: "Review matches",
    accentBg: "rgba(124,92,191,0.07)",
    accentText: "#7C5CBF",
    accentLabel: "Recruiting",
  },
} as const;

/**
 * Real roadmap built from the venture's actual phases + phase state — no
 * more per-industry canned copy. Phase 1..N titles come from the blueprint's
 * own generated content; status/date come from the backend project record
 * (`bp.project.phaseStates`), the same data `computeProjectHealth` reads for
 * the Venture Progress card, so both cards share one source of truth.
 */
export function getRoadmapForBlueprint(
  bp: Blueprint,
  content: BlueprintContent
): RoadmapMilestone[] {
  const project = bp.project;
  return content.phases.map((phase, i) => {
    const ps = project?.phaseStates[i];
    const status: RoadmapMilestone["status"] = !ps
      ? "upcoming"
      : ps.status === "Complete"
        ? "completed"
        : ps.status === "Not Started"
          ? "upcoming"
          : "active"; // "In Progress" | "In Review"
    const date = !project
      ? "Not started"
      : status === "completed"
        ? "Completed"
        : status === "active"
          ? "In Progress"
          : "Upcoming";
    const color =
      status === "completed" ? "#428475" : status === "active" ? "#7C5CBF" : "#eaeeed";
    return { phase: `Phase ${i + 1}`, title: phase.name, status, date, color };
  });
}

export interface VentureProgressBars {
  marketStrength: number;
  designCompleteness: number;
  developerAvailability: number;
  executionReadiness: number;
}

/**
 * Real signals for the Venture Progress bars — replaces the old formula that
 * derived all 4 numbers as arbitrary offsets from `viability`.
 *  - Market Strength: the blueprint's own AI-derived viability score.
 *  - Design Completeness: fraction of tech-stack layers with a chosen option
 *    plus whether MVP features have been defined.
 *  - Developer Availability: fraction of this venture's matched developers
 *    (same matched-developer list the Developer Pipeline card fetches) who
 *    are currently available.
 *  - Execution Readiness: real deliverables-done ratio from the project's
 *    phase state (0 if the idea hasn't been started as a project yet) — the
 *    same `computeProjectHealth` the Roadmap card's phase status comes from.
 */
export function computeVentureProgress(
  bp: Blueprint,
  content: BlueprintContent,
  matchedDevelopers: { availability: string }[]
): VentureProgressBars {
  const marketStrength = Math.max(0, Math.min(100, Math.round(bp.viability)));

  const layers = Object.values(content.techStack);
  const layersChosen = layers.filter((l) => l.chosen?.trim()).length;
  const featuresDefined = content.mvpPlan.mustHave.length > 0 ? 1 : 0;
  const designCompleteness = Math.round(
    ((layersChosen + featuresDefined) / (layers.length + 1)) * 100
  );

  const developerAvailability = matchedDevelopers.length
    ? Math.round(
        (matchedDevelopers.filter((d) => d.availability === "Available").length /
          matchedDevelopers.length) *
          100
      )
    : 0;

  const executionReadiness = bp.project
    ? (() => {
        const health = computeProjectHealth(content, bp.project!);
        return health.deliverables.total
          ? Math.round((health.deliverables.done / health.deliverables.total) * 100)
          : 0;
      })()
    : 0;

  return { marketStrength, designCompleteness, developerAvailability, executionReadiness };
}

// ─── Live-data compute functions ──────────────────────────────────────────────
// These replace the static METRICS / PIPELINE / AI_CONTENT tags at runtime.
// Every value is derived from actual backend data; no mock numbers.

export interface DashboardLiveData {
  blueprints: Blueprint[];
  /** Total active (non-completed) project count from the backend. */
  activeProjectCount: number;
  /** Total application count across all blueprints. */
  totalApplications: number;
  /** Number of applications that have a connection_id (in conversation). */
  applicationsInConversation: number;
}

/**
 * Build live Metric cards from real data.
 * Trend arrays are seeded with the one real data point — the UI sparkline
 * will grow as real historical data is added later.
 */
export function computeMetrics(data: DashboardLiveData): Metric[] {
  const { blueprints, activeProjectCount, totalApplications } = data;

  const avgViability = blueprints.length
    ? Math.round(blueprints.reduce((s, b) => s + b.viability, 0) / blueprints.length)
    : 0;

  return [
    {
      id: "viability",
      label: "Avg Viability",
      value: String(avgViability),
      delta: `${avgViability}%`,
      deltaUp: avgViability >= 50,
      sub: `${blueprints.length} blueprint${blueprints.length !== 1 ? "s" : ""}`,
      trend: [avgViability],
      accentColor: "#428475",
    },
    {
      id: "matches",
      label: "Developer Matches",
      value: String(totalApplications),
      delta: `+${totalApplications}`,
      deltaUp: totalApplications > 0,
      sub: `${totalApplications} total`,
      trend: [totalApplications],
      accentColor: "#89d7b7",
    },
    {
      id: "refinements",
      label: "Total Impressions",
      value: String(blueprints.reduce((s, b) => s + (b.views ?? 0), 0) || blueprints.length),
      delta: `${blueprints.filter((b) => b.isPublic).length} public`,
      deltaUp: blueprints.some((b) => b.isPublic),
      sub: "Blueprint views",
      trend: [blueprints.length],
      accentColor: "#7C5CBF",
    },
    {
      id: "milestones",
      label: "Ongoing Projects",
      value: String(activeProjectCount),
      delta: activeProjectCount > 0 ? "Active" : "None",
      deltaUp: activeProjectCount > 0,
      sub: `${activeProjectCount} in motion`,
      trend: [activeProjectCount],
      accentColor: "#C4973A",
    },
  ];
}

/**
 * Build a live pipeline widget row array from real project data:
 * - matchedCount: developers matched (via /matching) against active projects' current phase skillsets
 * - incomingCount: pending incoming connection requests
 * - connectedCount: accepted connections
 * - hiredCount: distinct developers actually assigned to a phase across active projects (from milestones)
 */
export function computePipeline(data: {
  matchedCount: number;
  incomingCount: number;
  connectedCount: number;
  hiredCount: number;
}): PipelineRow[] {
  const { matchedCount, incomingCount, connectedCount, hiredCount } = data;
  return [
    {
      label: "Total Matches",
      value: matchedCount,
      badge: matchedCount > 0 ? "Active" : undefined,
      badgeColor: "#89d7b7",
    },
    {
      label: "Pending Requests",
      value: incomingCount,
      badge: incomingCount > 0 ? "New" : undefined,
      badgeColor: "#C4973A",
    },
    { label: "Connected", value: connectedCount },
    {
      label: "Hired (Projects)",
      value: hiredCount,
      badge: hiredCount > 0 ? "Hired" : undefined,
      badgeColor: "#428475",
    },
  ];
}

export interface AIContentShape {
  icon: ReactNode;
  heading: string;
  body: string;
  tags: string[];
  cta: string;
  accentBg: string;
  accentText: string;
  accentLabel: string;
}

/** Build AI briefing content with real numbers in the tags. */
export function computeAIContent(
  state: AIState,
  data: { totalApplications: number; topViability: number; activeProjectCount: number }
): AIContentShape {
  const base = AI_CONTENT[state];
  if (state === "recruiting") {
    const count = data.totalApplications;
    return {
      icon: base.icon,
      heading: base.heading,
      cta: base.cta,
      accentBg: base.accentBg,
      accentText: base.accentText,
      accentLabel: base.accentLabel,
      body: `${count} developer${count !== 1 ? "s" : ""} have applied across your blueprints. Review their profiles to find your best match.`,
      tags: [
        `${count} applicant${count !== 1 ? "s" : ""}`,
        `${data.activeProjectCount} active project${data.activeProjectCount !== 1 ? "s" : ""}`,
      ],
    };
  }
  if (state === "high_viability") {
    const count = data.totalApplications;
    return {
      icon: base.icon,
      heading: base.heading,
      cta: base.cta,
      accentBg: base.accentBg,
      accentText: base.accentText,
      accentLabel: base.accentLabel,
      body: `Your top blueprint scores ${data.topViability} — developer demand is growing. Publishing it increases your match rate.`,
      tags: [
        `Top viability: ${data.topViability}`,
        `${count} applicant${count !== 1 ? "s" : ""}`,
      ],
    };
  }
  // profile_incomplete — keep existing static content
  return {
    icon: base.icon,
    heading: base.heading,
    body: base.body,
    tags: [...base.tags],
    cta: base.cta,
    accentBg: base.accentBg,
    accentText: base.accentText,
    accentLabel: base.accentLabel,
  };
}


