import { apiFetch } from "@/lib/api";
import type {
  Blueprint,
  BlueprintAgentOutputs,
  BlueprintIntake,
  BlueprintRiskSeverity,
  BlueprintRole,
  BlueprintStrategy,
  BlueprintStrategyAddition,
  BlueprintStrategyItem,
  BlueprintStrategyRisk,
} from "./types";

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

export async function getBlueprint(id: string): Promise<Blueprint> {
  const data = await apiFetch<BlueprintWire>(`/blueprints/${id}`, { auth: true });
  return blueprintFromWire(data);
}

export interface BlueprintGeneration {
  status: "generating" | "completed" | "failed";
  completedAgents: string[];
  error?: string;
}

// Reads the real generation status the backend writes into content_json — used
// to poll a `generating` blueprint until the agent pipeline finishes.
export function blueprintGeneration(bp: Blueprint): BlueprintGeneration {
  const gen = asRecord((bp.contentJson as Record<string, unknown> | undefined)?.generation);
  const status = gen?.status;
  return {
    status: status === "completed" || status === "failed" ? status : "generating",
    completedAgents: stringArray(gen?.completedAgents),
    error: typeof gen?.error === "string" ? gen.error : undefined,
  };
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
  const productAgent = asRecord(agents?.product);
  const techStackAgent = asRecord(agents?.techStack);
  const strategyAgent = asRecord(agents?.strategy);
  const techStackLayers = asRecord(techStackAgent?.techStack);
  const hostingLayer = asRecord(techStackLayers?.hosting);
  const competitors = arrayOfRecords(competitorAgent?.competitors);
  const roles = arrayOfRecords(techStackAgent?.roles)
    .map(roleFromRecord)
    .filter((role) => role.role && role.skills);

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
    features: stringArray(productAgent?.features),
    techStack: {
      frontend: layerChosen(techStackLayers, "frontend"),
      backend: layerChosen(techStackLayers, "backend"),
      ai: layerChosen(techStackLayers, "aiProvider"),
      db: layerChosen(techStackLayers, "database"),
      vectorDb: layerChosen(techStackLayers, "vectorDb"),
      aiProvider: layerChosen(techStackLayers, "aiProvider"),
      hosting: layerChosen(techStackLayers, "hosting"),
    },
    cost: {
      timeline: intake?.timeline || "To be estimated",
      team: roles.length ? `${roles.length} roles` : "",
      hosting: stringValue(hostingLayer?.monthlyCost, ""),
      budget: intake?.budget || "To be estimated",
    },
    contentJson,
    agentOutputs: agents,
    intake,
    roles,
    strategy: strategyFromRecord(strategyAgent),
  };
}

export const transformBlueprint = blueprintFromWire;

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

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function layerChosen(layers: Record<string, unknown> | undefined, key: string): string {
  return stringValue(asRecord(layers?.[key])?.chosen, "");
}

function roleFromRecord(item: Record<string, unknown>): BlueprintRole {
  return {
    role: stringValue(item.role, ""),
    count: numberValue(item.count, 1),
    skills: stringValue(item.skills, ""),
    lead: item.lead === true,
  };
}

function strategyFromRecord(item: Record<string, unknown> | undefined): BlueprintStrategy {
  return {
    marketLacks: arrayOfRecords(item?.marketLacks)
      .map(strategyItemFromRecord)
      .filter((entry) => entry.title && entry.text),
    recommendedAdditions: arrayOfRecords(item?.recommendedAdditions)
      .map(strategyAdditionFromRecord)
      .filter((entry) => entry.title && entry.text && entry.impact),
    pathToComplete: stringArray(item?.pathToComplete),
    risks: arrayOfRecords(item?.risks)
      .map(strategyRiskFromRecord)
      .filter((entry) => entry.risk && entry.mitigation),
    gtmChannels: arrayOfRecords(item?.gtmChannels)
      .map(strategyItemFromRecord)
      .filter((entry) => entry.title && entry.text),
    gtmSequence: stringArray(item?.gtmSequence),
  };
}

function strategyItemFromRecord(item: Record<string, unknown>): BlueprintStrategyItem {
  return {
    title: stringValue(item.title, ""),
    text: stringValue(item.text, ""),
  };
}

function strategyAdditionFromRecord(item: Record<string, unknown>): BlueprintStrategyAddition {
  return {
    ...strategyItemFromRecord(item),
    impact: stringValue(item.impact, ""),
  };
}

function strategyRiskFromRecord(item: Record<string, unknown>): BlueprintStrategyRisk {
  return {
    risk: stringValue(item.risk, ""),
    severity: severityValue(item.severity),
    mitigation: stringValue(item.mitigation, ""),
  };
}

function severityValue(value: unknown): BlueprintRiskSeverity {
  return value === "High" || value === "Medium" || value === "Low" ? value : "Medium";
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
