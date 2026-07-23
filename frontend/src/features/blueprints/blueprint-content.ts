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

export type SubScore = { label: string; value: number; note: string; sourceIndexes: number[] };

export type Viability = {
  score: number;
  grade: string;
  reasoning: string;
  verdict: string; // "Build" | "Validate first" | "Rethink" | "" for legacy blueprints
  subScores: SubScore[];
};

export type ResearchSourceRef = { title: string; url: string; domain: string; snippet?: string };

export type CitedText = { text: string; sourceIndexes: number[] };

export type MarketAnalysis = {
  demandLevel: "High" | "Medium" | "Low";
  totalMarket: string;
  totalMarketBasis: string; // "sourced" | "assumption" | ""
  bottomUpSam: string; // customers × price, computed by the backend ("" for legacy)
  bottomUpBasis: string;
  cagr: string;
  cagrBasis: string;
  timing: string;
  whyNow: string;
  insight: string;
  analysis: string; // long-form analyst paragraph ("" for legacy blueprints)
  demandSignals: CitedText[];
  headwinds: string[];
  confidence: string;
  assumptions: string[];
  sources: ResearchSourceRef[];
  retrievedAt: string;
};

export type CompetitorRow = {
  name: string;
  type: string;
  strengths: string[];
  weaknesses: string[];
  gap: string;
  sourceIndexes: number[];
};

export type CompetitorInsight = {
  analysis: string;
  confidence: string;
  assumptions: string[];
  sources: ResearchSourceRef[];
  retrievedAt: string;
};

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
  assumptions: string[]; // every input to this illustrative model, stated plainly
};

export type StackCat = {
  icon: ReactNode;
  name: string;
  primary: string;
  rows: { k: string; v: string }[];
};

export type Synthesis = {
  tagline: string;
  executiveSummary: string;
  verdict: string;
  verdictReasoning: string;
  redFlags: { flag: string; severity: string }[];
  contradictions: string[];
  keyAssumptions: string[];
};

export type BlueprintContent = {
  personas: Persona[];
  viability: Viability;
  synthesis: Synthesis;
  marketAnalysis: MarketAnalysis;
  competitors: CompetitorRow[];
  competitorInsight: CompetitorInsight;
  mvpPlan: MvpPlan;
  techStack: TechStackModel;
  costModel: CostModel;
  financials: Financials;
  phases: Phase[];
};

/* ═══════════════════════════════════════════════════════ */
/* Derivation helpers                                         */
/* ═══════════════════════════════════════════════════════ */
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

function fmtMarketMoney(n: number): string {
  if (n >= 1000000000) return "$" + (n / 1000000000).toFixed(n % 1000000000 ? 1 : 0) + "B";
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(n % 1000000 ? 1 : 0) + "M";
  if (n >= 1000) return "$" + Math.round(n / 1000) + "K";
  return "$" + Math.round(n);
}

function derivePersonas(bp: Blueprint): Persona[] {
  const personaAgent = agentRecord(bp, "persona");
  const generatedPersonas = recordArray(personaAgent?.personas);
  if (generatedPersonas.length) {
    return generatedPersonas.map((persona) => ({
      name: stringValue(persona.name, "Generated persona"),
      segment: (stringValue(persona.segment, "Primary user") as Persona["segment"]),
      about: stringValue(persona.context, stringValue(persona.role, "Core customer segment")),
      goals: sentenceList(persona.goals, "Achieve the core outcome faster."),
      pains: sentenceList(persona.pains, "Current workflows are slow or unreliable."),
    }));
  }

  // No agent data → no personas. Fabricated archetypes erode trust in the
  // sections that ARE researched; the section renders an unavailable state.
  return [];
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function citedTexts(value: unknown): CitedText[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return { text: item, sourceIndexes: [] };
      const record = asRecord(item);
      return {
        text: stringValue(record?.text),
        sourceIndexes: Array.isArray(record?.sourceIndexes)
          ? record.sourceIndexes.filter((n): n is number => typeof n === "number")
          : [],
      };
    })
    .filter((item) => item.text);
}

function sourceRefs(value: unknown): ResearchSourceRef[] {
  return recordArray(value)
    .map((source) => ({
      title: stringValue(source.title),
      url: stringValue(source.url),
      domain: stringValue(source.domain),
      snippet: stringValue(source.snippet),
    }))
    .filter((source) => source.title && source.url);
}

