"use client";

import { useState, useEffect, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  Lightning,
  Users,
  CurrencyDollar,
  TrendUp,
  Warning,
  ArrowRight,
  ChartLine,
  Plus,
  Sparkle,
} from "@phosphor-icons/react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface Blueprint {
  id: string;
  name: string;
  industry: string;
  isPublic: boolean;
  viability: number;
  fundingReadiness: string;
  devMatches: number;
  views: number;
  interested: number;
  updatedAt: string;
}

interface Metric {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaUp: boolean;
  sub: string;
  trend: number[];
  accentColor: string;
}

interface HealthBar { label: string; value: number; color: string }
interface RoadmapMilestone { phase: string; title: string; status: "completed" | "active" | "upcoming"; date?: string; color: string }
interface PipelineRow { label: string; value: number; badge?: string; badgeColor?: string }
type AIState = "profile_incomplete" | "high_viability" | "recruiting";

/* ─────────────────────────────────────────────
   MOCK DATA
 ───────────────────────────────────────────── */
const HEALTH_BARS: HealthBar[] = [
  { label: "Market Strength",        value: 82, color: "#428475" },
  { label: "Design Completeness",    value: 64, color: "#89d7b7" },
  { label: "Developer Availability", value: 71, color: "#7C5CBF" },
  { label: "Execution Readiness",    value: 58, color: "#C4973A" },
];

const ROADMAP: RoadmapMilestone[] = [
  { phase: "Phase 1", title: "Venture Ideation & Validation", status: "completed", date: "Completed", color: "#428475" },
  { phase: "Phase 2", title: "AI Blueprint Refinement", status: "completed", date: "Completed", color: "#89d7b7" },
  { phase: "Phase 3", title: "Developer Matching & Sourcing", status: "active", date: "In Progress", color: "#7C5CBF" },
  { phase: "Phase 4", title: "MVP Development & Launch", status: "upcoming", date: "Upcoming", color: "#C4973A" },
];

const PIPELINE: PipelineRow[] = [
  { label: "Total Matches",    value: 12, badge: "Active", badgeColor: "#89d7b7" },
  { label: "Pending Requests", value: 4,  badge: "New",    badgeColor: "#C4973A" },
  { label: "In Conversation",  value: 2 },
  { label: "Accepted",         value: 1,  badge: "Hired",  badgeColor: "#428475" },
];

const METRICS: Metric[] = [
  { id: "viability", label: "Avg Viability",      value: "76",  delta: "+4%", deltaUp: true, sub: "+2% this week",    trend: [58,62,65,68,70,69,73,74,76], accentColor: "#428475" },
  { id: "matches",   label: "Developer Matches",  value: "12",  delta: "+3",  deltaUp: true, sub: "3 pending",        trend: [4,5,6,7,8,9,10,11,12],      accentColor: "#89d7b7" },
  { id: "refinements", label: "Total Impressions", value: "312", delta: "+12%", deltaUp: true, sub: "Total views",      trend: [12,18,22,25,30,34,38,40,42], accentColor: "#7C5CBF" },
  { id: "milestones",  label: "Ongoing Projects",   value: "3",   delta: "Active", deltaUp: true, sub: "3 in motion",      trend: [2,3,4,4,5,6,7,7,8],         accentColor: "#C4973A" },
];

