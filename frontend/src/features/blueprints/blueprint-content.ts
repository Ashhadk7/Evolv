import type { ReactNode } from "react";
import type { Blueprint } from "./types";

/* ═══════════════════════════════════════════════════════ */
/* Shared pure helpers (moved out of WorkspaceTab so both    */
/* the view and this content model can use them)             */
/* ═══════════════════════════════════════════════════════ */
export function parseBudget(s: string): number {
  const m = s.replace(/[, ]/g, "").match(/\$?([\d.]+)\s*([kKmM])?/);
  if (!m) return 80000;
  let n = parseFloat(m[1]);
  const u = (m[2] || "").toLowerCase();
  if (u === "k") n *= 1000;
  else if (u === "m") n *= 1000000;
  return n;
}
export function fmtMoney(n: number): string {
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(n % 1000000 ? 1 : 0) + "M";
  if (n >= 1000) return "$" + Math.round(n / 1000) + "K";
  return "$" + Math.round(n);
}
export function gradeFor(v: number): string {
  if (v >= 88) return "A+";
  if (v >= 82) return "A";
  if (v >= 76) return "A−";
  if (v >= 70) return "B+";
  if (v >= 64) return "B";
  return "B−";
}
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
export function addWeeksISO(weeks: number, from: string = todayISO()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ═══════════════════════════════════════════════════════ */
/* Types — shaped like the future 8-agent pipeline output    */
/* ═══════════════════════════════════════════════════════ */
export type Persona = {
  name: string;
  segment: "Primary user" | "Economic buyer" | "Gatekeeper";
  about: string;
  goals: string;
  pains: string;
};

export type Viability = {
  score: number;
  grade: string;
  reasoning: string;
  subScores: { market: number; execution: number; timing: number; teamFit: number };
};

export type MarketAnalysis = {
  demandLevel: "High" | "Medium" | "Low";
  totalMarket: string;
  reachableMarket: string;
  realisticCapture: string;
  cagr: string;
  growth: string;
  timing: string;
  whyNow: string;
  insight: string;
  demandSignals: string[];
  headwinds: string[];
};

export type CompetitorRow = {
  name: string;
  pricing: string;
  strengths: string[];
  weaknesses: string[];
  gap: string;
};

export type SimilarStartup = { name: string; oneLiner: string; outcome: string };

export type MvpPlan = {
  mustHave: string[];
  shouldHave: string[];
  niceToHave: string[];
  timelineWeeks: number;
  outOfScope: string[];
};

export type StackLayerKey =
  "frontend" | "backend" | "database" | "vectorDb" | "aiProvider" | "hosting";
export type TechStackLayer = {
  chosen: string;
  options: string[];
  reasoning: string;
  monthlyCost: string;
};
export type TechStackModel = Record<StackLayerKey, TechStackLayer>;

export type ArchitectureNode = {
  id: string;
  label: string;
  kind: "frontend" | "backend" | "ai" | "data" | "integration" | "infra";
};
export type ArchitectureEdge = { from: string; to: string };

export type Phase = {
  name: string;
  layer: string;
  weeks: number;
  deliverables: string[];
  acceptanceCriteria: string[];
  skillset: string[];
  primarySkill: string;
  weeklyRate: number; // market contractor rate for this phase's skill
  cost: number; // weeklyRate × weeks — the founder's payment for this milestone
  status: "In Progress" | "Planned";
  assignedDeveloper?: string;
};

/* Cost is derived bottom-up from each phase's skill × market rate ×
   weeks — never a hardcoded budget. This is the "agent analyzed what
   developers actually charge" logic. */
export type CostModel = {
  devTotal: number; // Σ phase.cost — total paid through milestones
  platformFeePct: number; // Evolv's commission, taken from each milestone
  platformFee: number;
  devTakeHome: number; // what developers actually receive
  infraDuringBuild: number;
  contingency: number;
  total: number; // total build cost the founder should plan for
  buildWeeks: number;
  timelineLabel: string; // derived from phase weeks — no more 6mo/14wk clash
  monthlyRunCost: string;
  composition: { label: string; value: number; tone: string }[];
};

export type Financials = {
  pricePerUser: number;
  startingUsers: number;
  monthlyGrowthPct: number;
  revenueModel: string;
  year1: { month: number; users: number; mrr: number; cumulative: number }[];
  eoyMrr: number;
  eoyArr: number;
  breakEvenMonth: number | null; // null → not within 24 months
};

export type StackCat = {
  icon: ReactNode;
  name: string;
  primary: string;
  rows: { k: string; v: string }[];
};

export type BlueprintContent = {
  personas: Persona[];
  viability: Viability;
  marketAnalysis: MarketAnalysis;
  competitors: CompetitorRow[];
  similarStartups: SimilarStartup[];
  mvpPlan: MvpPlan;
  techStack: TechStackModel;
  costModel: CostModel;
  financials: Financials;
  phases: Phase[];
};

/* ═══════════════════════════════════════════════════════ */
/* Derivation helpers                                         */
/* ═══════════════════════════════════════════════════════ */
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];
}

function recordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(asRecord(item)))
    : [];
}

function agentRecord(bp: Blueprint, key: keyof NonNullable<Blueprint["agentOutputs"]>) {
  return asRecord(bp.agentOutputs?.[key]);
}

function sentenceList(value: unknown, fallback: string): string {
  const items = stringArray(value);
  return items.length ? items.join("; ") : fallback;
}

function parseMarketMoney(s: string): number {
  const m = s.replace(/[, ]/g, "").match(/\$?([\d.]+)\s*([kKmMbB])?/);
  if (!m) return 500000000;
  let n = parseFloat(m[1]);
  const u = (m[2] || "").toLowerCase();
  if (u === "k") n *= 1000;
  else if (u === "m") n *= 1000000;
  else if (u === "b") n *= 1000000000;
  return n;
}

function fmtMarketMoney(n: number): string {
  if (n >= 1000000000) return "$" + (n / 1000000000).toFixed(n % 1000000000 ? 1 : 0) + "B";
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(n % 1000000 ? 1 : 0) + "M";
  if (n >= 1000) return "$" + Math.round(n / 1000) + "K";
  return "$" + Math.round(n);
}

function barrierMultiplier(barriers: string): number {
  const b = barriers.toLowerCase();
  if (
    b.includes("high") ||
    b.includes("regulatory") ||
    b.includes("hardware") ||
    b.includes("grid")
  )
    return 0.76;
  if (b.includes("moderate") || b.includes("content")) return 0.9;
  return 1;
}

function derivePersonas(bp: Blueprint): Persona[] {
  const personaAgent = agentRecord(bp, "persona");
  const generatedPersonas = recordArray(personaAgent?.personas);
  if (generatedPersonas.length) {
    return generatedPersonas.slice(0, 3).map((persona) => ({
      name: stringValue(persona.name, "Generated persona"),
      segment: (stringValue(persona.segment, "Primary user") as Persona["segment"]),
      about: stringValue(persona.context, stringValue(persona.role, "Core customer segment")),
      goals: sentenceList(persona.goals, "Achieve the core outcome faster."),
      pains: sentenceList(persona.pains, "Current workflows are slow or unreliable."),
    }));
  }

  const ind = bp.industry.toLowerCase();
  if (ind.includes("health"))
    return [
      {
        name: "The Frontline Clinician",
        segment: "Primary user",
        about:
          "Oncologists and radiologists who review scans every day and carry the diagnostic decision.",
        goals: "Faster, more confident diagnoses with fewer false positives.",
        pains: "Manual review is slow, and existing AI tools don't explain their reasoning.",
      },
      {
        name: "The Clinic Operations Lead",
        segment: "Economic buyer",
        about: "Runs throughput and budget for the practice, and signs off on any new tooling.",
        goals: "Higher patient throughput with a clear, provable ROI on new tools.",
        pains: "Cost is hard to justify and EHR integration stalls every rollout.",
      },
      {
        name: "The Health-System IT Owner",
        segment: "Gatekeeper",
        about: "Owns security, compliance and deployment — and can block adoption outright.",
        goals: "Secure, compliant, low-maintenance software that passes review.",
        pains: "Data privacy, audit trails and vendor risk are dealbreakers.",
      },
    ];
  return [
    {
      name: `The ${bp.industry} Practitioner`,
      segment: "Primary user",
      about: `The person who would use ${bp.name} day to day to get the core ${bp.industry.toLowerCase()} job done.`,
      goals: `Get the core ${bp.industry.toLowerCase()} outcome faster, with far less friction.`,
      pains: "Today's tools are clunky, generic and slow to deliver real value.",
    },
    {
      name: "The Team Lead",
      segment: "Economic buyer",
      about: "Owns the budget and the decision to adopt on behalf of their team.",
      goals: "Clear ROI, easy rollout and measurable impact within a quarter.",
      pains: "Hard to evaluate, and switching costs feel high.",
    },
    {
      name: "The Ops / IT Owner",
      segment: "Gatekeeper",
      about: "Responsible for security, access and keeping existing systems reliable.",
      goals: "Reliable, secure software that fits the systems they already run.",
      pains: "Security review, permissions and integration overhead slow everything down.",
    },
  ];
}

function deriveViability(bp: Blueprint): Viability {
  const cagrNum = parseFloat(bp.market.cagr) || 20;
  const execution = Math.round(bp.viability * 0.88);
  const timing = Math.min(95, Math.round(55 + cagrNum));
  const teamFit = bp.developerDemand === "High" ? 88 : bp.developerDemand === "Medium" ? 72 : 58;
  const tier = bp.viability >= 80 ? "strong" : bp.viability >= 68 ? "solid" : "early-stage";
  return {
    score: bp.viability,
    grade: gradeFor(bp.viability),
    reasoning: `${bp.name} scores ${bp.viability}/100 — ${tier} fundamentals, driven by ${bp.market.score >= 75 ? "a large, fast-growing market" : "a focused, underserved niche"} and ${bp.developerDemand.toLowerCase()} developer interest. ${bp.aiRecommend}.`,
    subScores: { market: bp.market.score, execution, timing, teamFit },
  };
}

