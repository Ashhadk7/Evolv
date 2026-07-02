"use client";

import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Plus, X, Eye, PencilSimple, ArrowLeft, ArrowRight,
  CheckCircle, Sparkle, MagnifyingGlass, CaretDown, CaretRight,
  Lightbulb, Clock, LinkSimple, DownloadSimple, Broadcast,
  Gauge, FloppyDisk, PaperPlaneTilt, ChatCircleDots, Calculator,
  CodeBlock, Browser, Stack, Cpu, Database, CloudArrowUp, Plugs, Cube,
  Target, Crosshair, Compass, ChartLineUp, Strategy, ShieldCheck,
  Warning, SealCheck, ListChecks, XCircle, Buildings,
  Coins, Money, Receipt, Lock, Briefcase, UsersThree, User, Wallet,
  Flag, Megaphone, Storefront, Notebook, FileText, GitBranch,
  Pulse, Trophy, TrendUp, TrendDown, ChartBar,
} from "@phosphor-icons/react";
import {
  buildBlueprintContent, buildArchitecture, gradeFor, fmtMoney,
  type BlueprintContent, type TechStackModel, type StackLayerKey, type StackCat, type Phase,
  type ProjectState,
} from "./blueprintContent";
import {
  FOUNDER_NETWORK_PROFILES,
  NetworkProfileDetailScreen,
  type FounderContactProfile,
} from "./NetworkProfileDetail";
import type { FounderNetworkMessageTarget } from "./NetworkTab";

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
  techStack: { frontend: string; backend: string; ai: string; db: string; vectorDb?: string; aiProvider?: string; hosting?: string };
  cost: { timeline: string; team: string; hosting: string; budget: string };
  project?: ProjectState;
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
    aiRecommend: "Publish to attract developer matches",
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
    aiRecommend: "Schedule developer interviews this week",
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
const SORT_OPTIONS = ["Viability","Recent","Impressions","Market Potential"];
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
  { text: "Developer match rates for HealthTech increased 17% this month.", bold: "HealthTech" },
  { text: "EdTech startups have the highest match rates with developers.", bold: "" },
  { text: "Nexus Health is ready for workspace deployment — MVP specifications are strong.", bold: "Nexus Health" },
  { text: "Aura Logistics needs more developer validation before pitching.", bold: "Aura Logistics" },
];

const GUIDANCE = [
  { name: "Nexus Health",         tip: "Your blueprint is strong. Schedule 3 developer interviews this week." },
  { name: "Aura Logistics",       tip: "Add more technical validation to increase developer match confidence." },
  { name: "Veritas Energy",       tip: "Your market timing is excellent. Consider a soft launch." },
  { name: "Educational AI Tutor", tip: "AI generation is 60% complete. Monitor progress." },
];

const ACTIVITY = [
  { text: "Nexus Health complete",                        time: "2 days ago",  dot: "#2e7d5c" },
  { text: "Idea draft saved — Food Delivery Marketplace", time: "Yesterday",   dot: "#428475" },
  { text: "Blueprint initiated — Aura Logistics",         time: "1 week ago",  dot: "#89d7b7" },
  { text: "New developer match — Sarah Mitchell",         time: "2 weeks ago", dot: "#7a9e8e" },
  { text: "Developer matched with Veritas Energy",               time: "3 weeks ago", dot: "#b0c0b8" },
];

/* ─────────────────────────────────────────────────────── */
/* StatusBadge                                            */
/* ─────────────────────────────────────────────────────── */
export const PROJECT_STATUS_LABEL: Record<ProjectState["status"], string> = {
  ONBOARDING: "Onboarding Project",
  IN_DEVELOPMENT: "In Development",
  COMPLETED: "Project Completed",
};
export const PROJECT_STATUS_STYLE: Record<ProjectState["status"], { bg: string; color: string }> = {
  ONBOARDING: { bg: "#fef6e4", color: "#a66a10" },
  IN_DEVELOPMENT: { bg: "#dcf0e6", color: "#1d6e47" },
  COMPLETED: { bg: "#eef0ee", color: "#4f6358" },
};
function StatusBadge({ status, project }: { status: Blueprint["status"]; project?: ProjectState }) {
  if (project) {
    const s = PROJECT_STATUS_STYLE[project.status];
    return (
      <span style={{ display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, background: s.bg, color: s.color }}>
        {PROJECT_STATUS_LABEL[project.status]}
      </span>
    );
  }
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
  const accent = bp.project ? PROJECT_STATUS_STYLE[bp.project.status].color : pub ? "#89d7b7" : "#c8d8d0";
  const metrics = [
    { value: String(bp.viability),     label: "Viability"   },
    { value: `${bp.marketPotential}%`, label: "Market"      },
    { value: String(bp.investorViews), label: "Impressions"  },
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
        borderLeft: `4px solid ${accent}`,
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
          <StatusBadge status={bp.status} project={bp.project} />
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
            whileHover={{ scale: 1.04, filter: "brightness(1.08)" }}
            whileTap={{ scale: 0.96 }}
            onClick={onView}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              padding: "8px 18px",
              borderRadius: 10,
              background: "linear-gradient(180deg, #234840, #1a312c)",
              color: "#89d7b7",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 14px -4px rgba(17, 34, 27, 0.4)",
            }}
          >
            <Eye size={13} weight="bold" /> View
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

/* ═══════════════════════════════════════════════════════ */
/* Blueprint Detail — design tokens & primitives           */
/* ═══════════════════════════════════════════════════════ */

export const C = {
  forest: "#1a312c",
  deep: "#11221b",
  teal: "#428475",
  mint: "#89d7b7",
  mintSoft: "#a8dfc9",
  page: "#f0f3f1",
  card: "#ffffff",
  border: "#e6ede9",
  borderSoft: "#eef3f0",
  ink: "#15271f",
  body: "#4f6358",
  muted: "#647a6e",
  label: "#8aa99c",
  amber: "#b07d10",
  amberBg: "#fffaef",
  amberLine: "#f0dfa0",
  red: "#c0392b",
  redBg: "#fdeeec",
  redLine: "#f3d4cf",
  success: "#2e7d5c",
  successBg: "#e7f4ed",
  tint: "#f4f8f6",
};
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const MONO = "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace";
export const NUM: CSSProperties = { fontVariantNumeric: "tabular-nums", fontFeatureSettings: '"tnum" 1, "ss01" 1' };

export const cardStyle = (extra?: CSSProperties): CSSProperties => ({
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 20,
  boxShadow: "0 1px 1px rgba(19,36,29,0.03), 0 2px 6px rgba(19,36,29,0.03), 0 16px 40px -18px rgba(19,36,29,0.14)",
  ...extra,
});

/* Number that eases up from 0 → target on mount */
function useCountUp(target: number, duration = 1200, run = true) {
  const [val, setVal] = useState(run ? 0 : target);
  useEffect(() => {
    if (!run) { setVal(target); return; }
    let raf = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else setVal(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, run]);
  return val;
}

export function CountNum({ value, suffix = "", decimals = 0, run = true }: { value: number; suffix?: string; decimals?: number; run?: boolean }) {
  const v = useCountUp(value, 1200, run);
  return <>{v.toFixed(decimals)}{suffix}</>;
}

/* Scroll-into-view reveal — calm, expo-out, honours reduced motion */
export function Reveal({ children, delay = 0, y = 18, style }: { children: ReactNode; delay?: number; y?: number; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      style={{ breakInside: "avoid", ...style }}
    >
      {children}
    </motion.div>
  );
}

/* Section heading — icon chip · kicker · title · description */
export function SectionHead({ icon, kicker, title, desc, right }: { icon: ReactNode; kicker?: string; title: string; desc?: string; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, marginBottom: 20 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: C.tint, border: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
          <div>
            {kicker && <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: C.label, marginBottom: 2, fontFamily: MONO }}>{kicker}</div>}
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: "-0.022em", lineHeight: 1.1 }}>{title}</h2>
          </div>
        </div>
        {desc && <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65, marginTop: 12, maxWidth: 640 }}>{desc}</p>}
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

export const Kicker = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 10, fontWeight: 600, color: C.label, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 7, fontFamily: MONO }}>{children}</div>
);

export function Chip({ children, tone = "neutral", icon }: { children: ReactNode; tone?: "neutral" | "mint" | "amber" | "red" | "dark"; icon?: ReactNode }) {
  const map = {
    neutral: { bg: C.tint, color: C.teal, bd: C.borderSoft },
    mint: { bg: C.successBg, color: "#1d6e47", bd: "#cfeadd" },
    amber: { bg: C.amberBg, color: C.amber, bd: C.amberLine },
    red: { bg: C.redBg, color: C.red, bd: C.redLine },
    dark: { bg: C.forest, color: C.mint, bd: "transparent" },
  }[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: map.color, background: map.bg, border: `1px solid ${map.bd}`, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
      {icon}{children}
    </span>
  );
}

export function Avatar({ initials, size = 44 }: { initials: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 999, background: "linear-gradient(150deg, #1f3a30, #15271f)", color: C.mint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, flexShrink: 0, letterSpacing: "0.02em" }}>
      {initials}
    </div>
  );
}

export function Trend({ value, positive }: { value: string; positive: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: positive ? C.success : C.red, background: positive ? C.successBg : C.redBg, padding: "3px 8px", borderRadius: 999, ...NUM }}>
      {positive ? <TrendUp size={11} weight="bold" /> : <TrendDown size={11} weight="bold" />} {value}
    </span>
  );
}

/* Segmented meter — segments light up left→right on view */
function SegmentedBar({ value, total = 14, lit: litOverride, height = 22 }: { value: number; total?: number; lit?: number; height?: number }) {
  const reduce = useReducedMotion();
  const lit = litOverride ?? Math.round((value / 100) * total);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          initial={reduce ? false : { opacity: 0.25, transform: "scaleY(0.5)" }}
          whileInView={{ opacity: 1, transform: "scaleY(1)" }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.035, duration: 0.3, ease: "easeOut" }}
          style={{ flex: 1, height, borderRadius: 3, background: i < lit ? C.mint : "#e7eee9", transformOrigin: "bottom" }}
        />
      ))}
    </div>
  );
}

