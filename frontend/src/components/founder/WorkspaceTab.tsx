"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Lock,
  LockOpen,
  Eye,
  PencilSimple,
  Trash,
  ArrowRight,
  CheckCircle,
  Sparkle,
  ArrowLeft,
} from "@phosphor-icons/react";

/* ────────────────────────────────────────────────────────── */
/* Types                                                       */
/* ────────────────────────────────────────────────────────── */
export interface Blueprint {
  id: string;
  name: string;
  industry: string;
  ideaDesc: string;
  isPublic: boolean;
  viability: number;
  fundingReadiness: "High" | "Medium" | "Low";
  devMatches: number;
  views: number;
  interested: number;
  updatedAt: string;
  market: { size: string; cagr: string; barriers: string; score: number };
  competitors: { name: string; type: string }[];
  differentiator: string;
  features: string[];
  techStack: { frontend: string; backend: string; ai: string; db: string };
  cost: { timeline: string; team: string; hosting: string; budget: string };
}

/* ────────────────────────────────────────────────────────── */
/* Static seed data                                            */
/* ────────────────────────────────────────────────────────── */
const SEED: Blueprint[] = [
  {
    id: "nexus",
    name: "Nexus Health",
    industry: "MedTech",
    ideaDesc: "AI-driven diagnostics platform for early-stage oncology detection.",
    isPublic: true,
    viability: 84,
    fundingReadiness: "High",
    devMatches: 5,
    views: 24,
    interested: 2,
    updatedAt: "2 days ago",
    market: { size: "$2.4B", cagr: "18.3%", barriers: "High regulatory", score: 84 },
    competitors: [
      { name: "PathAI", type: "Direct" },
      { name: "Paige", type: "Direct" },
      { name: "Tempus", type: "Indirect" },
    ],
    differentiator: "Affordable early detection for emerging markets",
    features: ["Scan upload & analysis", "Real-time diagnostic report", "Physician dashboard", "Patient history"],
    techStack: { frontend: "React, TailwindCSS", backend: "FastAPI, Python", ai: "TensorFlow, DICOM", db: "PostgreSQL, Redis" },
    cost: { timeline: "6 months", team: "3 devs", hosting: "$800/mo", budget: "$120K" },
  },
  {
    id: "aura",
    name: "Aura Logistics",
    industry: "SaaS",
    ideaDesc: "Last-mile delivery drone network for suburban environments.",
    isPublic: false,
    viability: 72,
    fundingReadiness: "Medium",
    devMatches: 8,
    views: 59,
    interested: 1,
    updatedAt: "1 week ago",
    market: { size: "$1.1B", cagr: "24.1%", barriers: "Regulatory + hardware", score: 72 },
    competitors: [
      { name: "Zipline", type: "Direct" },
      { name: "Wing", type: "Direct" },
    ],
    differentiator: "Suburb-first, cost-efficient fleet model",
    features: ["Fleet management", "Route optimisation", "Customer tracking", "API integrations"],
    techStack: { frontend: "Next.js", backend: "Node.js, Express", ai: "Route ML models", db: "MongoDB" },
    cost: { timeline: "9 months", team: "5 devs", hosting: "$1.5K/mo", budget: "$280K" },
  },
  {
    id: "veritas",
    name: "Veritas Energy",
    industry: "CleanTech",
    ideaDesc: "Peer-to-peer renewable energy trading marketplace.",
    isPublic: true,
    viability: 65,
    fundingReadiness: "Low",
    devMatches: 3,
    views: 12,
    interested: 0,
    updatedAt: "3 weeks ago",
    market: { size: "$850M", cagr: "31.2%", barriers: "Grid regulations", score: 65 },
    competitors: [{ name: "LO3 Energy", type: "Direct" }],
    differentiator: "Blockchain-verified carbon credits + instant settlement",
    features: ["Energy listing", "Smart contract trades", "Carbon credit wallet", "Analytics dashboard"],
    techStack: { frontend: "React", backend: "Go, gRPC", ai: "Price prediction", db: "PostgreSQL, IPFS" },
    cost: { timeline: "12 months", team: "4 devs", hosting: "$600/mo", budget: "$200K" },
  },
];

