"use client";

import { useState, useEffect, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  Sparkle,
  Lightning,
  Users,
  CurrencyDollar,
  TrendUp,
  CheckCircle,
  Warning,
  ArrowRight,
  Briefcase,
  ChartLine,
  Robot,
} from "@phosphor-icons/react";

/* ─────────────────────────────────────────────
   DATA TYPES
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
  icon: React.ReactNode;
}

interface HealthBar {
  label: string;
  value: number;
  color: string;
}

interface MomentumItem {
  label: string;
  value: string;
  delta: string;
  deltaUp: boolean;
  trend: number[];
  color: string;
}

interface PipelineRow {
  label: string;
  value: number;
  badge?: string;
  badgeColor?: string;
}

type AIState = "profile_incomplete" | "high_viability" | "recruiting";

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const HEALTH_BARS: HealthBar[] = [
  { label: "Market Strength",         value: 82, color: "#428475" },
  { label: "Investor Interest",       value: 64, color: "#89d7b7" },
  { label: "Developer Availability",  value: 71, color: "#7C5CBF" },
  { label: "Execution Readiness",     value: 58, color: "#C4973A" },
];

const MOMENTUM: MomentumItem[] = [
  { label: "Views",         value: "142", delta: "+12%", deltaUp: true,  trend: [76,88,96,100,108,118,126,134,142], color: "#428475" },
  { label: "Saves",         value: "38",  delta: "+8%",  deltaUp: true,  trend: [18,21,24,25,28,30,34,36,38],      color: "#7C5CBF" },
  { label: "Interests",     value: "5",   delta: "+2",   deltaUp: true,  trend: [1,1,2,2,3,3,3,4,5],              color: "#C4973A" },
  { label: "Weekly Growth", value: "+21%",delta: "+5pp", deltaUp: true,  trend: [8,10,12,13,15,16,18,19,21],      color: "#89d7b7" },
];

const PIPELINE: PipelineRow[] = [
  { label: "Total Matches",     value: 12, badge: "Active",      badgeColor: "#89d7b7" },
  { label: "Pending Requests",  value: 4,  badge: "New",         badgeColor: "#C4973A" },
  { label: "In Conversation",   value: 2 },
  { label: "Accepted",          value: 1,  badge: "Hired",       badgeColor: "#428475" },
];

/* ─────────────────────────────────────────────
   AREA SPARKLINE
   Smooth cubic-bezier path + gradient fill
───────────────────────────────────────────── */
function AreaSparkline({
  data,
  color = "#428475",
  height = 36,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const gradId = `sg-${uid}`;
  const W = 100;
  const H = height;
  const PAD = 4;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - PAD - ((v - min) / range) * (H - PAD * 2),
  }));

  // Cubic bezier smooth path
  const lineParts = pts.map((p, i) => {
    if (i === 0) return `M ${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    const prev = pts[i - 1];
    const cpx = ((prev.x + p.x) / 2).toFixed(2);
    return `C ${cpx},${prev.y.toFixed(2)} ${cpx},${p.y.toFixed(2)} ${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  });
  const linePath = lineParts.join(" ");

  const last = pts[pts.length - 1];
  const first = pts[0];
  const areaPath = `${linePath} L ${last.x.toFixed(2)},${H} L ${first.x.toFixed(2)},${H} Z`;

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Filled area */}
      <path d={areaPath} fill={`url(#${gradId})`} />
      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last-point dot */}
      <circle cx={last.x} cy={last.y} r="2.5" fill={color} />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   ANIMATED BAR
───────────────────────────────────────────── */
function AnimatedBar({
  value,
  color,
  delay = 0,
}: {
  value: number;
  color: string;
  delay?: number;
}) {
  return (
    <div
      style={{
        height: 5,
        borderRadius: 99,
        background: "#edf2ef",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          height: "100%",
          borderRadius: 99,
          background: color,
        }}
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, boxShadow: "0 8px 28px rgba(15,28,24,0.10)", borderColor: "#c5ddd0" }}
      style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: "16px 18px 14px",
        border: "1px solid #e8ede9",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        cursor: "default",
      }}
    >
      {/* Label + delta */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#7a9e8e",
          }}
        >
          {metric.label}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            fontSize: 11,
            fontWeight: 700,
            color: metric.deltaUp ? "#2e7d5c" : "#b03030",
          }}
        >
          {metric.deltaUp ? <ArrowUp size={9} weight="bold" /> : <ArrowDown size={9} weight="bold" />}
          {metric.delta}
        </span>
      </div>

      {/* Big number */}
      <div
        style={{
          fontSize: "1.9rem",
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: "#1a2e26",
          marginTop: 4,
        }}
      >
        {metric.value}
      </div>

      {/* Sub-label */}
      <div style={{ fontSize: 11, color: "#7a9e8e", marginBottom: 6 }}>
        {metric.sub}
      </div>

      {/* Sparkline */}
      <div style={{ height: 36, marginTop: "auto" }}>
        <AreaSparkline data={metric.trend} color={metric.accentColor} height={36} />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   AI BRIEFING BANNER  (3 states)
