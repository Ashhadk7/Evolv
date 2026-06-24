"use client";

import { useState } from "react";
import { Receipt, CreditCard, ArrowUp } from "@phosphor-icons/react";

/* ── Simple SVG Line Chart ── */
function LineChart({
  data,
  w = 260,
  h = 80,
  color = "#428475",
}: {
  data: number[];
  w?: number;
  h?: number;
  color?: string;
}) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 10) - 5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const [first, ...rest] = pts.split(" ");
  const areaPath = `M ${first} ${rest.map((p) => `L ${p}`).join(" ")} L ${w},${h} L 0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <path d={areaPath} fill={color} fillOpacity="0.07" />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 10) - 5;
        return i === data.length - 1 ? (
          <circle key={i} cx={x} cy={y} r={3} fill={color} />
        ) : null;
      })}
    </svg>
  );
}

/* ── Horizontal bar ── */
function HBar({ value, max = 100 }: { value: number; max?: number }) {
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: "#eaf0eb" }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${(value / max) * 100}%`, background: "#428475" }}
      />
    </div>
  );
}

/* ── Section card wrapper ── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-xl ${className}`}
      style={{ border: "1px solid #e8ede9" }}
    >
      {children}
    </div>
  );
}

/* ── Milestone item ── */
function Milestone({
  label,
  done,
  date,
}: {
  label: string;
  done: boolean;
  date: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid #eaf0eb" }}>
      <div
        className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0"
        style={{
          background: done ? "#e8f5ef" : "#f5f7f5",
          color: done ? "#2e7d5c" : "#b0c0b8",
        }}
      >
        {done ? "✓" : "○"}
      </div>
      <div className="flex-1">
        <div className="text-[12px] font-medium" style={{ color: done ? "#7a9e8e" : "#1a2e26", textDecoration: done ? "line-through" : "none" }}>
          {label}
        </div>
      </div>
      <div className="text-[10px]" style={{ color: "#b0c0b8" }}>
        {date}
      </div>
    </div>
  );
}

/* ── Invoice row ── */
function InvoiceRow({
  dev,
  amount,
  status,
  date,
}: {
  dev: string;
  amount: string;
  status: "Paid" | "Pending" | "Overdue";
  date: string;
}) {
  const statusColor =
    status === "Paid" ? "#2e7d5c" : status === "Pending" ? "#b36e00" : "#c0392b";
  const statusBg =
    status === "Paid" ? "#e8f5ef" : status === "Pending" ? "#fef9ec" : "#fef2f2";

  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid #eaf0eb" }}>
      <div
        className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
        style={{ background: "#f0f5f2", color: "#428475" }}
      >
        {dev[0]}
      </div>
      <div className="flex-1">
        <div className="text-[12px] font-medium" style={{ color: "#1a2e26" }}>{dev}</div>
        <div className="text-[10px]" style={{ color: "#7a9e8e" }}>{date}</div>
      </div>
      <div className="text-right">
        <div className="text-[13px] font-semibold" style={{ color: "#1a2e26" }}>{amount}</div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: statusBg, color: statusColor }}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Main export                                                 */
/* ────────────────────────────────────────────────────────── */

const VELOCITY_DATA = [12, 18, 15, 22, 19, 28, 24, 33, 30, 38, 35, 42];
const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];

