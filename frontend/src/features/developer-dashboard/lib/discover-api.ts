import { apiFetch } from "@/lib/api";

export type DeveloperDemand = "High" | "Medium" | "Low";
export type ApplicationStatus = "applied" | "withdrawn";

export interface DiscoverBlueprintRole {
  role: string;
  count: number;
  skills: string[];
  lead: boolean;
}

export interface DiscoverBlueprint {
  id: string;
  name: string;
  industry: string;
  founderId: string;
  founderName: string;
  stage: string;
  summary: string;
  differentiator: string;
  viability: number;
  developerDemand: DeveloperDemand;
  techStack: string[];
  roles: DiscoverBlueprintRole[];
  mvpFeatures: string[];
  timeline: string;
  matchScore: number;
  matchReasons: string[];
  matchedSkills: string[];
  saved: boolean;
  applied: boolean;
  applicationId: string | null;
  applicationStatus: ApplicationStatus | null;
  appliedRole: string | null;
  appliedAt: string | null;
  withdrawnAt: string | null;
  updatedAt: string;
  logo: string;
}

export interface SavedDiscoverBlueprint {
  id: string;
  name: string;
  available: boolean;
  savedAt: string;
  blueprint: DiscoverBlueprint | null;
}

export interface DiscoverFilters {
  q?: string | null;
  industry?: string | null;
  stage?: string | null;
  tech?: string | null;
  minViability?: string | null;
}

export interface DiscoverFilterOptions {
  industries: string[];
  stages: string[];
  techStack: string[];
}

export interface DiscoverResponse {
  total: number;
  limit: number;
  offset: number;
  savedCount: number;
  applicationsCount: number;
  highMatchCount: number;
  filterOptions: DiscoverFilterOptions;
  items: DiscoverBlueprint[];
}

interface DiscoverBlueprintRoleWire {
  role: string;
  count: number;
  skills: string[];
  lead: boolean;
}

interface DiscoverBlueprintWire {
  id: string;
  name: string;
  industry: string;
  founder_id: string;
  founder_name: string | null;
  stage: string;
  summary: string;
  differentiator: string | null;
  viability: number;
  developer_demand: DeveloperDemand;
  tech_stack: string[];
  roles: DiscoverBlueprintRoleWire[];
  mvp_features: string[];
  timeline: string | null;
  match_score: number;
  match_reasons: string[];
  matched_skills: string[];
  saved: boolean;
  applied: boolean;
  application_id: string | null;
  application_status: ApplicationStatus | null;
  applied_role: string | null;
  applied_at: string | null;
  withdrawn_at: string | null;
  updated_at: string;
}

interface DiscoverResponseWire {
  total: number;
  limit: number;
  offset: number;
  saved_count: number;
  applications_count: number;
  high_match_count: number;
  filter_options: {
    industries: string[];
    stages: string[];
    tech_stack: string[];
  };
  items: DiscoverBlueprintWire[];
}

interface ApplicationWire {
  id: string;
  developer_id: string;
  blueprint_id: string;
  connection_id: string | null;
  role: string | null;
  status: ApplicationStatus;
  applied_at: string;
  withdrawn_at: string | null;
}

interface SavedDiscoverBlueprintWire {
  id: string;
  name: string;
  available: boolean;
  saved_at: string;
  blueprint: DiscoverBlueprintWire | null;
}

interface SavedDiscoverBlueprintResponseWire {
  total: number;
  items: SavedDiscoverBlueprintWire[];
}

function initialsFor(name: string) {
  const words = name
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
  return (words[0]?.[0] ?? "B") + (words[1]?.[0] ?? "");
}

function fromWire(item: DiscoverBlueprintWire): DiscoverBlueprint {
  return {
    id: item.id,
    name: item.name,
    industry: item.industry,
    founderId: item.founder_id,
    founderName: item.founder_name ?? "Founder not listed",
    stage: item.stage,
    summary: item.summary,
    differentiator: item.differentiator ?? "",
    viability: item.viability,
    developerDemand: item.developer_demand,
    techStack: item.tech_stack,
    roles: item.roles,
    mvpFeatures: item.mvp_features,
    timeline: item.timeline ?? "Timeline to be confirmed",
    matchScore: item.match_score,
    matchReasons: item.match_reasons,
    matchedSkills: item.matched_skills,
    saved: item.saved,
    applied: item.applied,
    applicationId: item.application_id,
    applicationStatus: item.application_status,
    appliedRole: item.applied_role,
    appliedAt: item.applied_at,
    withdrawnAt: item.withdrawn_at,
    updatedAt: item.updated_at,
    logo: initialsFor(item.name).toUpperCase(),
  };
}

function savedFromWire(item: SavedDiscoverBlueprintWire): SavedDiscoverBlueprint {
  return {
    id: item.id,
    name: item.name,
    available: item.available,
    savedAt: item.saved_at,
    blueprint: item.blueprint ? fromWire(item.blueprint) : null,
  };
}

function buildQuery(filters: DiscoverFilters, limit = 100) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.industry) params.set("industry", filters.industry);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.tech) params.set("tech", filters.tech);
  if (filters.minViability) params.set("min_viability", filters.minViability);
  return params.toString();
}

export async function listDiscoverBlueprints(
  filters: DiscoverFilters = {}
): Promise<DiscoverResponse> {
  const data = await apiFetch<DiscoverResponseWire>(`/discover/blueprints?${buildQuery(filters)}`, {
    auth: true,
  });
  return {
    total: data.total,
    limit: data.limit,
    offset: data.offset,
    savedCount: data.saved_count,
    applicationsCount: data.applications_count,
    highMatchCount: data.high_match_count,
    filterOptions: {
      industries: data.filter_options.industries,
      stages: data.filter_options.stages,
      techStack: data.filter_options.tech_stack,
    },
    items: data.items.map(fromWire),
  };
}

export async function listSavedDiscoverBlueprints(): Promise<SavedDiscoverBlueprint[]> {
  const data = await apiFetch<SavedDiscoverBlueprintResponseWire>(
    "/discover/saved-blueprints?limit=100",
    { auth: true }
  );
  return data.items.map(savedFromWire);
}

export async function applyToDiscoverBlueprint(
  blueprintId: string,
  role: string
): Promise<ApplicationWire> {
  return apiFetch<ApplicationWire>("/applications", {
    method: "POST",
    auth: true,
    body: { blueprint_id: blueprintId, role },
  });
}

export async function withdrawDiscoverApplication(applicationId: string): Promise<void> {
  await apiFetch(`/applications/${applicationId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function saveDiscoverBlueprint(blueprintId: string): Promise<void> {
  await apiFetch(`/blueprints/${blueprintId}/save`, {
    method: "POST",
    auth: true,
  });
}

export async function unsaveDiscoverBlueprint(blueprintId: string): Promise<void> {
  await apiFetch(`/blueprints/${blueprintId}/save`, {
    method: "DELETE",
    auth: true,
  });
}
