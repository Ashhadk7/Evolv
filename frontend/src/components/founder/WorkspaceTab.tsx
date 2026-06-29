"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Eye, PencilSimple,
  ArrowLeft, CheckCircle, Sparkle,
  MagnifyingGlass, CaretDown,
  Lightbulb, Clock,
} from "@phosphor-icons/react";

/* ─────────────────────────────────────────────────────── */
/* Types                                                    */
/* ─────────────────────────────────────────────────────── */
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
  techStack: { frontend: string; backend: string; ai: string; db: string };
  cost: { timeline: string; team: string; hosting: string; budget: string };
}

/* ─────────────────────────────────────────────────────── */
/* Seed data                                               */
/* ─────────────────────────────────────────────────────── */
const SEED: Blueprint[] = [
  {
    id: "nexus",
    name: "Nexus Health",
    industry: "HealthTech",
    ideaDesc: "AI-driven diagnostics platform for early-stage oncology detection, reducing false positives by 40%.",
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
    aiRecommend: "Publish to attract Series A investors",
    market: { size: "$2.4B", cagr: "18.3%", barriers: "High regulatory", score: 84 },
    competitors: [{ name: "PathAI", type: "Direct" }, { name: "Paige", type: "Direct" }, { name: "Tempus", type: "Indirect" }],
    differentiator: "Affordable early detection for emerging markets",
    features: ["Scan upload & analysis", "Real-time diagnostic report", "Physician dashboard", "Patient history"],
    techStack: { frontend: "React, TailwindCSS", backend: "FastAPI, Python", ai: "TensorFlow, DICOM", db: "PostgreSQL, Redis" },
    cost: { timeline: "6 months", team: "3 devs", hosting: "$800/mo", budget: "$120K" },
  },
  {
    id: "aura",
    name: "Aura Logistics",
    industry: "SaaS",
    ideaDesc: "Last-mile delivery drone network utilizing autonomous navigation in mid-density suburban environments.",
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
    competitors: [{ name: "Zipline", type: "Direct" }, { name: "Wing", type: "Direct" }],
    differentiator: "Suburb-first, cost-efficient fleet model",
    features: ["Fleet management", "Route optimisation", "Customer tracking", "API integrations"],
    techStack: { frontend: "Next.js", backend: "Node.js, Express", ai: "Route ML models", db: "MongoDB" },
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
    aiRecommend: "Schedule investor meetings this week",
    market: { size: "$850M", cagr: "31.2%", barriers: "Grid regulations", score: 65 },
    competitors: [{ name: "LO3 Energy", type: "Direct" }],
    differentiator: "Blockchain-verified carbon credits + instant settlement",
    features: ["Energy listing", "Smart contract trades", "Carbon credit wallet", "Analytics dashboard"],
    techStack: { frontend: "React", backend: "Go, gRPC", ai: "Price prediction", db: "PostgreSQL, IPFS" },
    cost: { timeline: "12 months", team: "4 devs", hosting: "$600/mo", budget: "$200K" },
  },
  {
    id: "edai",
    name: "Educational AI Tutor",
    industry: "EdTech",
    ideaDesc: "Adaptive learning paths for high school mathematics using generative problem sets and real-time feedback.",
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
    features: ["Adaptive problem sets", "Real-time feedback", "Progress tracking", "Parent dashboard"],
    techStack: { frontend: "React", backend: "FastAPI", ai: "GPT-4o", db: "PostgreSQL" },
    cost: { timeline: "4 months", team: "2 devs", hosting: "$400/mo", budget: "$60K" },
  },
];

const INDUSTRIES   = ["MedTech","SaaS","FinTech","CleanTech","EdTech","AI","Web3","E-commerce","Deep Tech","B2B"];
const STAGES       = ["All Stages","Published","Draft"];
const SORT_OPTIONS = ["Viability","Recent","Investor Views","Market Potential"];
const AGENTS = [
  { label: "Market Analysis Agent",   desc: "Analysing market size & growth…" },
  { label: "Competitor Scout Agent",  desc: "Mapping direct & indirect competitors…" },
  { label: "Feature Architect Agent", desc: "Generating MVP feature scope…" },
  { label: "Tech Stack Agent",        desc: "Evaluating optimal tech architecture…" },
  { label: "Financial Modeler Agent", desc: "Modelling costs & runway…" },
];

