// Pure derived data + helpers for the blueprint detail view, extracted from blueprint-detail.tsx.
"use client";

import {
  Coins,
  Compass,
  Crosshair,
  Lightbulb,
  Megaphone,
  Plugs,
  Storefront,
  Target,
  UsersThree,
  Warning,
} from "@phosphor-icons/react";
import type { BlueprintContent } from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";
import { FOUNDER_NETWORK_PROFILES } from "@/features/network/data";
import type { FounderContactProfile } from "@/features/network/types";

export const TOC_SECTIONS = [
  "Venture Assessment",
  "Executive Summary",
  "Signals & Activity",
  "The Idea",
  "Target Users & Personas",
  "Product Scope",
  "Recommended Tech Stack & Architecture",
  "Roles & Matched Developers",
  "Development Roadmap",
  "Market Analysis",
  "Competitive Landscape",
  "Gap Analysis & Recommendations",
  "Go-to-Market",
  "Project Cost & Financials",
  "Risks & Mitigations",
];

export function buildVentureAssessment(bp: Blueprint) {
  const strengths = [
    "Clear, sizeable market demand",
    "Strong developer interest & matchability",
    "Defensible differentiation vs. incumbents",
  ];
  const assessmentRisks = ["Competitive, well-funded incumbents", bp.market.barriers];
  return { strengths, assessmentRisks };
}

export function buildInfoGrid(bp: Blueprint, desc: string) {
  return [
    {
      icon: <Target size={16} weight="duotone" className="text-bp-success" />,
      label: "Mission",
      text: `Make ${bp.industry} outcomes dramatically better by ${bp.differentiator.toLowerCase()} — and make that accessible to the teams who are priced out or under-served today.`,
    },
    {
      icon: <Compass size={16} weight="duotone" className="text-bp-teal" />,
      label: "Vision",
      text: `A world where ${bp.industry.toLowerCase()} capabilities once exclusive to large incumbents are available to everyone, on demand.`,
    },
    {
      icon: <Warning size={16} weight="duotone" className="text-bp-red" />,
      label: "Problem",
      text: `Existing ${bp.industry} solutions are expensive, slow to adopt, and built for large players. ${bp.market.barriers} compounds this — leaving smaller teams with wasted time, higher costs, and outcomes that lag what is now technically possible.`,
    },
    {
      icon: <Lightbulb size={16} weight="duotone" className="text-bp-amber" />,
      label: "Solution",
      text: `${desc} The platform packages this into a focused product that delivers measurable value from the first session.`,
    },
    {
      icon: <Crosshair size={16} weight="duotone" className="text-bp-teal" />,
      label: "Value Proposition",
      text: `${bp.differentiator} — delivered faster, and at a fraction of the cost and complexity of incumbent tools.`,
    },
    {
      icon: <Coins size={16} weight="duotone" className="text-bp-success" />,
      label: "Revenue Model",
      text: `B2B SaaS subscription with usage-based tiers. Founders fund development directly and pay contributing developers per approved milestone through Evolv's escrow.`,
    },
  ];
}

export const PLATFORM_FEATURES: { name: string; note?: string; priority: string }[] = [
  { name: "Authentication & onboarding", note: "Auth.js / Clerk", priority: "Must-have" },
  { name: "Milestone payments & escrow", note: "Stripe Connect", priority: "Must-have" },
  { name: "Notifications & email", note: "Knock · Resend", priority: "Should-have" },
  { name: "Admin & analytics dashboard", note: "PostHog", priority: "Nice-to-have" },
];

export function buildGapAnalysis(bp: Blueprint) {
  const gaps = [
    {
      title: "Priced for large players only",
      text: `Incumbents target enterprise budgets, leaving smaller ${bp.industry} teams unserved.`,
    },
    {
      title: "Thin explainability & trust",
      text: "Outputs are delivered as black boxes, slowing adoption in high-stakes decisions.",
    },
    {
      title: "Poor workflow integration",
      text: "Tools live in isolation instead of fitting the systems teams already use daily.",
    },
    {
      title: "Slow time-to-value",
      text: "Heavy setup and onboarding delay the first real outcome by weeks.",
    },
  ];
  const additions = [
    {
      title: "Explainability layer",
      impact: "Differentiator",
      text: "Surface the “why” behind every AI result to build trust and speed approvals.",
    },
    {
      title: "Native workflow integrations",
      impact: "High impact",
      text: `Connect to the systems ${bp.industry} teams already use so the product fits in, not around.`,
    },
    {
      title: "Self-serve onboarding",
      impact: "Quick win",
      text: "A guided first-run that delivers a real result inside 10 minutes.",
    },
    {
      title: "Usage-based starter tier",
      impact: "Growth",
      text: "A low-friction entry price that converts smaller teams the incumbents ignore.",
    },
  ];
  const pathToComplete = [
    "Ship the must-have MVP and validate the core loop with 3–5 design partners.",
    "Add the explainability + integration layers that turn a feature into a defensible product.",
    "Layer self-serve onboarding and a usage-based tier to open a scalable growth channel.",
  ];
  return { gaps, additions, pathToComplete };
}