function deriveMarketAnalysis(bp: Blueprint): MarketAnalysis {
  const marketAgent = agentRecord(bp, "market");
  const cagrNum = parseFloat(bp.market.cagr) || 20;
  const agentDemandLevel = stringValue(marketAgent?.demandLevel);
  const demandLevel: MarketAnalysis["demandLevel"] =
    agentDemandLevel === "High" || agentDemandLevel === "Medium" || agentDemandLevel === "Low"
      ? agentDemandLevel
      : bp.market.score >= 75
        ? "High"
        : bp.market.score >= 60
          ? "Medium"
          : "Low";
  const totalMarketValue = parseMarketMoney(bp.market.size);
  const barrierFactor = barrierMultiplier(bp.market.barriers);
  const reachablePct = clamp((bp.market.score / 100) * 0.22 * barrierFactor, 0.08, 0.22);
  const capturePct = clamp((bp.viability / 100) * 0.06 * barrierFactor, 0.015, 0.06);
  const reachableMarketValue = totalMarketValue * reachablePct;
  const realisticCaptureValue = reachableMarketValue * capturePct;
  const growth =
    cagrNum > 25
      ? `${bp.market.cagr} CAGR signals fast category expansion, but also higher urgency to prove the wedge quickly.`
      : cagrNum > 15
        ? `${bp.market.cagr} CAGR is strong enough for new entrants if the first segment is narrow and reachable.`
        : `${bp.market.cagr} CAGR suggests a steadier market where differentiation has to carry more of the sale.`;
  const whyNow =
    cagrNum > 25
      ? `The market is still forming, so ${bp.name} can shape buyer expectations around ${bp.differentiator.toLowerCase()} before defaults harden.`
      : cagrNum > 15
        ? `The category is growing, but buyer workflows have not fully settled; ${bp.differentiator.toLowerCase()} gives the product a timely entry wedge.`
        : `The market is mature enough to have budget, but underserved teams still need a cheaper, focused alternative to incumbent tools.`;
  const timing =
    cagrNum > 25
      ? "Early — the category is still forming, which is the ideal window to establish position."
      : cagrNum > 15
        ? "Growing steadily — there's room to build a position before the market consolidates."
        : "Maturing — differentiation and cost efficiency matter more than pure timing here.";
  return {
    demandLevel,
    totalMarket: bp.market.size,
    reachableMarket: fmtMarketMoney(reachableMarketValue),
    realisticCapture: fmtMarketMoney(realisticCaptureValue),
    cagr: bp.market.cagr,
    growth,
    timing: stringValue(marketAgent?.timing, timing),
    whyNow: stringValue(marketAgent?.whyNow, whyNow),
    insight: stringValue(
      marketAgent?.insight,
      `The broad category is ${bp.market.size}; the more useful first target is an estimated ${fmtMarketMoney(reachableMarketValue)} reachable wedge, with about ${fmtMarketMoney(realisticCaptureValue)} plausible 3-year capture if execution matches the current viability score.`
    ),
    demandSignals: stringArray(marketAgent?.demandSignals).length
      ? stringArray(marketAgent?.demandSignals)
      : [
          `${demandLevel} market score (${bp.market.score}/100)`,
          `${bp.market.cagr} category growth`,
          `${bp.developerDemand} developer interest for building this kind of product`,
          bp.competitors.length
            ? "Comparable competitors validate buyer budget"
            : "Clear whitespace, but fewer competitor proof points",
        ],
    headwinds: stringArray(marketAgent?.headwinds).length
      ? stringArray(marketAgent?.headwinds)
      : [bp.market.barriers, "Incumbent players already have distribution and buyer trust"],
  };
}

function deriveCompetitors(bp: Blueprint): CompetitorRow[] {
  const competitorAgent = agentRecord(bp, "competitor");
  const generatedCompetitors = recordArray(competitorAgent?.competitors);
  if (generatedCompetitors.length) {
    return generatedCompetitors.map((competitor) => ({
      name: stringValue(competitor.name, "Competitor"),
      pricing: stringValue(competitor.type, "Comparable player"),
      strengths: stringArray(competitor.strengths).length
        ? stringArray(competitor.strengths)
        : [stringValue(competitor.positioning, "Established category presence")],
      weaknesses: stringArray(competitor.weaknesses).length
        ? stringArray(competitor.weaknesses)
        : ["May not serve the first wedge deeply"],
      gap: stringValue(competitor.gap, "Opportunity to serve a narrower customer segment better"),
    }));
  }

  const rows = bp.competitors.length
    ? bp.competitors
    : [{ name: "Established incumbent", type: "Direct" }];
  return rows.map((c) => {
    const direct = c.type === "Direct";
    return {
      name: c.name,
      pricing: direct ? "Enterprise pricing, custom quotes" : "Mid-market, seat-based pricing",
      strengths: direct
        ? ["Established brand trust", "Deep enterprise integrations"]
        : ["Broad platform reach", "Lower switching friction for buyers"],
      weaknesses: direct
        ? ["Slow to adapt, built for large teams", "Expensive for smaller buyers"]
        : [`Generic — not purpose-built for ${bp.industry}`, "Limited depth on the core workflow"],
      gap: direct
        ? `Priced out of reach for smaller ${bp.industry} teams`
        : "Doesn't go deep enough on the core workflow",
    };
  });
}