export function AnalysisTab() {
  const [activeProject, setActiveProject] = useState("nexus");

  const projects = [
    { id: "nexus", name: "Nexus Health", progress: 68, stage: "Development", deadline: "2 weeks", hours: 24 },
    { id: "aura", name: "Aura Logistics", progress: 42, stage: "Design", deadline: "5 weeks", hours: 12 },
    { id: "veritas", name: "Veritas Energy", progress: 18, stage: "Planning", deadline: "9 weeks", hours: 6 },
  ];

  const milestones = [
    { label: "Market research completed", done: true, date: "Jun 5" },
    { label: "MVP wireframes approved", done: true, date: "Jun 12" },
    { label: "Backend API foundation", done: true, date: "Jun 19" },
    { label: "Frontend integration", done: false, date: "Jul 3" },
    { label: "AI model integration", done: false, date: "Jul 10" },
    { label: "Beta launch", done: false, date: "Jul 24" },
  ];

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: "#f5f6f4", padding: "24px 28px" }}
    >
      <div className="mb-5 shrink-0">
        <h2 className="text-[1.2rem] font-bold" style={{ color: "#1a2e26" }}>Project Analysis</h2>
        <p className="text-[12px] mt-0.5" style={{ color: "#7a9e8e" }}>Track progress, velocity, and payments across all ventures</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 overflow-hidden">

        {/* ── Left: Milestones & Projects ── */}
        <div className="flex flex-col gap-4 overflow-hidden">

          {/* Project selector */}
          <Card>
            <div className="px-4 pt-4 pb-3">
              <div className="text-[12px] font-semibold mb-3" style={{ color: "#1a2e26" }}>Projects</div>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveProject(p.id)}
                  className="w-full text-left rounded-lg px-3 py-2.5 mb-1 transition-colors"
                  style={{
                    background: activeProject === p.id ? "#f0f5f2" : "transparent",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-semibold" style={{ color: "#1a2e26" }}>{p.name}</span>
                    <span className="text-[11px] font-bold" style={{ color: "#428475" }}>{p.progress}%</span>
                  </div>
                  <HBar value={p.progress} />
                  <div className="flex gap-3 mt-1 text-[10px]" style={{ color: "#7a9e8e" }}>
                    <span>{p.stage}</span>
                    <span>·</span>
                    <span>Due in {p.deadline}</span>
                    <span>·</span>
                    <span>{p.hours}h logged</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Milestones */}
          <Card className="flex-1 overflow-hidden">
            <div className="px-4 pt-4 pb-1 flex items-center justify-between">
              <div className="text-[12px] font-semibold" style={{ color: "#1a2e26" }}>Milestones</div>
              <span className="text-[10px]" style={{ color: "#7a9e8e" }}>
                {milestones.filter((m) => m.done).length}/{milestones.length} done
              </span>
            </div>
            <div className="px-4 overflow-y-auto" style={{ maxHeight: 220 }}>
              {milestones.map((m) => (
                <Milestone key={m.label} {...m} />
              ))}
            </div>
          </Card>
        </div>

        {/* ── Centre: Velocity chart ── */}
        <div className="flex flex-col gap-4 overflow-hidden">

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { label: "Tasks Completed", val: "38", delta: "+12%" },
              { label: "Avg. Sprint Velocity", val: "32", delta: "+8%" },
            ].map(({ label, val, delta }) => (
              <Card key={label}>
                <div className="px-4 py-3">
                  <div className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: "#7a9e8e" }}>{label}</div>
                  <div className="text-[1.5rem] font-bold" style={{ color: "#1a2e26" }}>{val}</div>
                  <div className="flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: "#2e7d5c" }}>
                    <ArrowUp size={10} weight="bold" />
                    {delta}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Line chart */}
          <Card className="flex-1">
            <div className="px-4 pt-4 pb-3">
              <div className="text-[12px] font-semibold mb-1" style={{ color: "#1a2e26" }}>Development Velocity</div>
              <div className="text-[11px] mb-4" style={{ color: "#7a9e8e" }}>Tasks completed per week</div>
              <LineChart data={VELOCITY_DATA} w={280} h={100} />
              <div className="flex justify-between mt-1">
                {WEEKS.filter((_, i) => i % 3 === 0).map((w) => (
                  <span key={w} className="text-[9px]" style={{ color: "#b0c0b8" }}>{w}</span>
                ))}
              </div>
            </div>
          </Card>

          {/* Team composition */}
          <Card>
            <div className="px-4 py-3">
              <div className="text-[12px] font-semibold mb-2" style={{ color: "#1a2e26" }}>Team</div>
              {[
                { name: "Sarah Mitchell", role: "AI Engineer", match: 94, hours: "48h" },
                { name: "James Okafor", role: "Backend Dev", match: 88, hours: "36h" },
              ].map(({ name, role, match, hours }) => (
                <div key={name} className="flex items-center gap-2.5 py-2" style={{ borderBottom: "1px solid #eaf0eb" }}>
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: "#89d7b7", color: "#0f1c18" }}
                  >
                    {name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-[12px] font-medium" style={{ color: "#1a2e26" }}>{name}</div>
                    <div className="text-[10px]" style={{ color: "#7a9e8e" }}>{role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-semibold" style={{ color: "#2e7d5c" }}>{match}% match</div>
                    <div className="text-[10px]" style={{ color: "#7a9e8e" }}>{hours} logged</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Right: Payments ── */}
        <div className="flex flex-col gap-4 overflow-hidden">

          {/* Escrow */}
          <Card>
            <div className="px-4 py-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={14} style={{ color: "#428475" }} />
                <span className="text-[12px] font-semibold" style={{ color: "#1a2e26" }}>Escrow Account</span>
              </div>
              <div className="text-[1.6rem] font-bold mb-0.5" style={{ color: "#1a2e26" }}>$4,200</div>
              <div className="text-[11px]" style={{ color: "#7a9e8e" }}>Available balance</div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  className="py-1.5 rounded-lg text-[12px] font-semibold text-center transition-colors hover:bg-[#0f1c18] hover:text-white"
                  style={{ background: "#f0f5f2", color: "#1a2e26", border: "1px solid #e8ede9" }}
                >
                  Deposit
                </button>
                <button
                  className="py-1.5 rounded-lg text-[12px] font-semibold text-center transition-opacity hover:opacity-90"
                  style={{ background: "#0f1c18", color: "#89d7b7" }}
                >
                  Withdraw
                </button>
              </div>
            </div>
          </Card>

          {/* Invoices */}
          <Card className="flex-1 overflow-hidden">
            <div className="px-4 pt-4 pb-1">
              <div className="flex items-center gap-2 mb-3">
                <Receipt size={14} style={{ color: "#428475" }} />
                <span className="text-[12px] font-semibold" style={{ color: "#1a2e26" }}>Recent Invoices</span>
              </div>
            </div>
            <div className="px-4 overflow-y-auto" style={{ maxHeight: 380 }}>
              {[
                { dev: "Sarah Mitchell", amount: "$1,200", status: "Paid" as const, date: "Jun 15, 2026" },
                { dev: "James Okafor", amount: "$950", status: "Paid" as const, date: "Jun 8, 2026" },
                { dev: "Sarah Mitchell", amount: "$1,200", status: "Pending" as const, date: "Jul 1, 2026" }
              ].map((inv, i) => (
                <InvoiceRow key={i} {...inv} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