───────────────────────────────────────────── */
const AI_CONTENT: Record<
  AIState,
  {
    icon: React.ReactNode;
    heading: string;
    body: string;
    tags: string[];
    cta: string;
    accentBg: string;
    accentText: string;
  }
> = {
  profile_incomplete: {
    icon: <Warning size={17} weight="fill" style={{ color: "#C4973A" }} />,
    heading: "Complete your profile",
    body: "Investors and developers are 3× more likely to engage with a fully filled-out founder profile.",
    tags: ["Profile strength: 40%", "Missing bio & links"],
    cta: "Complete profile →",
    accentBg: "rgba(196,151,58,0.08)",
    accentText: "#C4973A",
  },
  high_viability: {
    icon: <Lightning size={17} weight="fill" style={{ color: "#89d7b7" }} />,
    heading: "High-viability opportunity detected",
    body: "Your top blueprint scores above 70 — developer demand for your sector is up 17% this month.",
    tags: ["Market signal: Strong", "HealthTech · Series A ready", "Updated 2h ago"],
    cta: "Publish blueprint →",
    accentBg: "rgba(137,215,183,0.07)",
    accentText: "#2e7d5c",
  },
  recruiting: {
    icon: <Users size={17} weight="fill" style={{ color: "#7C5CBF" }} />,
    heading: "Talent pool is hot right now",
    body: "12 developers match your current blueprints. 4 pending requests are waiting for your response.",
    tags: ["12 active matches", "4 pending requests", "Respond within 48h"],
    cta: "Review matches →",
    accentBg: "rgba(124,92,191,0.07)",
    accentText: "#7C5CBF",
  },
};