const SIMILAR_STARTUPS_BY_INDUSTRY: Record<string, SimilarStartup[]> = {
  health: [
    {
      name: "PathAI",
      oneLiner: "AI-assisted pathology diagnostics for hospital labs.",
      outcome: "Raised $255M+ across multiple rounds; deployed across major health systems.",
    },
    {
      name: "Tempus",
      oneLiner: "Precision-medicine platform combining clinical and molecular data.",
      outcome: "IPO'd in 2024 at a multi-billion dollar valuation.",
    },
    {
      name: "Paige",
      oneLiner: "FDA-cleared AI for cancer diagnosis from pathology slides.",
      outcome: "First FDA-approved AI product in digital pathology.",
    },
  ],
  saas: [
    {
      name: "Linear",
      oneLiner: "Opinionated issue tracking built for fast-moving product teams.",
      outcome: "Reached a $1.25B valuation with a small, focused team.",
    },
    {
      name: "Notion",
      oneLiner: "Flexible workspace for docs, wikis, and lightweight databases.",
      outcome: "Grew to 30M+ users before raising at a $10B valuation.",
    },
  ],
  clean: [
    {
      name: "Arcadia",
      oneLiner: "Software layer connecting households and businesses to clean energy.",
      outcome: "Raised $377M+ and partners with utilities across the US.",
    },
    {
      name: "LO3 Energy",
      oneLiner: "Blockchain-based peer-to-peer energy trading.",
      outcome: "Piloted transactive-grid projects with utilities in three countries.",
    },
  ],
  ed: [
    {
      name: "Khanmigo",
      oneLiner: "AI tutor layered on Khan Academy's curriculum.",
      outcome: "Rolled out to hundreds of school districts within its first year.",
    },
    {
      name: "Squirrel AI",
      oneLiner: "Adaptive learning engine for K-12 math in China.",
      outcome: "Scaled to 2,000+ learning centers before expanding internationally.",
    },
  ],
};
function deriveSimilarStartups(bp: Blueprint): SimilarStartup[] {
  const ind = bp.industry.toLowerCase();
  const key = Object.keys(SIMILAR_STARTUPS_BY_INDUSTRY).find((k) => ind.includes(k));
  if (key) return SIMILAR_STARTUPS_BY_INDUSTRY[key];
  return [
    {
      name: `${bp.industry} category leader`,
      oneLiner: `An established player proving demand for ${bp.industry.toLowerCase()} tooling exists.`,
      outcome: "Reached meaningful scale with a comparable product thesis.",
    },
    {
      name: "Adjacent-market challenger",
      oneLiner: `A startup that broke into ${bp.industry.toLowerCase()} from a neighbouring category.`,
      outcome: "Validated that outsiders can win here with the right wedge.",
    },
  ];
}

function deriveMvpPlan(bp: Blueprint, totalWeeks: number): MvpPlan {
  return {
    mustHave: bp.features.slice(0, 2),
    shouldHave: bp.features.slice(2, 4),
    niceToHave: bp.features.slice(4),
    timelineWeeks: totalWeeks,
    outOfScope: [
      "Native mobile apps — ship web-first, evaluate mobile after MVP validation",
      "Multi-language / localisation",
      `Deep ${bp.industry} enterprise integrations beyond the first design partner`,
    ],
  };
}

const STACK_OPTIONS: Record<StackLayerKey, string[]> = {
  frontend: ["Next.js", "Remix", "SvelteKit", "Vue / Nuxt"],
  backend: ["Node.js / Express", "FastAPI (Python)", "Go", "NestJS"],
  database: ["PostgreSQL", "MySQL", "MongoDB", "PlanetScale"],
  vectorDb: ["Pinecone", "FAISS", "Weaviate", "Qdrant", "pgvector"],
  aiProvider: ["OpenAI", "Anthropic", "Groq", "Google Gemini"],
  hosting: ["Vercel", "Railway", "Render", "AWS"],
};

