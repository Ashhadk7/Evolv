"use client";

import { useState, useEffect } from "react";
import { ArrowUp, Eye, Sparkle, TrendUp } from "@phosphor-icons/react";

/* ── Sparkline SVG ── */
function Sparkline({ data, color = "#428475" }: { data: number[]; color?: string }) {
  const w = 80, h = 28;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Progress bar ── */
function Bar({ value, max = 100 }: { value: number; max?: number }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#eaf0eb" }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${(value / max) * 100}%`, background: "#428475" }}
      />
    </div>
  );
}

/* ── Stat card ── */
function StatCard({
  label,
  value,
  delta,
  sub,
  data,
}: {
  label: string;
  value: string;
  delta: string;
  sub: string;
  data: number[];
}) {
  return (
    <div
      className="bg-white rounded-xl p-4 flex flex-col gap-1"
      style={{ border: "1px solid #e8ede9", transition: "all 0.2s ease" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,28,24,0.08)";
        e.currentTarget.style.borderColor = "#c5ddd0";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#e8ede9";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "#7a9e8e" }}>
          {label}
        </span>
        <span
          className="flex items-center gap-0.5 text-[11px] font-semibold"
          style={{ color: "#2e7d5c" }}
        >
          <ArrowUp size={10} weight="bold" />
          {delta}
        </span>
      </div>
      <div className="text-[1.6rem] font-bold leading-none" style={{ color: "#1a2e26" }}>
        {value}
      </div>
      <div className="text-[10px]" style={{ color: "#7a9e8e" }}>
        {sub}
      </div>
      <div className="mt-1">
        <Sparkline data={data} />
      </div>
    </div>
  );
}

/* ── Blueprint mini-card ── */
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

function BlueprintCard({
  bp,
  onView,
}: {
  bp: Blueprint;
  onView: (id: string) => void;
}) {
  return (
    <div
      className="bg-white rounded-xl p-4"
      style={{ border: "1px solid #e8ede9", transition: "all 0.2s ease" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,28,24,0.08)";
        e.currentTarget.style.borderColor = "#c5ddd0";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#e8ede9";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-[13px]" style={{ color: "#1a2e26" }}>
            {bp.name}
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: "#7a9e8e" }}>
            · {bp.industry} · {bp.updatedAt}
          </div>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide"
          style={{
            background: bp.isPublic ? "#e8f5ef" : "#f5f7f5",
            color: bp.isPublic ? "#2e7d5c" : "#7a9e8e",
          }}
        >
          {bp.isPublic ? "Public" : "Private"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-[10px] mb-1" style={{ color: "#7a9e8e" }}>
            Viability
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold" style={{ color: "#1a2e26" }}>
              {bp.viability}%
            </span>
          </div>
          <Bar value={bp.viability} />
        </div>
        <div>
          <div className="text-[10px] mb-1" style={{ color: "#7a9e8e" }}>
            Funding Readiness
          </div>
          <div
            className="text-[12px] font-semibold"
            style={{
              color:
                bp.fundingReadiness === "High"
                  ? "#2e7d5c"
                  : bp.fundingReadiness === "Medium"
                  ? "#b36e00"
                  : "#c0392b",
            }}
          >
            {bp.fundingReadiness}
          </div>
        </div>
      </div>
      <div
        className="flex items-center gap-3 pt-3 text-[10px]"
        style={{ borderTop: "1px solid #eaf0eb", color: "#7a9e8e" }}
      >
        <span>{bp.devMatches} matches</span>
        <span>{bp.views} views</span>
        <span>{bp.interested} interested</span>
        <button
          onClick={() => onView(bp.id)}
          className="ml-auto flex items-center gap-1 text-[11px] font-semibold transition-colors hover:text-[#0f1c18]"
          style={{ color: "#428475" }}
        >
          <Eye size={12} />
          View
        </button>
      </div>
    </div>
  );
}

/* ── Bottom widget: Portfolio Health ── */
function PortfolioHealth() {
  const items = [
    { label: "Market Strength", val: 82 },
    { label: "Developer Availability", val: 71 },
    { label: "Execution", val: 58 },
  ];
  return (
    <div
      className="bg-white rounded-xl p-4 h-full"
      style={{ border: "1px solid #e8ede9", transition: "all 0.2s ease" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,28,24,0.08)";
        e.currentTarget.style.borderColor = "#c5ddd0";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#e8ede9";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className="text-[12px] font-semibold mb-3" style={{ color: "#1a2e26" }}>
        Portfolio Health
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map(({ label, val }) => (
          <div key={label}>
            <div className="flex justify-between text-[11px] mb-1" style={{ color: "#7a9e8e" }}>
              <span>{label}</span>
              <span style={{ color: "#1a2e26", fontWeight: 600 }}>{val}</span>
            </div>
            <Bar value={val} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Bottom widget: Developer Pipeline ── */
function DevPipeline() {
  return (
    <div
      className="bg-white rounded-xl p-4 h-full"
      style={{ border: "1px solid #e8ede9", transition: "all 0.2s ease" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,28,24,0.08)";
        e.currentTarget.style.borderColor = "#c5ddd0";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#e8ede9";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className="text-[12px] font-semibold mb-3" style={{ color: "#1a2e26" }}>
        Developer Pipeline
      </div>
      {[
        { label: "Matches", val: 12, arrow: "→" },
        { label: "Pending Requests", val: 4, arrow: "" },
        { label: "In Conversation", val: 2, arrow: "" },
        { label: "Accepted", val: 1, arrow: "" },
      ].map(({ label, val }) => (
        <div
          key={label}
          className="flex items-center justify-between py-2"
          style={{ borderBottom: "1px solid #eaf0eb" }}
        >
          <span className="text-[12px]" style={{ color: "#1a2e26" }}>
            {label}
          </span>
          <span className="text-[13px] font-bold" style={{ color: "#428475" }}>
            {val}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Main Export ── */
interface Props {
  profile: { firstName: string };
  onNavigateWorkspace: (forge?: boolean) => void;
  blueprints: Blueprint[];
  onViewBlueprint: (id: string) => void;
  profileComplete?: boolean;
}

const STAT_DATA = {
  viability: [62, 68, 71, 70, 74, 76, 73, 78, 76],
  matches: [5, 7, 8, 9, 10, 11, 12, 12, 12],
  views: [80, 95, 110, 100, 118, 128, 135, 138, 142],
};

export function DashboardOverview({ profile, onNavigateWorkspace, blueprints, onViewBlueprint, profileComplete = true }: Props) {
  const name = profile.firstName || "Asad";
  const fullText = `Hello, ${name}`;
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
        setTimeout(() => setDone(true), 1500);
      }
    }, 55);
    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: "#f5f6f4", padding: "24px 28px" }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blink-cursor {
          from, to { border-color: transparent }
          50% { border-color: #1a2e26 }
        }
      ` }} />
      {/* ── Top row ── */}
      <div className="flex items-start justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-[1.45rem] font-bold" style={{ color: "#1a2e26" }}>
            {displayed}
            <span style={{
              borderLeft: "2px solid #1a2e26",
              marginLeft: "2px",
              animation: "blink-cursor 0.75s step-end infinite",
              display: done ? "none" : "inline"
            }} />
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "#7a9e8e" }}>
            You have{" "}
            <span className="font-semibold" style={{ color: "#0f1c18" }}>
              {blueprints.length} ventures
            </span>{" "}
            in motion,{" "}
            <span className="font-semibold" style={{ color: "#0f1c18" }}>
              12 developer matches
            </span>
            , and growing developer interest.
          </p>
        </div>
        <button
          onClick={() => onNavigateWorkspace(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#0f1c18", color: "#89d7b7" }}
        >
          + Forge new blueprint
        </button>
      </div>

      {/* ── AI Briefing Card ── */}
      <div
        className="flex items-center gap-4 bg-white rounded-xl px-5 py-3.5 mb-4 shrink-0"
        style={{ border: "1px solid #e8ede9", transition: "all 0.2s ease" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,28,24,0.08)";
          e.currentTarget.style.borderColor = "#c5ddd0";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.borderColor = "#e8ede9";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <Sparkle size={18} weight="fill" className="shrink-0" style={{ color: "#89d7b7" }} />
        <div className="flex-1 min-w-0">
          <span className="text-[12px] font-semibold" style={{ color: "#1a2e26" }}>
            AI Venture Briefing
          </span>
          <span className="text-[12px] ml-2" style={{ color: "#7a9e8e" }}>
            <strong style={{ color: "#1a2e26" }}>Nexus Health</strong> is your most
            promising blueprint — developer demand for HealthTech increased 17% this month.
          </span>
          <div className="flex gap-3 mt-1">
            {["Market signal: Strong", "Updated 2h ago", "HealthTech · Series A ready"].map((t) => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "#f0f5f2", color: "#428475" }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <button
          disabled={!profileComplete}
          title={profileComplete ? "Publish blueprint" : "Complete your founder profile before publishing"}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-opacity hover:opacity-90"
          style={{
            background: profileComplete ? "#0f1c18" : "#e8ede9",
            color: profileComplete ? "#89d7b7" : "#7a9e8e",
            opacity: profileComplete ? 1 : 0.78,
          }}
        >
          <span>{profileComplete ? "Publish Nexus Health" : "Complete profile to publish"}</span>
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-3 mb-4 shrink-0">
        <StatCard label="Avg Viability" value="76" delta="4%" sub="+2% this week" data={STAT_DATA.viability} />
        <StatCard label="Developer Matches" value="12" delta="3" sub="3 pending requests" data={STAT_DATA.matches} />
        <StatCard label="Blueprint Views" value="142" delta="34" sub="this week" data={STAT_DATA.views} />
      </div>

      {/* ── Active Blueprints ── */}
      <div className="flex flex-col mb-4 shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: "#89d7b7" }} />
            <span className="text-[13px] font-semibold" style={{ color: "#1a2e26" }}>
              Active Blueprints
            </span>
          </div>
          <button
            onClick={() => onNavigateWorkspace(false)}
            className="text-[12px] font-medium transition-colors hover:text-[#0f1c18]"
            style={{ color: "#428475" }}
          >
            View all →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {blueprints.slice(0, 3).map((bp) => (
            <BlueprintCard key={bp.id} bp={bp} onView={onViewBlueprint} />
          ))}
        </div>
      </div>

      {/* ── Bottom widgets ── */}
      <div className="grid grid-cols-2 gap-3 shrink-0" style={{ height: 155 }}>
        <PortfolioHealth />
        <DevPipeline />
      </div>
    </div>
  );
}