/* Thin gradient meter line */
export function MeterBar({ value, height = 8 }: { value: number; height?: number }) {
  return (
    <div style={{ height, background: "#e7eee9", borderRadius: 999, overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE }}
        style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #428475, #89d7b7)" }}
      />
    </div>
  );
}

/* Circular viability gauge — gradient arc, soft glow, counting centre */
export function ViabilityGauge({ score, label = "VIABILITY", size = 190 }: { score: number; label?: string; size?: number }) {
  const reduce = useReducedMotion();
  const scale = size / 190;
  const r = 76, cx = 95, cy = 95, sw = 12;
  const Circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 190 190" style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#428475" />
            <stop offset="100%" stopColor="#89d7b7" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e7eee9" strokeWidth={sw} />
        <motion.circle
          cx={cx} cy={cy} r={r} fill="none" stroke="url(#gaugeGrad)" strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={Circ}
          initial={reduce ? { strokeDashoffset: Circ * (1 - score / 100) } : { strokeDashoffset: Circ }}
          whileInView={{ strokeDashoffset: Circ * (1 - score / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: EASE }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 50 * scale, fontWeight: 800, color: C.ink, lineHeight: 1, letterSpacing: "-0.04em", ...NUM }}><CountNum value={score} /></div>
        <div style={{ fontSize: 10 * Math.max(scale, 0.85), fontWeight: 600, color: C.label, letterSpacing: "0.2em", marginTop: 6 * scale, fontFamily: MONO }}>{label}</div>
      </div>
    </div>
  );
}

export const Label = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 10, fontWeight: 600, color: C.label, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 7, fontFamily: MONO }}>{children}</div>
);