function deriveTechStack(bp: Blueprint): TechStackModel {
  const frontend = bp.techStack.frontend.split(",")[0].trim();
  const backend = bp.techStack.backend.split(",")[0].trim();
  const database = bp.techStack.db.split(",")[0].trim();
  const vectorDb = "Pinecone";
  const aiProvider = "OpenAI";
  const hosting = "Vercel";
  return {
    frontend: {
      chosen: frontend,
      options: STACK_OPTIONS.frontend,
      reasoning: `${frontend} gives the fastest path to a polished, responsive UI with a large hiring pool.`,
      monthlyCost: "Included in hosting",
    },
    backend: {
      chosen: backend,
      options: STACK_OPTIONS.backend,
      reasoning: `${backend} fits the ${bp.industry} domain logic and scales cleanly as usage grows.`,
      monthlyCost: "Included in hosting",
    },
    database: {
      chosen: database,
      options: STACK_OPTIONS.database,
      reasoning: `${database} handles relational data with strong consistency guarantees for this domain.`,
      monthlyCost: "$15–60/mo (managed)",
    },
    vectorDb: {
      chosen: vectorDb,
      options: STACK_OPTIONS.vectorDb,
      reasoning: `${vectorDb} is the fastest way to ship semantic search and retrieval without managing infra.`,
      monthlyCost: "$0–70/mo (free tier available)",
    },
    aiProvider: {
      chosen: aiProvider,
      options: STACK_OPTIONS.aiProvider,
      reasoning: `${aiProvider} gives the best balance of quality, latency, and cost for this use case.`,
      monthlyCost: "$50–400/mo (usage-based)",
    },
    hosting: {
      chosen: hosting,
      options: STACK_OPTIONS.hosting,
      reasoning: `${hosting} keeps deploys simple with zero-ops scaling for an early-stage team.`,
      monthlyCost: bp.cost.hosting,
    },
  };
}

/* Architecture is derived live from whatever tech stack is currently
   selected (including founder edits), so the diagram always matches
   the editable stack — it is not baked into the static content model. */
const DIAGRAM_NODE_ORDER: {
  id: string;
  kind: ArchitectureNode["kind"];
  layerKey: StackLayerKey | null;
  fixedLabel?: string;
}[] = [
  { id: "client", kind: "frontend", layerKey: "frontend" },
  { id: "api", kind: "backend", layerKey: "backend" },
  { id: "ai", kind: "ai", layerKey: "aiProvider" },
  { id: "vector", kind: "data", layerKey: "vectorDb" },
  { id: "db", kind: "data", layerKey: "database" },
  { id: "payments", kind: "integration", layerKey: null, fixedLabel: "Payments — Stripe Connect" },
  { id: "hosting", kind: "infra", layerKey: "hosting" },
];
const DIAGRAM_EDGES: ArchitectureEdge[] = [
  { from: "client", to: "api" },
  { from: "api", to: "ai" },
  { from: "ai", to: "vector" },
  { from: "api", to: "db" },
  { from: "api", to: "payments" },
  { from: "client", to: "hosting" },
  { from: "api", to: "hosting" },
];
export function buildArchitecture(techStack: TechStackModel): {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
} {
  const labelFor = (key: StackLayerKey, prefix: string) => `${prefix} — ${techStack[key].chosen}`;
  const nodes: ArchitectureNode[] = DIAGRAM_NODE_ORDER.map((n) => {
    if (!n.layerKey) return { id: n.id, kind: n.kind, label: n.fixedLabel! };
    const prefix =
      {
        client: "Client",
        api: "API",
        ai: "AI Layer",
        vector: "Vector Store",
        db: "Database",
        hosting: "Hosting",
      }[n.id] || n.id;
    return { id: n.id, kind: n.kind, label: labelFor(n.layerKey, prefix) };
  });
  return { nodes, edges: DIAGRAM_EDGES };
}

/* Market contractor rates (blended, USD/week) by skill. This is the
   table the "cost agent" reasons over — what developers actually charge. */
const WEEKLY_RATES: Record<string, number> = {
  "ai/ml": 5500,
  "full stack": 4200,
  backend: 4000,
  "stripe connect": 4000,
  devops: 3800,
  frontend: 3500,
  design: 3200,
  qa: 2800,
  default: 3800,
};
function rateForSkill(skill: string): number {
  const key = Object.keys(WEEKLY_RATES).find((k) => skill.toLowerCase().includes(k));
  return WEEKLY_RATES[key || "default"];
}
function parseMonthly(s: string): number {
  const m = s.replace(/[, ]/g, "").match(/\$?([\d.]+)\s*([kK])?/);
  if (!m) return 800;
  let n = parseFloat(m[1]);
  if ((m[2] || "").toLowerCase() === "k") n *= 1000;
  return n;
}

const PALETTE = { mint: "#89d7b7", teal: "#428475", mintSoft: "#a8dfc9", faint: "#cfe3d8" };