function retrievedAtOf(agent: Record<string, unknown> | null): string {
  const generatedAt = stringValue(asRecord(agent?.researchMetadata)?.generatedAt);
  return generatedAt ? generatedAt.slice(0, 10) : "";
}

// The six scorecard dimensions, in display order. Values come from the
// backend's rubric-scored agent — nothing is re-derived on the client.
const SCORECARD_DIMENSIONS: { key: string; label: string }[] = [
  { key: "problemSeverity", label: "Problem" },
  { key: "marketQuality", label: "Market" },
  { key: "differentiation", label: "Differentiation" },
  { key: "executionFeasibility", label: "Execution" },
  { key: "competition", label: "Competition" },
  { key: "timing", label: "Timing" },
];

function scorecardSubScores(bp: Blueprint): SubScore[] {
  const scorecard = agentRecord(bp, "scorecard");
  if (!scorecard) {
    // Legacy blueprint (schema <= 4): the market score is the only real
    // sub-score that exists — show it alone rather than inventing three more.
    return [{ label: "Market", value: bp.market.score, note: "", sourceIndexes: [] }];
  }
  return SCORECARD_DIMENSIONS.map(({ key, label }) => {
    const dimension = asRecord(scorecard[key]);
    const rawIndexes = dimension?.sourceIndexes;
    const sourceIndexes = Array.isArray(rawIndexes)
      ? (rawIndexes as unknown[]).filter((n): n is number => typeof n === "number")
      : [];
    return {
      label,
      value: numberValue(dimension?.score),
      note: stringValue(dimension?.justification),
      sourceIndexes,
    };
  });
}

function deriveSynthesis(bp: Blueprint): Synthesis {
  const synthesis = agentRecord(bp, "synthesis");
  return {
    tagline: stringValue(synthesis?.tagline),
    executiveSummary: stringValue(synthesis?.executiveSummary),
    verdict: stringValue(synthesis?.verdict),
    verdictReasoning: stringValue(synthesis?.verdictReasoning),
    redFlags: recordArray(synthesis?.redFlags)
      .map((flag) => ({
        flag: stringValue(flag.flag),
        severity: stringValue(flag.severity, "Medium"),
      }))
      .filter((flag) => flag.flag),
    contradictions: stringArray(synthesis?.contradictions),
    keyAssumptions: stringArray(synthesis?.keyAssumptions),
  };
}

function deriveViability(bp: Blueprint, synthesis: Synthesis): Viability {
  const reasoning =
    synthesis.verdictReasoning || bp.aiRecommend || "Generated before verdict support was added.";
  return {
    score: bp.viability,
    grade: gradeFor(bp.viability),
    reasoning,
    verdict: synthesis.verdict,
    subScores: scorecardSubScores(bp),
  };
}

function deriveMarketAnalysis(bp: Blueprint): MarketAnalysis {
  const marketAgent = agentRecord(bp, "market");
  const agentDemandLevel = stringValue(marketAgent?.demandLevel);
  const demandLevel: MarketAnalysis["demandLevel"] =
    agentDemandLevel === "High" || agentDemandLevel === "Medium" || agentDemandLevel === "Low"
      ? agentDemandLevel
      : bp.market.score >= 75
        ? "High"
        : bp.market.score >= 60
          ? "Medium"
          : "Low";
  const customerCount = numberValue(marketAgent?.customerCount);
  const priceAnnualUsd = numberValue(marketAgent?.priceAnnualUsd);
  const bottomUpBasis =
    customerCount && priceAnnualUsd
      ? `${customerCount.toLocaleString()} customers × ${fmtMarketMoney(priceAnnualUsd)}/yr — ${stringValue(marketAgent?.customerCountBasis)}`
      : "";
  return {
    demandLevel,
    totalMarket: bp.market.size,
    totalMarketBasis: stringValue(marketAgent?.sizeBasis),
    bottomUpSam: stringValue(marketAgent?.bottomUpSam),
    bottomUpBasis,
    cagr: bp.market.cagr,
    cagrBasis: stringValue(marketAgent?.cagrBasis),
    timing: stringValue(marketAgent?.timing),
    whyNow: stringValue(marketAgent?.whyNow),
    insight: stringValue(marketAgent?.insight),
    analysis: stringValue(marketAgent?.analysis),
    demandSignals: citedTexts(marketAgent?.demandSignals),
    headwinds: stringArray(marketAgent?.headwinds),
    confidence: stringValue(marketAgent?.confidence),
    assumptions: stringArray(marketAgent?.assumptions),
    sources: sourceRefs(marketAgent?.sources),
    retrievedAt: retrievedAtOf(marketAgent),
  };
}