/* ─────────────────────────────────────────────────────── */
/* Static sidebar data                                     */
/* ─────────────────────────────────────────────────────── */
const INSIGHTS = [
  { text: "Investor demand for HealthTech increased 17% this month.", bold: "HealthTech" },
  { text: "EdTech startups have the highest match rates with developers.", bold: "" },
  { text: "Nexus Health is ready for fundraising — Series A metrics are strong.", bold: "Nexus Health" },
  { text: "Aura Logistics needs more developer validation before pitching.", bold: "Aura Logistics" },
];

const GUIDANCE = [
  { name: "Nexus Health",         tip: "Your pitch deck is strong. Schedule 3 investor meetings this week." },
  { name: "Aura Logistics",       tip: "Add more technical validation to increase investor confidence." },
  { name: "Veritas Energy",       tip: "Your market timing is excellent. Consider a soft launch." },
  { name: "Educational AI Tutor", tip: "AI generation is 60% complete. Monitor progress." },
];

const ACTIVITY = [
  { text: "Nexus Health complete",                        time: "2 days ago",  dot: "#2e7d5c" },
  { text: "Idea draft saved — Food Delivery Marketplace", time: "Yesterday",   dot: "#428475" },
  { text: "Blueprint initiated — Aura Logistics",         time: "1 week ago",  dot: "#89d7b7" },
  { text: "New developer match — Sarah Mitchell",         time: "2 weeks ago", dot: "#7a9e8e" },
  { text: "Investor viewed Veritas Energy",               time: "3 weeks ago", dot: "#b0c0b8" },
];

