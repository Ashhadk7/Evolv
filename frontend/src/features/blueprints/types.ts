import type { ProjectState } from "./blueprint-content";

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
  fundingReadiness: "High" | "Medium" | "Low";
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
  project?: ProjectState;
}