const INDUSTRIES = ["MedTech", "SaaS", "FinTech", "CleanTech", "EdTech", "AI", "Web3", "E-commerce", "Deep Tech", "B2B"];

const AGENTS = [
  { label: "Market Analysis Agent", desc: "Analysing market size & growth…" },
  { label: "Competitor Scout Agent", desc: "Mapping direct & indirect competitors…" },
  { label: "Feature Architect Agent", desc: "Generating MVP feature scope…" },
  { label: "Tech Stack Agent", desc: "Evaluating optimal tech architecture…" },
  { label: "Financial Modeler Agent", desc: "Modelling costs & runway…" },
];

/* ────────────────────────────────────────────────────────── */
/* Sub-components                                              */
/* ────────────────────────────────────────────────────────── */

function Bar({ value }: { value: number }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#eaf0eb" }}>
      <div className="h-full rounded-full" style={{ width: `${value}%`, background: "#428475" }} />
    </div>
  );
}

function Badge({ label, color = "#f0f5f2", text = "#428475" }: { label: string; color?: string; text?: string }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: color, color: text }}>
      {label}
    </span>
  );
}

/* Blueprint card in list */
function BPCard({ bp, onView, onTogglePublic, onDelete, canPublish = true, onCompleteProfile }: {
  bp: Blueprint;
  onView: () => void;
  onTogglePublic: () => void;
  onDelete: () => void;
  canPublish?: boolean;
  onCompleteProfile?: () => void;
}) {
  return (
    <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #e8ede9" }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-[14px]" style={{ color: "#1a2e26" }}>{bp.name}</div>
          <div className="text-[12px] mt-0.5" style={{ color: "#7a9e8e" }}>{bp.industry} · {bp.updatedAt}</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            label={bp.isPublic ? "PUBLIC" : "PRIVATE"}
            color={bp.isPublic ? "#e8f5ef" : "#f5f7f5"}
            text={bp.isPublic ? "#2e7d5c" : "#7a9e8e"}
          />
        </div>
      </div>
      <p className="text-[12px] mb-3 line-clamp-1" style={{ color: "#7a9e8e" }}>{bp.ideaDesc}</p>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1">
          <div className="flex justify-between text-[10px] mb-1.5" style={{ color: "#7a9e8e" }}>
            <span className="uppercase tracking-wide font-semibold">Viability Score</span>
            <span style={{ color: "#1a2e26", fontWeight: 700 }}>{bp.viability}%</span>
          </div>
          <Bar value={bp.viability} />
        </div>
        <div className="flex flex-col items-end text-[11px]" style={{ color: "#7a9e8e" }}>
          <span style={{ color: "#1a2e26", fontWeight: 600 }}>{bp.devMatches} matches</span>
          <span>{bp.views} views</span>
        </div>
      </div>
      <div className="flex items-center gap-2" style={{ borderTop: "1px solid #eaf0eb", paddingTop: 12 }}>
        <button
          onClick={onView}
          className="flex items-center justify-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors flex-1"
          style={{ background: "#0f1c18", color: "#89d7b7" }}
        >
          <Eye size={14} /> Open Blueprint
        </button>
        <button
          onClick={() => {
            if (!canPublish && !bp.isPublic) {
              onCompleteProfile?.();
              return;
            }
            if (window.confirm(`Are you sure you want to make this blueprint ${bp.isPublic ? 'private' : 'public'}?`)) {
              onTogglePublic();
            }
          }}
          className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: !canPublish && !bp.isPublic ? "#e8ede9" : "#f0f5f2", color: !canPublish && !bp.isPublic ? "#7a9e8e" : "#428475" }}
          title={!canPublish && !bp.isPublic ? "Complete your founder profile before publishing" : undefined}
        >
          {bp.isPublic ? <Lock size={14} /> : <LockOpen size={14} />}
          {bp.isPublic ? "Make Private" : "Make Public"}
        </button>
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this blueprint?")) {
              onDelete();
            }
          }}
          className="p-1.5 rounded-lg transition-colors hover:bg-[#fef2f2]"
          style={{ color: "#c0392b" }}
        >
          <Trash size={15} />
        </button>
      </div>
    </div>
  );
}

