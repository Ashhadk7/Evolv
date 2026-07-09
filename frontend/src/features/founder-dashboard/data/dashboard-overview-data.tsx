// Types + mock data for the founder dashboard overview, extracted from
// features/founder-dashboard/components/dashboard-overview.tsx.
"use client";

import { Lightning, Users, Warning } from "@phosphor-icons/react";

export interface Blueprint {
  id: string;
  name: string;
  industry: string;
  isPublic: boolean;
  viability: number;
  fundingReadiness: string;
  devMatches: number;
  views: number;
  interested: number;
  updatedAt: string;
}

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

export function getRoadmapForBlueprint(bp: Blueprint): RoadmapMilestone[] {
  const industry = bp?.industry || "SaaS";
  if (industry === "HealthTech" || industry === "MedTech") {
    return [
      {
        phase: "Phase 1",
        title: "Clinical Validation & HIPAA Setup",
        status: "completed",
        date: "Completed",
        color: "#428475",
      },
      {
        phase: "Phase 2",
        title: "AI Model Diagnostics Training",
        status: "completed",
        date: "Completed",
        color: "#89d7b7",
      },
      {
        phase: "Phase 3",
        title: "Developer Sourcing (HIPAA Stack)",
        status: "active",
        date: "In Progress",
        color: "#7C5CBF",
      },
      {
        phase: "Phase 4",
        title: "Hospital Pilot & Clinical Launch",
        status: "upcoming",
        date: "Upcoming",
        color: "#C4973A",
      },
    ];
  }
  if (industry === "CleanTech") {
    return [
      {
        phase: "Phase 1",
        title: "Micro-Grid Simulation Testing",
        status: "completed",
        date: "Completed",
        color: "#428475",
      },
      {
        phase: "Phase 2",
        title: "Carbon Credit Smart Contracts",
        status: "completed",
        date: "Completed",
        color: "#89d7b7",
      },
      {
        phase: "Phase 3",
        title: "Cooperative Partner Onboarding",
        status: "active",
        date: "In Progress",
        color: "#7C5CBF",
      },
      {
        phase: "Phase 4",
        title: "Coop Grid Rollout & Launch",
        status: "upcoming",
        date: "Upcoming",
        color: "#C4973A",
      },
    ];
  }
  if (industry === "EdTech") {
    return [
      {
        phase: "Phase 1",
        title: "Curriculum Mapping & Validation",
        status: "completed",
        date: "Completed",
        color: "#428475",
      },
      {
        phase: "Phase 2",
        title: "Generative Math Engine Review",
        status: "completed",
        date: "Completed",
        color: "#89d7b7",
      },
      {
        phase: "Phase 3",
        title: "Beta School Matching & Sourcing",
        status: "active",
        date: "In Progress",
        color: "#7C5CBF",
      },
      {
        phase: "Phase 4",
        title: "Mobile App Store MVP Launch",
        status: "upcoming",
        date: "Upcoming",
        color: "#C4973A",
      },
    ];
  }
  // Default / SaaS
  return [
    {
      phase: "Phase 1",
      title: "Venture Ideation & Validation",
      status: "completed",
      date: "Completed",
      color: "#428475",
    },
    {
      phase: "Phase 2",
      title: "AI Blueprint Refinement",
      status: "completed",
      date: "Completed",
      color: "#89d7b7",
    },
    {
      phase: "Phase 3",
      title: "Developer Matching & Sourcing",
      status: "active",
      date: "In Progress",
      color: "#7C5CBF",
    },
    {
      phase: "Phase 4",
      title: "MVP Development & Launch",
      status: "upcoming",
      date: "Upcoming",
      color: "#C4973A",
    },
  ];
}