function buildPhases(bp: Blueprint): Phase[] {
  const raw: Omit<Phase, "primarySkill" | "weeklyRate" | "cost">[] = [
    {
      name: "Foundation & UI",
      layer: bp.techStack.frontend,
      weeks: 3,
      deliverables: [
        "Design system & component library",
        "Responsive app shell",
        "Auth & onboarding screens",
      ],
      acceptanceCriteria: [
        "Design system covers every core screen",
        "Auth flow works end-to-end in staging",
      ],
      skillset: ["Frontend", bp.techStack.frontend.split(",")[0].trim()],
      status: "In Progress",
    },
    {
      name: "Core Backend & API",
      layer: bp.techStack.backend,
      weeks: 4,
      deliverables: [
        "Data model & migrations",
        "REST API + auth middleware",
        "Core business logic",
      ],
      acceptanceCriteria: [
        "API contract documented and typed end-to-end",
        "Core business logic covered by tests",
      ],
      skillset: ["Backend", bp.techStack.backend.split(",")[0].trim()],
      status: "Planned",
    },
    {
      name: "Intelligence Layer",
      layer: bp.techStack.ai,
      weeks: 3,
      deliverables: ["Model integration", "Inference pipeline & caching", "Results & insights API"],
      acceptanceCriteria: [
        "Inference latency within target on staging data",
        "Results API returns explainable output",
      ],
      skillset: ["AI/ML", bp.techStack.ai.split(",")[0].trim()],
      status: "Planned",
    },
    {
      name: "Payments & Integrations",
      layer: "Stripe Connect",
      weeks: 2,
      deliverables: [
        "Milestone escrow flow",
        "Connected accounts & payouts",
        "Email & notifications",
      ],
      acceptanceCriteria: [
        "A milestone can be funded, approved, and paid out end-to-end in test mode",
      ],
      skillset: ["Backend", "Stripe Connect"],
      status: "Planned",
    },
    {
      name: "Hardening & Launch",
      layer: "QA · CI/CD",
      weeks: 2,
      deliverables: ["E2E + load testing", "Observability & alerts", "Production deploy pipeline"],
      acceptanceCriteria: [
        "E2E suite passes in CI",
        "Alerts fire correctly on a simulated incident",
      ],
      skillset: ["DevOps", "QA"],
      status: "Planned",
    },
  ];
  return raw.map((p) => {
    const primarySkill = p.skillset[0];
    const weeklyRate = rateForSkill(primarySkill);
    return { ...p, primarySkill, weeklyRate, cost: weeklyRate * p.weeks };
  });
}

function buildCostModel(bp: Blueprint, phases: Phase[]): CostModel {
  const buildWeeks = phases.reduce((s, p) => s + p.weeks, 0) || 1;
  const devTotal = phases.reduce((s, p) => s + p.cost, 0);
  const platformFeePct = 0.08;
  const platformFee = Math.round(devTotal * platformFeePct);
  const devTakeHome = devTotal - platformFee;
  const buildMonths = buildWeeks / 4.33;
  const infraDuringBuild = Math.round(parseMonthly(bp.cost.hosting) * buildMonths);
  const contingency = Math.round(devTotal * 0.1);
  const total = devTotal + infraDuringBuild + contingency;
  const months = Math.round(buildWeeks / 4.33);
  return {
    devTotal,
    platformFeePct,
    platformFee,
    devTakeHome,
    infraDuringBuild,
    contingency,
    total,
    buildWeeks,
    timelineLabel: `${buildWeeks} weeks · ~${months} months`,
    monthlyRunCost: bp.cost.hosting,
    composition: [
      { label: "Developer payouts", value: devTakeHome, tone: PALETTE.mint },
      { label: "Evolv platform fee", value: platformFee, tone: PALETTE.teal },
      { label: "Infrastructure & tooling", value: infraDuringBuild, tone: PALETTE.mintSoft },
      { label: "Contingency (10%)", value: contingency, tone: PALETTE.faint },
    ],
  };
}

function deriveFinancials(bp: Blueprint, buildCost: number): Financials {
  const startingUsers = Math.round(20 + bp.marketPotential * 0.6);
  const monthlyGrowthPct = Math.round((0.08 + (bp.viability / 100) * 0.08) * 100); // 8–16%/mo
  const g = monthlyGrowthPct / 100;
  const price = 49;
  // Compute month-by-month for 24 months so break-even can be found beyond year 1.
  let users = startingUsers;
  let cumulative = 0;
  const all: { month: number; users: number; mrr: number; cumulative: number }[] = [];
  let breakEvenMonth: number | null = null;
  for (let m = 1; m <= 24; m++) {
    if (m > 1) users = Math.round(users * (1 + g));
    const mrr = Math.round(users * price);
    cumulative += mrr;
    if (breakEvenMonth === null && cumulative >= buildCost) breakEvenMonth = m;
    all.push({ month: m, users, mrr, cumulative });
  }
  const year1 = all.slice(0, 12);
  const eoy = year1[11];
  return {
    pricePerUser: price,
    startingUsers,
    monthlyGrowthPct,
    revenueModel:
      "B2B SaaS subscription with usage-based tiers. Founders fund development directly; developers are paid per approved milestone through Evolv's Stripe Connect escrow.",
    year1,
    eoyMrr: eoy.mrr,
    eoyArr: eoy.mrr * 12,
    breakEvenMonth,
  };
}