/* ─────────────────────────────────────────────────────── */
/* StatusBadge                                            */
/* ─────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: Blueprint["status"] }) {
  const pub = status === "PUBLISHED";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "4px 10px",
        borderRadius: 999,
        background: pub ? "#dcf0e6" : "#eff2f0",
        color: pub ? "#1d6e47" : "#7a9e8e",
      }}
    >
      {pub ? "Published" : "Draft"}
    </span>
  );
}

/* ─────────────────────────────────────────────────────── */
/* IdeaCard                                               */
/* ─────────────────────────────────────────────────────── */
function IdeaCard({ bp, idx, onView, onDelete, canPublish, onCompleteProfile, onTogglePublic }: {
  bp: Blueprint; idx: number; onView: () => void; onDelete: () => void;
  canPublish: boolean; onCompleteProfile?: () => void; onTogglePublic: () => void;
}) {
  const pub = bp.status === "PUBLISHED";
  const metrics = [
    { value: String(bp.viability),     label: "Viability"   },
    { value: `${bp.marketPotential}%`, label: "Market"      },
    { value: String(bp.investorViews), label: "Inv. Views"  },
    { value: String(bp.devMatches),    label: "Dev Matches" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ delay: idx * 0.07, type: "spring", stiffness: 260, damping: 24 }}
      whileHover={{ y: -3, boxShadow: "0 16px 44px rgba(26,49,44,0.12)" }}
      style={{
        background: "#fff",
        border: "1px solid #e4ece7",
        borderLeft: `4px solid ${pub ? "#89d7b7" : "#c8d8d0"}`,
        borderRadius: 18,
        padding: "24px 26px 22px 24px",
        boxShadow: "0 2px 12px rgba(26,49,44,0.06)",
      }}
    >
      {/* Header: name + badge */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1a2e26", lineHeight: 1, letterSpacing: "-0.01em" }}>
            {bp.name}
          </h3>
          <StatusBadge status={bp.status} />
        </div>
        <span style={{ fontSize: 11, color: "#9ab4a4", flexShrink: 0, marginLeft: 12 }}>{bp.updatedAt}</span>
      </div>

      {/* Industry pill */}
      <div style={{ marginBottom: 14 }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 600,
          color: "#1d6e47",
          background: "#e8f5ef",
          padding: "4px 10px",
          borderRadius: 999,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: "#89d7b7", display: "inline-block", flexShrink: 0 }} />
          {bp.industry}
        </span>
      </div>

      {/* Description */}
      <p className="line-clamp-2" style={{ fontSize: 13, color: "#5a7a6a", lineHeight: 1.6, marginBottom: 20 }}>
        {bp.ideaDesc}
      </p>

      {/* Metrics — unified grid on green-tinted background */}
      <div
        style={{
          display: "flex",
          background: "#f3f8f5",
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 18,
          border: "1px solid #e0ede6",
        }}
      >
        {metrics.map((m, i) => (
          <div
            key={m.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "14px 8px",
              borderRight: i < metrics.length - 1 ? "1px solid #e0ede6" : "none",
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 900, color: "#1a2e26", lineHeight: 1 }}>
              {m.value}
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#7a9e8e",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginTop: 5,
            }}>
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* AI Recommend */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "12px 14px",
          background: "#fffbef",
          border: "1px solid #edd98a",
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <Sparkle size={13} weight="fill" style={{ color: "#b07d10", flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: 12, color: "#7a5c10", lineHeight: 1.5 }}>
          <strong style={{ color: "#b07d10" }}>AI: </strong>{bp.aiRecommend}
        </span>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 16,
          borderTop: "1px solid #edf2ee",
        }}
      >
        <span style={{ fontSize: 12, color: "#9ab4a4" }}>
          {bp.wordCount} words · {bp.interested} interested
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            onClick={onView}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 700,
              padding: "8px 18px", borderRadius: 10,
              background: "#1a312c", color: "#89d7b7",
              border: "none", cursor: "pointer",
            }}
          >
            <Eye size={13} /> View
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, background: "#e3ede8" }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 600,
              padding: "8px 18px", borderRadius: 10,
              background: "#eef4f1", color: "#428475",
              border: "1px solid #d8e8e0", cursor: "pointer",
            }}
          >
            <PencilSimple size={13} /> Edit
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* Blueprint detail view                                  */
/* ─────────────────────────────────────────────────────── */
function BlueprintDetail({ bp, onBack }: { bp: Blueprint; onBack: () => void }) {
  const sections = [
    {
      agent: "Market Analysis", icon: "🔍",
      content: (
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { label: "Market Size",    val: bp.market.size     },
            { label: "CAGR",           val: bp.market.cagr     },
            { label: "Entry Barriers", val: bp.market.barriers },
          ].map(({ label, val }) => (
            <div key={label} style={{ background: "#f3f8f5", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: "#7a9e8e", marginBottom: 5 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26" }}>{val}</div>
            </div>
          ))}
          <div className="col-span-3 flex items-center gap-3 mt-2">
            <div style={{ fontSize: 11, color: "#7a9e8e", flexShrink: 0 }}>Market Score</div>
            <div style={{ flex: 1, height: 6, background: "#e0ede6", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${bp.market.score}%`, height: "100%", background: "linear-gradient(90deg, #428475, #89d7b7)", borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26", flexShrink: 0 }}>{bp.market.score}</div>
          </div>
        </div>
      ),
    },
    {
      agent: "Competitor Scout", icon: "🏁",
      content: (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {bp.competitors.map((c) => (
              <span key={c.name} style={{ fontSize: 12, fontWeight: 600, background: "#eef4f1", color: "#1a2e26", padding: "5px 12px", borderRadius: 999 }}>
                {c.name}<span style={{ fontSize: 10, color: "#7a9e8e", marginLeft: 6 }}>· {c.type}</span>
              </span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#7a9e8e", lineHeight: 1.5 }}>
            <strong style={{ color: "#1a2e26" }}>Differentiator: </strong>{bp.differentiator}
          </p>
        </div>
      ),
    },
    {
      agent: "Feature Architect", icon: "⚡",
      content: (
        <div className="mt-3 flex flex-wrap gap-2">
          {bp.features.map((f) => (
            <span key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, background: "#eef4f1", color: "#1a2e26", padding: "6px 12px", borderRadius: 8 }}>
              <CheckCircle size={12} style={{ color: "#2e7d5c" }} weight="fill" />{f}
            </span>
          ))}
        </div>
      ),
    },
    {
      agent: "Tech Stack", icon: "🖥️",
      content: (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {Object.entries(bp.techStack).map(([key, val]) => (
            <div key={key} style={{ background: "#f3f8f5", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, color: "#7a9e8e", textTransform: "capitalize", marginBottom: 3 }}>{key}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1a2e26" }}>{val}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      agent: "Financial Modeler", icon: "💰",
      content: (
        <div className="grid grid-cols-4 gap-3 mt-3">
          {Object.entries(bp.cost).map(([key, val]) => (
            <div key={key} style={{ background: "#f3f8f5", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#7a9e8e", marginBottom: 5 }}>
                {key === "hosting" ? "Hosting/mo" : key === "budget" ? "Budget" : key === "team" ? "Team" : "Timeline"}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1a2e26" }}>{val}</div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors hover:bg-[#e8ede9] cursor-pointer"
          style={{ fontSize: 13, color: "#428475" }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ width: 1, height: 18, background: "#dde5e0" }} />
        <span style={{ fontSize: 15, fontWeight: 800, color: "#1a2e26" }}>{bp.name}</span>
        <span style={{ fontSize: 12, color: "#7a9e8e" }}>{bp.industry}</span>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={bp.status} />
          <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 10, background: "#1a312c", color: "#89d7b7" }}>
            {bp.viability}% Viability
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {sections.map((s) => (
          <div key={s.agent} style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", border: "1px solid #e4ece7" }}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1a2e26" }}>{s.agent} Agent</span>
            </div>
            {s.content}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* Forge Modal                                            */
/* ─────────────────────────────────────────────────────── */
function ForgeModal({ onClose, onCreated }: { onClose: () => void; onCreated: (bp: Blueprint) => void }) {
  const [phase, setPhase] = useState<"input" | "generating" | "done">("input");
  const [idea, setIdea] = useState("");
  const [industry, setIndustry] = useState("");
  const [agentIndex, setAgentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGeneration = () => {
    if (!idea.trim() || !industry) return;
    setPhase("generating");
    setAgentIndex(0);
    setProgress(0);
    let tick = 0;
    intervalRef.current = setInterval(() => {
      tick++;
      setProgress(Math.min(tick * 4, 100));
      setAgentIndex(Math.min(Math.floor(tick / 5), AGENTS.length - 1));
      if (tick >= 25) { clearInterval(intervalRef.current!); setPhase("done"); }
    }, 200);
  };

  const handleAccept = () => {
    const bp: Blueprint = {
      id: `bp_${Date.now()}`, name: idea.slice(0, 28) || "My Blueprint", industry, ideaDesc: idea,
      isPublic: false, status: "DRAFT",
      viability: 68 + Math.floor(Math.random() * 20), fundingReadiness: "Medium",
      investorInterest: 2, marketPotential: 62 + Math.floor(Math.random() * 20),
      developerDemand: "Medium", devMatches: 3, views: 0, investorViews: 0, interested: 0,
      wordCount: idea.split(" ").length, updatedAt: "Just now",
      aiRecommend: "Review your blueprint and add more detail",
      market: { size: "$500M", cagr: "22%", barriers: "Moderate", score: 70 },
      competitors: [{ name: "Incumbent A", type: "Direct" }, { name: "Incumbent B", type: "Indirect" }],
      differentiator: "AI-first approach with lower cost of entry",
      features: ["Core MVP", "User onboarding", "Analytics", "API"],
      techStack: { frontend: "React", backend: "Node.js", ai: "OpenAI APIs", db: "PostgreSQL" },
      cost: { timeline: "5 months", team: "2–3 devs", hosting: "$600/mo", budget: "$80K" },
    };
    onCreated(bp);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,22,18,0.75)", backdropFilter: "blur(6px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        style={{ background: "#fff", borderRadius: 20, overflow: "hidden", width: 520, border: "1px solid #d8e8e0", boxShadow: "0 32px 80px rgba(26,49,44,0.22)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #eaf0eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "#1a312c", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkle size={15} weight="fill" style={{ color: "#89d7b7" }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#1a2e26" }}>Forge New Blueprint</span>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", display: "flex" }} className="hover:bg-[#f5f7f5] transition-colors">
            <X size={15} style={{ color: "#7a9e8e" }} />
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          <AnimatePresence mode="wait">
            {phase === "input" && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#5a8070", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Describe your startup idea
                  </label>
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="e.g. An AI platform that helps small restaurants optimise their menu pricing dynamically…"
                    style={{ width: "100%", borderRadius: 12, padding: "13px 16px", fontSize: 13, outline: "none", resize: "none", background: "#f5f8f6", border: "1px solid #d8e8e0", color: "#1a2e26", minHeight: 110, fontFamily: "inherit", lineHeight: 1.6 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#5a8070", marginBottom: 10, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Select industry
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind}
                        onClick={() => setIndustry(ind)}
                        style={{
                          padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
                          background: industry === ind ? "#1a312c" : "#eef4f1",
                          color: industry === ind ? "#89d7b7" : "#428475",
                          border: `1px solid ${industry === ind ? "rgba(137,215,183,0.3)" : "#d8e8e0"}`,
                          transition: "all 0.15s ease",
                        }}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>
                <motion.button
                  onClick={startGeneration}
                  disabled={!idea.trim() || !industry}
                  whileHover={idea.trim() && industry ? { scale: 1.01 } : {}}
                  whileTap={idea.trim() && industry ? { scale: 0.98 } : {}}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "13px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "#1a312c", color: "#89d7b7", border: "none", opacity: !idea.trim() || !industry ? 0.4 : 1 }}
                >
                  <Sparkle size={14} weight="fill" /> Generate Blueprint
                </motion.button>
              </motion.div>
            )}

            {phase === "generating" && (
              <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ paddingTop: 8, paddingBottom: 8 }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2e26", marginBottom: 4 }}>Generating your blueprint…</div>
                  <div style={{ fontSize: 12, color: "#7a9e8e" }}>5 AI agents are working on your idea</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                  {AGENTS.map((agent, i) => {
                    const done = i < agentIndex; const active = i === agentIndex;
                    return (
                      <div key={agent.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, background: done ? "#dcf0e6" : active ? "#1a312c" : "#f0f5f2", color: done ? "#1d6e47" : active ? "#89d7b7" : "#9ab4a4" }}>
                          {done ? "✓" : i + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: done ? "#9ab4a4" : active ? "#1a2e26" : "#b0c0b8" }}>{agent.label}</div>
                          {active && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 11, color: "#7a9e8e", marginTop: 2 }}>{agent.desc}</motion.div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ height: 6, background: "#e0ede6", borderRadius: 999, overflow: "hidden" }}>
                  <motion.div style={{ height: "100%", background: "linear-gradient(90deg, #1a312c, #428475, #89d7b7)", borderRadius: 999 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />
                </div>
                <div style={{ textAlign: "right", marginTop: 6, fontSize: 11, color: "#7a9e8e" }}>{progress}%</div>
              </motion.div>
            )}

            {phase === "done" && (
              <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>✦</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1a2e26", marginBottom: 6 }}>Blueprint ready</div>
                <div style={{ fontSize: 13, color: "#7a9e8e", marginBottom: 28 }}>All 5 agents completed analysis successfully.</div>
                <motion.button
                  onClick={handleAccept}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "#1a312c", color: "#89d7b7", border: "none" }}
                >
                  <CheckCircle size={15} weight="fill" /> View Blueprint
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* Right Sidebar                                          */
/* ─────────────────────────────────────────────────────── */
function SidebarSection({ icon, title, badge, action, children, delay }: {
  icon: ReactNode;
  title: string;
  badge?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 26 }}
      style={{ background: "#fff", borderRadius: 18, border: "1px solid #e4ece7", padding: "20px 22px", boxShadow: "0 2px 10px rgba(26,49,44,0.04)" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "#e8f5ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {icon}
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#1a2e26", letterSpacing: "-0.01em" }}>{title}</span>
        </div>
        {badge ?? action}
      </div>
      {children}
    </motion.div>
  );
}

function WorkspaceSidebar() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", overflowY: "auto", minWidth: 278, maxWidth: 298 }}>

      <SidebarSection
        icon={<Lightbulb size={15} weight="fill" style={{ color: "#2e7d5c" }} />}
        title="Founder Insights"
        badge={
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "#dcf0e6", color: "#1d6e47", letterSpacing: "0.05em" }}>
            AI
          </span>
        }
        delay={0.15}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {INSIGHTS.map((ins, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
            >
              <div style={{ width: 6, height: 6, borderRadius: 999, background: "#89d7b7", flexShrink: 0, marginTop: 5 }} />
              <p style={{ fontSize: 12, color: "#4a6a5a", lineHeight: 1.6, margin: 0 }}>
                {ins.bold
                  ? ins.text.split(ins.bold).map((part, pi, arr) => (
                      <span key={pi}>
                        {part}
                        {pi < arr.length - 1 && <strong style={{ color: "#1a2e26" }}>{ins.bold}</strong>}
                      </span>
                    ))
                  : ins.text}
              </p>
            </motion.div>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection
        icon={<PencilSimple size={15} style={{ color: "#2e7d5c" }} />}
        title="Founder Guidance"
        action={
          <button style={{ fontSize: 11, fontWeight: 700, color: "#428475", background: "none", border: "none", cursor: "pointer" }} className="hover:underline">
            View all
          </button>
        }
        delay={0.22}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {GUIDANCE.map((g, i) => (
            <motion.div
              key={g.name}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + i * 0.04 }}
              style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
            >
              <div style={{ width: 6, height: 6, borderRadius: 999, background: "#89d7b7", flexShrink: 0, marginTop: 5 }} />
              <p style={{ fontSize: 12, color: "#4a6a5a", lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: "#1a2e26" }}>{g.name}: </strong>{g.tip}
              </p>
            </motion.div>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection
        icon={<Clock size={15} style={{ color: "#2e7d5c" }} />}
        title="Recent Activity"
        action={
          <button style={{ fontSize: 11, fontWeight: 700, color: "#428475", background: "none", border: "none", cursor: "pointer" }} className="hover:underline">
            All
          </button>
        }
        delay={0.3}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {ACTIVITY.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34 + i * 0.04 }}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <div style={{ width: 8, height: 8, borderRadius: 999, background: a.dot, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1a2e26", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {a.text}
                </div>
              </div>
              <div style={{ fontSize: 10, color: "#9ab4a4", flexShrink: 0 }}>{a.time}</div>
            </motion.div>
          ))}
        </div>
      </SidebarSection>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* Main export                                            */
/* ─────────────────────────────────────────────────────── */
interface Props {
  initialBlueprints?: Blueprint[];
  onBlueprintsChange?: (bps: Blueprint[]) => void;
  openBlueprintId?: string | null;
  onClearOpen?: () => void;
  triggerForge?: boolean;
  onClearForge?: () => void;
  profileComplete?: boolean;
  onCompleteProfile?: () => void;
}

export function WorkspaceTab({
  initialBlueprints = SEED,
  onBlueprintsChange,
  openBlueprintId,
  onClearOpen,
  triggerForge,
  onClearForge,
  profileComplete = true,
  onCompleteProfile,
}: Props) {
  const [blueprints, setBlueprints] = useState<Blueprint[]>(initialBlueprints);
  const [forgeOpen, setForgeOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(openBlueprintId ?? null);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("All Stages");
  const [sort, setSort] = useState("Viability");

  useEffect(() => { if (triggerForge) { setForgeOpen(true); onClearForge?.(); } }, [triggerForge, onClearForge]);
  useEffect(() => { if (openBlueprintId) setViewingId(openBlueprintId); }, [openBlueprintId]);

  const update = (bps: Blueprint[]) => { setBlueprints(bps); onBlueprintsChange?.(bps); };
  const viewingBP = blueprints.find((b) => b.id === viewingId);

  const filtered = blueprints.filter((bp) => {
    const matchSearch =
      bp.name.toLowerCase().includes(search.toLowerCase()) ||
      bp.industry.toLowerCase().includes(search.toLowerCase()) ||
      bp.ideaDesc.toLowerCase().includes(search.toLowerCase());
    const matchStage = stage === "All Stages" || bp.status.toLowerCase() === stage.toLowerCase();
    return matchSearch && matchStage;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "Viability")        return b.viability - a.viability;
    if (sort === "Investor Views")   return b.investorViews - a.investorViews;
    if (sort === "Market Potential") return b.marketPotential - a.marketPotential;
    return 0;
  });

  const pubCount      = blueprints.filter((b) => b.status === "PUBLISHED").length;
  const totalInvViews = blueprints.reduce((s, b) => s + b.investorViews, 0);
  const avgViability  = blueprints.length > 0
    ? Math.round(blueprints.reduce((s, b) => s + b.viability, 0) / blueprints.length)
    : 0;

  const headerStats = [
    { value: blueprints.length, label: "Total Ideas"   },
    { value: pubCount,          label: "Published"     },
    { value: `${avgViability}%`,label: "Avg Viability" },
    { value: totalInvViews,     label: "Inv. Views"    },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: "#f0f3f1" }}>

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, padding: "28px 32px 20px" }}>
        <AnimatePresence mode="wait">
          {!viewingBP ? (
            <motion.div key="header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Title row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1a2e26", letterSpacing: "-0.025em", lineHeight: 1 }}>
                    Founder Workspace
                  </h1>
                  <p style={{ fontSize: 13, color: "#7a9e8e", marginTop: 6 }}>
                    Manage and track your startup blueprints
                  </p>
                </div>
                <motion.button
                  onClick={() => setForgeOpen(true)}
                  whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(26,49,44,0.28)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontSize: 13, fontWeight: 700,
                    padding: "11px 22px", borderRadius: 12,
                    background: "#1a312c", color: "#89d7b7",
                    border: "none", cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(26,49,44,0.18)",
                  }}
                >
                  <Plus size={15} weight="bold" /> New idea
                </motion.button>
              </div>

              {/* Dark stats bar */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  display: "flex",
                  background: "#1a312c",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(26,49,44,0.2)",
                }}
              >
                {headerStats.map((s, i) => (
                  <div
                    key={s.label}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "20px 16px",
                      borderRight: i < headerStats.length - 1 ? "1px solid rgba(137,215,183,0.12)" : "none",
                    }}
                  >
                    <span style={{ fontSize: 26, fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.02em" }}>
                      {s.value}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#89d7b7", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6 }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="detail-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          )}
        </AnimatePresence>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: "0 32px 28px", gap: 20 }}>

        {/* Left: list or detail */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            {viewingBP ? (
              <BlueprintDetail
                key="detail"
                bp={viewingBP}
                onBack={() => { setViewingId(null); onClearOpen?.(); }}
              />
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>

                {/* Search & filter bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexShrink: 0 }}>
                  <div style={{
                    flex: 1, display: "flex", alignItems: "center", gap: 10,
                    background: "#fff", padding: "12px 16px",
                    borderRadius: 14, border: "1px solid #dde8e2",
                    boxShadow: "0 1px 6px rgba(26,49,44,0.05)",
                  }}>
                    <MagnifyingGlass size={17} style={{ color: "#9ab4a4", flexShrink: 0 }} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search ideas, industries…"
                      style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#1a2e26", fontFamily: "inherit" }}
                    />
                  </div>
                  {[
                    { label: stage,           options: STAGES,       setter: setStage },
                    { label: `Sort: ${sort}`, options: SORT_OPTIONS, setter: setSort  },
                  ].map(({ label, options, setter }) => (
                    <div key={label} style={{ position: "relative" }}>
                      <select
                        onChange={(e) => setter(e.target.value)}
                        style={{
                          appearance: "none",
                          background: "#fff",
                          border: "1px solid #dde8e2",
                          borderRadius: 14,
                          padding: "12px 40px 12px 16px",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1a2e26",
                          cursor: "pointer",
                          outline: "none",
                          minWidth: 138,
                          fontFamily: "inherit",
                          boxShadow: "0 1px 6px rgba(26,49,44,0.05)",
                        }}
                      >
                        {options.map((o) => <option key={o}>{o}</option>)}
                      </select>
                      <CaretDown size={11} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#7a9e8e", pointerEvents: "none" }} />
                    </div>
                  ))}
                </div>

                {/* Cards */}
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 18, paddingRight: 4 }}>
                  {sorted.length === 0 && (
                    <div style={{ textAlign: "center", padding: "64px 0", color: "#7a9e8e" }}>
                      <div style={{ fontSize: 36, marginBottom: 16 }}>✦</div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: "#1a2e26" }}>No ideas found</div>
                      <div style={{ fontSize: 13 }}>Try adjusting your search or forge a new blueprint.</div>
                    </div>
                  )}
                  <AnimatePresence>
                    {sorted.map((bp, idx) => (
                      <IdeaCard
                        key={bp.id}
                        bp={bp}
                        idx={idx}
                        onView={() => setViewingId(bp.id)}
                        onDelete={() => {
                          if (window.confirm("Delete this idea?")) update(blueprints.filter((b) => b.id !== bp.id));
                        }}
                        canPublish={profileComplete}
                        onCompleteProfile={onCompleteProfile}
                        onTogglePublic={() =>
                          update(blueprints.map((b) =>
                            b.id === bp.id
                              ? { ...b, isPublic: !b.isPublic, status: (b.isPublic ? "DRAFT" : "PUBLISHED") as "DRAFT" | "PUBLISHED" }
                              : b
                          ))
                        }
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right sidebar */}
        <AnimatePresence>
          {!viewingBP && (
            <motion.aside
              key="sidebar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              style={{ flexShrink: 0, overflowY: "auto", width: 290 }}
            >
              <WorkspaceSidebar />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {forgeOpen && (
        <ForgeModal
          onClose={() => setForgeOpen(false)}
          onCreated={(bp) => { update([bp, ...blueprints]); setViewingId(bp.id); }}
        />
      )}
    </div>
  );
}

export { SEED as DEFAULT_BLUEPRINTS };
