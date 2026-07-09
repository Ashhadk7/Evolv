"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Circle,
  Bug,
  CreditCard,
  Warning,
  Clock,
  CalendarBlank,
  CaretRight,
  ChartBar,
} from "@phosphor-icons/react";

import { Topbar } from "./shared";
import {
  C,
  cardStyle,
  SectionHead,
  Kicker,
  Chip,
  MeterBar,
  Avatar,
  NUM,
  Label,
} from "../founder/WorkspaceTab";
import {
  buildBlueprintContent,
  initProjectState,
  fmtMoney,
  fmtDate,
  type BlueprintContent,
  type ProjectState,
} from "../founder/blueprintContent";

// ── Mock Setup ─────────────────────────────────────────────────────────
const CURRENT_DEV = {
  id: "dev-1",
  name: "Sarah Mitchell",
  initials: "SM",
};

const DEV_BLUEPRINT = {
  id: "nexus",
  name: "Nexus Health",
  industry: "HealthTech",
  ideaDesc: "AI-driven diagnostics platform for early-stage oncology detection.",
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
  developerDemand: "High" as any,
  market: { size: "$2.4B", cagr: "18.3%", barriers: "High regulatory", score: 84 },
  competitors: [{ name: "PathAI", type: "Direct" }],
  differentiator: "Affordable early detection for emerging markets",
  aiRecommend: "Publish to attract developer matches",
};

const DEV_BLUEPRINT_2 = {
  id: "aura",
  name: "Aura Logistics",
  industry: "SaaS",
  ideaDesc:
    "Last-mile delivery drone network utilizing autonomous navigation in mid-density suburban environments.",
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
  developerDemand: "Medium" as any,
  market: { size: "$1.1B", cagr: "24.1%", barriers: "Regulatory + hardware", score: 72 },
  competitors: [{ name: "Zipline", type: "Direct" }],
  differentiator: "Suburb-first, cost-efficient fleet model",
  aiRecommend: "Add technical co-founder",
};