/* ─────────────────────────────────────────────
   AREA SPARKLINE
───────────────────────────────────────────── */
function AreaSparkline({ data, color = "#428475", height = 36 }: { data: number[]; color?: string; height?: number }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `sg-${uid}`;
  const W = 100; const H = height; const PAD = 4;
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - PAD - ((v - min) / range) * (H - PAD * 2),
  }));
  const lineParts = pts.map((p, i) => {
    if (i === 0) return `M ${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    const prev = pts[i - 1];
    const cpx = ((prev.x + p.x) / 2).toFixed(2);
    return `C ${cpx},${prev.y.toFixed(2)} ${cpx},${p.y.toFixed(2)} ${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  });
  const linePath = lineParts.join(" ");
  const last = pts[pts.length - 1]; const first = pts[0];
  const areaPath = `${linePath} L ${last.x.toFixed(2)},${H} L ${first.x.toFixed(2)},${H} Z`;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="2.2" fill={color} />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   ANIMATED BAR
───────────────────────────────────────────── */
function AnimatedBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  return (
    <div style={{ height: 4, borderRadius: 99, background: "#edf2ef", overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.85, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ height: "100%", borderRadius: 99, background: color }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
function StatCard({ metric, index }: { metric: Metric; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, boxShadow: "0 12px 36px rgba(15,28,24,0.09)", borderColor: "#c8ddd4" }}
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "18px 20px 16px",
        border: "1px solid #eaeeed",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        cursor: "default",
        transition: "border-color 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8aab9a" }}>
          {metric.label}
        </span>
        <span style={{
          display: "flex", alignItems: "center", gap: 2,
          fontSize: 11, fontWeight: 700,
          color: metric.deltaUp ? "#2e7d5c" : "#b03030",
          background: metric.deltaUp ? "#edf8f2" : "#fdf0f0",
          padding: "2px 7px", borderRadius: 99,
        }}>
          {metric.deltaUp ? <ArrowUp size={9} weight="bold" /> : <ArrowDown size={9} weight="bold" />}
          {metric.delta}
        </span>
      </div>

      <div style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", color: "#1a2e26", marginTop: 6 }}>
        {metric.value}
      </div>

      <div style={{ fontSize: 11, color: "#8aab9a", marginBottom: 8 }}>{metric.sub}</div>

      <div style={{ height: 38, marginTop: "auto" }}>
        <AreaSparkline data={metric.trend} color={metric.accentColor} height={38} />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   AI BRIEFING BANNER
───────────────────────────────────────────── */
const AI_CONTENT = {
  profile_incomplete: {
    icon: <Warning size={16} weight="fill" style={{ color: "#C4973A" }} />,
    heading: "Complete your profile",
    body: "Investors and developers are 3× more likely to engage with a fully filled-out founder profile.",
    tags: ["Profile strength: 40%", "Missing bio & links"],
    cta: "Complete profile",
    accentBg: "rgba(196,151,58,0.08)",
    accentText: "#C4973A",
    accentLabel: "Action Needed",
  },
  high_viability: {
    icon: <Lightning size={16} weight="fill" style={{ color: "#89d7b7" }} />,
    heading: "High-viability opportunity detected",
    body: "Your top blueprint scores above 70 — developer demand for your sector is up 17% this month.",
    tags: ["Market signal: Strong", "HealthTech · Series A ready"],
    cta: "Publish blueprint",
    accentBg: "rgba(137,215,183,0.07)",
    accentText: "#2e7d5c",
    accentLabel: "Opportunity",
  },
  recruiting: {
    icon: <Users size={16} weight="fill" style={{ color: "#7C5CBF" }} />,
    heading: "Talent pool is hot right now",
    body: "12 developers match your current blueprints. 4 pending requests are waiting for your response.",
    tags: ["12 active matches", "4 pending requests"],
    cta: "Review matches",
    accentBg: "rgba(124,92,191,0.07)",
    accentText: "#7C5CBF",
    accentLabel: "Recruiting",
  },
} as const;

function AIBriefingBanner({ state, onCta }: { state: AIState; onCta: () => void }) {
  const c = AI_CONTENT[state];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "#ffffff",
          borderRadius: 16,
          padding: "14px 18px",
          border: "1px solid #eaeeed",
        }}
      >
        {/* Icon bubble */}
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: c.accentBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {c.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1a2e26" }}>AI Venture Briefing</span>
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase",
              color: c.accentText, background: c.accentBg, borderRadius: 6, padding: "2px 6px",
            }}>
              {c.accentLabel}
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: "#4a6a5a", lineHeight: 1.55, marginBottom: 8 }}>
            <strong style={{ color: "#1a2e26" }}>{c.heading}</strong> — {c.body}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {c.tags.map((t) => (
              <span key={t} style={{ fontSize: 10.5, fontWeight: 500, padding: "3px 10px", borderRadius: 99, background: "#f2f6f4", color: "#4a6a5a" }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.button
          onClick={onCta}
          whileHover={{ scale: 1.03, boxShadow: "0 6px 20px rgba(26,49,44,0.22)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          style={{
            flexShrink: 0, padding: "9px 16px", borderRadius: 11,
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: "#1a312c", color: "#89d7b7", whiteSpace: "nowrap",
          }}
        >
          {c.cta} →
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   IDEA CARD  (PUBLISHED / DRAFT only)
───────────────────────────────────────────── */
function IdeaCard({ bp, onView, index }: { bp: Blueprint; onView: (id: string) => void; index: number }) {
  const viabilityColor =
    bp.viability >= 70 ? "#2e7d5c" : bp.viability >= 50 ? "#C4973A" : "#b03030";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: 0.16 + index * 0.08 }}
      whileHover={{ y: -4, boxShadow: "0 12px 36px rgba(15,28,24,0.09)", borderColor: "#c8ddd4" }}
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "18px 18px 14px",
        border: "1px solid #eaeeed",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        cursor: "default",
        transition: "border-color 0.2s ease",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2e26", lineHeight: 1.3, marginBottom: 3 }}>{bp.name}</div>
          <div style={{ fontSize: 11.5, color: "#8aab9a" }}>{bp.industry} · {bp.updatedAt}</div>
        </div>
        {/* Status pill — PUBLISHED or DRAFT only */}
        <span style={{
          flexShrink: 0,
          fontSize: 10, fontWeight: 700,
          padding: "3px 10px", borderRadius: 99,
          letterSpacing: "0.05em", textTransform: "uppercase",
          background: bp.isPublic ? "#edf8f2" : "#f5f5f4",
          color: bp.isPublic ? "#2e7d5c" : "#888",
          border: `1px solid ${bp.isPublic ? "#b8e8cc" : "#e0e0de"}`,
          marginLeft: 10,
        }}>
          {bp.isPublic ? "Published" : "Draft"}
        </span>
      </div>

      {/* Viability */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: "#8aab9a", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Viability
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: viabilityColor }}>{bp.viability}%</span>
        </div>
        <AnimatedBar value={bp.viability} color={viabilityColor} delay={0.18 + index * 0.08} />
      </div>

      {/* Stats row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        paddingTop: 12, borderTop: "1px solid #f0f3f1",
      }}>
        <div style={{ display: "flex", flex: 1, gap: 12 }}>
          <div>
            <div style={{ fontSize: 9.5, color: "#8aab9a", marginBottom: 1, textTransform: "uppercase", letterSpacing: "0.04em" }}>Devs</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26" }}>{bp.devMatches}</div>
          </div>
          <div>
            <div style={{ fontSize: 9.5, color: "#8aab9a", marginBottom: 1, textTransform: "uppercase", letterSpacing: "0.04em" }}>Views</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26" }}>{bp.views}</div>
          </div>
          <div>
            <div style={{ fontSize: 9.5, color: "#8aab9a", marginBottom: 1, textTransform: "uppercase", letterSpacing: "0.04em" }}>Funding</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: bp.fundingReadiness === "High" ? "#2e7d5c" : bp.fundingReadiness === "Medium" ? "#C4973A" : "#b03030" }}>
              {bp.fundingReadiness}
            </div>
          </div>
        </div>
        <motion.button
          onClick={() => onView(bp.id)}
          whileHover={{ scale: 1.06, color: "#1a312c" }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 12, fontWeight: 600, color: "#428475",
            cursor: "pointer", background: "none", border: "none", padding: 0,
          }}
        >
          <Eye size={13} />
          View
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   PORTFOLIO HEALTH WIDGET
───────────────────────────────────────────── */
function VentureHealthWidget({ blueprints }: { blueprints: Blueprint[] }) {
  const [selectedId, setSelectedId] = useState("latest");

  // Determine which blueprint is active
  const activeBp = selectedId === "latest" 
    ? blueprints[0] 
    : blueprints.find(b => b.id === selectedId) || blueprints[0];

  // Dynamically calculate health bars based on the active blueprint's viability
  const baseViability = activeBp ? activeBp.viability : 70;
  
  const dynamicBars = [
    { label: "Market Strength",        value: Math.min(95, Math.max(45, baseViability + 6)), color: "#428475" },
    { label: "Design Completeness",    value: Math.min(95, Math.max(40, baseViability - 12)), color: "#89d7b7" },
    { label: "Developer Availability", value: Math.min(95, Math.max(35, baseViability - 5)), color: "#7C5CBF" },
    { label: "Execution Readiness",    value: Math.min(95, Math.max(30, baseViability - 18)), color: "#C4973A" },
  ];

  return (
    <div style={{ background: "#ffffff", borderRadius: 16, padding: "18px 20px", border: "1px solid #eaeeed", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <ChartLine size={14} weight="bold" style={{ color: "#428475" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26" }}>Venture Progress</span>
        </div>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#4a6a5a",
            background: "#f2f6f4",
            border: "1px solid #eaeeed",
            borderRadius: 8,
            padding: "4px 24px 4px 10px",
            cursor: "pointer",
            outline: "none",
            maxWidth: 160,
            textOverflow: "ellipsis",
            appearance: "none",
            WebkitAppearance: "none",
            backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%234a6a5a' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 6px center",
            backgroundSize: "14px",
          }}
        >
          <option value="latest">Latest Venture</option>
          {blueprints.map((bp) => (
            <option key={bp.id} value={bp.id}>
              {bp.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {dynamicBars.map((h, i) => (
          <div key={h.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11.5, color: "#4a6a5a" }}>{h.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1a2e26" }}>{h.value}%</span>
            </div>
            <AnimatedBar value={h.value} color={h.color} delay={i * 0.1} />
          </div>
        ))}
      </div>
    </div>
  );
}

function VentureRoadmapWidget({ blueprints }: { blueprints: Blueprint[] }) {
  const [selectedId, setSelectedId] = useState("latest");

  // Determine which blueprint is active
  const activeBp = selectedId === "latest" 
    ? blueprints[0] 
    : blueprints.find(b => b.id === selectedId) || blueprints[0];

  const roadmap = getRoadmapForBlueprint(activeBp);

  return (
    <div style={{ background: "#ffffff", borderRadius: 16, padding: "18px 20px", border: "1px solid #eaeeed", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <TrendUp size={14} weight="bold" style={{ color: "#7C5CBF" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26" }}>Venture Roadmap</span>
        </div>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#4a6a5a",
            background: "#f2f6f4",
            border: "1px solid #eaeeed",
            borderRadius: 8,
            padding: "4px 24px 4px 10px",
            cursor: "pointer",
            outline: "none",
            maxWidth: 160,
            textOverflow: "ellipsis",
            appearance: "none",
            WebkitAppearance: "none",
            backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%234a6a5a' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 6px center",
            backgroundSize: "14px",
          }}
        >
          <option value="latest">Latest Venture</option>
          {blueprints.map((bp) => (
            <option key={bp.id} value={bp.id}>
              {bp.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {roadmap.map((item, i) => (
          <div key={item.phase} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", top: 2 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: item.status === "completed" ? "#428475" : item.status === "active" ? "#7C5CBF" : "#eaeeed",
                border: item.status === "active" ? "2px solid #ffffff" : "none",
                boxShadow: item.status === "active" ? "0 0 0 2px #7C5CBF" : "none",
                zIndex: 2,
              }} />
              {i < roadmap.length - 1 && (
                <div style={{
                  position: "absolute", top: 10, bottom: -20,
                  width: 1.5, background: item.status === "completed" ? "#428475" : "#eaeeed",
                  zIndex: 1,
                }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#8aab9a", textTransform: "uppercase" }}>{item.phase}</span>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
                  background: item.status === "completed" ? "#edf8f2" : item.status === "active" ? "#f3effa" : "#f5f5f4",
                  color: item.status === "completed" ? "#2e7d5c" : item.status === "active" ? "#7C5CBF" : "#888"
                }}>
                  {item.date}
                </span>
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#1a2e26" }}>{item.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function DevPipelineWidget() {
  return (
    <div style={{ background: "#ffffff", borderRadius: 16, padding: "18px 20px", border: "1px solid #eaeeed", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Users size={14} weight="bold" style={{ color: "#7C5CBF" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26" }}>Developer Pipeline</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {PIPELINE.map((row, i) => (
          <div key={row.label} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: i < PIPELINE.length - 1 ? "1px solid #f0f3f1" : "none",
          }}>
            <span style={{ fontSize: 12.5, color: "#4a6a5a" }}>{row.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {row.badge && (
                <span style={{
                  fontSize: 9.5, fontWeight: 700,
                  padding: "2px 7px", borderRadius: 99,
                  background: `${row.badgeColor}18`, color: row.badgeColor,
                  letterSpacing: "0.04em", textTransform: "uppercase",
                }}>
                  {row.badge}
                </span>
              )}
              <span style={{ fontSize: 15, fontWeight: 800, color: "#1a2e26", letterSpacing: "-0.02em" }}>
                {row.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
interface Props {
  profile: { firstName: string };
  onNavigateWorkspace: (forge?: boolean) => void;
  blueprints: Blueprint[];
  onViewBlueprint: (id: string) => void;
  profileComplete?: boolean;
}

function getRoadmapForBlueprint(bp: Blueprint): RoadmapMilestone[] {
  const industry = bp?.industry || "SaaS";
  if (industry === "HealthTech" || industry === "MedTech") {
    return [
      { phase: "Phase 1", title: "Clinical Validation & HIPAA Setup", status: "completed", date: "Completed", color: "#428475" },
      { phase: "Phase 2", title: "AI Model Diagnostics Training", status: "completed", date: "Completed", color: "#89d7b7" },
      { phase: "Phase 3", title: "Developer Sourcing (HIPAA Stack)", status: "active", date: "In Progress", color: "#7C5CBF" },
      { phase: "Phase 4", title: "Hospital Pilot & Clinical Launch", status: "upcoming", date: "Upcoming", color: "#C4973A" },
    ];
  }
  if (industry === "CleanTech") {
    return [
      { phase: "Phase 1", title: "Micro-Grid Simulation Testing", status: "completed", date: "Completed", color: "#428475" },
      { phase: "Phase 2", title: "Carbon Credit Smart Contracts", status: "completed", date: "Completed", color: "#89d7b7" },
      { phase: "Phase 3", title: "Cooperative Partner Onboarding", status: "active", date: "In Progress", color: "#7C5CBF" },
      { phase: "Phase 4", title: "Coop Grid Rollout & Launch", status: "upcoming", date: "Upcoming", color: "#C4973A" },
    ];
  }
  if (industry === "EdTech") {
    return [
      { phase: "Phase 1", title: "Curriculum Mapping & Validation", status: "completed", date: "Completed", color: "#428475" },
      { phase: "Phase 2", title: "Generative Math Engine Review", status: "completed", date: "Completed", color: "#89d7b7" },
      { phase: "Phase 3", title: "Beta School Matching & Sourcing", status: "active", date: "In Progress", color: "#7C5CBF" },
      { phase: "Phase 4", title: "Mobile App Store MVP Launch", status: "upcoming", date: "Upcoming", color: "#C4973A" },
    ];
  }
  // Default / SaaS
  return [
    { phase: "Phase 1", title: "Venture Ideation & Validation", status: "completed", date: "Completed", color: "#428475" },
    { phase: "Phase 2", title: "AI Blueprint Refinement", status: "completed", date: "Completed", color: "#89d7b7" },
    { phase: "Phase 3", title: "Developer Matching & Sourcing", status: "active", date: "In Progress", color: "#7C5CBF" },
    { phase: "Phase 4", title: "MVP Development & Launch", status: "upcoming", date: "Upcoming", color: "#C4973A" },
  ];
}

export function DashboardOverview({ profile, onNavigateWorkspace, blueprints, onViewBlueprint, profileComplete = true }: Props) {
  const name = profile.firstName || "Founder";
  const [greeting, setGreeting] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const h = new Date().getHours();
    const timeGreeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    const full = `${timeGreeting}, ${name}.`;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setGreeting(full.slice(0, i));
      if (i >= full.length) { clearInterval(iv); setTimeout(() => setCursorVisible(false), 1000); }
    }, 42);
    return () => clearInterval(iv);
  }, [name]);

  const topBlueprint = [...blueprints].sort((a, b) => b.viability - a.viability)[0];
  const aiState: AIState = !profileComplete ? "profile_incomplete" : topBlueprint?.viability >= 70 ? "high_viability" : "recruiting";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", background: "#f7f8f6", padding: "26px 30px 36px", gap: 18 }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}
      >
        <div>
          <h1 style={{
            fontSize: "1.65rem", fontWeight: 900, letterSpacing: "-0.04em",
            color: "#1a2e26", lineHeight: 1.15, minHeight: "1.98rem",
          }}>
            {greeting}
            {cursorVisible && (
              <span style={{
                display: "inline-block", width: 2, height: "1em",
                background: "#89d7b7", borderRadius: 1, marginLeft: 2,
                verticalAlign: "middle", animation: "dashCursor 0.7s step-end infinite",
              }} />
            )}
          </h1>
          <p style={{ fontSize: 13.5, color: "#7a9e8e", marginTop: 6, lineHeight: 1.55 }}>
            You have{" "}
            <strong style={{ color: "#1a2e26" }}>{blueprints.length} venture{blueprints.length !== 1 ? "s" : ""}</strong>{" "}
            in motion, <strong style={{ color: "#1a2e26" }}>12 developer matches</strong>, and active building momentum.
          </p>
        </div>

        {/* Single primary action */}
        <motion.button
          onClick={() => onNavigateWorkspace(true)}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(26,49,44,0.28)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          style={{
            flexShrink: 0,
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 20px",
            borderRadius: 13, fontSize: 13.5, fontWeight: 600,
            cursor: "pointer", background: "#1a312c", color: "#89d7b7",
          }}
        >
          <Plus size={15} weight="bold" />
          New idea
        </motion.button>
      </motion.div>

      {/* ── AI Briefing ── */}
      <div style={{ flexShrink: 0 }}>
        <AIBriefingBanner
          state={aiState}
          onCta={() => {
            if (aiState !== "profile_incomplete") onNavigateWorkspace(false);
          }}
        />
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, flexShrink: 0 }}>
        {METRICS.map((m, i) => <StatCard key={m.id} metric={m} index={i} />)}
      </div>

      {/* ── Active Ideas ── */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#89d7b7" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1a2e26" }}>Active Ideas</span>
            <span style={{
              fontSize: 10.5, fontWeight: 700,
              padding: "2px 8px", borderRadius: 99,
              background: "#edf5f1", color: "#428475",
            }}>
              {blueprints.length}
            </span>
          </div>
          <motion.button
            onClick={() => onNavigateWorkspace(false)}
            whileHover={{ x: 3 }}
            transition={{ duration: 0.15 }}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 12.5, fontWeight: 600, color: "#428475",
              cursor: "pointer", background: "none", border: "none", padding: 0,
            }}
          >
            View all <ArrowRight size={12} weight="bold" />
          </motion.button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {blueprints.slice(0, 3).map((bp, i) => (
            <IdeaCard key={bp.id} bp={bp} onView={onViewBlueprint} index={i} />
          ))}
        </div>
      </div>

      {/* ── Bottom widgets ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, flexShrink: 0 }}>
        <VentureHealthWidget blueprints={blueprints} />
        <VentureRoadmapWidget blueprints={blueprints} />
        <DevPipelineWidget />
      </div>

      {/* Footer note */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
        <span style={{ fontSize: 11.5, color: "#9ab4a4" }}>LaunchPad AI · Founder Workspace</span>
        <span style={{ fontSize: 11.5, color: "#9ab4a4" }}>
          {blueprints.length} idea{blueprints.length !== 1 ? "s" : ""} · {blueprints.filter(b => b.isPublic).length} active
        </span>
      </div>

      <style>{`
        @keyframes dashCursor { from, to { opacity: 1 } 50% { opacity: 0 } }
      `}</style>
    </div>
  );
}
