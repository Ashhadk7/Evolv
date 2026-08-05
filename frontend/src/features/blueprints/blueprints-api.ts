import { monthlyCostLabel } from "@/features/blueprints/blueprint-content";
import { ApiError, apiFetch } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
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
  EvidenceBasis,
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

export type IntakeFieldName = keyof GenerateBlueprintInput;

export interface IntakeGap {
  field: IntakeFieldName;
  issue: string;
  question: string;
  suggestion: string;
}

export interface IntakeConflict {
  fields: IntakeFieldName[];
  conflict: string;
  question: string;
}

export interface IntakeReview {
  verdict: "ask" | "block";
  reason: string;
  gaps: IntakeGap[];
  conflicts: IntakeConflict[];
}

// The intake critic rejects before any blueprint row exists, returning the
// questions it wants answered rather than a dead-end message. Anything else is
// an ordinary error the caller shows as text.
export function intakeReviewFrom(error: unknown): IntakeReview | null {
  if (!(error instanceof ApiError) || error.code !== "intake_rejected") return null;
  const review = (error.data as { intake?: IntakeReview } | null)?.intake;
  return review?.verdict ? review : null;
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

// Deletes a blueprint on the backend (owner-only, 204 No Content). Cascade
// removes its versions. Callers update local state after this resolves.
export async function deleteBlueprint(id: string): Promise<void> {
  await apiFetch<void>(`/blueprints/${id}`, { method: "DELETE", auth: true });
}

// Re-runs generation on the SAME blueprint from its saved inputs (no duplicate).
// Returns the blueprint reset to `generating`; poll with pollGeneration after.
export async function retryBlueprint(id: string): Promise<Blueprint> {
  const data = await apiFetch<BlueprintWire>(`/blueprints/${id}/retry`, {
    method: "POST",
    auth: true,
  });
  return blueprintFromWire(data);
}

// Toggles a blueprint public/private on the backend (PATCH visibility).
// Returns the updated blueprint (its status/visibility reflect the change).
export async function setBlueprintVisibility(id: string, isPublic: boolean): Promise<Blueprint> {
  const data = await apiFetch<BlueprintWire>(`/blueprints/${id}`, {
    method: "PATCH",
    auth: true,
    body: { visibility: isPublic ? "public" : "private" },
  });
  return blueprintFromWire(data);
}

// Persists user-edited content (features, tech-stack choices) on the same row.
// The backend merges these into content_json and returns the updated blueprint.
export async function updateBlueprintContent(
  id: string,
  edits: { features?: string[]; techStack?: Record<string, string> }
): Promise<Blueprint> {
  const data = await apiFetch<BlueprintWire>(`/blueprints/${id}/content`, {
    method: "PATCH",
    auth: true,
    body: { features: edits.features, tech_stack: edits.techStack },
  });
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

// Polls a `generating` blueprint until the backend reports done/failed.
// 12-min window: rate-limited free-tier AI can legitimately pause ~90s between
// agents, so a short poll would report false failures. `onProgress` reports the
// completed-agent list for a live progress bar. Throws on failure/timeout.
export async function pollGeneration(
  id: string,
  onProgress?: (completedAgents: string[]) => void
): Promise<Blueprint> {
  for (let attempt = 0; attempt < 360; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const blueprint = await getBlueprint(id);
    const generation = blueprintGeneration(blueprint);
    onProgress?.(generation.completedAgents);
    if (generation.status === "completed") return blueprint;
    if (generation.status === "failed") {
      throw new Error(generation.error ?? "Blueprint generation failed. Please try again.");
    }
  }
  throw new Error(
    "Generation is still running in the background. Check your workspace in a few minutes — do not start a second generation."
  );
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
    createdAt: data.created_at,
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
    features: featureNames(productAgent?.features),
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
      hosting: monthlyCostLabel(hostingLayer?.monthlyCost),
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

// Feature names for the editor / list view. Handles both the new structured
// features (objects with a `name`) and legacy string features.
function featureNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item : stringValue(asRecord(item)?.name, "")))
    .filter((name) => name.trim());
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
    basis: basisValue(item.basis),
  };
}

function strategyRiskFromRecord(item: Record<string, unknown>): BlueprintStrategyRisk {
  return {
    risk: stringValue(item.risk, ""),
    severity: severityValue(item.severity),
    mitigation: stringValue(item.mitigation, ""),
    basis: basisValue(item.basis),
  };
}

// The agent tags each risk/addition `sourced` or `assumption`. Dropping it here
// silently disabled the "Assumption" chip the risks table already renders.
function basisValue(value: unknown): EvidenceBasis | undefined {
  return value === "sourced" || value === "assumption" ? value : undefined;
}

function severityValue(value: unknown): BlueprintRiskSeverity {
  return value === "High" || value === "Medium" || value === "Low" ? value : "Medium";
}

