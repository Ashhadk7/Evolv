import { blueprintGeneration } from "@/features/blueprints/blueprints-api";
import type { Blueprint } from "@/features/blueprints/types";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type WorkspaceStage = "All Stages" | "Published" | "Draft";
export type WorkspaceSort = "Viability" | "Recent" | "Market Potential";

export interface WorkspaceStats {
  total: number;
  published: number;
  drafts: number;
  createdThisWeek: number;
  avgViability: number;
}

/** Only completed blueprints carry real scores, roles and cost estimates. */
export function isBlueprintReady(bp: Blueprint): boolean {
  return blueprintGeneration(bp).status === "completed";
}

export function viabilityGrade(viability: number): string {
  if (viability >= 80) return "A+";
  if (viability >= 72) return "A";
  if (viability >= 64) return "A-";
  if (viability >= 56) return "B+";
  return "B";
}

export function blueprintSlug(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "untitled"}.blueprint`;
}

export function blueprintSubtitle(bp: Blueprint): string {
  const stage = bp.intake?.stage?.trim();
  return stage ? `${bp.industry} · ${stage}` : bp.industry;
}

export function workspaceStats(blueprints: Blueprint[], now: number = Date.now()): WorkspaceStats {
  const published = blueprints.filter((bp) => bp.status === "PUBLISHED").length;
  // Generating and failed blueprints sit at viability 0 and would drag the
  // average down, so they are excluded rather than counted as a zero score.
  const scored = blueprints.filter(isBlueprintReady);
  const createdThisWeek = blueprints.filter((bp) => {
    const created = new Date(bp.createdAt).getTime();
    return Number.isFinite(created) && now - created < WEEK_MS;
  }).length;

  return {
    total: blueprints.length,
    published,
    drafts: blueprints.length - published,
    createdThisWeek,
    avgViability: scored.length
      ? Math.round(scored.reduce((sum, bp) => sum + bp.viability, 0) / scored.length)
      : 0,
  };
}

export function filterBlueprints(
  blueprints: Blueprint[],
  { search, stage }: { search: string; stage: WorkspaceStage }
): Blueprint[] {
  const query = search.trim().toLowerCase();
  return blueprints.filter((bp) => {
    const matchesStage = stage === "All Stages" || bp.status === stage.toUpperCase();
    const matchesSearch =
      !query || `${bp.name} ${bp.industry} ${bp.ideaDesc}`.toLowerCase().includes(query);
    return matchesStage && matchesSearch;
  });
}

// `|| 0` keeps a locally cached blueprint that predates `createdAt` from
// producing a NaN comparator, which would scramble the whole list order.
const createdMs = (bp: Blueprint) => Date.parse(bp.createdAt) || 0;

export function sortBlueprints(blueprints: Blueprint[], sort: WorkspaceSort): Blueprint[] {
  return [...blueprints].sort((a, b) => {
    if (sort === "Recent") return createdMs(b) - createdMs(a);
    if (sort === "Market Potential") return b.marketPotential - a.marketPotential;
    return b.viability - a.viability;
  });
}