function deriveCompetitors(bp: Blueprint): CompetitorRow[] {
  // Agent data only. Fabricating pricing or strengths for real companies is
  // the fastest possible credibility kill — no agent data, no table.
  const competitorAgent = agentRecord(bp, "competitor");
  return recordArray(competitorAgent?.competitors).map((competitor) => ({
    name: stringValue(competitor.name, "Competitor"),
    type: stringValue(competitor.type, "Direct"),
    strengths: stringArray(competitor.strengths).length
      ? stringArray(competitor.strengths)
      : [stringValue(competitor.positioning, "Established category presence")],
    weaknesses: stringArray(competitor.weaknesses).length
      ? stringArray(competitor.weaknesses)
      : ["May not serve the first wedge deeply"],
    gap: stringValue(competitor.gap, "Opportunity to serve a narrower customer segment better"),
    sourceIndexes: Array.isArray(competitor.sourceIndexes)
      ? competitor.sourceIndexes.filter((n): n is number => typeof n === "number")
      : [],
  }));
}

function deriveCompetitorInsight(bp: Blueprint): CompetitorInsight {
  const competitorAgent = agentRecord(bp, "competitor");
  return {
    analysis: stringValue(competitorAgent?.analysis),
    confidence: stringValue(competitorAgent?.confidence),
    assumptions: stringArray(competitorAgent?.assumptions),
    sources: sourceRefs(competitorAgent?.sources),
    retrievedAt: retrievedAtOf(competitorAgent),
  };
}


function deriveMvpPlan(bp: Blueprint, totalWeeks: number): MvpPlan {
  const productAgent = agentRecord(bp, "product");
  return {
    mustHave: bp.features.slice(0, 2),
    shouldHave: bp.features.slice(2, 4),
    niceToHave: bp.features.slice(4),
    timelineWeeks: totalWeeks,
    outOfScope: stringArray(productAgent?.outOfScope),
  };
}

function deriveTechStack(bp: Blueprint): TechStackModel {
  const techStackAgent = agentRecord(bp, "techStack");
  const layers = asRecord(techStackAgent?.techStack);
  return {
    frontend: stackLayer(layers, "frontend"),
    backend: stackLayer(layers, "backend"),
    database: stackLayer(layers, "database"),
    vectorDb: stackLayer(layers, "vectorDb"),
    aiProvider: stackLayer(layers, "aiProvider"),
    hosting: stackLayer(layers, "hosting"),
  };
}

function stackLayer(layers: Record<string, unknown> | null, key: StackLayerKey): TechStackLayer {
  const layer = asRecord(layers?.[key]);
  const chosen = stringValue(layer?.chosen);
  return {
    chosen,
    options: chosen ? [chosen] : [],
    reasoning: stringValue(layer?.reasoning),
    monthlyCost: stringValue(layer?.monthlyCost),
  };
}

/* Architecture is derived live from whatever tech stack is currently
   selected (including founder edits), so the diagram always matches
   the editable stack — it is not baked into the static content model. */
