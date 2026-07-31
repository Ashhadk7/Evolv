import type { WorkspaceSort, WorkspaceStage } from "@/features/workspace/lib/workspace-metrics";

export const WORKSPACE_INDUSTRIES = [
  "MedTech",
  "SaaS",
  "FinTech",
  "CleanTech",
  "EdTech",
  "AI",
  "Web3",
  "E-commerce",
  "Deep Tech",
  "B2B",
];

export const WORKSPACE_STAGES: WorkspaceStage[] = ["All Stages", "Published", "Draft"];

// "Impressions" is deliberately absent: nothing in the backend counts blueprint
// views yet, so that option would sort every card by a constant zero.
export const WORKSPACE_SORT_OPTIONS: WorkspaceSort[] = ["Viability", "Recent", "Market Potential"];

// `key` matches the backend agent names written to content_json.generation.completedAgents.
export const FORGE_AGENTS = [
  {
    key: "market",
    label: "Market Agent",
    desc: "Researching market size, growth, and demand signals...",
  },
  {
    key: "competitor",
    label: "Competitor Agent",
    desc: "Mapping direct and adjacent competitors...",
  },
  {
    key: "persona",
    label: "Persona Agent",
    desc: "Building customer, buyer, and gatekeeper personas...",
  },
  { key: "product", label: "Product Agent", desc: "Scoping MVP features and boundaries..." },
  { key: "strategy", label: "Strategy Agent", desc: "Shaping go-to-market moves and roadmap..." },
  { key: "scorecard", label: "Scorecard Agent", desc: "Scoring viability against the evidence..." },
  { key: "techStack", label: "Tech Stack Agent", desc: "Selecting the stack and team roles..." },
  {
    key: "synthesis",
    label: "Synthesis Agent",
    desc: "Naming the venture and writing the verdict...",
  },
];
