import { buildBlueprintContent, initProjectState } from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";

export const CURRENT_DEV = {
  id: "dev-1",
  name: "Sarah Mitchell",
  initials: "SM",
};

const DEV_BLUEPRINT: Blueprint = {
  id: "nexus",
  name: "Nexus Health",
  industry: "HealthTech",
  ideaDesc: "AI-driven diagnostics platform for early-stage oncology detection.",
  isPublic: true,
  status: "PUBLISHED",
  fundingReadiness: "High",
  investorInterest: 78,
  devMatches: 12,
  views: 340,
  investorViews: 54,
  interested: 9,
  wordCount: 620,
  updatedAt: new Date().toISOString().slice(0, 10),
  features: [
    "Scan upload & analysis",
    "Real-time diagnostic report",
    "Physician dashboard",
    "Patient history",
  ],
  techStack: {
    frontend: "React, TailwindCSS",
    backend: "FastAPI, Python",
    ai: "TensorFlow, DICOM",
    db: "PostgreSQL, Redis",
  },
  cost: { timeline: "6 months", team: "3 devs", hosting: "$800/mo", budget: "$120K" },
  marketPotential: 91,
  viability: 82,
  developerDemand: "High",
  market: { size: "$2.4B", cagr: "18.3%", barriers: "High regulatory", score: 84 },
  competitors: [{ name: "PathAI", type: "Direct" }],
  differentiator: "Affordable early detection for emerging markets",
  aiRecommend: "Publish to attract developer matches",
};

const DEV_BLUEPRINT_2: Blueprint = {
  id: "aura",
  name: "Aura Logistics",
  industry: "SaaS",
  ideaDesc:
    "Last-mile delivery drone network utilizing autonomous navigation in mid-density suburban environments.",
  isPublic: true,
  status: "PUBLISHED",
  fundingReadiness: "Medium",
  investorInterest: 61,
  devMatches: 7,
  views: 210,
  investorViews: 33,
  interested: 5,
  wordCount: 540,
  updatedAt: new Date().toISOString().slice(0, 10),
  features: ["Fleet management", "Route optimisation", "Customer tracking", "API integrations"],
  techStack: {
    frontend: "Next.js",
    backend: "Node.js, Express",
    ai: "Route ML models",
    db: "MongoDB",
  },
  cost: { timeline: "9 months", team: "5 devs", hosting: "$1.5K/mo", budget: "$280K" },
  marketPotential: 74,
  viability: 68,
  developerDemand: "Medium",
  market: { size: "$1.1B", cagr: "24.1%", barriers: "Regulatory + hardware", score: 72 },
  competitors: [{ name: "Zipline", type: "Direct" }],
  differentiator: "Suburb-first, cost-efficient fleet model",
  aiRecommend: "Add technical co-founder",
};

export function getMockProjects() {
  const content1 = buildBlueprintContent(DEV_BLUEPRINT);
  const proj1 = initProjectState(content1);
  proj1.status = "IN_DEVELOPMENT";
  proj1.phaseStates[1].assignment = {
    developerId: CURRENT_DEV.id,
    developerName: CURRENT_DEV.name,
    developerInitials: CURRENT_DEV.initials,
    hiredAt: new Date().toISOString().slice(0, 10),
    amountAgreed: content1.phases[1].cost,
    amountPaid: 0,
    payments: [],
  };
  proj1.phaseStates[1].deadline = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  proj1.phaseStates[1].status = "In Progress";
  proj1.issues = [
    {
      id: "iss-1",
      title: "API auth failing on staging",
      description: "The JWT token isn't being parsed correctly by FastAPI middleware.",
      priority: "High",
      status: "Open",
      phaseIndex: 1,
      createdAt: new Date().toISOString().slice(0, 10),
      history: [],
    },
  ];

  const content2 = buildBlueprintContent(DEV_BLUEPRINT_2);
  const proj2 = initProjectState(content2);
  proj2.status = "IN_DEVELOPMENT";
  proj2.phaseStates[0].assignment = {
    developerId: CURRENT_DEV.id,
    developerName: CURRENT_DEV.name,
    developerInitials: CURRENT_DEV.initials,
    hiredAt: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
    amountAgreed: content2.phases[0].cost,
    amountPaid: content2.phases[0].cost * 0.5,
    payments: [
      { amount: content2.phases[0].cost * 0.5, date: new Date().toISOString().slice(0, 10) },
    ],
  };
  proj2.phaseStates[0].deadline = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
  proj2.phaseStates[0].status = "In Progress";
  proj2.phaseStates[0].deliverables[0].done = true;
  proj2.phaseStates[0].deliverables[1].done = true;

  return [
    { bp: DEV_BLUEPRINT, content: content1, project: proj1 },
    { bp: DEV_BLUEPRINT_2, content: content2, project: proj2 },
  ];
}