/* ═══════════════════════════════════════════════════════ */
/* Public entry point                                         */
/* ═══════════════════════════════════════════════════════ */
export function buildBlueprintContent(bp: Blueprint): BlueprintContent {
  const phases = buildPhases(bp);
  const totalWeeks = phases.reduce((s, p) => s + p.weeks, 0) || 1;
  const costModel = buildCostModel(bp, phases);
  return {
    personas: derivePersonas(bp),
    viability: deriveViability(bp),
    marketAnalysis: deriveMarketAnalysis(bp),
    competitors: deriveCompetitors(bp),
    similarStartups: deriveSimilarStartups(bp),
    mvpPlan: deriveMvpPlan(bp, totalWeeks),
    techStack: deriveTechStack(bp),
    costModel,
    financials: deriveFinancials(bp, costModel.total),
    phases,
  };
}

/* ═══════════════════════════════════════════════════════ */
/* Project management — runtime state for a started project  */
/* (kept separate from the static agent-generated spec       */
/* above; lives on Blueprint.project once a founder commits   */
/* to actually building it, not just pitching it)             */
/* ═══════════════════════════════════════════════════════ */
export type ProjectStatus = "ONBOARDING" | "IN_DEVELOPMENT" | "COMPLETED";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  ONBOARDING: "Onboarding Project",
  IN_DEVELOPMENT: "In Development",
  COMPLETED: "Project Completed",
};
export const PROJECT_STATUS_STYLE: Record<ProjectStatus, { bg: string; color: string }> = {
  ONBOARDING: { bg: "#fef6e4", color: "#a66a10" },
  IN_DEVELOPMENT: { bg: "#dcf0e6", color: "#1d6e47" },
  COMPLETED: { bg: "#eef0ee", color: "#4f6358" },
};

export type PhaseAssignment = {
  developerId: string;
  developerName: string;
  developerInitials: string;
  hiredAt: string; // ISO date (YYYY-MM-DD)
  amountAgreed: number; // confirmed by the founder when hiring, pre-filled from phase.budget, editable at that moment
  amountPaid: number; // running total actually paid — "Not paid" / "Partially paid" / "Paid in full" is derived from this vs amountAgreed, never stored
  payments: { amount: number; date: string }[]; // the ledger — real usage is incremental (weekly, partial work), not one all-or-nothing release
};

/* Permanent audit trail — if a founder removes a developer mid-phase,
   the reason and amount paid at that moment are recorded and never
   cleared. This is the platform's record if a dispute is ever reported. */
export type DeveloperRemoval = {
  developerId: string;
  developerName: string;
  reason: string; // required, non-empty
  amountPaid: number; // pulled from the assignment at the moment of removal — not editable
  date: string; // ISO date
};

export type ProjectPhaseState = {
  deliverables: { text: string; done: boolean }[]; // founder can add/remove; seeded from the blueprint spec but no longer index-locked to it
  deadline: string | null; // founder-set, independent of any assignment; null until the founder sets one
  assignment: PhaseAssignment | null;
  status: "Not Started" | "In Progress" | "In Review" | "Complete";
  history: { label: string; date: string }[];
  removals: DeveloperRemoval[]; // permanent — never cleared, even across multiple hire/remove cycles on the same phase
  totalPaid: number; // sunk cost — survives removing/replacing the assignment, so budget burn never forgets money already released
  budget: number; // founder-editable planned spend for this phase; defaults to phase.cost, adjustable regardless of who's assigned
};

/* Every dollar spent on the project — developer payouts (auto-logged on
   release, never typed by hand) plus whatever the founder logs manually
   for hosting, domains, tools, and API costs. This is the single ledger
   behind "Total Spent". */
export type ExpenseCategory =
  "Developer Payment" | "Hosting" | "Domain" | "Tools & Services" | "API Costs" | "Other";
export type ProjectExpense = {
  id: string;
  label: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // ISO date
  phaseIndex: number | null; // linked phase for dev payments; null for general project costs
};

/* GitHub-Issues-style: what's wrong with what was built, not what to build. */
export type ProjectIssue = {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low"; // danger scale — High is red, same convention as risk severity
  status: "Open" | "In Progress" | "Resolved";
  phaseIndex: number | null; // optional link to a specific phase; null = project-wide
  createdAt: string; // ISO date
  history: { label: string; date: string }[];
};

export type ProjectDeadline = {
  id: string;
  note: string;
  priority: "Low" | "Medium" | "High";
  phaseIndex: number | null;
  date: string;
  status: "Pending" | "Met" | "Missed";
  createdAt: string;
};

export type ProjectState = {
  status: ProjectStatus;
  startedAt: string; // ISO date
  phaseStates: ProjectPhaseState[]; // index-aligned with content.phases
  issues: ProjectIssue[];
  deadlines: ProjectDeadline[];
  expenses: ProjectExpense[];
};

export function initProjectState(content: BlueprintContent): ProjectState {
  return {
    status: "ONBOARDING",
    startedAt: new Date().toISOString().slice(0, 10),
    phaseStates: content.phases.map((p) => ({
      deliverables: p.deliverables.map((text) => ({ text, done: false })),
      deadline: null,
      assignment: null,
      status: "Not Started",
      history: [{ label: "Project started", date: new Date().toISOString().slice(0, 10) }],
      removals: [],
      totalPaid: 0,
      budget: p.cost,
    })),
    issues: [],
    deadlines: [],
    expenses: [],
  };
}