function AIBriefingBanner({
  state,
  onCta,
}: {
  state: AIState;
  onCta: () => void;
}) {
  const c = AI_CONTENT[state];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "#ffffff",
          borderRadius: 14,
          padding: "14px 18px",
          border: "1px solid #e8ede9",
          marginBottom: 16,
        }}
      >
        {/* Icon circle */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: c.accentBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {c.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1a2e26" }}>
              AI Venture Briefing
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: c.accentText,
                background: c.accentBg,
                borderRadius: 4,
                padding: "1px 5px",
              }}
            >
              {state === "profile_incomplete" ? "Action Needed" : state === "high_viability" ? "Opportunity" : "Recruiting"}
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#3d5c4e", lineHeight: 1.5, marginBottom: 6 }}>
            <strong style={{ color: "#1a2e26" }}>{c.heading}</strong> — {c.body}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {c.tags.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: "#f0f5f2",
                  color: "#428475",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.button
          onClick={onCta}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          style={{
            flexShrink: 0,
            padding: "9px 14px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            background: "#1a312c",
            color: "#e8f4ef",
            whiteSpace: "nowrap",
          }}
        >
          {c.cta}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   BLUEPRINT CARD
───────────────────────────────────────────── */
function BlueprintCard({ bp, onView, index }: { bp: Blueprint; onView: (id: string) => void; index: number }) {
  const viabilityColor = bp.viability >= 70 ? "#2e7d5c" : bp.viability >= 50 ? "#C4973A" : "#b03030";
  const fundColor =
    bp.fundingReadiness === "High" ? "#2e7d5c"
    : bp.fundingReadiness === "Medium" ? "#C4973A"
    : "#b03030";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.18 + index * 0.07 }}
      whileHover={{ y: -3, boxShadow: "0 8px 28px rgba(15,28,24,0.10)", borderColor: "#c5ddd0" }}
      style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: 16,
        border: "1px solid #e8ede9",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        cursor: "default",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26", lineHeight: 1.3 }}>{bp.name}</div>
          <div style={{ fontSize: 11, color: "#7a9e8e", marginTop: 2 }}>
            {bp.industry} · {bp.updatedAt}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          {/* Investor heat dot */}
          <div title="Investor Heat">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: bp.interested >= 4 ? "#C4973A" : bp.interested >= 2 ? "#89d7b7" : "#d4dfd9",
                boxShadow: bp.interested >= 4 ? "0 0 6px rgba(196,151,58,0.5)" : "none",
              }}
            />
          </div>
          {/* Developer demand dot */}
          <div title="Developer Demand">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: bp.devMatches >= 8 ? "#7C5CBF" : bp.devMatches >= 4 ? "#89d7b7" : "#d4dfd9",
                boxShadow: bp.devMatches >= 8 ? "0 0 6px rgba(124,92,191,0.5)" : "none",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 99,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              background: bp.isPublic ? "#e8f5ef" : "#f5f7f5",
              color: bp.isPublic ? "#2e7d5c" : "#7a9e8e",
            }}
          >
            {bp.isPublic ? "Public" : "Draft"}
          </span>
        </div>
      </div>

      {/* Viability bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: "#7a9e8e" }}>Viability</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: viabilityColor }}>{bp.viability}%</span>
        </div>
        <AnimatedBar value={bp.viability} color={viabilityColor} delay={0.2 + index * 0.07} />
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingTop: 10,
          borderTop: "1px solid #edf1ee",
        }}
      >
        <span style={{ fontSize: 10, color: "#7a9e8e" }}>
          <span style={{ fontWeight: 600, color: "#1a2e26" }}>{bp.devMatches}</span> devs
        </span>
        <span style={{ fontSize: 10, color: "#7a9e8e" }}>
          <span style={{ fontWeight: 600, color: "#1a2e26" }}>{bp.views}</span> views
        </span>
        <span style={{ fontSize: 10, color: fundColor, fontWeight: 600 }}>{bp.fundingReadiness}</span>
        <motion.button
          onClick={() => onView(bp.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            fontWeight: 600,
            color: "#428475",
            cursor: "pointer",
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          <Eye size={12} />
          View
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   PORTFOLIO HEALTH WIDGET
───────────────────────────────────────────── */
function PortfolioHealthWidget() {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: "16px 18px",
        border: "1px solid #e8ede9",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
        <ChartLine size={14} weight="bold" style={{ color: "#428475" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1a2e26" }}>Portfolio Health</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {HEALTH_BARS.map((h, i) => (
          <div key={h.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: "#7a9e8e" }}>{h.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#1a2e26" }}>{h.value}</span>
            </div>
            <AnimatedBar value={h.value} color={h.color} delay={i * 0.1} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   INVESTOR MOMENTUM WIDGET  (2×2 grid)
───────────────────────────────────────────── */
function InvestorMomentumWidget() {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: "16px 18px",
        border: "1px solid #e8ede9",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
        <CurrencyDollar size={14} weight="bold" style={{ color: "#C4973A" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1a2e26" }}>Investor Momentum</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {MOMENTUM.map((m) => (
          <div
            key={m.label}
            style={{
              background: "#f8faf8",
              borderRadius: 10,
              padding: "10px 11px 8px",
              border: "1px solid #edf1ee",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: "#7a9e8e" }}>{m.label}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: m.deltaUp ? "#2e7d5c" : "#b03030",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {m.deltaUp ? <ArrowUp size={8} weight="bold" /> : <ArrowDown size={8} weight="bold" />}
                {m.delta}
              </span>
            </div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#1a2e26",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {m.value}
            </div>
            <div style={{ height: 22 }}>
              <AreaSparkline data={m.trend} color={m.color} height={22} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DEV PIPELINE WIDGET
───────────────────────────────────────────── */
function DevPipelineWidget() {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: "16px 18px",
        border: "1px solid #e8ede9",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
        <Users size={14} weight="bold" style={{ color: "#7C5CBF" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1a2e26" }}>Developer Pipeline</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {PIPELINE.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 0",
              borderBottom: i < PIPELINE.length - 1 ? "1px solid #edf1ee" : "none",
            }}
          >
            <span style={{ fontSize: 12, color: "#3d5c4e" }}>{row.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {row.badge && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 99,
                    background: `${row.badgeColor}18`,
                    color: row.badgeColor,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {row.badge}
                </span>
              )}
              <span style={{ fontSize: 14, fontWeight: 800, color: "#1a2e26", letterSpacing: "-0.02em" }}>
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

const METRICS: Metric[] = [
  {
    id: "viability",
    label: "Avg Viability",
    value: "76",
    delta: "+4%",
    deltaUp: true,
    sub: "+2% this week",
    trend: [58, 62, 65, 68, 70, 69, 73, 74, 76],
    accentColor: "#428475",
    icon: <TrendUp size={14} weight="bold" />,
  },
  {
    id: "matches",
    label: "Developer Matches",
    value: "12",
    delta: "+3",
    deltaUp: true,
    sub: "3 pending requests",
    trend: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    accentColor: "#89d7b7",
    icon: <Users size={14} weight="bold" />,
  },
  {
    id: "views",
    label: "Investor Views",
    value: "142",
    delta: "+24",
    deltaUp: true,
    sub: "This week",
    trend: [76, 88, 96, 100, 108, 118, 126, 134, 142],
    accentColor: "#7C5CBF",
    icon: <Eye size={14} weight="bold" />,
  },
  {
    id: "interested",
    label: "Investor Interest",
    value: "5",
    delta: "+2",
    deltaUp: true,
    sub: "Interest up 67%",
    trend: [1, 1, 2, 2, 3, 3, 3, 4, 5],
    accentColor: "#C4973A",
    icon: <CurrencyDollar size={14} weight="bold" />,
  },
];

export function DashboardOverview({
  profile,
  onNavigateWorkspace,
  blueprints,
  onViewBlueprint,
  profileComplete = true,
}: Props) {
  const name = profile.firstName || "Founder";
  const [greeting, setGreeting] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  // Time-based greeting — client-side only to avoid hydration mismatch
  useEffect(() => {
    const h = new Date().getHours();
    const timeGreeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    const full = `${timeGreeting}, ${name}.`;

    let i = 0;
    const iv = setInterval(() => {
      i++;
      setGreeting(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(iv);
        setTimeout(() => setCursorVisible(false), 1200);
      }
    }, 45);
    return () => clearInterval(iv);
  }, [name]);

  // Derive AI state
  const topBlueprint = [...blueprints].sort((a, b) => b.viability - a.viability)[0];
  const aiState: AIState = !profileComplete
    ? "profile_incomplete"
    : topBlueprint && topBlueprint.viability >= 70
    ? "high_viability"
    : "recruiting";

  const handleAiCta = () => {
    if (aiState === "profile_incomplete") {
      // Nothing — parent would handle settings nav if wired
    } else {
      onNavigateWorkspace(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
        background: "#f4f6f4",
        padding: "24px 28px 32px",
        gap: 16,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.55rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#1a2e26",
              lineHeight: 1.2,
              minHeight: "1.86rem",
            }}
          >
            {greeting}
            {cursorVisible && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: "1.1em",
                  background: "#428475",
                  borderRadius: 1,
                  marginLeft: 2,
                  verticalAlign: "middle",
                  animation: "dashCursor 0.7s step-end infinite",
                }}
              />
            )}
          </h1>
          <p style={{ fontSize: 13, color: "#7a9e8e", marginTop: 5, lineHeight: 1.5 }}>
            You have{" "}
            <strong style={{ color: "#1a2e26" }}>{blueprints.length} venture{blueprints.length !== 1 ? "s" : ""}</strong>{" "}
            in motion,{" "}
            <strong style={{ color: "#1a2e26" }}>12 developer matches</strong>, and growing investor interest.
          </p>
        </div>

        <motion.button
          onClick={() => onNavigateWorkspace(true)}
          whileHover={{ scale: 1.03, boxShadow: "0 6px 20px rgba(26,49,44,0.28)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            background: "#1a312c",
            color: "#e8f4ef",
            border: "none",
          }}
        >
          <Briefcase size={14} weight="bold" />
          Forge blueprint
        </motion.button>
      </div>

      {/* ── AI Briefing Banner ── */}
      <div style={{ flexShrink: 0 }}>
        <AIBriefingBanner state={aiState} onCta={handleAiCta} />
      </div>

      {/* ── Stat cards (4 across) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          flexShrink: 0,
        }}
      >
        {METRICS.map((m, i) => (
          <StatCard key={m.id} metric={m} index={i} />
        ))}
      </div>

      {/* ── Active Blueprints ── */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#89d7b7" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1a2e26" }}>Active Blueprints</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "1px 7px",
                borderRadius: 99,
                background: "#edf5f1",
                color: "#428475",
              }}
            >
              {blueprints.length}
            </span>
          </div>
          <motion.button
            onClick={() => onNavigateWorkspace(false)}
            whileHover={{ x: 2 }}
            transition={{ duration: 0.15 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: "#428475",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            View all
            <ArrowRight size={12} weight="bold" />
          </motion.button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {blueprints.slice(0, 3).map((bp, i) => (
            <BlueprintCard key={bp.id} bp={bp} onView={onViewBlueprint} index={i} />
          ))}
        </div>
      </div>

      {/* ── Bottom widgets (3 col) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <PortfolioHealthWidget />
        <InvestorMomentumWidget />
        <DevPipelineWidget />
      </div>

      {/* Cursor animation */}
      <style>{`
        @keyframes dashCursor {
          from, to { opacity: 1 }
          50% { opacity: 0 }
        }
      `}</style>
    </div>
  );
}