function getMockProjects() {
  const content1 = buildBlueprintContent(DEV_BLUEPRINT as any);
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

  const content2 = buildBlueprintContent(DEV_BLUEPRINT_2 as any);
  const proj2 = initProjectState(content2);
  proj2.status = "IN_DEVELOPMENT";
  proj2.phaseStates[0].assignment = {
    developerId: CURRENT_DEV.id,
    developerName: CURRENT_DEV.name,
    developerInitials: CURRENT_DEV.initials,
    hiredAt: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
    amountAgreed: content2.phases[0].cost,
    amountPaid: content2.phases[0].cost * 0.5,
    payments: [{ amount: content2.phases[0].cost * 0.5, date: new Date().toISOString().slice(0, 10) }],
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

// ── Shared UI Sub-components ──────────────────────────────────────────
function DevProjectListCard({
  name,
  industry,
  phaseName,
  progress,
  isActive,
  onClick,
}: {
  name: string;
  industry: string;
  phaseName: string;
  progress: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      style={{
        ...cardStyle({
          padding: "16px 20px",
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
          border: isActive ? `1px solid ${C.mint}` : `1px solid ${C.border}`,
          background: isActive ? C.tint : C.card,
        }),
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>{name}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            {industry} · {phaseName}
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.teal, ...NUM }}>{progress}%</div>
      </div>
      <MeterBar value={progress} />
    </motion.button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export default function Projects({ onNavigate }: { onNavigate?: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projectsData, setProjectsData] = useState(() => getMockProjects());

  // Derive selection
  const projectIdParam = searchParams?.get("project");
  const defaultIdx = projectsData.findIndex((p) => p.bp.id === projectIdParam);
  const selectedIdx = defaultIdx >= 0 ? defaultIdx : 0;
  const selected = projectsData[selectedIdx];

  useEffect(() => {
    if (selected && projectIdParam !== selected.bp.id) {
      const p = new URLSearchParams(searchParams?.toString() || "");
      p.set("project", selected.bp.id);
      router.push(`?${p.toString()}`, { scroll: false });
    }
  }, [selected, router, searchParams, projectIdParam]);

  // Derive active phase for the selected project
  const activePhaseIdx = selected.project.phaseStates.findIndex(
    (p) => p.assignment?.developerId === CURRENT_DEV.id
  );
  const activePhase = selected.content.phases[activePhaseIdx];
  const activePhaseState = selected.project.phaseStates[activePhaseIdx];

  // Actions
  const toggleDeliverable = (dIdx: number) => {
    setProjectsData((prev) => {
      const next = [...prev];
      const p = { ...next[selectedIdx] };
      const proj = { ...p.project };
      const phases = [...proj.phaseStates];
      const ps = { ...phases[activePhaseIdx] };
      const delivs = [...ps.deliverables];
      delivs[dIdx] = { ...delivs[dIdx], done: !delivs[dIdx].done };
      ps.deliverables = delivs;
      phases[activePhaseIdx] = ps;
      proj.phaseStates = phases;
      p.project = proj;
      next[selectedIdx] = p;
      return next;
    });
  };

  const toggleIssue = (issueId: string) => {
    setProjectsData((prev) => {
      const next = [...prev];
      const p = { ...next[selectedIdx] };
      const proj = { ...p.project };
      const issues = [...proj.issues];
      const idx = issues.findIndex((i) => i.id === issueId);
      if (idx !== -1) {
        issues[idx] = { ...issues[idx], status: issues[idx].status === "Resolved" ? "Open" : "Resolved" };
      }
      proj.issues = issues;
      p.project = proj;
      next[selectedIdx] = p;
      return next;
    });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", background: C.page, overflow: "hidden" }}>
      <Topbar title="My Projects" subtitle="Manage your assigned phases, deliverables, and payments." onNavigate={onNavigate} />

      <div style={{ flex: 1, display: "flex", padding: 24, gap: 24, overflow: "hidden" }}>
        {/* Left Sidebar - Assigned Projects */}
        <div style={{ width: 340, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", paddingRight: 8 }}>
          <Kicker>Active Projects</Kicker>
          {projectsData.map((data, i) => {
            const pIdx = data.project.phaseStates.findIndex((p) => p.assignment?.developerId === CURRENT_DEV.id);
            const pState = data.project.phaseStates[pIdx];
            const pContent = data.content.phases[pIdx];
            const doneCount = pState?.deliverables.filter((d) => d.done).length || 0;
            const totalCount = pState?.deliverables.length || 1;
            const progress = Math.round((doneCount / totalCount) * 100);

            return (
              <DevProjectListCard
                key={data.bp.id}
                name={data.bp.name}
                industry={data.bp.industry}
                phaseName={pContent?.name || "Unassigned"}
                progress={progress}
                isActive={selectedIdx === i}
                onClick={() => {
                  const p = new URLSearchParams(searchParams?.toString() || "");
                  p.set("project", data.bp.id);
                  router.push(`?${p.toString()}`, { scroll: false });
                }}
              />
            );
          })}
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", paddingRight: 24 }}>
          {activePhaseIdx === -1 ? (
            <div style={{ ...cardStyle({ padding: 40 }), textAlign: "center", color: C.muted }}>
              You are not assigned to any phase in this project.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 860 }}>
              
              {/* Phase Header */}
              <div style={cardStyle({ padding: "28px 32px" })}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Kicker>{selected.bp.name} · {selected.bp.industry}</Kicker>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: C.ink, marginBottom: 8 }}>{activePhase.name}</h1>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <Chip tone="dark">{activePhase.primarySkill}</Chip>
                      <Chip tone="neutral">{activePhase.weeks} Weeks Estimate</Chip>
                    </div>
                  </div>
                  {activePhaseState.deadline && (
                    <div style={{ textAlign: "right" }}>
                      <Label>Deadline</Label>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, display: "flex", alignItems: "center", gap: 6 }}>
                        <CalendarBlank size={18} weight="duotone" style={{ color: C.amber }} />
                        {fmtDate(activePhaseState.deadline)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
                
                {/* Deliverables Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={cardStyle({ padding: "24px 28px" })}>
                    <SectionHead
                      icon={<CheckCircle size={20} weight="duotone" style={{ color: C.teal }} />}
                      title="Deliverables"
                      desc="Check off deliverables as you complete them to keep the founder updated."
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
                      {activePhaseState.deliverables.map((d, dIdx) => (
                        <button
                          key={dIdx}
                          onClick={() => toggleDeliverable(dIdx)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            padding: "12px 16px",
                            borderRadius: 12,
                            background: d.done ? C.successBg : C.tint,
                            border: `1px solid ${d.done ? "#cfeadd" : C.borderSoft}`,
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {d.done ? (
                            <CheckCircle size={20} weight="fill" style={{ color: C.success, flexShrink: 0 }} />
                          ) : (
                            <Circle size={20} style={{ color: C.label, flexShrink: 0 }} />
                          )}
                          <span style={{ fontSize: 14, fontWeight: d.done ? 600 : 500, color: d.done ? C.success : C.ink, textDecoration: d.done ? "line-through" : "none" }}>
                            {d.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Issues Section */}
                  <div style={cardStyle({ padding: "24px 28px" })}>
                    <SectionHead
                      icon={<Bug size={20} weight="duotone" style={{ color: C.red }} />}
                      title="Project Issues"
                      desc="Issues raised by the founder for this phase. Mark them resolved once fixed."
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
                      {selected.project.issues.filter(i => i.phaseIndex === activePhaseIdx || i.phaseIndex === null).length === 0 && (
                        <div style={{ fontSize: 13, color: C.muted, padding: "20px 0", textAlign: "center" }}>No active issues.</div>
                      )}
                      {selected.project.issues
                        .filter(i => i.phaseIndex === activePhaseIdx || i.phaseIndex === null)
                        .map((issue) => {
                          const resolved = issue.status === "Resolved";
                          return (
                            <div key={issue.id} style={{ padding: "16px", borderRadius: 12, background: C.tint, border: `1px solid ${C.borderSoft}` }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: resolved ? C.muted : C.ink, textDecoration: resolved ? "line-through" : "none" }}>
                                  {issue.title}
                                </div>
                                <Chip tone={resolved ? "neutral" : issue.priority === "High" ? "red" : "amber"}>
                                  {resolved ? "Resolved" : `${issue.priority} Priority`}
                                </Chip>
                              </div>
                              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: 14 }}>
                                {issue.description}
                              </p>
                              <button
                                onClick={() => toggleIssue(issue.id)}
                                style={{
                                  fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: 8,
                                  background: resolved ? C.card : C.forest,
                                  color: resolved ? C.ink : C.mint,
                                  border: resolved ? `1px solid ${C.border}` : "none",
                                  cursor: "pointer",
                                }}
                              >
                                {resolved ? "Reopen Issue" : "Mark as Resolved"}
                              </button>
                            </div>
                          );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Payment & Meta */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={cardStyle({ padding: "24px" })}>
                    <SectionHead
                      icon={<CreditCard size={20} weight="duotone" style={{ color: C.amber }} />}
                      title="Payment Status"
                    />
                    {activePhaseState.assignment && (
                      <div style={{ marginTop: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                          <div>
                            <div style={{ fontSize: 11, color: C.label, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Agreed Amount</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, ...NUM }}>{fmtMoney(activePhaseState.assignment.amountAgreed)}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 11, color: C.label, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Paid to Date</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: C.success, ...NUM }}>{fmtMoney(activePhaseState.assignment.amountPaid)}</div>
                          </div>
                        </div>

                        {activePhaseState.assignment.payments.length > 0 && (
                          <div style={{ marginTop: 24 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: C.ink, marginBottom: 12 }}>Payment History</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {activePhaseState.assignment.payments.map((p, idx) => (
                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "8px 12px", background: C.tint, borderRadius: 8 }}>
                                  <span style={{ color: C.muted }}>{fmtDate(p.date)}</span>
                                  <span style={{ fontWeight: 700, color: C.success }}>+{fmtMoney(p.amount)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div style={{ marginTop: 24, padding: "12px", background: C.amberBg, border: `1px solid ${C.amberLine}`, borderRadius: 10, display: "flex", gap: 10 }}>
                          <Warning size={16} weight="duotone" style={{ color: C.amber, flexShrink: 0 }} />
                          <div style={{ fontSize: 11.5, color: "#7a5c10", lineHeight: 1.5 }}>
                            Payments are released by the founder. Complete deliverables to trigger milestones.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
