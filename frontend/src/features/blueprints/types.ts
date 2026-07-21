import type { ProjectState } from "./blueprint-content";

export interface BlueprintAgentOutputs {
  market?: Record<string, unknown>;
  competitor?: Record<string, unknown>;
  persona?: Record<string, unknown>;
  product?: Record<string, unknown>;
  techStack?: Record<string, unknown>;
  strategy?: Record<string, unknown>;
  scorecard?: Record<string, unknown>;
  synthesis?: Record<string, unknown>;
}

export interface BlueprintRole {
  role: string;
  count: number;
  skills: string;
  lead: boolean;
}

export type BlueprintRiskSeverity = "High" | "Medium" | "Low";

export interface BlueprintStrategyItem {
  title: string;
  text: string;
}

export interface BlueprintStrategyAddition extends BlueprintStrategyItem {
  impact: string;
}

export interface BlueprintStrategyRisk {
  risk: string;
  severity: BlueprintRiskSeverity;
  mitigation: string;
}

export interface BlueprintStrategy {
  marketLacks: BlueprintStrategyItem[];
  recommendedAdditions: BlueprintStrategyAddition[];
  pathToComplete: string[];
  risks: BlueprintStrategyRisk[];
  gtmChannels: BlueprintStrategyItem[];
  gtmSequence: string[];
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
  roles?: BlueprintRole[];
  strategy?: BlueprintStrategy;
  contentJson?: Record<string, unknown> | null;
  agentOutputs?: BlueprintAgentOutputs;
  intake?: BlueprintIntake;
  project?: ProjectState;
}