const DIAGRAM_NODE_ORDER: {
  id: string;
  kind: ArchitectureNode["kind"];
  layerKey: StackLayerKey;
}[] = [
  { id: "client", kind: "frontend", layerKey: "frontend" },
  { id: "api", kind: "backend", layerKey: "backend" },
  { id: "ai", kind: "ai", layerKey: "aiProvider" },
  { id: "vector", kind: "data", layerKey: "vectorDb" },
  { id: "db", kind: "data", layerKey: "database" },
  { id: "hosting", kind: "infra", layerKey: "hosting" },
];
const DIAGRAM_EDGES: ArchitectureEdge[] = [
  { from: "client", to: "api" },
  { from: "api", to: "ai" },
  { from: "ai", to: "vector" },
  { from: "api", to: "db" },
  { from: "client", to: "hosting" },
  { from: "api", to: "hosting" },
];
export function buildArchitecture(techStack: TechStackModel): {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
} {
  const labelFor = (key: StackLayerKey, prefix: string) =>
    techStack[key].chosen ? `${prefix} - ${techStack[key].chosen}` : prefix;
  const nodes: ArchitectureNode[] = DIAGRAM_NODE_ORDER.map((n) => {
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
  const productAgent = agentRecord(bp, "product");
  const agentPhases = recordArray(productAgent?.phases);
  const raw: Omit<Phase, "primarySkill" | "weeklyRate" | "cost">[] = agentPhases.length
    ? agentPhases.map((phase, index) => {
        const skill = stringValue(phase.primarySkill, "Full Stack");
        return {
          name: stringValue(phase.name, `Phase ${index + 1}`),
          layer: skill,
          weeks: Math.max(1, numberValue(phase.weeks, 2)),
          deliverables: stringArray(phase.deliverables),
          acceptanceCriteria: stringArray(phase.acceptanceCriteria),
          skillset: [skill],
          status: index === 0 ? ("In Progress" as const) : ("Planned" as const),
        };
      })
    : legacyPhases(bp);
  return raw.map((p) => {
    const primarySkill = p.skillset[0];
    const weeklyRate = rateForSkill(primarySkill);
    return { ...p, primarySkill, weeklyRate, cost: weeklyRate * p.weeks };
  });
}

/* Fallback roadmap for blueprints generated before the product agent planned
   phases (schema <= 4). Generic scaffolding, not idea-specific — new
   generations never hit this path. */
function legacyPhases(bp: Blueprint): Omit<Phase, "primarySkill" | "weeklyRate" | "cost">[] {
  return [
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
      deliverables: ["Data model & migrations", "REST API + auth middleware", "Core business logic"],
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
      name: "Hardening & Launch",
      layer: "QA · CI/CD",
      weeks: 2,
      deliverables: ["E2E + load testing", "Observability & alerts", "Production deploy pipeline"],
      acceptanceCriteria: ["E2E suite passes in CI", "Alerts fire correctly on a simulated incident"],
      skillset: ["DevOps", "QA"],
      status: "Planned",
    },
  ];
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
  const marketAgent = agentRecord(bp, "market");
  // Price comes from the market agent's researched wedge price when present;
  // the legacy $49 default only applies to pre-scorecard blueprints.
  const priceAnnual = numberValue(marketAgent?.priceAnnualUsd);
  const price = priceAnnual ? Math.max(1, Math.round(priceAnnual / 12)) : 49;
  const priceBasis = stringValue(marketAgent?.priceBasis);
  const startingUsers = Math.round(20 + bp.marketPotential * 0.6);
  const monthlyGrowthPct = Math.round((0.08 + (bp.viability / 100) * 0.08) * 100); // 8–16%/mo
  const g = monthlyGrowthPct / 100;
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
      bp.intake?.monetization ||
      "Subscription pricing assumed — no monetization model was provided at intake.",
    year1,
    eoyMrr: eoy.mrr,
    eoyArr: eoy.mrr * 12,
    breakEvenMonth,
    assumptions: [
      priceBasis
        ? `Price $${price}/user/mo — ${priceBasis}`
        : `Price $${price}/user/mo — default assumption, not researched`,
      `Starting users (${startingUsers}) scaled from the market score — assumption`,
      `Growth ${monthlyGrowthPct}%/mo — model assumption, not a forecast`,
    ],
  };
}

/* ═══════════════════════════════════════════════════════ */
/* Public entry point                                         */
/* ═══════════════════════════════════════════════════════ */
export function buildBlueprintContent(bp: Blueprint): BlueprintContent {
  const phases = buildPhases(bp);
  const totalWeeks = phases.reduce((s, p) => s + p.weeks, 0) || 1;
  const costModel = buildCostModel(bp, phases);
  const synthesis = deriveSynthesis(bp);
  return {
    personas: derivePersonas(bp),
    viability: deriveViability(bp, synthesis),
    synthesis,
    marketAnalysis: deriveMarketAnalysis(bp),
    competitors: deriveCompetitors(bp),
    competitorInsight: deriveCompetitorInsight(bp),
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
