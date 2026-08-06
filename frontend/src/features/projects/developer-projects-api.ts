import { apiFetch } from "@/lib/api";
import type { Deadline } from "./deadlines-api";
import type { Deliverable } from "./deliverables-api";
import type { Issue } from "./issues-api";
import {
  fmtCents,
  type BackendProjectStatus,
  type DeadlineStatus,
  type IssuePriority,
  type IssueStatus,
  type MemberStatus,
  type PaymentProvider,
  type PaymentStatus,
} from "./types";

export {
  fmtCents,
  type BackendProjectStatus,
  type DeadlineStatus,
  type IssuePriority,
  type IssueStatus,
  type MemberStatus,
  type PaymentProvider,
  type PaymentStatus,
};

export interface DeveloperPhase {
  phase_index: number;
  status: string;
  deadline: string | null;
  is_mine: boolean;
  deliverables: Deliverable[];
}

export interface DeveloperPayment {
  id: string;
  phase_index: number;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  created_at: string;
  settled_at: string | null;
}

export interface DeveloperEngagement {
  phase_index: number;
  agreed_cents: number;
  paid_cents: number;
}

export interface DeveloperEarnings {
  currency: string;
  agreed_cents: number;
  paid_cents: number;
  outstanding_cents: number;
  engagements: DeveloperEngagement[];
  payments: DeveloperPayment[];
}

export interface DeveloperProjectSummary {
  id: string;
  blueprint_id: string;
  founder_id: string;
  founder_name: string;
  title: string;
  status: BackendProjectStatus;
  my_phase_indices: number[];
  deliverables_done: number;
  deliverables_total: number;
  open_issues: number;
  next_deadline: string | null;
  earnings: DeveloperEarnings;
}

export interface DeveloperProjectDetail extends DeveloperProjectSummary {
  phases: DeveloperPhase[];
  issues: Issue[];
  deadlines: Deadline[];
}

export interface DeveloperInvite {
  id: string;
  project_id: string;
  project_title: string;
  founder_name: string;
  phase_index: number;
  status: MemberStatus;
  amount_agreed_cents: number;
  counter_amount_cents: number | null;
  invited_at: string;
}

interface ListWire<T> {
  total: number;
  items: T[];
}

export async function listDeveloperProjects(): Promise<DeveloperProjectSummary[]> {
  const data = await apiFetch<ListWire<DeveloperProjectSummary>>("/developer/projects", {
    auth: true,
  });
  return data.items;
}

export async function getDeveloperProject(projectId: string): Promise<DeveloperProjectDetail> {
  return apiFetch<DeveloperProjectDetail>(`/developer/projects/${projectId}`, { auth: true });
}

export async function listDeveloperInvites(): Promise<DeveloperInvite[]> {
  const data = await apiFetch<ListWire<DeveloperInvite>>("/developer/projects/invites", {
    auth: true,
  });
  return data.items;
}

export async function respondToInvite(memberId: string, accept: boolean): Promise<void> {
  await apiFetch(`/developer/projects/invites/${memberId}/${accept ? "accept" : "decline"}`, {
    method: "POST",
    auth: true,
  });
}

/** Developer proposes a different rate instead of accepting/declining the invite. */
export async function negotiateInvite(memberId: string, amountCents: number): Promise<void> {
  await apiFetch(`/developer/projects/invites/${memberId}/negotiate`, {
    method: "POST",
    auth: true,
    body: { amount_cents: amountCents },
  });
}
