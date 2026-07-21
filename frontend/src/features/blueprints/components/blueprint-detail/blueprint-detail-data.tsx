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

export function buildVentureAssessment(bp: Blueprint, content: BlueprintContent) {
  // Strengths = the scorecard's best-scoring dimensions, in the agent's own
  // words. Risks = the synthesis agent's red flags. Nothing is invented here;
  // legacy blueprints without scorecard data show what actually exists.
  const strengths = content.viability.subScores
    .filter((s) => s.note && s.value >= 60)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((s) => s.note);
  const assessmentRisks = content.synthesis.redFlags.length
    ? content.synthesis.redFlags.map((r) => r.flag)
    : [bp.market.barriers].filter(Boolean);
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
      text:
        bp.intake?.problem ||
        `Existing ${bp.industry} solutions are expensive, slow to adopt, and built for large players. ${bp.market.barriers} compounds this — leaving smaller teams with wasted time, higher costs, and outcomes that lag what is now technically possible.`,
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
      text:
        bp.intake?.monetization ||
        "No monetization model was provided at intake — define one before fundraising.",
    },
  ];
}

export function buildGapAnalysis(bp: Blueprint) {
  return {
    gaps: bp.strategy?.marketLacks ?? [],
    additions: bp.strategy?.recommendedAdditions ?? [],
    pathToComplete: bp.strategy?.pathToComplete ?? [],
  };
}

export function buildGoToMarket(bp: Blueprint) {
  return {
    gtmChannels: (bp.strategy?.gtmChannels ?? []).map((channel, index) => ({
      ...channel,
      icon: gtmIcon(index),
    })),
    gtmPhases: bp.strategy?.gtmSequence ?? [],
  };
}

function gtmIcon(index: number) {
  const icons = [
    <UsersThree size={16} weight="duotone" className="text-bp-teal" />,
    <Megaphone size={16} weight="duotone" className="text-bp-teal" />,
    <Storefront size={16} weight="duotone" className="text-bp-teal" />,
    <Plugs size={16} weight="duotone" className="text-bp-teal" />,
  ];
  return icons[index % icons.length];
}

export function buildTeamRoles(bp: Blueprint) {
  return bp.roles ?? [];
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
  return (bp.strategy?.risks ?? [])
    .map((risk) => ({
      risk: risk.risk,
      sev: risk.severity,
      mit: risk.mitigation,
    }))
    .sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev]);
}

// Severity = danger scale: High risk is red, low risk is safe (mint).
export const sevTone = (s: string) =>
  (s === "High" ? "red" : s === "Medium" ? "amber" : "mint") as "red" | "amber" | "mint";

export function buildAnalytics(bp: Blueprint) {
  // Real platform counts only — no invented trends or padded numbers.
  const lit = (n: number) => Math.min(8, n);
  return [
    {
      label: "Blueprint Views",
      value: String(bp.views),
      trend: "",
      up: true,
      cap: "all time",
      lit: lit(bp.views),
    },
    {
      label: "Developer Applications",
      value: String(bp.devMatches),
      trend: "",
      up: true,
      cap: "all time",
      lit: lit(bp.devMatches),
    },
    {
      label: "Profile Saves",
      value: String(bp.interested),
      trend: "",
      up: true,
      cap: "all time",
      lit: lit(bp.interested),
    },
  ];
}

export function buildAiRecs(bp: Blueprint) {
  const additions = bp.strategy?.recommendedAdditions ?? [];
  const risks = bp.strategy?.risks ?? [];
  return [
    { p: "High", text: bp.aiRecommend },
    ...additions.slice(0, 2).map((addition) => ({ p: "Medium", text: addition.text })),
    ...risks.slice(0, 2).map((risk) => ({ p: risk.severity, text: risk.mitigation })),
  ].filter((item) => item.text);
}

export function buildFeatureItems(features: string[]) {
  return features.map((f, i) => ({
    name: f,
    priority: i < 2 ? "Must-have" : i < 4 ? "Should-have" : "Nice-to-have",
  }));
}

export type { BlueprintContent };