/* Backfills fields added to the schema after some projects were already
   started (e.g. persisted in localStorage from an earlier session) —
   old records won't have `expenses`, a per-phase `budget`, the newer
   deliverables/deadline/removals shape, or the payment ledger yet. Call
   this on any ProjectState read from storage before trusting its shape. */
export function normalizeProjectState(
  content: BlueprintContent,
  project: ProjectState
): ProjectState {
  return {
    ...project,
    expenses: project.expenses ?? [],
    deadlines: project.deadlines ?? [],
    phaseStates: project.phaseStates.map((ps, i) => {
      const legacy = ps as unknown as { deliverablesDone?: boolean[] };
      const deliverables =
        ps.deliverables ??
        legacy.deliverablesDone?.map((done, k) => ({
          text: content.phases[i]?.deliverables[k] ?? `Deliverable ${k + 1}`,
          done,
        })) ??
        [];
      const assignment = ps.assignment
        ? (() => {
            const legacyAssignment = ps.assignment as unknown as {
              paymentStatus?: string;
              deadline?: string;
            };
            return {
              ...ps.assignment,
              amountPaid:
                ps.assignment.amountPaid ??
                (legacyAssignment.paymentStatus === "Released" ? ps.assignment.amountAgreed : 0),
              payments: ps.assignment.payments ?? [],
            };
          })()
        : null;
      return {
        ...ps,
        deliverables,
        deadline:
          ps.deadline ?? (ps.assignment as unknown as { deadline?: string })?.deadline ?? null,
        assignment,
        removals: ps.removals ?? [],
        budget: ps.budget ?? content.phases[i]?.cost ?? 0,
        totalPaid: ps.totalPaid ?? 0,
      };
    }),
  };
}

/* Status is always derived from phase state, never hand-set — so it can
   never drift out of sync with what's actually assigned/complete. */
export function deriveProjectStatus(project: ProjectState): ProjectStatus {
  if (project.phaseStates.length > 0 && project.phaseStates.every((ps) => ps.status === "Complete"))
    return "COMPLETED";
  if (project.phaseStates.some((ps) => ps.assignment !== null)) return "IN_DEVELOPMENT";
  return "ONBOARDING";
}

export type ProjectHealth = {
  verdict: "On track" | "Attention needed" | "At risk";
  budget: { spent: number; total: number; pct: number };
  timeline: { delayedCount: number; totalAssigned: number };
  deliverables: { done: number; total: number };
  developers: {
    developerId: string;
    developerName: string;
    phasesAssigned: number;
    phasesComplete: number;
    phasesOverdue: number;
  }[];
};

export function computeProjectHealth(
  content: BlueprintContent,
  project: ProjectState
): ProjectHealth {
  const today = new Date().toISOString().slice(0, 10);
  let delayedCount = 0;
  let totalAssigned = 0;
  let doneCount = 0;
  let totalDeliverables = 0;
  const devMap = new Map<string, ProjectHealth["developers"][number]>();

  project.phaseStates.forEach((ps) => {
    totalDeliverables += ps.deliverables.length;
    doneCount += ps.deliverables.filter((d) => d.done).length;

    if (ps.assignment) {
      totalAssigned += 1;
      const overdue = ps.status !== "Complete" && !!ps.deadline && ps.deadline < today;
      if (overdue) delayedCount += 1;

      const key = ps.assignment.developerId;
      const entry = devMap.get(key) || {
        developerId: key,
        developerName: ps.assignment.developerName,
        phasesAssigned: 0,
        phasesComplete: 0,
        phasesOverdue: 0,
      };
      entry.phasesAssigned += 1;
      if (ps.status === "Complete") entry.phasesComplete += 1;
      if (overdue) entry.phasesOverdue += 1;
      devMap.set(key, entry);
    }
  });

  // Budget is the founder-editable phase-wise sum, not the fixed cost-model estimate.
  // Falls back to the phase's derived cost for records saved before `budget` existed.
  const total = project.phaseStates.reduce(
    (s, ps, i) => s + (ps.budget ?? content.phases[i]?.cost ?? 0),
    0
  );
  // Spend is the single ledger — auto-logged payments + whatever the founder recorded manually.
  const spent = (project.expenses ?? []).reduce((s, e) => s + e.amount, 0);
  const verdict: ProjectHealth["verdict"] =
    delayedCount === 0 ? "On track" : delayedCount === 1 ? "Attention needed" : "At risk";

  return {
    verdict,
    budget: { spent, total, pct: total ? Math.min(100, Math.round((spent / total) * 100)) : 0 },
    timeline: { delayedCount, totalAssigned },
    deliverables: { done: doneCount, total: totalDeliverables },
    developers: Array.from(devMap.values()),
  };
}
