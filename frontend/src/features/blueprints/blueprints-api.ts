import { apiFetch } from "@/lib/api";
import type { Blueprint, BlueprintAgentOutputs, BlueprintIntake } from "./types";

type LevelRating = "High" | "Medium" | "Low";

export interface GenerateBlueprintInput {
  idea: string;
  industry: string;
  target_customer?: string;
  problem?: string;
  solution?: string;
  stage?: string;
  budget?: string;
  timeline?: string;
  region?: string;
  monetization?: string;
  constraints?: string;
}

interface BlueprintVersionWire {
  id: string;
  blueprint_id: string;
  state: "current" | "pending";
  name: string;
  industry: string;
  idea_desc: string;
  differentiator: string | null;
  ai_recommend: string | null;
  viability: number;
  market_potential: number;
  developer_demand: LevelRating;
  content_json: Record<string, unknown> | null;
  generated_at: string;
}

interface BlueprintWire {
  id: string;
  founder_id: string;
  visibility: "private" | "public";
  created_at: string;
  updated_at: string;
  current_version: BlueprintVersionWire | null;
}

interface BlueprintListWire {
  total: number;
  limit: number;
  offset: number;
  items: BlueprintWire[];
}

export async function generateBlueprint(input: GenerateBlueprintInput): Promise<Blueprint> {
  const data = await apiFetch<BlueprintWire>("/blueprints/generate", {
    method: "POST",
    auth: true,
    body: input,
  });
  return blueprintFromWire(data);
}

export async function listBlueprints(): Promise<Blueprint[]> {
  const data = await apiFetch<BlueprintListWire>("/blueprints", { auth: true });
  return data.items.map(blueprintFromWire);
}

export function blueprintFromWire(data: BlueprintWire): Blueprint {
  const version = data.current_version;
  if (!version) {
    throw new Error("Blueprint has no version.");
  }

  const contentJson = asRecord(version.content_json);
  const agents = asRecord(contentJson?.agents) as BlueprintAgentOutputs | undefined;
  const intake = asRecord(contentJson?.intake) as BlueprintIntake | undefined;
  const marketAgent = asRecord(agents?.market);
  const competitorAgent = asRecord(agents?.competitor);
  const competitors = arrayOfRecords(competitorAgent?.competitors);

  return {
    id: data.id,
    name: version.name,
    industry: version.industry,
    ideaDesc: version.idea_desc,
    isPublic: data.visibility === "public",
    status: data.visibility === "public" ? "PUBLISHED" : "DRAFT",
    viability: version.viability,
    investorInterest: 0,
    marketPotential: version.market_potential,
    developerDemand: version.developer_demand,
    devMatches: 0,
    views: 0,
    investorViews: 0,
    interested: 0,
    wordCount: version.idea_desc.split(/\s+/).filter(Boolean).length,
    updatedAt: timeAgo(version.generated_at || data.updated_at),
    aiRecommend: version.ai_recommend ?? "Review the generated agent sections.",
    market: {
      size: stringValue(marketAgent?.size, "$500M"),
      cagr: stringValue(marketAgent?.cagr, "18%"),
      barriers: stringValue(marketAgent?.barriers, "Moderate"),
      score: numberValue(marketAgent?.score, version.market_potential),
    },
    competitors: competitors.length
      ? competitors.map((item) => ({
          name: stringValue(item.name, "Comparable player"),
          type: stringValue(item.type, "Direct"),
        }))
      : [{ name: "Comparable player", type: "Direct" }],
    differentiator: version.differentiator ?? "Focused AI-guided execution for early teams",
    features: ["Founder intake", "Market evidence", "Competitor map", "Persona map"],
    techStack: {
      frontend: "Next.js",
      backend: "FastAPI",
      ai: "Groq + Tavily",
      db: "PostgreSQL",
      aiProvider: "Groq",
      hosting: "Vercel / Render",
    },
    cost: {
      timeline: intake?.timeline || "To be estimated",
      team: "2-3 builders",
      hosting: "$100-500/mo",
      budget: intake?.budget || "To be estimated",
    },
    contentJson,
    agentOutputs: agents,
    intake,
  };
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function arrayOfRecords(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(asRecord(item)))
    : [];
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function timeAgo(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
