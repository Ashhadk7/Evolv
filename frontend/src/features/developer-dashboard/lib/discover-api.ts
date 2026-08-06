import { apiFetch } from "@/lib/api";

export type DeveloperDemand = "High" | "Medium" | "Low";
export type ApplicationStatus = "applied" | "withdrawn";
export type EngagementStatus = "invited" | "accepted" | "countered";
export type ApplicantAvailability = "full_time" | "part_time" | "weekends";
export type DiscoverSort = "match" | "newest" | "applicants";

export interface DiscoverBlueprintRole {
  role: string;
  count: number;
  skills: string[];
  lead: boolean;
}

export interface DiscoverRoleFit {
  role: string;
  fit: number;
}

export interface DiscoverApplicantsByRole {
  role: string;
  count: number;
}

export interface DiscoverBlueprint {
  id: string;
  name: string;
  industry: string;
  founderId: string;
  founderName: string;
  founderBlueprintCount: number;
  stage: string;
  summary: string;
  viability: number;
  techStack: string[];
  roles: DiscoverBlueprintRole[];
  matchScore: number | null;
  fitLabel: string | null;
  bestRole: string | null;
  roleFits: DiscoverRoleFit[];
  matchReasons: string[];
  matchedSkills: string[];
  skillsToPickUp: string[];
  applicantCount: number;
  applicantsByRole: DiscoverApplicantsByRole[];
  saved: boolean;
  applied: boolean;
  applicationId: string | null;
  applicationStatus: ApplicationStatus | null;
  appliedRole: string | null;
  appliedAt: string | null;
  withdrawnAt: string | null;
  engagementStatus: EngagementStatus | null;
  engagementProjectId: string | null;
  engagementProjectTitle: string | null;
  createdAt: string;
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
  tech?: string | null;
  role?: string | null;
}

export interface DiscoverFilterOptions {
  industries: string[];
  stages: string[];
  techStack: string[];
  roles: string[];
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

export interface ApplyInput {
  role: string;
  message?: string;
  availability?: ApplicantAvailability;
}

interface DiscoverBlueprintWire {
  id: string;
  name: string;
  industry: string;
  founder_id: string;
  founder_name: string | null;
  founder_blueprint_count: number;
  stage: string;
  summary: string;
  viability: number;
  tech_stack: string[];
  roles: DiscoverBlueprintRole[];
  match_score: number | null;
  fit_label: string | null;
  best_role: string | null;
  role_fits: DiscoverRoleFit[];
  match_reasons: string[];
  matched_skills: string[];
  skills_to_pick_up: string[];
  applicant_count: number;
  applicants_by_role: DiscoverApplicantsByRole[];
  saved: boolean;
  applied: boolean;
  application_id: string | null;
  application_status: ApplicationStatus | null;
  applied_role: string | null;
  applied_at: string | null;
  withdrawn_at: string | null;
  engagement_status: EngagementStatus | null;
  engagement_project_id: string | null;
  engagement_project_title: string | null;
  created_at: string;
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
    roles: string[];
  };
  items: DiscoverBlueprintWire[];
}

interface ApplicationWire {
  id: string;
  developer_id: string;
  blueprint_id: string;
  connection_id: string | null;
  role: string | null;
  message: string | null;
  availability: ApplicantAvailability | null;
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
    founderBlueprintCount: item.founder_blueprint_count,
    stage: item.stage,
    summary: item.summary,
    viability: item.viability,
    techStack: item.tech_stack,
    roles: item.roles,
    matchScore: item.match_score,
    fitLabel: item.fit_label,
    bestRole: item.best_role,
    roleFits: item.role_fits,
    matchReasons: item.match_reasons,
    matchedSkills: item.matched_skills,
    skillsToPickUp: item.skills_to_pick_up,
    applicantCount: item.applicant_count,
    applicantsByRole: item.applicants_by_role,
    saved: item.saved,
    applied: item.applied,
    applicationId: item.application_id,
    applicationStatus: item.application_status,
    appliedRole: item.applied_role,
    appliedAt: item.applied_at,
    withdrawnAt: item.withdrawn_at,
    engagementStatus: item.engagement_status,
    engagementProjectId: item.engagement_project_id,
    engagementProjectTitle: item.engagement_project_title,
    createdAt: item.created_at,
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

export const DISCOVER_PAGE_SIZE = 50;

function buildQuery(filters: DiscoverFilters, sort: DiscoverSort, page: number, limit: number) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(page * limit),
    sort,
  });
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.industry) params.set("industry", filters.industry);
  if (filters.tech) params.set("tech", filters.tech);
  if (filters.role) params.set("role", filters.role);
  return params.toString();
}

export async function listDiscoverBlueprints(
  filters: DiscoverFilters = {},
  sort: DiscoverSort = "match",
  page = 0,
  limit: number = DISCOVER_PAGE_SIZE
): Promise<DiscoverResponse> {
  const data = await apiFetch<DiscoverResponseWire>(
    `/discover/blueprints?${buildQuery(filters, sort, page, limit)}`,
    { auth: true }
  );
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
      roles: data.filter_options.roles,
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
  input: ApplyInput
): Promise<ApplicationWire> {
  return apiFetch<ApplicationWire>("/applications", {
    method: "POST",
    auth: true,
    body: {
      blueprint_id: blueprintId,
      role: input.role || null,
      message: input.message?.trim() || null,
      availability: input.availability ?? null,
    },
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
