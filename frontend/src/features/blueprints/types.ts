import type { ProjectState } from "./blueprint-content";

export interface BlueprintAgentOutputs {
  positioning?: Record<string, unknown>;
  market?: Record<string, unknown>;
  competitor?: Record<string, unknown>;
  persona?: Record<string, unknown>;
}

export interface BlueprintIntake {
  idea?: string;
  industry?: string;
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

// The startup Blueprint domain entity. Extracted from WorkspaceTab so it can be
// shared (founder workspace/projects + developer projects) without importing the
// large workspace component. `Blueprint` and `ProjectState` reference each other,
// so this is a type-only cycle with blueprint-content (fine — types erase).
export interface Blueprint {
  id: string;
  name: string;
  industry: string;
  ideaDesc: string;
  isPublic: boolean;
  status: "PUBLISHED" | "DRAFT";
  viability: number;
  investorInterest: number;
  marketPotential: number;
  developerDemand: "High" | "Medium" | "Low";
  devMatches: number;
  views: number;
  investorViews: number;
  interested: number;
  wordCount: number;
  updatedAt: string;
  aiRecommend: string;
  market: { size: string; cagr: string; barriers: string; score: number };
  competitors: { name: string; type: string }[];
  differentiator: string;
  features: string[];
  techStack: {
    frontend: string;
    backend: string;
    ai: string;
    db: string;
    vectorDb?: string;
    aiProvider?: string;
    hosting?: string;
  };
  cost: { timeline: string; team: string; hosting: string; budget: string };
  contentJson?: Record<string, unknown> | null;
  agentOutputs?: BlueprintAgentOutputs;
  intake?: BlueprintIntake;
  project?: ProjectState;
}