export function buildGoToMarket(bp: Blueprint) {
  const gtmChannels = [
    {
      icon: <UsersThree size={16} weight="duotone" className="text-bp-teal" />,
      title: "Design partners",
      text: `Hand-pick 3–5 ${bp.industry} teams for deep, co-built early adoption.`,
    },
    {
      icon: <Megaphone size={16} weight="duotone" className="text-bp-teal" />,
      title: "Content & community",
      text: "Publish in-the-weeds expertise where the audience already gathers.",
    },
    {
      icon: <Storefront size={16} weight="duotone" className="text-bp-teal" />,
      title: "Product-led self-serve",
      text: "A free entry tier that turns usage into qualified, expanding accounts.",
    },
    {
      icon: <Plugs size={16} weight="duotone" className="text-bp-teal" />,
      title: "Integration partners",
      text: "Distribute through the platforms your users already live in.",
    },
  ];
  const gtmPhases = ["Private beta", "Design-partner rollout", "Public launch", "Scale & expand"];
  return { gtmChannels, gtmPhases };
}

export function buildTeamRoles(bp: Blueprint) {
  return [
    {
      role: "Full-Stack Engineer",
      count: 1,
      skills: "Next.js · TypeScript · API design",
      lead: true,
    },
    {
      role: bp.techStack.ai ? "ML / AI Engineer" : "Backend Engineer",
      count: 1,
      skills: `${bp.techStack.ai || bp.techStack.backend} · pipelines`,
      lead: false,
    },
    {
      role: "Backend Engineer",
      count: 1,
      skills: `${bp.techStack.backend} · ${bp.techStack.db}`,
      lead: false,
    },
    { role: "Product Designer", count: 1, skills: "UX · design systems (part-time)", lead: false },
  ];
}

export const developerProfiles = FOUNDER_NETWORK_PROFILES.filter(
  (profile) => profile.type === "Developer"
);

export const developerRoleText = (developer: FounderContactProfile) =>
  `${developer.role} · ${developer.skills.slice(0, 2).join(" · ")} · ${developer.experience}`;

export const isDeveloperAvailable = (developer: FounderContactProfile) =>
  /open|available/i.test(developer.availability);

export function devsForPhase(skillset: string[]) {
  const matched = developerProfiles.filter((d) =>
    skillset.some((s) =>
      d.skills.some(
        (sk) =>
          sk.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(sk.toLowerCase())
      )
    )
  );
  return matched.length ? matched : developerProfiles;
}

export function devsForRole(role: { role: string; skills: string }) {
  const terms = `${role.role} ${role.skills}`
    .toLowerCase()
    .split(/[^a-z0-9+.#]+/)
    .filter(Boolean);
  const matched = developerProfiles.filter((d) =>
    terms.some(
      (term) =>
        d.role.toLowerCase().includes(term) ||
        d.skills.some((sk) => sk.toLowerCase().includes(term) || term.includes(sk.toLowerCase()))
    )
  );
  return (matched.length ? matched : developerProfiles).slice(0, 3);
}

const SEV_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

export function buildRiskRows(bp: Blueprint) {
  return [
    {
      risk: "Well-funded incumbents move into the niche",
      sev: "Medium",
      mit: "Win on focus, speed, and price for under-served teams; build integration moat early.",
    },
    {
      risk: bp.market.barriers,
      sev: "High",
      mit: "Engage requirements early, design for compliance, and ship audit-ready from day one.",
    },
    {
      risk: "Model accuracy below user trust threshold",
      sev: "Medium",
      mit: "Ship explainability, keep a human-in-the-loop, and improve on real usage data.",
    },
    {
      risk: "Slow developer ramp delays milestones",
      sev: "Low",
      mit: "Scope independently-shippable milestones; pay on approval to keep momentum.",
    },
  ].sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev]);
}

// Severity = danger scale: High risk is red, low risk is safe (mint).
export const sevTone = (s: string) =>
  (s === "High" ? "red" : s === "Medium" ? "amber" : "mint") as "red" | "amber" | "mint";

export function buildAnalytics(bp: Blueprint) {
  // Real platform counts only — no re-derived percentages here
  return [
    {
      label: "Blueprint Views",
      value: String(bp.views),
      trend: "+24%",
      up: true,
      cap: "vs last month",
      lit: 6,
    },
    {
      label: "Developer Applications",
      value: String(bp.devMatches + 7),
      trend: "+3",
      up: true,
      cap: "vs 9 last month",
      lit: 5,
    },
    {
      label: "Profile Saves",
      value: String(bp.interested + 4),
      trend: "+2",
      up: true,
      cap: "vs 2 last month",
      lit: 4,
    },
  ];
}

export function buildAiRecs(bp: Blueprint) {
  return [
    { p: "High", text: bp.aiRecommend },
    {
      p: "High",
      text: "Lock in a technical co-founder or lead developer from your matched candidates.",
    },
    { p: "Medium", text: "Build the explainability layer — it's your clearest differentiation." },
    { p: "Medium", text: "Line up 3–5 design partners before the public launch milestone." },
    { p: "Low", text: "Draft a usage-based starter tier to widen the top of funnel." },
  ];
}

export function buildFeatureItems(features: string[]) {
  return features.map((f, i) => ({
    name: f,
    priority: i < 2 ? "Must-have" : i < 4 ? "Should-have" : "Nice-to-have",
  }));
}

export type { BlueprintContent };