/* ═══════════════════════════════════════════════════════ */
/* Floating Blueprint AI assistant                         */
/* ═══════════════════════════════════════════════════════ */
type ChatMsg = { from: "ai" | "user"; text: string };
function ChatPanel({ bp }: { bp: Blueprint }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { from: "ai", text: `I'm the blueprint assistant for ${bp.name}. Ask about the recommended stack, scope, budget, or what to build first.` },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setInput("");
    setTyping(true);
    const replies = [
      `For ${bp.name}, I'd build the ${bp.techStack.frontend} client and ${bp.techStack.backend} API first — that unlocks the core flow and lets a developer demo value early.`,
      `The biggest lever is the AI layer (${bp.techStack.ai}). Ship a thin inference pipeline behind a clean API, then iterate on accuracy once real data flows in.`,
      `Budget-wise, front-load the must-have milestones. Payments release per approved milestone, so keep each phase independently shippable.`,
    ];
    const reply = replies[msgs.filter((m) => m.from === "user").length % replies.length];
    window.setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "ai", text: reply }]);
    }, 1200);
  };

  return (
    <>
      <motion.button
        className="blueprint-no-print"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        style={{
          position: "fixed", bottom: 26, right: 26, zIndex: 60,
          width: 54, height: 54, borderRadius: 999,
          background: "linear-gradient(180deg, #244b42 0%, #18382f 55%, #102b24 100%)",
          border: "1px solid rgba(5, 31, 25, 0.88)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "inset 0 1px 0 rgba(171,255,220,0.18), inset 0 -1px 0 rgba(0,0,0,0.18), 0 12px 34px rgba(17,34,27,0.42)",
        }}
        aria-label="Blueprint assistant"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} style={{ display: "flex" }}><X size={20} weight="bold" style={{ color: C.mint }} /></motion.span>
            : <motion.span key="s" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} style={{ display: "flex" }}><ChatCircleDots size={22} weight="fill" style={{ color: C.mint }} /></motion.span>}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="blueprint-no-print"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            style={{
              position: "fixed", bottom: 92, right: 26, zIndex: 59,
              width: 336, height: 440,
              background: C.card, borderRadius: 20,
              border: `1px solid ${C.border}`,
              boxShadow: "0 24px 60px rgba(17,34,27,0.28)",
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}
          >
            <div style={{ background: C.forest, padding: "15px 18px", display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(137,215,183,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChatCircleDots size={15} weight="fill" style={{ color: C.mint }} />
              </div>
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Blueprint Assistant</div>
                <div style={{ fontSize: 10.5, color: C.mintSoft }}>Ask anything about this build</div>
              </div>
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ alignSelf: m.from === "ai" ? "flex-start" : "flex-end", maxWidth: "85%" }}>
                  <div style={{
                    fontSize: 12.5, lineHeight: 1.55, padding: "10px 13px", borderRadius: 14,
                    background: m.from === "ai" ? C.tint : C.forest,
                    color: m.from === "ai" ? C.body : "#dbf0e5",
                    borderTopLeftRadius: m.from === "ai" ? 4 : 14,
                    borderTopRightRadius: m.from === "ai" ? 14 : 4,
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div style={{ alignSelf: "flex-start", display: "flex", gap: 4, padding: "11px 13px", background: C.tint, borderRadius: 14 }}>
                  {[0, 1, 2].map((d) => (
                    <motion.span key={d} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.18 }} style={{ width: 6, height: 6, borderRadius: 999, background: C.mint, display: "inline-block" }} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderTop: `1px solid ${C.borderSoft}` }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Ask about the stack, scope, budget…"
                style={{ flex: 1, fontSize: 12.5, padding: "10px 13px", borderRadius: 11, background: C.tint, border: `1px solid ${C.borderSoft}`, outline: "none", color: C.ink, fontFamily: "inherit" }}
              />
              <motion.button onClick={send} whileTap={{ scale: 0.9 }} className="bp-gradient-btn" style={{ width: 38, height: 38, borderRadius: 11, background: C.forest, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <PaperPlaneTilt size={16} weight="fill" style={{ color: C.mint }} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Presentational stack detail (icons live here — the data    */
/* model itself lives in blueprintContent.ts)                 */
/* ═══════════════════════════════════════════════════════ */
function deriveStack(bp: Blueprint): StackCat[] {
  const fe = bp.techStack.frontend;
  const be = bp.techStack.backend;
  const ai = bp.techStack.ai;
  const db = bp.techStack.db;
  return [
    {
      icon: <Browser size={18} weight="duotone" style={{ color: C.teal }} />, name: "Frontend", primary: fe,
      rows: [
        { k: "Framework", v: "Next.js 16 (App Router) + React" },
        { k: "Language", v: "TypeScript (strict)" },
        { k: "Styling", v: "Tailwind CSS + Framer Motion" },
        { k: "Data / state", v: "TanStack Query + Zustand" },
        { k: "Components", v: "Radix Primitives + custom UI kit" },
      ],
    },
    {
      icon: <Stack size={18} weight="duotone" style={{ color: C.teal }} />, name: "Backend", primary: be,
      rows: [
        { k: "Service", v: be },
        { k: "API", v: "REST + OpenAPI (typed client)" },
        { k: "Auth", v: "Auth.js / Clerk — JWT + OAuth" },
        { k: "Validation", v: be.toLowerCase().includes("python") ? "Pydantic" : "Zod" },
        { k: "Background jobs", v: be.toLowerCase().includes("python") ? "Celery + Redis" : "BullMQ + Redis" },
      ],
    },
    {
      icon: <Cpu size={18} weight="duotone" style={{ color: C.teal }} />, name: "AI / ML", primary: ai,
      rows: [
        { k: "Models", v: ai },
        { k: "Serving", v: "FastAPI + ONNX Runtime" },
        { k: "Orchestration", v: "LangChain / typed pipeline" },
        { k: "Vector store", v: "pgvector (Postgres)" },
        { k: "Evaluation", v: "Weights & Biases + golden sets" },
      ],
    },
    {
      icon: <Database size={18} weight="duotone" style={{ color: C.teal }} />, name: "Data", primary: db,
      rows: [
        { k: "Primary DB", v: db },
        { k: "Cache / queue", v: "Redis" },
        { k: "Object storage", v: "Amazon S3 / Cloudflare R2" },
        { k: "ORM", v: be.toLowerCase().includes("python") ? "SQLAlchemy + Alembic" : "Prisma" },
        { k: "Analytics", v: "ClickHouse / warehouse sync" },
      ],
    },
    {
      icon: <CloudArrowUp size={18} weight="duotone" style={{ color: C.teal }} />, name: "Infra & DevOps", primary: "Vercel · AWS",
      rows: [
        { k: "Hosting", v: "Vercel (web) + AWS / Render (API)" },
        { k: "Containers", v: "Docker" },
        { k: "CI / CD", v: "GitHub Actions" },
        { k: "IaC", v: "Terraform" },
        { k: "Observability", v: "Sentry + Grafana / OpenTelemetry" },
      ],
    },
    {
      icon: <Plugs size={18} weight="duotone" style={{ color: C.teal }} />, name: "Integrations", primary: "Stripe Connect",
      rows: [
        { k: "Payments", v: "Stripe Connect — milestone escrow" },
        { k: "Email", v: "Resend / Postmark" },
        { k: "Product analytics", v: "PostHog" },
        { k: "Notifications", v: "Knock / Novu" },
        { k: "Error tracking", v: "Sentry" },
      ],
    },
  ];
}

/* Architecture diagram — SVG boxes+arrows fed by structured    */
/* node/edge data. No diagram library, no image-gen model: the  */
/* labels come straight from the (editable) tech stack, so the  */
/* diagram can never show a box that doesn't match the stack.   */
const DIAGRAM_LAYOUT: Record<string, { x: number; y: number }> = {
  client: { x: 0, y: 0 }, api: { x: 220, y: 0 }, ai: { x: 440, y: 0 },
  vector: { x: 440, y: 96 }, db: { x: 220, y: 96 }, payments: { x: 0, y: 96 },
  hosting: { x: 110, y: 192 },
};
function ArchitectureDiagram({ nodes, edges }: { nodes: { id: string; label: string }[]; edges: { from: string; to: string }[] }) {
  const boxW = 196, boxH = 46, W = 656, H = 250;
  const pos = (id: string) => DIAGRAM_LAYOUT[id] || { x: 0, y: 0 };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block" }}>
      {edges.map((e, i) => {
        const a = pos(e.from), b = pos(e.to);
        const x1 = a.x + boxW / 2, y1 = a.y + boxH / 2, x2 = b.x + boxW / 2, y2 = b.y + boxH / 2;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.borderSoft} strokeWidth={2} />;
      })}
      {nodes.map((n) => {
        const p = pos(n.id);
        return (
          <g key={n.id}>
            <rect x={p.x} y={p.y} width={boxW} height={boxH} rx={10} fill={C.card} stroke={C.border} strokeWidth={1.5} />
            <text x={p.x + boxW / 2} y={p.y + boxH / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.ink}>{n.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* Editable tech-stack layer pill — curated options + "Custom…". */
/* Read-only chip when not in edit mode, matching the existing   */
/* pill style used across the hero/architecture rows.            */
function TechStackPill({ label, layer, editing, onChange }: {
  label: string; layer: { chosen: string; options: string[] }; editing: boolean; onChange: (v: string) => void;
}) {
  const [custom, setCustom] = useState(false);
  const pillBase: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: C.ink, background: C.tint, border: `1px solid ${C.borderSoft}`, padding: "8px 12px", borderRadius: 10 };
  if (!editing) {
    return (
      <span style={pillBase}>
        <span style={{ color: C.label, fontFamily: MONO, fontSize: 10, textTransform: "uppercase" }}>{label}</span>{layer.chosen}
      </span>
    );
  }
  return (
    <span style={{ ...pillBase, background: C.card, border: `1px solid ${C.forest}`, flexDirection: "column", alignItems: "stretch", gap: 5, padding: "7px 10px" }}>
      <span style={{ color: C.label, fontFamily: MONO, fontSize: 10, textTransform: "uppercase" }}>{label}</span>
      <select
        value={custom ? "__custom" : layer.chosen}
        onChange={(e) => { if (e.target.value === "__custom") { setCustom(true); return; } setCustom(false); onChange(e.target.value); }}
        style={{ fontSize: 12.5, fontWeight: 600, color: C.ink, border: `1px solid ${C.border}`, borderRadius: 7, padding: "4px 6px", outline: "none", background: C.card, fontFamily: "inherit" }}
      >
        {!layer.options.includes(layer.chosen) && <option value={layer.chosen}>{layer.chosen}</option>}
        {layer.options.map((o) => <option key={o} value={o}>{o}</option>)}
        <option value="__custom">Custom…</option>
      </select>
      {custom && (
        <input
          autoFocus
          placeholder="Type your own choice"
          onBlur={(e) => { if (e.target.value.trim()) onChange(e.target.value.trim()); }}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
          style={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 7px", outline: "none", fontFamily: "inherit", color: C.ink }}
        />
      )}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Blueprint Detail view                                   */
/* ═══════════════════════════════════════════════════════ */
function BlueprintDetail({
  bp,
  onBack,
  onSave,
  onMessage,
  profileComplete = true,
  onRequireProfile,
}: {
  bp: Blueprint;
  onBack: () => void;
  onSave?: (updated: Blueprint) => void;
  onMessage?: (contact: FounderNetworkMessageTarget) => void;
  profileComplete?: boolean;
  onRequireProfile?: (afterComplete?: () => void) => void;
}) {
  const reduce = useReducedMotion();
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState<FounderContactProfile | null>(null);
  const [activeRoleFilter, setActiveRoleFilter] = useState("all");
  const [developerConnections, setDeveloperConnections] = useState<Record<string, boolean>>(() =>
    FOUNDER_NETWORK_PROFILES.reduce<Record<string, boolean>>((acc, profile) => {
      if (profile.type === "Developer") acc[profile.id] = profile.connected;
      return acc;
    }, {})
  );
  const [content] = useState<BlueprintContent>(() => buildBlueprintContent(bp));
  const [phases, setPhases] = useState<Phase[]>(() => content.phases);
  const [editPhase, setEditPhase] = useState<number | null>(null);
  const [hirePanelPhase, setHirePanelPhase] = useState<number | null>(null);
  const [phaseHires, setPhaseHires] = useState<Record<number, string>>({});
  const [draftDesc, setDraftDesc] = useState(bp.ideaDesc);
  const [draftFeatures, setDraftFeatures] = useState<string[]>(bp.features);
  const [draftCost, setDraftCost] = useState(bp.cost);
  const [draftTechStack, setDraftTechStack] = useState<TechStackModel>(() => content.techStack);
  const updateTechStackLayer = (key: StackLayerKey, value: string) =>
    setDraftTechStack((prev) => ({ ...prev, [key]: { ...prev[key], chosen: value } }));
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const restoreBlueprintScrollRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  const published = bp.status === "PUBLISHED";

  /* URL deep-link + browser back */
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "workspace");
    url.searchParams.set("blueprint", bp.id);
    window.history.pushState({}, "", url.toString());
    const handlePop = () => {
      const p = new URLSearchParams(window.location.search);
      if (!p.get("blueprint")) onBack();
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bp.id]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
  };
  useEffect(() => {
    if (selectedDeveloper || restoreBlueprintScrollRef.current === null) return;
    const top = restoreBlueprintScrollRef.current;
    restoreBlueprintScrollRef.current = null;
    const raf = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTop = top;
      onScroll();
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedDeveloper]);

  const handleBack = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("blueprint");
    window.history.pushState({}, "", url.toString());
    onBack();
  };
  const requireProfileBeforeAction = (afterComplete?: () => void) => {
    if (profileComplete || !onRequireProfile) return false;
    onRequireProfile(afterComplete);
    return true;
  };
  const handleToggleDeveloperConnection = (id: string) => {
    if (requireProfileBeforeAction(() => handleToggleDeveloperConnection(id))) return;
    setDeveloperConnections((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const handleDeveloperMessage = (profile: FounderContactProfile) => {
    if (requireProfileBeforeAction()) return;
    onMessage?.({
      id: profile.id,
      name: profile.name,
      role: `${profile.role} - ${profile.company}`,
      match: profile.match,
      initials: profile.initials,
      online: profile.online,
      personType: profile.type,
      requestStatus: developerConnections[profile.id] ? undefined : "pending",
      requestDirection: developerConnections[profile.id] ? undefined : "outgoing",
      subject: developerConnections[profile.id] ? undefined : "Blueprint match",
    });
  };
  const handleViewMatchedDeveloper = (profile: FounderContactProfile) => {
    restoreBlueprintScrollRef.current = scrollRef.current?.scrollTop ?? null;
    setSelectedDeveloper(profile);
  };
  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2000); };
  const copyLink = () => {
    const url = window.location.href;
    const fallback = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = url; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.focus(); ta.select();
        document.execCommand("copy"); document.body.removeChild(ta);
      } catch { /* ignore */ }
    };
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).catch(fallback);
      } else { fallback(); }
    } catch { fallback(); }
    showToast("Link copied to clipboard");
  };
  const togglePublish = () => { onSave?.({ ...bp, status: published ? "DRAFT" : "PUBLISHED", isPublic: !published }); showToast(published ? "Blueprint unpublished" : "Blueprint published"); };
  const saveEdits = () => {
    onSave?.({
      ...bp, ideaDesc: draftDesc, features: draftFeatures, cost: draftCost,
      techStack: {
        frontend: draftTechStack.frontend.chosen, backend: draftTechStack.backend.chosen,
        ai: bp.techStack.ai, db: draftTechStack.database.chosen,
        vectorDb: draftTechStack.vectorDb.chosen, aiProvider: draftTechStack.aiProvider.chosen, hosting: draftTechStack.hosting.chosen,
      },
    });
    setEditing(false); showToast("Changes saved");
  };
  const cancelEdits = () => { setDraftDesc(bp.ideaDesc); setDraftFeatures(bp.features); setDraftCost(bp.cost); setDraftTechStack(content.techStack); setEditing(false); };

  /* ── derived metrics — one viability score, sourced from content model ── */
  const { score: viabilityScore, grade, reasoning: viabilityReasoning, subScores } = content.viability;
  const topPct = Math.max(3, Math.round((100 - viabilityScore) * 0.55));
  const stageLabel = viabilityScore >= 82 ? "Launch Ready" : viabilityScore >= 72 ? "Build Ready" : viabilityScore >= 62 ? "Validation Stage" : "Concept Stage";
  const subScoreRow = [
    { label: "Market", value: subScores.market },
    { label: "Execution", value: subScores.execution },
    { label: "Timing", value: subScores.timing },
    { label: "Team Fit", value: subScores.teamFit },
  ];
  const architecture = buildArchitecture(draftTechStack);

  const strengths = ["Clear, sizeable market demand", "Strong developer interest & matchability", "Defensible differentiation vs. incumbents"];
  const risks = ["Competitive, well-funded incumbents", bp.market.barriers];

  const desc = editing ? draftDesc : bp.ideaDesc;
  const infoGrid = [
    { icon: <Target size={16} weight="duotone" style={{ color: C.success }} />, label: "Mission", text: `Make ${bp.industry} outcomes dramatically better by ${bp.differentiator.toLowerCase()} — and make that accessible to the teams who are priced out or under-served today.` },
    { icon: <Compass size={16} weight="duotone" style={{ color: C.teal }} />, label: "Vision", text: `A world where ${bp.industry.toLowerCase()} capabilities once exclusive to large incumbents are available to everyone, on demand.` },
    { icon: <Warning size={16} weight="duotone" style={{ color: C.red }} />, label: "Problem", text: `Existing ${bp.industry} solutions are expensive, slow to adopt, and built for large players. ${bp.market.barriers} compounds this — leaving smaller teams with wasted time, higher costs, and outcomes that lag what is now technically possible.` },
    { icon: <Lightbulb size={16} weight="duotone" style={{ color: C.amber }} />, label: "Solution", text: `${desc} The platform packages this into a focused product that delivers measurable value from the first session.` },
    { icon: <Crosshair size={16} weight="duotone" style={{ color: C.teal }} />, label: "Value Proposition", text: `${bp.differentiator} — delivered faster, and at a fraction of the cost and complexity of incumbent tools.` },
    { icon: <Coins size={16} weight="duotone" style={{ color: C.success }} />, label: "Revenue Model", text: `B2B SaaS subscription with usage-based tiers. Founders fund development directly and pay contributing developers per approved milestone through Evolv's escrow.` },
  ];

  const personas = content.personas;

  const featureItems: { name: string; note?: string; priority: string }[] = (editing ? draftFeatures : bp.features).map((f, i) => ({
    name: f,
    priority: i < 2 ? "Must-have" : i < 4 ? "Should-have" : "Nice-to-have",
  }));
  const platformFeatures: { name: string; note?: string; priority: string }[] = [
    { name: "Authentication & onboarding", note: "Auth.js / Clerk", priority: "Must-have" },
    { name: "Milestone payments & escrow", note: "Stripe Connect", priority: "Must-have" },
    { name: "Notifications & email", note: "Knock · Resend", priority: "Should-have" },
    { name: "Admin & analytics dashboard", note: "PostHog", priority: "Nice-to-have" },
  ];

  const stack = deriveStack({ ...bp, techStack: { ...bp.techStack, frontend: draftTechStack.frontend.chosen, backend: draftTechStack.backend.chosen, db: draftTechStack.database.chosen } });

  const cost = content.costModel;
  const fin = content.financials;
  const totalWeeks = cost.buildWeeks;

  const competitorRows = content.competitors;

  const gaps = [
    { title: "Priced for large players only", text: `Incumbents target enterprise budgets, leaving smaller ${bp.industry} teams unserved.` },
    { title: "Thin explainability & trust", text: "Outputs are delivered as black boxes, slowing adoption in high-stakes decisions." },
    { title: "Poor workflow integration", text: "Tools live in isolation instead of fitting the systems teams already use daily." },
    { title: "Slow time-to-value", text: "Heavy setup and onboarding delay the first real outcome by weeks." },
  ];
  const additions = [
    { title: "Explainability layer", impact: "Differentiator", text: "Surface the “why” behind every AI result to build trust and speed approvals." },
    { title: "Native workflow integrations", impact: "High impact", text: `Connect to the systems ${bp.industry} teams already use so the product fits in, not around.` },
    { title: "Self-serve onboarding", impact: "Quick win", text: "A guided first-run that delivers a real result inside 10 minutes." },
    { title: "Usage-based starter tier", impact: "Growth", text: "A low-friction entry price that converts smaller teams the incumbents ignore." },
  ];
  const pathToComplete = [
    "Ship the must-have MVP and validate the core loop with 3–5 design partners.",
    "Add the explainability + integration layers that turn a feature into a defensible product.",
    "Layer self-serve onboarding and a usage-based tier to open a scalable growth channel.",
  ];

  const gtmChannels = [
    { icon: <UsersThree size={16} weight="duotone" style={{ color: C.teal }} />, title: "Design partners", text: `Hand-pick 3–5 ${bp.industry} teams for deep, co-built early adoption.` },
    { icon: <Megaphone size={16} weight="duotone" style={{ color: C.teal }} />, title: "Content & community", text: "Publish in-the-weeds expertise where the audience already gathers." },
    { icon: <Storefront size={16} weight="duotone" style={{ color: C.teal }} />, title: "Product-led self-serve", text: "A free entry tier that turns usage into qualified, expanding accounts." },
    { icon: <Plugs size={16} weight="duotone" style={{ color: C.teal }} />, title: "Integration partners", text: "Distribute through the platforms your users already live in." },
  ];
  const gtmPhases = ["Private beta", "Design-partner rollout", "Public launch", "Scale & expand"];

  const roles = [
    { role: "Full-Stack Engineer", count: 1, skills: "Next.js · TypeScript · API design", lead: true },
    { role: bp.techStack.ai ? "ML / AI Engineer" : "Backend Engineer", count: 1, skills: `${bp.techStack.ai || bp.techStack.backend} · pipelines`, lead: false },
    { role: "Backend Engineer", count: 1, skills: `${bp.techStack.backend} · ${bp.techStack.db}`, lead: false },
    { role: "Product Designer", count: 1, skills: "UX · design systems (part-time)", lead: false },
  ];
  const developerProfiles = FOUNDER_NETWORK_PROFILES.filter((profile) => profile.type === "Developer");
  const developerRoleText = (developer: FounderContactProfile) =>
    `${developer.role} · ${developer.skills.slice(0, 2).join(" · ")} · ${developer.experience}`;
  const isDeveloperAvailable = (developer: FounderContactProfile) =>
    /open|available/i.test(developer.availability);
  const devsForPhase = (skillset: string[]) => {
    const matched = developerProfiles.filter((d) => skillset.some((s) => d.skills.some((sk) => sk.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(sk.toLowerCase()))));
    return matched.length ? matched : developerProfiles;
  };
  const devsForRole = (role: { role: string; skills: string }) => {
    const terms = `${role.role} ${role.skills}`.toLowerCase().split(/[^a-z0-9+.#]+/).filter(Boolean);
    const matched = developerProfiles.filter((d) => terms.some((term) =>
      d.role.toLowerCase().includes(term) ||
      d.skills.some((sk) => sk.toLowerCase().includes(term) || term.includes(sk.toLowerCase()))
    ));
    return (matched.length ? matched : developerProfiles).slice(0, 3);
  };
  const visibleMatchedRoles = activeRoleFilter === "all"
    ? roles
    : roles.filter((role) => role.role === activeRoleFilter);

  const SEV_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
  const riskRows = [
    { risk: "Well-funded incumbents move into the niche", sev: "Medium", mit: "Win on focus, speed, and price for under-served teams; build integration moat early." },
    { risk: bp.market.barriers, sev: "High", mit: "Engage requirements early, design for compliance, and ship audit-ready from day one." },
    { risk: "Model accuracy below user trust threshold", sev: "Medium", mit: "Ship explainability, keep a human-in-the-loop, and improve on real usage data." },
    { risk: "Slow developer ramp delays milestones", sev: "Low", mit: "Scope independently-shippable milestones; pay on approval to keep momentum." },
  ].sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev]);

  /* Real platform counts only — no re-derived percentages here */
  const analytics = [
    { label: "Blueprint Views", value: String(bp.views), trend: "+24%", up: true, cap: "vs last month", lit: 6 },
    { label: "Developer Applications", value: String(bp.devMatches + 7), trend: "+3", up: true, cap: "vs 9 last month", lit: 5 },
    { label: "Profile Saves", value: String(bp.interested + 4), trend: "+2", up: true, cap: "vs 2 last month", lit: 4 },
  ];

  const aiRecs = [
    { p: "High", text: bp.aiRecommend },
    { p: "High", text: "Lock in a technical co-founder or lead developer from your matched candidates." },
    { p: "Medium", text: "Build the explainability layer — it's your clearest differentiation." },
    { p: "Medium", text: "Line up 3–5 design partners before the public launch milestone." },
    { p: "Low", text: "Draft a usage-based starter tier to widen the top of funnel." },
  ];
  /* Severity = danger scale: High risk is red, low risk is safe (mint). */
  const sevTone = (s: string) => (s === "High" ? "red" : s === "Medium" ? "amber" : "mint") as "red" | "amber" | "mint";
  /* Priority/importance = ordinal ramp: strong (mint) → medium (amber) → low (neutral). Never red — red means danger, not "important". */
  const priTone = (p: string) => (p === "Must-have" || p === "High" ? "mint" : p === "Should-have" || p === "Medium" ? "amber" : "neutral") as "mint" | "amber" | "neutral";
  const personaSegment = (segment: string): { icon: ReactNode; tone: "mint" | "amber" | "neutral" } => {
    if (segment === "Primary user") return { icon: <User size={18} weight="duotone" style={{ color: C.teal }} />, tone: "mint" };
    if (segment === "Economic buyer") return { icon: <Wallet size={18} weight="duotone" style={{ color: C.amber }} />, tone: "amber" };
    return { icon: <ShieldCheck size={18} weight="duotone" style={{ color: C.muted }} />, tone: "neutral" };
  };

  const iconBtn: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 11, background: C.card, border: `1px solid ${C.border}`, cursor: "pointer" };
  const colGap = { display: "flex", flexDirection: "column", gap: 22 } as CSSProperties;

  const tocSections = [
    "Venture Assessment", "Executive Summary", "Signals & Activity", "The Idea", "Target Users & Personas",
    "Product Scope", "Recommended Tech Stack & Architecture", "Roles & Matched Developers", "Development Roadmap",
    "Market Analysis", "Competitive Landscape", "Gap Analysis & Recommendations",
    "Go-to-Market", "Project Cost & Financials",
    "Risks & Mitigations",
  ];

  if (selectedDeveloper) {
    return (
      <NetworkProfileDetailScreen
        key={selectedDeveloper.id}
        profile={selectedDeveloper}
        connected={Boolean(developerConnections[selectedDeveloper.id])}
        backLabel="Back to Blueprint"
        onBack={() => setSelectedDeveloper(null)}
        onToggleConnection={handleToggleDeveloperConnection}
        onMessage={handleDeveloperMessage}
        profileComplete={profileComplete}
        onRequireProfile={onRequireProfile}
        messageLabel="Message"
      />
    );
  }

  return (
    <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="h-full flex flex-col overflow-hidden" style={{ position: "relative", background: C.page }}>

      {/* ── Action bar ── */}
      <div className="blueprint-no-print" style={{ flexShrink: 0, position: "relative", background: "rgba(240,243,241,0.86)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}`, zIndex: 20 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, padding: "12px 2px" }}>
          <button onClick={handleBack} className="bp-back-btn" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: C.teal, padding: "8px 13px 8px 11px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer" }}>
            <ArrowLeft className="bp-back-arrow" size={15} weight="bold" /> Back
          </button>
          <div style={{ width: 1, height: 22, background: C.border }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: C.ink, letterSpacing: "-0.012em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bp.name}</span>
          {bp.project ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", padding: "4px 11px", borderRadius: 999, background: PROJECT_STATUS_STYLE[bp.project.status].bg, color: PROJECT_STATUS_STYLE[bp.project.status].color }}>
              <Buildings size={12} weight="bold" /> {PROJECT_STATUS_LABEL[bp.project.status]}
            </span>
          ) : (
            <Chip tone="mint" icon={<span style={{ width: 5, height: 5, borderRadius: 999, background: bp.isPublic ? "#1d6e47" : "#9ab4a4", display: "inline-block" }} />}>{bp.isPublic ? "Public" : "Private"}</Chip>
          )}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {!bp.project && (
              <button onClick={togglePublish} className="bp-primary-btn">
                <Broadcast size={15} weight="bold" /> {published ? "Unpublish" : "Publish"}
              </button>
            )}
            <button onClick={copyLink} className="bp-icon-btn" style={iconBtn} title="Copy link"><LinkSimple size={16} weight="bold" style={{ color: C.teal }} /></button>
            <button onClick={() => window.print()} className="bp-icon-btn" style={iconBtn} title="Export PDF"><DownloadSimple size={16} weight="bold" style={{ color: C.teal }} /></button>

          </div>
        </div>
        <div style={{ position: "absolute", left: 0, bottom: -1, height: 2, width: `${progress * 100}%`, background: "linear-gradient(90deg, #428475, #89d7b7)", transition: "width 0.1s linear" }} />
      </div>

      {/* ── Scroll body ── */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto blueprint-scroll">
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 2px 8px", ...colGap }}>

          {/* ── PRINT-ONLY COVER + TABLE OF CONTENTS ── */}
          <div className="blueprint-print-only">
            <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 4px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 18 }}>Venture Blueprint</div>
              <h1 style={{ fontSize: 44, fontWeight: 800, color: C.ink, letterSpacing: "-0.03em", marginBottom: 14 }}>{bp.name}</h1>
              <p style={{ fontSize: 15, color: C.body, lineHeight: 1.7, maxWidth: 560, marginBottom: 28 }}>{bp.ideaDesc}</p>
              <div style={{ display: "flex", gap: 28 }}>
                <div><div style={{ fontSize: 11, color: C.label, textTransform: "uppercase", letterSpacing: "0.08em" }}>Grade</div><div style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>{grade}</div></div>
                <div><div style={{ fontSize: 11, color: C.label, textTransform: "uppercase", letterSpacing: "0.08em" }}>Viability</div><div style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>{viabilityScore} / 100</div></div>
                <div><div style={{ fontSize: 11, color: C.label, textTransform: "uppercase", letterSpacing: "0.08em" }}>Industry</div><div style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>{bp.industry}</div></div>
                <div><div style={{ fontSize: 11, color: C.label, textTransform: "uppercase", letterSpacing: "0.08em" }}>Prepared</div><div style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>{bp.updatedAt}</div></div>
              </div>
            </div>
            <div style={{ padding: "20px 4px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.label, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 16 }}>Contents</div>
              <div style={{ columns: 2, columnGap: 32 }}>
                {tocSections.map((t, i) => (
                  <div key={t} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.borderSoft}`, breakInside: "avoid" }}>
                    <span style={{ fontSize: 13, color: C.ink }}>{i + 1}. {t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── HERO ── */}
          <Reveal y={14}>
            <div style={cardStyle({ position: "relative", overflow: "hidden", padding: "40px 44px" })}>
              <div style={{ position: "absolute", top: -120, right: -80, width: 360, height: 360, background: "radial-gradient(circle, rgba(137,215,183,0.16), transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", display: "flex", gap: 40, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                {/* left */}
                <div style={{ flex: "1 1 420px", minWidth: 300 }}>
                  <Kicker>Venture Blueprint · {stageLabel}</Kicker>
                  <h1 style={{ fontSize: 38, fontWeight: 800, color: C.ink, letterSpacing: "-0.032em", lineHeight: 1.04 }}>{bp.name}</h1>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                    <Chip tone="mint" icon={<span style={{ width: 5, height: 5, borderRadius: 999, background: "#89d7b7", display: "inline-block" }} />}>{bp.industry}</Chip>
                    <Chip>{stageLabel}</Chip>
                    <Chip>Updated {bp.updatedAt}</Chip>
                  </div>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.7, marginTop: 18, maxWidth: 540 }}>{bp.ideaDesc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 20, fontSize: 12, color: C.label, fontFamily: MONO }}>
                    <span>{phases.length} milestones</span><span>·</span>
                    <span>{cost.buildWeeks}-week build</span><span>·</span>
                    <span>{bp.devMatches} developer matches</span>
                  </div>
                </div>
                {/* right */}
                <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 16, minWidth: 330, maxWidth: 356 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ViabilityGauge score={viabilityScore} />
                  </div>
                  <p style={{ fontSize: 12.5, color: C.body, lineHeight: 1.6, margin: 0 }}>{viabilityReasoning}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, paddingTop: 14, borderTop: `1px solid ${C.borderSoft}` }}>
                    {subScoreRow.map((s) => (
                      <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: C.ink, lineHeight: 1, ...NUM }}>{s.value}</span>
                        <MeterBar value={s.value} height={3} />
                        <span style={{ fontSize: 9, color: C.label, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: MONO, whiteSpace: "nowrap" }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── AI VENTURE ASSESSMENT ── */}
          <Reveal>
            <div style={cardStyle({ borderLeft: `3px solid ${C.mint}`, padding: "28px 30px" })}>
              <SectionHead icon={<Gauge size={18} weight="duotone" style={{ color: C.success }} />} kicker="AI Analysis" title="Venture Assessment" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.1fr", gap: 30 }}>
                <div>
                  <Label>Strengths</Label>
                  {strengths.map((s) => (
                    <div key={s} style={{ display: "flex", gap: 9, marginBottom: 11 }}>
                      <SealCheck size={15} weight="fill" style={{ color: C.success, flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 13, color: C.body, lineHeight: 1.5 }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <Label>Risks</Label>
                  {risks.map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, marginBottom: 11 }}>
                      <Warning size={15} weight="fill" style={{ color: i === 0 ? C.red : C.amber, flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 13, color: C.body, lineHeight: 1.5 }}>{r}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <Label>Recommendation</Label>
                  <div style={{ display: "flex", gap: 10, background: C.amberBg, border: `1px solid ${C.amberLine}`, borderRadius: 12, padding: "13px 15px" }}>
                    <ArrowRight size={15} weight="bold" style={{ color: C.amber, flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: "#7a5c10", lineHeight: 1.55 }}>{bp.aiRecommend}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
                    <Chip tone="mint">Market Leader</Chip>
                    <Chip tone="mint">High Growth</Chip>
                    <Chip tone="amber">Medium Risk</Chip>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── EXECUTIVE SUMMARY ── */}
          <Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 22 }}>
              <div style={cardStyle({ padding: "28px 30px" })}>
                <SectionHead icon={<Notebook size={18} weight="duotone" style={{ color: C.teal }} />} kicker="Overview" title="Executive Summary" />
                <p style={{ fontSize: 14.5, color: C.body, lineHeight: 1.75, marginBottom: 14 }}>
                  <strong style={{ color: C.ink }}>{bp.name}</strong> is a {bp.industry} venture built around a simple thesis: {bp.differentiator.toLowerCase()}. {bp.ideaDesc}
                </p>
                <p style={{ fontSize: 14.5, color: C.body, lineHeight: 1.75 }}>
                  This blueprint translates that idea into an executable plan — a recommended architecture, a milestone-based build roadmap, a budget the founder funds directly, and the developer profiles best matched to ship it. Everything below is structured so a developer could pick it up and start building.
                </p>
              </div>
              <div style={cardStyle({ padding: "26px 28px" })}>
                <Label>Build snapshot</Label>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {[
                    ["Total build cost", fmtMoney(cost.total)],
                    ["Build time", cost.timelineLabel],
                    ["Milestones", `${phases.length} phases`],
                    ["Roles needed", `${roles.length}`],
                    ["MVP features", `${content.mvpPlan.mustHave.length + content.mvpPlan.shouldHave.length} core`],
                  ].map(([k, v], i) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderTop: i === 0 ? "none" : `1px solid ${C.borderSoft}` }}>
                      <span style={{ fontSize: 12.5, color: C.muted }}>{k}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, ...NUM }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── SIGNALS & ACTIVITY ── */}
          <Reveal>
            <SectionHead icon={<Pulse size={18} weight="duotone" style={{ color: C.teal }} />} kicker="Traction" title="Signals & Activity" desc="How this blueprint is performing on the platform, and what to act on next." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 18 }}>
              {analytics.map((a) => (
                <motion.div key={a.label} whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} style={cardStyle({ padding: "20px", textAlign: "center" })}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.ink, lineHeight: 1, ...NUM }}>{a.value}</div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: C.label, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 7, fontFamily: MONO }}>{a.label}</div>
                  <div style={{ marginTop: 9, display: "flex", justifyContent: "center" }}><Trend value={a.trend} positive={a.up} /></div>
                  <div style={{ fontSize: 10.5, color: C.label, marginTop: 7 }}>{a.cap}</div>
                  <div style={{ marginTop: 12 }}><SegmentedBar value={0} total={8} lit={a.lit} height={14} /></div>
                </motion.div>
              ))}
            </div>
            <div style={cardStyle({ padding: "24px 26px" })}>
              <Label>Recommended next steps</Label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 28px" }}>
                {aiRecs.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <Chip tone={priTone(r.p)}>{r.p}</Chip>
                    <span style={{ fontSize: 13, color: C.body, lineHeight: 1.5, paddingTop: 2 }}>{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ── THE IDEA ── */}
          <Reveal>
            <SectionHead icon={<Lightbulb size={18} weight="duotone" style={{ color: C.amber }} />} kicker="Concept" title="The Idea" desc="The product narrative — what it is, who it serves, and how it makes money." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {infoGrid.map((c) => (
                <motion.div key={c.label} whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} style={cardStyle({ padding: "22px 24px" })}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 9, background: C.tint, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.icon}</div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: C.label, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: MONO }}>{c.label}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: C.body, lineHeight: 1.65, margin: 0 }}>{c.text}</p>
                </motion.div>
              ))}
            </div>
          </Reveal>

          {/* ── PERSONAS ── */}
          <Reveal>
            <SectionHead icon={<UsersThree size={18} weight="duotone" style={{ color: C.teal }} />} kicker="Audience" title="Target Users & Personas" desc="The audience segments this idea is built for — who they are, what they need, and what's holding them back today." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
              {personas.map((p) => {
                const seg = personaSegment(p.segment);
                return (
                  <motion.div key={p.name} whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} style={cardStyle({ padding: "24px 24px" })}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, background: C.tint, border: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{seg.icon}</div>
                      <Chip tone={seg.tone}>{p.segment}</Chip>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, letterSpacing: "-0.01em" }}>{p.name}</div>
                    <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55, marginTop: 6, marginBottom: 16 }}>{p.about}</p>
                    <div style={{ marginBottom: 12 }}>
                      <Label>What they need</Label>
                      <p style={{ fontSize: 12.5, color: C.body, lineHeight: 1.55, margin: 0 }}>{p.goals}</p>
                    </div>
                    <div>
                      <Label>What&apos;s stopping them today</Label>
                      <p style={{ fontSize: 12.5, color: C.body, lineHeight: 1.55, margin: 0 }}>{p.pains}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Reveal>

          {/* ── PRODUCT SCOPE ── */}
          <Reveal>
            <div style={cardStyle({ padding: "28px 30px" })}>
              <SectionHead icon={<ListChecks size={18} weight="duotone" style={{ color: C.success }} />} kicker="Scope" title="Product Scope" desc="The feature set, grouped by priority so the team builds the right thing first." />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {["Must-have", "Should-have", "Nice-to-have"].map((tier) => {
                  const items = [...featureItems, ...platformFeatures].filter((f) => f.priority === tier);
                  return (
                    <div key={tier}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <Chip tone={priTone(tier)}>{tier}</Chip>
                        <span style={{ fontSize: 11, color: C.label, fontFamily: MONO, ...NUM }}>{items.length}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {items.map((f, i) => (
                          <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: C.tint, border: `1px solid ${C.borderSoft}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <CheckCircle size={15} weight="fill" style={{ color: C.mint, flexShrink: 0 }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{f.name}</span>
                            </div>
                            {f.note ? <div style={{ fontSize: 10.5, color: C.muted, marginTop: 3, marginLeft: 24, fontFamily: MONO }}>{f.note}</div> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 20 }}>
                <Label>Out of scope for v1</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {content.mvpPlan.outOfScope.map((o, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                      <XCircle size={15} weight="fill" style={{ color: C.label, flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── RECOMMENDED TECH STACK ── */}
          <Reveal>
                        <SectionHead 
              icon={<Cube size={18} weight="duotone" style={{ color: C.teal }} />} 
              kicker="Engineering" 
              title="Recommended Tech Stack & Architecture" 
              desc="A complete, opinionated stack â€” editable where you know better than the AI, plus the system diagram it produces."
              right={
                <button 
                  onClick={() => setEditing((e) => !e)} 
                  className="bp-icon-btn" 
                  style={{ ...iconBtn, background: editing ? C.forest : C.card, borderColor: editing ? C.forest : C.border }} 
                  title="Edit tech stack"
                >
                  <PencilSimple size={16} weight="bold" style={{ color: editing ? C.mint : C.teal }} />
                </button>
              }
            />
            {/* editable core choices */}
            <div style={cardStyle({ padding: "20px 24px", marginBottom: 18 })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Label>Core choices{editing ? " — click a layer to change it" : ""}</Label>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
                <TechStackPill label="Frontend" layer={draftTechStack.frontend} editing={editing} onChange={(v) => updateTechStackLayer("frontend", v)} />
                <TechStackPill label="Backend" layer={draftTechStack.backend} editing={editing} onChange={(v) => updateTechStackLayer("backend", v)} />
                <TechStackPill label="Database" layer={draftTechStack.database} editing={editing} onChange={(v) => updateTechStackLayer("database", v)} />
                <TechStackPill label="Vector DB" layer={draftTechStack.vectorDb} editing={editing} onChange={(v) => updateTechStackLayer("vectorDb", v)} />
                <TechStackPill label="AI Provider" layer={draftTechStack.aiProvider} editing={editing} onChange={(v) => updateTechStackLayer("aiProvider", v)} />
                <TechStackPill label="Hosting" layer={draftTechStack.hosting} editing={editing} onChange={(v) => updateTechStackLayer("hosting", v)} />
              </div>
            </div>
            <div style={cardStyle({ padding: "20px 24px", marginBottom: 18 })}>
              <Label>System architecture</Label>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
                <ArchitectureDiagram nodes={architecture.nodes} edges={architecture.edges} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
              {stack.map((cat) => (
                <motion.div key={cat.name} whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} style={cardStyle({ padding: "22px 24px" })}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 4 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: C.tint, border: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{cat.icon}</div>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 800, color: C.ink }}>{cat.name}</div>
                      <div style={{ fontSize: 11, color: C.teal, fontFamily: MONO, marginTop: 1 }}>{cat.primary}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column" }}>
                    {cat.rows.map((r, i) => (
                      <div key={r.k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderTop: i === 0 ? "none" : `1px solid ${C.borderSoft}` }}>
                        <span style={{ fontSize: 11.5, color: C.label, fontFamily: MONO, flexShrink: 0 }}>{r.k}</span>
                        <span style={{ fontSize: 12.5, color: C.ink, fontWeight: 600, textAlign: "right" }}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>

          {/* ── TEAM & TALENT ── */}
          <Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 22, alignItems: "start" }}>
              <div style={cardStyle({ padding: "26px 28px", alignSelf: "start" })}>
                <SectionHead icon={<Briefcase size={18} weight="duotone" style={{ color: C.teal }} />} kicker="Team" title="Roles Needed" />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {roles.map((r) => (
                    <div key={r.role} style={{ padding: "13px 15px", background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{r.role}</span>
                        {r.lead ? <Chip tone="mint">Lead</Chip> : <Chip>x{r.count}</Chip>}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontFamily: MONO }}>{r.skills}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={cardStyle({ padding: "26px 28px", alignSelf: "start" })}>
                <SectionHead
                  icon={<CodeBlock size={18} weight="duotone" style={{ color: C.success }} />}
                  kicker="AI Suggested"
                  title="Matched Developers"
                  right={<Chip tone="mint">{developerProfiles.length} profiles</Chip>}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  {[{ role: "all", label: "All roles" }, ...roles.map((role) => ({ role: role.role, label: role.role }))].map((item) => {
                    const active = activeRoleFilter === item.role;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setActiveRoleFilter(item.role)}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: active ? C.mint : C.teal,
                          background: active ? C.forest : C.tint,
                          border: `1px solid ${active ? C.forest : C.borderSoft}`,
                          borderRadius: 999,
                          padding: "6px 11px",
                          cursor: "pointer",
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <div className="blueprint-scroll" style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 430, overflowY: "auto", paddingRight: 6 }}>
                  {visibleMatchedRoles.map((r) => (
                    <div key={r.role} style={{ padding: "13px 15px", borderRadius: 12, background: C.tint, border: `1px solid ${C.borderSoft}` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{r.role}</div>
                        <Chip tone={r.lead ? "mint" : "neutral"}>{r.lead ? "Priority hire" : "Suggested"}</Chip>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {devsForRole(r).map((d) => {
                          const avail = isDeveloperAvailable(d);
                          const connected = developerConnections[d.id];
                          return (
                            <motion.button
                              key={`${r.role}-${d.id}`}
                              type="button"
                              whileHover={{ y: -2, borderColor: "#c5ddd0", boxShadow: "0 8px 22px rgba(15,28,24,0.06)" }}
                              onClick={() => handleViewMatchedDeveloper(d)}
                              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 10, background: C.card, border: `1px solid ${C.borderSoft}`, cursor: "pointer" }}
                            >
                              <Avatar initials={d.initials} size={32} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                                  {d.online && <span style={{ width: 7, height: 7, borderRadius: 999, background: C.success, flexShrink: 0 }} />}
                                </div>
                                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{developerRoleText(d)}</div>
                              </div>
                              <Chip tone={avail ? "mint" : "amber"}>{avail ? "Available" : d.availability}</Chip>
                              {connected && <Chip tone="neutral">Connected</Chip>}
                              <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: "#e8f5ef", color: "#1d6e47", ...NUM }}>{d.match}%</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── ROADMAP ── */}
          <Reveal>
            <div style={cardStyle({ padding: "28px 30px" })}>
              <SectionHead icon={<Flag size={18} weight="duotone" style={{ color: C.success }} />} kicker="Delivery" title="Development Roadmap"
                desc="Milestone-based build plan. Each milestone is independently shippable, with its developer payout released on approval."
                right={<Chip tone="dark">{totalWeeks} weeks total</Chip>} />
              <div style={{ position: "relative", paddingLeft: 6 }}>
                <motion.div initial={reduce ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: "easeInOut" }}
                  style={{ position: "absolute", left: 20, top: 14, bottom: 14, width: 2, background: `linear-gradient(${C.mint}, ${C.border})`, transformOrigin: "top" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {phases.map((ph, i) => {
                    const inProg = ph.status === "In Progress";
                    const pay = ph.cost;
                    const isEdit = editPhase === i;
                    return (
                      <div key={i} style={{ display: "flex", gap: 16 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 999, background: C.forest, color: C.mint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0, zIndex: 1, ...NUM }}>{i + 1}</div>
                        <div style={{ flex: 1, background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 14, padding: "16px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                            {isEdit ? (
                              <input value={ph.name} onChange={(e) => setPhases((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={{ flex: 1, fontSize: 14, fontWeight: 700, color: C.ink, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", outline: "none", fontFamily: "inherit" }} />
                            ) : (
                              <span style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{ph.name}</span>
                            )}
                            <span style={{ fontSize: 11, color: C.teal, fontFamily: MONO }}>{ph.layer}</span>
                            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                              <Chip>{ph.weeks}w</Chip>
                              <Chip tone="mint" icon={<Coins size={11} weight="fill" />}>{fmtMoney(pay)}</Chip>
                              <Chip tone={inProg ? "mint" : "neutral"}>{ph.status}</Chip>
                              {editing && (
                                <button onClick={() => setEditPhase(isEdit ? null : i)} style={{ ...iconBtn, width: 28, height: 28 }} title="Edit phase">
                                  {isEdit ? <CheckCircle size={14} weight="fill" style={{ color: C.success }} /> : <PencilSimple size={13} style={{ color: C.teal }} />}
                                </button>
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {ph.deliverables.map((d, di) => isEdit ? (
                              <input key={di} value={d} onChange={(e) => setPhases((p) => p.map((x, j) => j === i ? { ...x, deliverables: x.deliverables.map((y, k) => k === di ? e.target.value : y) } : x))} style={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 9px", outline: "none", fontFamily: "inherit", color: C.ink }} />
                            ) : (
                              <span key={di} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.body, background: C.card, border: `1px solid ${C.borderSoft}`, padding: "5px 11px", borderRadius: 8 }}>
                                <CheckCircle size={11} weight="fill" style={{ color: C.mint }} />{d}
                              </span>
                            ))}
                          </div>
                          <div style={{ marginTop: 10 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.label, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: MONO }}>Acceptance criteria</span>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 5 }}>
                              {ph.acceptanceCriteria.map((a, ai) => (
                                <span key={ai} style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>· {a}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.borderSoft}` }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {ph.skillset.map((s) => <Chip key={s}>{s}</Chip>)}
                            </div>
                            {phaseHires[i] ? (
                              <Chip tone="mint" icon={<CheckCircle size={11} weight="fill" />}>{phaseHires[i]} hired for this phase</Chip>
                            ) : (
                              <button onClick={() => setHirePanelPhase(hirePanelPhase === i ? null : i)} className="bp-primary-btn">
                                Hire for this phase <ArrowRight size={12} weight="bold" />
                              </button>
                            )}
                          </div>
                          <AnimatePresence>
                            {hirePanelPhase === i && !phaseHires[i] && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                                  {devsForPhase(ph.skillset).map((d) => (
                                    <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 11, border: `1px solid ${C.borderSoft}`, background: C.card }}>
                                      <Avatar initials={d.initials} size={34} />
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{d.name}</div>
                                        <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{d.role}</div>
                                      </div>
                                      <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: "#e8f5ef", color: "#1d6e47", ...NUM }}>{d.match}%</span>
                                      <button onClick={() => { setPhaseHires((p) => ({ ...p, [i]: d.name })); setHirePanelPhase(null); }} className="bp-gradient-btn" style={{ fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 9, background: C.forest, color: C.mint, border: "none", cursor: "pointer" }}>
                                        Hire
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── MARKET ANALYSIS ── */}
          <Reveal>
            <div style={cardStyle({ padding: "28px 30px" })}>
              <SectionHead icon={<ChartLineUp size={18} weight="duotone" style={{ color: C.teal }} />} kicker="Market" title="Market Analysis"
                desc="Total category size, the reachable wedge, and what an early team could plausibly capture."
                right={<Chip tone={content.marketAnalysis.demandLevel === "High" ? "mint" : content.marketAnalysis.demandLevel === "Medium" ? "amber" : "neutral"}>{content.marketAnalysis.demandLevel} market pull</Chip>} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                {[
                  { l: "Total market", v: content.marketAnalysis.totalMarket, sub: "Broad category demand" },
                  { l: "Reachable wedge", v: content.marketAnalysis.reachableMarket, sub: "First focused segment" },
                  { l: "3-year capture", v: content.marketAnalysis.realisticCapture, sub: "Directional early upside" },
                ].map((m, i) => (
                  <div key={m.l} style={{ background: i === 1 ? C.forest : C.tint, border: `1px solid ${i === 1 ? "transparent" : C.borderSoft}`, borderRadius: 14, padding: "16px 18px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: i === 1 ? C.mintSoft : C.label, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 7, fontFamily: MONO }}>{m.l}</div>
                    <div style={{ fontSize: 21, fontWeight: 800, color: i === 1 ? "#fff" : C.ink, ...NUM }}>{m.v}</div>
                    <div style={{ fontSize: 11.5, color: i === 1 ? C.mintSoft : C.muted, lineHeight: 1.45, marginTop: 5 }}>{m.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 22 }}>
                <Label>Opportunity logic</Label>
                <p style={{ fontSize: 13.5, color: C.body, lineHeight: 1.65, margin: 0 }}>{content.marketAnalysis.insight}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 18 }}>
                {[
                  { label: "Growth", icon: <TrendUp size={15} weight="duotone" style={{ color: C.success }} />, text: content.marketAnalysis.growth },
                  { label: "Why now", icon: <Clock size={15} weight="duotone" style={{ color: C.teal }} />, text: content.marketAnalysis.whyNow },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", gap: 10, background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 12, padding: "13px 15px" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: C.card, border: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.label, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: MONO, marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 12.5, color: C.body, lineHeight: 1.55 }}>{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18, marginTop: 18 }}>
                <div>
                  <Label>Demand signals</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {content.marketAnalysis.demandSignals.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 9 }}>
                        <SealCheck size={14} weight="fill" style={{ color: C.success, flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 12.5, color: C.body, lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Headwinds</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {content.marketAnalysis.headwinds.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 9 }}>
                        <Warning size={14} weight="fill" style={{ color: C.amber, flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 12.5, color: C.body, lineHeight: 1.5 }}>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── COMPETITIVE LANDSCAPE ── */}
          <Reveal>
            <div style={cardStyle({ padding: "28px 30px" })}>
              <SectionHead icon={<Trophy size={18} weight="duotone" style={{ color: C.amber }} />} kicker="Competition" title="Competitive Landscape" desc="Direct competitors show what buyers already pay for; comparable startups show the broader category proof and likely outcomes." />
              <div style={{ border: `1px solid ${C.borderSoft}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1.35fr 1.35fr 1.35fr", padding: "11px 18px", background: C.tint, fontSize: 10, fontWeight: 700, color: C.label, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: MONO }}>
                  <span>Player</span><span>Pricing</span><span>Why they win</span><span>Where they fall short</span><span>Opening for {bp.name}</span>
                </div>
                {competitorRows.map((c, i) => (
                  <div key={c.name + i} style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1.35fr 1.35fr 1.35fr", padding: "14px 18px", fontSize: 12.5, color: C.ink, borderTop: `1px solid ${C.borderSoft}`, alignItems: "start", gap: 10 }}>
                    <span style={{ fontWeight: 700 }}>{c.name}</span>
                    <span style={{ color: C.muted }}>{c.pricing}</span>
                    <span style={{ color: C.muted, lineHeight: 1.5 }}>{c.strengths.join("; ")}</span>
                    <span style={{ color: C.muted, lineHeight: 1.5 }}>{c.weaknesses.join("; ")}</span>
                    <span style={{ color: C.body, lineHeight: 1.5 }}>{c.gap}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <Label>Category proof</Label>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${content.similarStartups.length}, 1fr)`, gap: 14 }}>
                  {content.similarStartups.map((s) => (
                    <motion.div key={s.name} whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} style={{ padding: "16px 18px", background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                        <Buildings size={15} weight="duotone" style={{ color: C.success, flexShrink: 0 }} />
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{s.name}</div>
                      </div>
                      <p style={{ fontSize: 12.2, color: C.body, lineHeight: 1.55, margin: 0 }}>{s.oneLiner}</p>
                      <div style={{ display: "flex", gap: 8, marginTop: 11, padding: "9px 10px", background: C.card, border: `1px solid ${C.borderSoft}`, borderRadius: 9 }}>
                        <Trophy size={13} weight="fill" style={{ color: C.success, flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 11.7, color: C.muted, lineHeight: 1.45 }}>{s.outcome}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── GAP ANALYSIS & RECOMMENDATIONS ── */}
          <Reveal>
            <div style={cardStyle({ borderLeft: `3px solid ${C.amber}`, padding: "28px 30px" })}>
              <SectionHead icon={<Strategy size={18} weight="duotone" style={{ color: C.amber }} />} kicker="Opportunity" title="Gap Analysis & Recommendations" desc="Where the market falls short today — and exactly what to add to turn this into a complete, defensible product." />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <Label>What the market lacks</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {gaps.map((g) => (
                      <div key={g.title} style={{ display: "flex", gap: 11, padding: "13px 15px", background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 12 }}>
                        <Warning size={15} weight="duotone" style={{ color: C.amber, flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{g.title}</div>
                          <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginTop: 2 }}>{g.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Recommended additions</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {additions.map((a) => (
                      <div key={a.title} style={{ padding: "13px 15px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Lightbulb size={15} weight="fill" style={{ color: C.success }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{a.title}</span>
                          </div>
                          <Chip tone="mint">{a.impact}</Chip>
                        </div>
                        <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginTop: 6 }}>{a.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                <Label>Path to a complete product</Label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {pathToComplete.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "15px 16px", background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 999, background: C.forest, color: C.mint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, ...NUM }}>{i + 1}</div>
                      <span style={{ fontSize: 12.5, color: C.body, lineHeight: 1.55 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── GO-TO-MARKET ── */}
          <Reveal>
            <div style={cardStyle({ padding: "28px 30px" })}>
              <SectionHead icon={<Megaphone size={18} weight="duotone" style={{ color: C.teal }} />} kicker="Distribution" title="Go-to-Market" desc="How the first users are reached, and the sequence to get from beta to scale." />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
                {gtmChannels.map((g) => (
                  <div key={g.title} style={{ background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 14, padding: "18px 18px" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: C.card, border: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>{g.icon}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, marginBottom: 5 }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{g.text}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                {gtmPhases.map((p, i, arr) => (
                  <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: C.ink, background: C.tint, border: `1px solid ${C.borderSoft}`, padding: "8px 13px", borderRadius: 999 }}>
                      <span style={{ width: 18, height: 18, borderRadius: 999, background: C.forest, color: C.mint, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{i + 1}</span>{p}
                    </span>
                    {i < arr.length - 1 && <CaretRight size={14} style={{ color: C.label }} />}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ── PROJECT COST & FINANCIALS ── */}
          <Reveal>
            <SectionHead icon={<Receipt size={18} weight="duotone" style={{ color: C.success }} />} kicker="The Money" title="Project Cost & Financials"
              desc="What it costs to build — estimated from real market developer rates for each phase's skills — how developers are paid per milestone, and when the product earns that investment back." />

            {/* COST TO BUILD */}
            <div style={cardStyle({ padding: "28px 30px", marginBottom: 18 })}>
              <div style={{ display: "flex", gap: 9, marginBottom: 18, padding: "11px 14px", background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 11 }}>
                <Calculator size={14} weight="duotone" style={{ color: C.teal, flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.5 }}>
                  Estimated bottom-up: each phase&apos;s required skill is matched to current market contractor rates and multiplied by its duration. This is a data-driven estimate, not a fixed budget.
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
                {[
                  { l: "Total Build Cost", v: fmtMoney(cost.total), ic: <Money size={18} weight="duotone" style={{ color: C.success }} /> },
                  { l: "Build Time", v: cost.timelineLabel, ic: <Clock size={18} weight="duotone" style={{ color: C.teal }} /> },
                  { l: "Run Cost / month", v: cost.monthlyRunCost, ic: <CloudArrowUp size={18} weight="duotone" style={{ color: C.teal }} /> },
                  { l: "Break-even", v: fin.breakEvenMonth ? `Month ${fin.breakEvenMonth}` : "24+ months", ic: <ChartBar size={18} weight="duotone" style={{ color: C.success }} /> },
                ].map((s) => (
                  <div key={s.l} style={{ background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 14, padding: "18px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Label>{s.l}</Label>{s.ic}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, ...NUM }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: 22 }}>
                {/* composition */}
                <div>
                  <Label>Where the money goes</Label>
                  <div style={{ display: "flex", height: 12, borderRadius: 999, overflow: "hidden", marginBottom: 14 }}>
                    {cost.composition.map((b) => (
                      <div key={b.label} style={{ width: `${(b.value / cost.total) * 100}%`, background: b.tone }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {cost.composition.map((b) => (
                      <div key={b.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.body }}>
                          <span style={{ width: 9, height: 9, borderRadius: 3, background: b.tone }} />{b.label}
                        </span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, ...NUM }}>{fmtMoney(b.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* milestone schedule with per-phase rate math */}
                <div>
                  <Label>Milestone payments to developers</Label>
                  <div style={{ border: `1px solid ${C.borderSoft}`, borderRadius: 12, overflow: "hidden" }}>
                    {phases.map((ph, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "11px 15px", borderTop: i === 0 ? "none" : `1px solid ${C.borderSoft}` }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <span style={{ width: 20, height: 20, borderRadius: 999, background: C.forest, color: C.mint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0, ...NUM }}>{i + 1}</span>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: "block", fontSize: 12.5, color: C.ink, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ph.name}</span>
                            <span style={{ display: "block", fontSize: 10.5, color: C.label, fontFamily: MONO }}>{ph.primarySkill} · {ph.weeks}w × {fmtMoney(ph.weeklyRate)}/wk</span>
                          </span>
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.success, ...NUM }}>{fmtMoney(ph.cost)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 9, marginTop: 12, padding: "11px 14px", background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 11 }}>
                    <Lock size={14} weight="duotone" style={{ color: C.teal, flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.5 }}>Each milestone is funded into Evolv escrow and released to the developer on your approval, net of Evolv&apos;s {Math.round(cost.platformFeePct * 100)}% platform fee — via Stripe Connect.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* REVENUE & BREAK-EVEN */}
            <div style={cardStyle({ padding: "28px 30px" })}>
              <Label>Revenue &amp; break-even</Label>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, marginBottom: 18 }}>
                Modelled as a B2B SaaS subscription at <strong style={{ color: C.ink }}>${fin.pricePerUser}/user per month</strong>, starting near {fin.startingUsers} paying users and growing ~{fin.monthlyGrowthPct}% each month. <strong style={{ color: C.ink }}>MRR</strong> is monthly recurring revenue; <strong style={{ color: C.ink }}>ARR</strong> is that figure annualised.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
                {[
                  { l: "MRR by month 12", v: fmtMoney(fin.eoyMrr), sub: `${fin.year1[11].users} paying users` },
                  { l: "ARR by month 12", v: fmtMoney(fin.eoyArr), sub: "annual run-rate" },
                  { l: "Break-even", v: fin.breakEvenMonth ? `Month ${fin.breakEvenMonth}` : "24+ months", sub: `cumulative revenue clears ${fmtMoney(cost.total)}` },
                ].map((s, i) => (
                  <div key={s.l} style={{ background: i === 2 ? C.forest : C.tint, border: `1px solid ${i === 2 ? "transparent" : C.borderSoft}`, borderRadius: 14, padding: "18px 18px" }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: i === 2 ? C.mintSoft : C.label, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: MONO, marginBottom: 8 }}>{s.l}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: i === 2 ? "#fff" : C.ink, ...NUM }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: i === 2 ? C.mintSoft : C.muted, marginTop: 4 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <Label>Year-1 monthly recurring revenue</Label>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 130, marginTop: 6 }}>
                {fin.year1.map((y) => {
                  const isBreakEven = fin.breakEvenMonth === y.month;
                  return (
                    <div key={y.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: isBreakEven ? C.success : C.muted, ...NUM }}>{fmtMoney(y.mrr)}</span>
                      <motion.div initial={reduce ? false : { height: 0 }} whileInView={{ height: `${Math.max(4, (y.mrr / fin.eoyMrr) * 90)}px` }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE, delay: y.month * 0.03 }}
                        style={{ width: "100%", borderRadius: "6px 6px 0 0", background: isBreakEven ? C.forest : "linear-gradient(180deg, #89d7b7, #cfe3d8)" }} />
                      <span style={{ fontSize: 9.5, color: C.label, fontFamily: MONO }}>M{y.month}</span>
                    </div>
                  );
                })}
              </div>
              {fin.breakEvenMonth && fin.breakEvenMonth <= 12 && (
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 14 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: C.forest, display: "inline-block" }} />
                  <span style={{ fontSize: 11.5, color: C.muted }}>Break-even month — cumulative revenue overtakes the {fmtMoney(cost.total)} build cost.</span>
                </div>
              )}
            </div>
          </Reveal>

          {/* ── RISKS & MITIGATIONS ── */}
          <Reveal>
            <div style={cardStyle({ padding: "28px 30px" })}>
              <SectionHead icon={<ShieldCheck size={18} weight="duotone" style={{ color: C.teal }} />} kicker="Risk" title="Risks & Mitigations" />
              <div style={{ border: `1px solid ${C.borderSoft}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.5fr 1.8fr", padding: "11px 18px", background: C.tint, fontSize: 10, fontWeight: 700, color: C.label, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: MONO }}>
                  <span>Risk</span><span>Severity</span><span>Mitigation</span>
                </div>
                {riskRows.map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 0.5fr 1.8fr", padding: "14px 18px", fontSize: 13, borderTop: `1px solid ${C.borderSoft}`, alignItems: "start", gap: 10 }}>
                    <span style={{ color: C.ink, fontWeight: 600, lineHeight: 1.45 }}>{r.risk}</span>
                    <span><Chip tone={sevTone(r.sev)}>{r.sev}</Chip></span>
                    <span style={{ color: C.muted, lineHeight: 1.5 }}>{r.mit}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ── FOOTER ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 4px 4px", borderTop: `1px solid ${C.border}`, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: C.label, fontFamily: MONO }}>{bp.name} · Venture Blueprint · Rev. {bp.updatedAt}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: C.label }}>
              <Lock size={12} weight="duotone" style={{ color: C.teal }} /> Confidential — shared with matched developers only
            </span>
          </div>
        </div>
      </div>

      {/* ── Edit mode bottom bar ── */}
      <AnimatePresence>
        {editing && (
          <motion.div className="blueprint-no-print" initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }} transition={{ type: "spring", stiffness: 340, damping: 30 }}
            style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 55, background: C.forest, padding: "15px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 -10px 34px rgba(11,34,27,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 9, color: C.mint, fontSize: 13, fontWeight: 700 }}><PencilSimple size={16} /> Editing blueprint</span>
              <button onClick={() => setDraftFeatures((a) => [...a, "New feature"])} style={{ fontSize: 12, fontWeight: 600, color: C.mintSoft, background: "rgba(137,215,183,0.12)", border: "1px solid rgba(137,215,183,0.2)", borderRadius: 9, padding: "7px 13px", cursor: "pointer" }}>+ Feature</button>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={cancelEdits} style={{ fontSize: 13, fontWeight: 600, padding: "10px 20px", borderRadius: 11, background: "transparent", border: "1px solid rgba(137,215,183,0.3)", color: C.mintSoft, cursor: "pointer" }}>Cancel</button>
              <motion.button onClick={saveEdits} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, padding: "10px 22px", borderRadius: 11, background: C.mint, color: C.deep, border: "none", cursor: "pointer" }}>
                <FloppyDisk size={15} weight="fill" /> Save changes
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div className="blueprint-no-print" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            style={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 70, display: "flex", alignItems: "center", gap: 8, background: C.forest, color: C.mint, fontSize: 13, fontWeight: 600, padding: "11px 20px", borderRadius: 12, boxShadow: "0 14px 40px rgba(11,34,27,0.42)" }}>
            <CheckCircle size={16} weight="fill" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <ChatPanel bp={bp} />
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
                  className="bp-primary-btn"
                  style={{ width: "100%", opacity: !idea.trim() || !industry ? 0.4 : 1 }}
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
                  className="bp-primary-btn"
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
  onMessage?: (contact: FounderNetworkMessageTarget) => void;
  onRequireProfile?: (afterComplete?: () => void) => void;
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
  onMessage,
  onRequireProfile,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [blueprints, setBlueprints] = useState<Blueprint[]>(initialBlueprints);
  const [forgeOpen, setForgeOpen] = useState(false);
  
  // Use searchParams to initialize without flashing
  const bpParam = searchParams.get("blueprint");
  const [viewingId, setViewingId] = useState<string | null>(bpParam ?? openBlueprintId ?? null);
  
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("All Stages");
  const [sort, setSort] = useState("Viability");

  useEffect(() => { if (triggerForge) { setForgeOpen(true); onClearForge?.(); } }, [triggerForge, onClearForge]);
  useEffect(() => { if (openBlueprintId) setViewingId(openBlueprintId); }, [openBlueprintId]);

  // Sync to URL to persist across refreshes
  useEffect(() => {
    const p = new URLSearchParams(searchParams.toString());
    if (viewingId) {
      if (p.get("blueprint") !== viewingId) {
        p.set("blueprint", viewingId);
        router.push(`?${p.toString()}`, { scroll: false });
      }
    } else {
      if (p.has("blueprint")) {
        p.delete("blueprint");
        router.push(`?${p.toString()}`, { scroll: false });
      }
    }
  }, [viewingId, router, searchParams]);

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
    if (sort === "Impressions")   return b.investorViews - a.investorViews;
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
    { value: totalInvViews,     label: "Impressions"    },
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
                <button
                  onClick={() => setForgeOpen(true)}
                  className="bp-primary-btn"
                >
                  <Plus size={15} weight="bold" /> New idea
                </button>
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
                onSave={(updated) => update(blueprints.map((b) => (b.id === updated.id ? updated : b)))}
                onMessage={onMessage}
                profileComplete={profileComplete}
                onRequireProfile={onRequireProfile}
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