/* Blueprint detail view */
function BlueprintDetail({ bp, onBack }: { bp: Blueprint; onBack: () => void }) {
  const sections = [
    {
      agent: "Market Analysis",
      icon: "🔍",
      content: (
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { label: "Market Size", val: bp.market.size },
            { label: "CAGR", val: bp.market.cagr },
            { label: "Entry Barriers", val: bp.market.barriers },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-lg p-3" style={{ background: "#f5f7f5" }}>
              <div className="text-[10px] mb-1" style={{ color: "#7a9e8e" }}>{label}</div>
              <div className="text-[13px] font-semibold" style={{ color: "#1a2e26" }}>{val}</div>
            </div>
          ))}
          <div className="col-span-3 flex items-center gap-2">
            <div className="text-[11px]" style={{ color: "#7a9e8e" }}>Market Score</div>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#eaf0eb" }}>
              <div className="h-full rounded-full" style={{ width: `${bp.market.score}%`, background: "#428475" }} />
            </div>
            <div className="text-[13px] font-bold" style={{ color: "#1a2e26" }}>{bp.market.score}</div>
          </div>
        </div>
      ),
    },
    {
      agent: "Competitor Scout",
      icon: "🏁",
      content: (
        <div className="mt-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {bp.competitors.map((c) => (
              <span
                key={c.name}
                className="text-[12px] px-3 py-1 rounded-full font-medium"
                style={{ background: "#f0f5f2", color: "#1a2e26" }}
              >
                {c.name}
                <span className="ml-1.5 text-[10px]" style={{ color: "#7a9e8e" }}>· {c.type}</span>
              </span>
            ))}
          </div>
          <p className="text-[12px]" style={{ color: "#7a9e8e" }}>
            <strong style={{ color: "#1a2e26" }}>Differentiator: </strong>{bp.differentiator}
          </p>
        </div>
      ),
    },
    {
      agent: "Feature Architect",
      icon: "⚡",
      content: (
        <div className="mt-2 flex flex-wrap gap-2">
          {bp.features.map((f) => (
            <span
              key={f}
              className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg"
              style={{ background: "#f0f5f2", color: "#1a2e26" }}
            >
              <CheckCircle size={12} style={{ color: "#2e7d5c" }} weight="fill" />
              {f}
            </span>
          ))}
        </div>
      ),
    },
    {
      agent: "Tech Stack",
      icon: "🖥️",
      content: (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {Object.entries(bp.techStack).map(([key, val]) => (
            <div key={key} className="rounded-lg p-2.5" style={{ background: "#f5f7f5" }}>
              <div className="text-[10px] capitalize mb-0.5" style={{ color: "#7a9e8e" }}>{key}</div>
              <div className="text-[12px] font-medium" style={{ color: "#1a2e26" }}>{val}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      agent: "Financial Modeler",
      icon: "💰",
      content: (
        <div className="grid grid-cols-4 gap-3 mt-2">
          {Object.entries(bp.cost).map(([key, val]) => (
            <div key={key} className="rounded-lg p-3 text-center" style={{ background: "#f5f7f5" }}>
              <div className="text-[10px] capitalize mb-1" style={{ color: "#7a9e8e" }}>
                {key === "hosting" ? "Monthly Hosting" : key === "budget" ? "Est. Budget" : key === "team" ? "Team Size" : "Timeline"}
              </div>
              <div className="text-[14px] font-bold" style={{ color: "#1a2e26" }}>{val}</div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-lg transition-colors hover:bg-[#e8ede9]"
          style={{ color: "#428475" }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="h-4 w-px" style={{ background: "#dde5e0" }} />
        <div>
          <span className="font-bold text-[15px]" style={{ color: "#1a2e26" }}>{bp.name}</span>
          <span className="ml-2 text-[12px]" style={{ color: "#7a9e8e" }}>{bp.industry}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: bp.isPublic ? "#e8f5ef" : "#f5f7f5",
              color: bp.isPublic ? "#2e7d5c" : "#7a9e8e",
            }}
          >
            {bp.isPublic ? "Public" : "Private"}
          </span>
          <span className="text-[12px] font-bold px-3 py-1 rounded-lg" style={{ background: "#0f1c18", color: "#89d7b7" }}>
            {bp.viability}% Viability
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {sections.map((s) => (
          <div key={s.agent} className="bg-white rounded-xl px-4 py-3.5" style={{ border: "1px solid #e8ede9" }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[14px]">{s.icon}</span>
              <span className="text-[12px] font-semibold" style={{ color: "#1a2e26" }}>{s.agent} Agent</span>
            </div>
            {s.content}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* Forge Modal */
function ForgeModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (bp: Blueprint) => void;
}) {
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
      if (tick >= 25) {
        clearInterval(intervalRef.current!);
        setPhase("done");
      }
    }, 200);
  };

  const handleAccept = () => {
    const bp: Blueprint = {
      id: `bp_${Date.now()}`,
      name: idea.slice(0, 28) || "My Blueprint",
      industry,
      ideaDesc: idea,
      isPublic: false,
      viability: 68 + Math.floor(Math.random() * 20),
      fundingReadiness: "Medium",
      devMatches: 3,
      views: 0,
      interested: 0,
      updatedAt: "Just now",
      market: { size: "$500M", cagr: "22%", barriers: "Moderate", score: 70 },
      competitors: [{ name: "Incumbent A", type: "Direct" }, { name: "Incumbent B", type: "Indirect" }],
      differentiator: "AI-first approach with lower cost of entry",
      features: ["Core MVP feature", "User onboarding", "Analytics", "API"],
      techStack: { frontend: "React", backend: "Node.js", ai: "OpenAI APIs", db: "PostgreSQL" },
      cost: { timeline: "5 months", team: "2–3 devs", hosting: "$600/mo", budget: "$80K" },
    };
    onCreated(bp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,28,24,0.65)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl overflow-hidden"
        style={{ width: 520, border: "1px solid #e0e8e3" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #eaf0eb" }}>
          <div className="flex items-center gap-2">
            <Sparkle size={16} weight="fill" style={{ color: "#89d7b7" }} />
            <span className="font-bold text-[14px]" style={{ color: "#1a2e26" }}>Forge New Blueprint</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f5f7f5] transition-colors">
            <X size={15} style={{ color: "#7a9e8e" }} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {phase === "input" && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-medium mb-1.5 block" style={{ color: "#6b8e7e" }}>
                    Describe your startup idea
                  </label>
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="e.g. An AI platform that helps small restaurants optimise their menu pricing dynamically…"
                    className="w-full rounded-xl px-4 py-3 text-[13px] outline-none resize-none focus:ring-1 focus:ring-[#0f1c18]"
                    style={{ background: "#f5f7f5", border: "1px solid #dde5e0", color: "#1a2e26", minHeight: 110 }}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium mb-2 block" style={{ color: "#6b8e7e" }}>Select industry</label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind}
                        onClick={() => setIndustry(ind)}
                        className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                        style={{
                          background: industry === ind ? "#0f1c18" : "#f0f5f2",
                          color: industry === ind ? "#89d7b7" : "#428475",
                          border: `1px solid ${industry === ind ? "#0f1c18" : "#dde5e0"}`,
                        }}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={startGeneration}
                  disabled={!idea.trim() || !industry}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-semibold transition-opacity"
                  style={{
                    background: "#0f1c18",
                    color: "#89d7b7",
                    opacity: !idea.trim() || !industry ? 0.4 : 1,
                  }}
                >
                  <Sparkle size={14} weight="fill" /> Generate Blueprint
                </button>
              </motion.div>
            )}

            {phase === "generating" && (
              <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-4">
                <div className="text-center mb-5">
                  <div className="text-[14px] font-semibold mb-1" style={{ color: "#1a2e26" }}>Generating your blueprint…</div>
                  <div className="text-[12px]" style={{ color: "#7a9e8e" }}>5 AI agents are working on your idea</div>
                </div>
                <div className="space-y-3 mb-5">
                  {AGENTS.map((agent, i) => {
                    const done = i < agentIndex;
                    const active = i === agentIndex;
                    return (
                      <div key={agent.label} className="flex items-center gap-3">
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                          style={{
                            background: done ? "#e8f5ef" : active ? "#0f1c18" : "#f5f7f5",
                            color: done ? "#2e7d5c" : active ? "#89d7b7" : "#7a9e8e",
                          }}
                        >
                          {done ? "✓" : i + 1}
                        </div>
                        <div>
                          <div className="text-[12px] font-medium" style={{ color: done ? "#7a9e8e" : active ? "#1a2e26" : "#b0c0b8" }}>
                            {agent.label}
                          </div>
                          {active && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-[11px]"
                              style={{ color: "#7a9e8e" }}
                            >
                              {agent.desc}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#eaf0eb" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "#428475" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <div className="text-right text-[11px] mt-1" style={{ color: "#7a9e8e" }}>{progress}%</div>
              </motion.div>
            )}

            {phase === "done" && (
              <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-6">
                <div className="text-[2rem] mb-3">✦</div>
                <div className="text-[15px] font-bold mb-1" style={{ color: "#1a2e26" }}>Blueprint ready</div>
                <div className="text-[13px] mb-5" style={{ color: "#7a9e8e" }}>
                  All 5 agents completed analysis successfully.
                </div>
                <button
                  onClick={handleAccept}
                  className="flex items-center justify-center gap-2 mx-auto px-6 py-2.5 rounded-xl text-[13px] font-semibold"
                  style={{ background: "#0f1c18", color: "#89d7b7" }}
                >
                  <CheckCircle size={14} weight="fill" /> View Blueprint
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Main export                                                 */
/* ────────────────────────────────────────────────────────── */
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
  onCompleteProfile
}: Props) {
  const [blueprints, setBlueprints] = useState<Blueprint[]>(initialBlueprints);
  const [forgeOpen, setForgeOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(openBlueprintId ?? null);

  useEffect(() => {
    if (triggerForge) {
      setForgeOpen(true);
      onClearForge?.();
    }
  }, [triggerForge, onClearForge]);

  // sync from parent
  useEffect(() => {
    if (openBlueprintId) setViewingId(openBlueprintId);
  }, [openBlueprintId]);

  const update = (bps: Blueprint[]) => {
    setBlueprints(bps);
    onBlueprintsChange?.(bps);
  };

  const togglePublic = (id: string) =>
    update(blueprints.map((b) => (b.id === id ? { ...b, isPublic: !b.isPublic } : b)));

  const deleteBlueprint = (id: string) =>
    update(blueprints.filter((b) => b.id !== id));

  const viewingBP = blueprints.find((b) => b.id === viewingId);

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#f5f6f4", padding: "24px 28px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h2 className="text-[1.2rem] font-bold" style={{ color: "#1a2e26" }}>Workspace</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "#7a9e8e" }}>
            {blueprints.length} blueprints · {blueprints.filter((b) => b.isPublic).length} public
          </p>
        </div>
        <button
          onClick={() => setForgeOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#0f1c18", color: "#89d7b7" }}
        >
          <Plus size={14} weight="bold" /> Forge New Blueprint
        </button>
      </div>

      {!profileComplete && (
        <div className="mb-4 rounded-xl bg-white px-4 py-3 text-[12px] leading-5" style={{ border: "1px solid #dde5e0", color: "#6b8e7e" }}>
          You can generate and save private blueprints now. Complete your founder profile before publishing blueprints or connecting with developers.
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {viewingBP ? (
            <BlueprintDetail
              key="detail"
              bp={viewingBP}
              onBack={() => {
                setViewingId(null);
                onClearOpen?.();
              }}
            />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {blueprints.length === 0 && (
                <div className="text-center py-16" style={{ color: "#7a9e8e" }}>
                  <div className="text-[2rem] mb-3">✦</div>
                  <div className="text-[14px] font-semibold mb-1">No blueprints yet</div>
                  <div className="text-[12px]">Start by forging your first blueprint above.</div>
                </div>
              )}
              {blueprints.map((bp) => (
                <BPCard
                  key={bp.id}
                  bp={bp}
                  onView={() => setViewingId(bp.id)}
                  onTogglePublic={() => togglePublic(bp.id)}
                  onDelete={() => deleteBlueprint(bp.id)}
                  canPublish={profileComplete}
                  onCompleteProfile={onCompleteProfile}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {forgeOpen && (
        <ForgeModal
          onClose={() => setForgeOpen(false)}
          onCreated={(bp) => {
            update([bp, ...blueprints]);
            setViewingId(bp.id);
          }}
        />
      )}
    </div>
  );
}

export { SEED as DEFAULT_BLUEPRINTS };
