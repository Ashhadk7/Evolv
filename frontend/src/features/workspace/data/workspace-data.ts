import type { Blueprint } from "@/features/blueprints/types";

export const DEFAULT_BLUEPRINTS: Blueprint[] = [
  {
    id: "nexus",
    name: "Nexus Health",
    industry: "HealthTech",
    ideaDesc:
      "AI-driven diagnostics platform for early-stage oncology detection, reducing false positives by 40%.",
    isPublic: true,
    status: "PUBLISHED",
    viability: 82,
    fundingReadiness: "High",
    investorInterest: 3,
    marketPotential: 91,
    developerDemand: "High",
    devMatches: 5,
    views: 142,
    investorViews: 142,
    interested: 2,
    wordCount: 240,
    updatedAt: "2 days ago",
    aiRecommend: "Publish to attract developer matches",
    market: { size: "$2.4B", cagr: "18.3%", barriers: "High regulatory", score: 84 },
    competitors: [
      { name: "PathAI", type: "Direct" },
      { name: "Paige", type: "Direct" },
      { name: "Tempus", type: "Indirect" },
    ],
    differentiator: "Affordable early detection for emerging markets",
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
  },
  {
    id: "aura",
    name: "Aura Logistics",
    industry: "SaaS",
    ideaDesc:
      "Last-mile delivery drone network utilizing autonomous navigation in mid-density suburban environments.",
    isPublic: false,
    status: "DRAFT",
    viability: 68,
    fundingReadiness: "Medium",
    investorInterest: 2,
    marketPotential: 74,
    developerDemand: "Medium",
    devMatches: 8,
    views: 89,
    investorViews: 89,
    interested: 1,
    wordCount: 412,
    updatedAt: "1 week ago",
    aiRecommend: "Add technical co-founder to strengthen team",
    market: { size: "$1.1B", cagr: "24.1%", barriers: "Regulatory + hardware", score: 72 },
    competitors: [
      { name: "Zipline", type: "Direct" },
      { name: "Wing", type: "Direct" },
    ],
    differentiator: "Suburb-first, cost-efficient fleet model",
    features: ["Fleet management", "Route optimisation", "Customer tracking", "API integrations"],
    techStack: {
      frontend: "Next.js",
      backend: "Node.js, Express",
      ai: "Route ML models",
      db: "MongoDB",
    },
    cost: { timeline: "9 months", team: "5 devs", hosting: "$1.5K/mo", budget: "$280K" },
  },
  {
    id: "veritas",
    name: "Veritas Energy",
    industry: "CleanTech",
    ideaDesc: "Decentralized micro-grid management software for residential solar cooperatives.",
    isPublic: true,
    status: "PUBLISHED",
    viability: 74,
    fundingReadiness: "Low",
    investorInterest: 2,
    marketPotential: 68,
    developerDemand: "Low",
    devMatches: 3,
    views: 12,
    investorViews: 12,
    interested: 0,
    wordCount: 185,
    updatedAt: "3 weeks ago",
    aiRecommend: "Schedule developer interviews this week",
    market: { size: "$850M", cagr: "31.2%", barriers: "Grid regulations", score: 65 },
    competitors: [{ name: "LO3 Energy", type: "Direct" }],
    differentiator: "Blockchain-verified carbon credits + instant settlement",
    features: [
      "Energy listing",
      "Smart contract trades",
      "Carbon credit wallet",
      "Analytics dashboard",
    ],
    techStack: {
      frontend: "React",
      backend: "Go, gRPC",
      ai: "Price prediction",
      db: "PostgreSQL, IPFS",
    },
    cost: { timeline: "12 months", team: "4 devs", hosting: "$600/mo", budget: "$200K" },
  },
  {
    id: "edai",
    name: "Educational AI Tutor",
    industry: "EdTech",
    ideaDesc:
      "Adaptive learning paths for high school mathematics using generative problem sets and real-time feedback.",
    isPublic: false,
    status: "DRAFT",
    viability: 61,
    fundingReadiness: "Medium",
    investorInterest: 2,
    marketPotential: 72,
    developerDemand: "Medium",
    devMatches: 4,
    views: 0,
    investorViews: 0,
    interested: 0,
    wordCount: 320,
    updatedAt: "2h ago",
    aiRecommend: "Complete market research before publishing",
    market: { size: "$4.0B", cagr: "28.0%", barriers: "Content regulation", score: 61 },
    competitors: [],
    differentiator: "Generative personalization at scale",
    features: [
      "Adaptive problem sets",
      "Real-time feedback",
      "Progress tracking",
      "Parent dashboard",
    ],
    techStack: { frontend: "React", backend: "FastAPI", ai: "GPT-4o", db: "PostgreSQL" },
    cost: { timeline: "4 months", team: "2 devs", hosting: "$400/mo", budget: "$60K" },
  },
];

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

export const WORKSPACE_STAGES = ["All Stages", "Published", "Draft"];

export const WORKSPACE_SORT_OPTIONS = ["Viability", "Recent", "Impressions", "Market Potential"];

export const FORGE_AGENTS = [
  { label: "Market Analysis Agent", desc: "Analysing market size & growth..." },
  { label: "Competitor Scout Agent", desc: "Mapping direct & indirect competitors..." },
  { label: "Feature Architect Agent", desc: "Generating MVP feature scope..." },
  { label: "Tech Stack Agent", desc: "Evaluating optimal tech architecture..." },
  { label: "Financial Modeler Agent", desc: "Modelling costs & runway..." },
];

export const WORKSPACE_INSIGHTS = [
  { text: "Developer match rates for HealthTech increased 17% this month.", bold: "HealthTech" },
  { text: "EdTech startups have the highest match rates with developers.", bold: "" },
  {
    text: "Nexus Health is ready for workspace deployment - MVP specifications are strong.",
    bold: "Nexus Health",
  },
  {
    text: "Aura Logistics needs more developer validation before pitching.",
    bold: "Aura Logistics",
  },
];

export const WORKSPACE_GUIDANCE = [
  {
    name: "Nexus Health",
    tip: "Your blueprint is strong. Schedule 3 developer interviews this week.",
  },
  {
    name: "Aura Logistics",
    tip: "Add more technical validation to increase developer match confidence.",
  },
  { name: "Veritas Energy", tip: "Your market timing is excellent. Consider a soft launch." },
  { name: "Educational AI Tutor", tip: "AI generation is 60% complete. Monitor progress." },
];

export const WORKSPACE_ACTIVITY = [
  { text: "Nexus Health complete", time: "2 days ago", dot: "#2e7d5c" },
  { text: "Idea draft saved - Food Delivery Marketplace", time: "Yesterday", dot: "#428475" },
  { text: "Blueprint initiated - Aura Logistics", time: "1 week ago", dot: "#89d7b7" },
  { text: "New developer match - Sarah Mitchell", time: "2 weeks ago", dot: "#7a9e8e" },
  { text: "Developer matched with Veritas Energy", time: "3 weeks ago", dot: "#b0c0b8" },
];
