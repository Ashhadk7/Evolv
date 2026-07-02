"use client";

import { useRef, useState, type CSSProperties, type ReactNode, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, ArrowLeft, ArrowRight, CheckCircle, Check, Circle, Warning, Clock,
  Coins, Money, UsersThree, User, PencilSimple, Buildings, Bug,
  CalendarBlank, Lock, CreditCard, ShieldCheck, CaretRight, ChartBar,
  MagnifyingGlass, ChatCircleDots,
} from "@phosphor-icons/react";
import {
  C, EASE, MONO, NUM, cardStyle, Reveal, SectionHead, Kicker, Chip, Avatar, MeterBar, Label, ViabilityGauge,
  PROJECT_STATUS_LABEL, PROJECT_STATUS_STYLE,
  type Blueprint,
} from "./WorkspaceTab";
import {
  buildBlueprintContent, fmtMoney, todayISO, addWeeksISO, fmtDate,
  initProjectState, deriveProjectStatus, computeProjectHealth, normalizeProjectState,
  type BlueprintContent, type ProjectState, type ProjectPhaseState, type ProjectIssue, type ProjectDeadline, type ProjectExpense, type ExpenseCategory,
} from "./blueprintContent";
import { FOUNDER_NETWORK_PROFILES, NetworkProfileDetailScreen, type FounderContactProfile } from "./NetworkProfileDetail";
import type { FounderNetworkMessageTarget } from "./NetworkTab";

/* Reads/writes the same connection state the real Network page uses
   (localStorage["evolv_founder_network_state"]), so "Connect" here and
   the Network tab never disagree about who's actually connected. */
const NETWORK_STORAGE_KEY = "evolv_founder_network_state";
function readNetworkConnections(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(NETWORK_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { connected?: Record<string, boolean> };
    return parsed.connected ?? {};
  } catch { return {}; }
}
function writeNetworkConnection(id: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(NETWORK_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : { connected: {}, pendingIds: [], ignoredIds: [], outgoingIds: [], requestNotes: {} };
    parsed.connected = { ...parsed.connected, [id]: true };
    parsed.outgoingIds = Array.from(new Set([...(parsed.outgoingIds ?? []), id]));
    window.localStorage.setItem(NETWORK_STORAGE_KEY, JSON.stringify(parsed));
  } catch { /* ignore */ }
}

type ProjectBlueprint = Blueprint & { project: ProjectState };

/* ═══════════════════════════════════════════════════════ */
/* Small local helpers                                        */
/* ═══════════════════════════════════════════════════════ */
function currentPhaseIndex(project: ProjectState): number {
  const idx = project.phaseStates.findIndex((ps) => ps.status !== "Complete");
  return idx === -1 ? Math.max(0, project.phaseStates.length - 1) : idx;
}
function devsForSkillset(skillset: string[]): FounderContactProfile[] {
  const devs = FOUNDER_NETWORK_PROFILES.filter((p) => p.type === "Developer");
  const matched = devs.filter((d) => skillset.some((s) => d.skills.some((sk) => sk.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(sk.toLowerCase()))));
  return matched.length ? matched : devs;
}
/* Issue priority uses the danger scale — same convention as risk severity, never the ordinal must/should/nice ramp. */
const issueTone = (p: ProjectIssue["priority"]) => (p === "High" ? "red" : p === "Medium" ? "amber" : "mint") as "red" | "amber" | "mint";
const issueStatusTone = (s: ProjectIssue["status"]) => (s === "Open" ? "red" : s === "In Progress" ? "amber" : "mint") as "red" | "amber" | "mint";

/* ═══════════════════════════════════════════════════════ */
/* Project list card — mirrors the landing hero's terminal   */
/* window card (landing/Hero.tsx BlueprintCard), with data    */
/* relevant to a live build instead of a blueprint pitch.     */
/* ═══════════════════════════════════════════════════════ */
function DarkMeter({ value, delay }: { value: number; delay: number }) {
  return (
    <div style={{ height: 3, overflow: "hidden", borderRadius: 999, background: "rgba(255,244,225,0.14)" }}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ delay, duration: 1.1, ease: EASE }}
        style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #428475, #89d7b7)" }}
      />
    </div>
  );
}

const PROJECT_LIVE_LABEL: Record<ProjectState["status"], string> = {
  ONBOARDING: "Project onboarding",
  IN_DEVELOPMENT: "Build in progress",
  COMPLETED: "Project complete",
};

function ProjectListCard({ bp, idx, onClick }: { bp: ProjectBlueprint; idx: number; onClick: () => void }) {
  const content = buildBlueprintContent(bp);
  const health = computeProjectHealth(content, bp.project);
  const phaseIdx = currentPhaseIndex(bp.project);
  const currentPhase = content.phases[phaseIdx];
  const currentAssignment = bp.project.phaseStates[phaseIdx]?.assignment;
  const completion = health.deliverables.total ? Math.round((health.deliverables.done / health.deliverables.total) * 100) : 0;
  const phasesComplete = bp.project.phaseStates.filter((ps) => ps.status === "Complete").length;
  const dotColor = bp.project.status === "ONBOARDING" ? "#e8b04b" : "#89d7b7";
  const live = bp.project.status === "IN_DEVELOPMENT";

  const meters = [
    { label: "Deliverables", value: completion, display: `${health.deliverables.done}/${health.deliverables.total}` },
    { label: "Budget deployed", value: health.budget.pct, display: fmtMoney(health.budget.spent) },
    { label: "Phases complete", value: Math.round((phasesComplete / (bp.project.phaseStates.length || 1)) * 100), display: `${phasesComplete}/${bp.project.phaseStates.length}` },
  ];

  const stackTags = [bp.techStack.frontend, bp.techStack.backend, bp.techStack.db, bp.techStack.hosting || "Vercel"]
    .map((s) => s.split(",")[0].trim())
    .filter(Boolean);

  const currentDeadline = bp.project.phaseStates[phaseIdx]?.deadline;
  const insight = bp.project.status === "COMPLETED"
    ? "All phases complete — every milestone shipped and paid out."
    : currentAssignment
      ? `${currentPhase?.name} in progress with ${currentAssignment.developerName}${currentDeadline ? ` — due ${fmtDate(currentDeadline)}` : ""}.`
      : `Next: assign a developer for ${currentPhase?.name} — ${fmtMoney(currentPhase?.cost ?? 0)} milestone.`;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08, duration: 0.5, ease: EASE }}
      whileHover={{ y: -5 }}
      style={{
        textAlign: "left", cursor: "pointer", overflow: "hidden", borderRadius: 16, padding: 0,
        background: "linear-gradient(160deg, #2a4c40 0%, #1a332b 100%)",
        border: "1px solid rgba(137,215,183,0.18)",
        boxShadow: "0 0 0 1px rgba(137,215,183,0.08) inset, 0 22px 46px -18px rgba(17,34,27,0.5), 0 6px 18px rgba(17,34,27,0.16)",
      }}
    >
      {/* Window chrome */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid rgba(255,244,225,0.09)", background: "rgba(255,244,225,0.03)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(255,95,86,0.55)" }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(255,189,46,0.55)" }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(39,201,63,0.55)" }} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.04em", color: "rgba(255,244,225,0.4)" }}>{bp.id}.project</span>
        <div style={{ width: 46 }} />
      </div>

      <div style={{ padding: 20 }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ position: "relative", display: "flex", width: 6, height: 6 }}>
                {live && <motion.span animate={{ scale: [1, 2.1], opacity: [0.55, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }} style={{ position: "absolute", inset: 0, borderRadius: 999, background: dotColor }} />}
                <span style={{ position: "relative", width: 6, height: 6, borderRadius: 999, background: dotColor }} />
              </span>
              <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(137,215,183,0.78)" }}>{PROJECT_LIVE_LABEL[bp.project.status]}</span>
            </div>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: "rgba(255,244,225,0.97)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{bp.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,244,225,0.5)", marginTop: 3 }}>{bp.industry} · {currentPhase?.name}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1, color: "#9fe3c6", ...NUM }}>{completion}<span style={{ fontSize: 17 }}>%</span></div>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,244,225,0.42)", marginTop: 3 }}>Complete</div>
          </div>
        </div>

        {/* Metric meters */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {meters.map((m, i) => (
            <div key={m.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 10 }}>
                <span style={{ color: "rgba(255,244,225,0.55)" }}>{m.label}</span>
                <span style={{ color: "rgba(159,227,198,0.9)", ...NUM }}>{m.display}</span>
              </div>
              <DarkMeter value={m.value} delay={0.3 + i * 0.1} />
            </div>
          ))}
        </div>

        {/* Stack tags — from the blueprint this project was built on */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {stackTags.map((tag) => (
            <span key={tag} style={{ borderRadius: 7, padding: "3px 8px", fontSize: 10, color: "rgba(159,227,198,0.85)", background: "rgba(137,215,183,0.1)", border: "1px solid rgba(137,215,183,0.2)" }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Next-action insight */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, borderRadius: 10, padding: "10px 12px", background: "rgba(137,215,183,0.09)", border: "1px solid rgba(137,215,183,0.16)" }}>
          {currentAssignment || bp.project.status === "COMPLETED" ? (
            <CheckCircle size={11} weight="fill" style={{ color: "#9fe3c6", flexShrink: 0, marginTop: 2 }} />
          ) : (
            <Warning size={11} weight="fill" style={{ color: "#eec06a", flexShrink: 0, marginTop: 2 }} />
          )}
          <p style={{ fontSize: 10.5, lineHeight: 1.55, margin: 0, color: "rgba(255,244,225,0.62)" }}>{insight}</p>
        </div>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* New Project — blueprint picker modal                       */
/* ═══════════════════════════════════════════════════════ */
function StartProjectModal({ blueprints, onPick, onClose }: { blueprints: Blueprint[]; onPick: (bp: Blueprint) => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(15,28,24,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        style={{ ...cardStyle({ padding: "28px 28px 22px", width: "min(560px, 100%)", maxHeight: "80vh", display: "flex", flexDirection: "column" }) }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <Kicker>New Project</Kicker>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: C.ink }}>Select a blueprint to start building</h2>
            <p style={{ fontSize: 12.5, color: C.muted, marginTop: 6, maxWidth: 420 }}>
              Starting a project unpublishes this blueprint from public discovery and turns it into a live build you manage phase by phase.
            </p>
          </div>
          <button onClick={onClose} className="bp-icon-btn" style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: C.tint, border: `1px solid ${C.borderSoft}`, cursor: "pointer", flexShrink: 0 }}>
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {blueprints.length === 0 && (
            <div style={{ padding: "28px 18px", textAlign: "center", color: C.muted, fontSize: 13, background: C.tint, borderRadius: 12, border: `1px solid ${C.borderSoft}` }}>
              All your blueprints are already projects — head to Workspace to draft a new idea first.
            </div>
          )}
          {blueprints.map((bp) => (
            <button
              key={bp.id}
              onClick={() => onPick(bp)}
              style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", padding: "13px 15px", borderRadius: 12, background: C.tint, border: `1px solid ${C.borderSoft}`, cursor: "pointer" }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{bp.name}</span>
                  <Chip>{bp.industry}</Chip>
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bp.ideaDesc}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.success, flexShrink: 0 }}>{bp.viability}</span>
              <ArrowRight size={14} style={{ color: C.label, flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Modal shell — shared chrome for the small action modals    */
/* ═══════════════════════════════════════════════════════ */
function ModalShell({ icon, title, subtitle, onClose, width = 420, children }: {
  icon: ReactNode; title: string; subtitle?: string; onClose: () => void; width?: number; children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(15,28,24,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        style={{ ...cardStyle({ padding: "26px 26px 22px", width: `min(${width}px, 100%)` }) }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: C.tint, border: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{title}</div>
              {subtitle && <div style={{ fontSize: 11, color: C.muted }}>{subtitle}</div>}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, background: C.tint, border: `1px solid ${C.borderSoft}`, cursor: "pointer", flexShrink: 0 }}>
            <X size={13} style={{ color: C.muted }} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Add developer — confirm the agreed amount before hiring     */
/* ═══════════════════════════════════════════════════════ */
function AddDeveloperModal({ developer, defaultAmount, onConfirm, onClose }: {
  developer: FounderContactProfile; defaultAmount: number; onConfirm: (amount: number) => void; onClose: () => void;
}) {
  const [amount, setAmount] = useState(defaultAmount);
  return (
    <ModalShell icon={<User size={16} weight="duotone" style={{ color: C.teal }} />} title={`Hire ${developer.name}`} subtitle={developer.role} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 12, marginBottom: 16 }}>
        <Avatar initials={developer.initials} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{developer.name}</div>
          <div style={{ fontSize: 11, color: C.muted }}>{developer.skills.slice(0, 2).join(" · ")}</div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: "#e8f5ef", color: "#1d6e47", ...NUM }}>{developer.match}%</span>
      </div>
      <Label>Amount agreed for this phase</Label>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>$</span>
        <input
          type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)}
          style={{ flex: 1, fontSize: 20, fontWeight: 800, color: C.ink, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", outline: "none", fontFamily: "inherit", ...NUM }}
        />
      </div>
      <p style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.5, marginBottom: 18 }}>
        This is the total you&apos;re confirming with {developer.name.split(" ")[0]} for this phase — you can pay it in installments as work progresses, not all at once.
      </p>
      <button
        onClick={() => onConfirm(Math.max(0, amount))}
        disabled={amount <= 0}
        className="bp-primary-btn"
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13.5, fontWeight: 700, padding: "12px", borderRadius: 11, background: `linear-gradient(180deg, #234840, ${C.forest})`, color: C.mint, border: "none", cursor: amount > 0 ? "pointer" : "not-allowed", opacity: amount > 0 ? 1 : 0.5 }}
      >
        <CheckCircle size={15} weight="fill" /> Confirm & hire
      </button>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Remove developer — mandatory reason, permanent audit trail  */
/* ═══════════════════════════════════════════════════════ */
function RemoveDeveloperModal({ developerName, phaseName, amountPaid, onConfirm, onClose }: {
  developerName: string; phaseName: string; amountPaid: number; onConfirm: (reason: string) => void; onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <ModalShell icon={<Warning size={16} weight="duotone" style={{ color: C.red }} />} title={`Remove ${developerName}`} subtitle={phaseName} onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 12, marginBottom: 14 }}>
        <span style={{ fontSize: 12.5, color: C.muted }}>Already paid to {developerName.split(" ")[0]}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: C.ink, ...NUM }}>{fmtMoney(amountPaid)}</span>
      </div>
      <p style={{ fontSize: 11.5, color: "#7a5c10", lineHeight: 1.5, background: C.amberBg, border: `1px solid ${C.amberLine}`, borderRadius: 12, padding: "10px 12px", marginBottom: 14 }}>
        Removing does not refund what&apos;s already been paid. Evolv keeps a permanent record of this removal — the reason and amount paid — in case it&apos;s ever reported or disputed.
      </p>
      <Label>Reason for removal (required)</Label>
      <textarea
        value={reason} onChange={(e) => setReason(e.target.value)} autoFocus
        placeholder="e.g. Missed two deadlines and deliverables didn't match the spec after feedback."
        style={{ width: "100%", minHeight: 80, fontSize: 12.5, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, outline: "none", fontFamily: "inherit", color: C.ink, resize: "vertical", marginBottom: 16 }}
      />
      <button
        onClick={() => onConfirm(reason.trim())}
        disabled={!reason.trim()}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13.5, fontWeight: 700, padding: "12px", borderRadius: 11, background: reason.trim() ? C.red : C.border, color: "#fff", border: "none", cursor: reason.trim() ? "pointer" : "not-allowed" }}
      >
        Remove & record
      </button>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Payment modal — real ledger: agreed / paid / due, partial   */
/* payments, gated on a real persisted Stripe-connected flag   */
/* ═══════════════════════════════════════════════════════ */
function PaymentModal({
  developerName, amountAgreed, amountPaid, feePct, stripeConnected, onNavigateSettingsPayment, onSend, onClose,
}: {
  developerName: string; amountAgreed: number; amountPaid: number; feePct: number; stripeConnected: boolean;
  onNavigateSettingsPayment?: () => void; onSend: (amount: number) => void; onClose: () => void;
}) {
  const due = Math.max(0, amountAgreed - amountPaid);
  const [amount, setAmount] = useState(due);
  const fee = Math.round(amount * feePct);
  const takeHome = amount - fee;
  const statusLabel = amountPaid <= 0 ? "Not paid yet" : amountPaid >= amountAgreed ? "Paid in full" : "Partially paid";

  return (
    <ModalShell icon={<CreditCard size={16} weight="duotone" style={{ color: C.teal }} />} title={`Pay ${developerName}`} subtitle="via Stripe Connect" onClose={onClose}>
      {!stripeConnected ? (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "14px 16px", background: C.amberBg, border: `1px solid ${C.amberLine}`, borderRadius: 12 }}>
          <Lock size={14} weight="duotone" style={{ color: C.amber, flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: "#7a5c10", lineHeight: 1.5, marginBottom: 10 }}>Connect your Stripe account to pay developers — funds route through Evolv&apos;s platform account, the platform fee is deducted, and the rest releases to their connected account.</div>
            <button onClick={() => { onClose(); onNavigateSettingsPayment?.(); }} className="bp-gradient-btn" style={{ fontSize: 12, fontWeight: 700, padding: "8px 15px", borderRadius: 9, background: C.forest, color: C.mint, border: "none", cursor: "pointer" }}>Connect Stripe account</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            <div style={{ padding: "10px 12px", background: C.tint, borderRadius: 10, border: `1px solid ${C.borderSoft}` }}>
              <div style={{ fontSize: 9.5, color: C.label, textTransform: "uppercase", letterSpacing: "0.06em" }}>Agreed</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, ...NUM }}>{fmtMoney(amountAgreed)}</div>
            </div>
            <div style={{ padding: "10px 12px", background: C.tint, borderRadius: 10, border: `1px solid ${C.borderSoft}` }}>
              <div style={{ fontSize: 9.5, color: C.label, textTransform: "uppercase", letterSpacing: "0.06em" }}>Paid</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.success, ...NUM }}>{fmtMoney(amountPaid)}</div>
            </div>
            <div style={{ padding: "10px 12px", background: C.tint, borderRadius: 10, border: `1px solid ${C.borderSoft}` }}>
              <div style={{ fontSize: 9.5, color: C.label, textTransform: "uppercase", letterSpacing: "0.06em" }}>Due</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: due > 0 ? C.amber : C.success, ...NUM }}>{fmtMoney(due)}</div>
            </div>
          </div>
          <Chip tone={statusLabel === "Paid in full" ? "mint" : statusLabel === "Partially paid" ? "amber" : "neutral"}>{statusLabel}</Chip>

          <div style={{ marginTop: 16 }}>
            <Label>Amount to pay now</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>$</span>
              <input
                type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)}
                style={{ flex: 1, fontSize: 20, fontWeight: 800, color: C.ink, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", outline: "none", fontFamily: "inherit", ...NUM }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "14px 16px", background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 12, marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
              <span style={{ color: C.muted }}>Sent to Evolv platform account</span>
              <span style={{ fontWeight: 700, color: C.ink }}>{fmtMoney(amount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
              <span style={{ color: C.muted }}>Evolv platform fee ({Math.round(feePct * 100)}%)</span>
              <span style={{ fontWeight: 700, color: C.amber }}>−{fmtMoney(fee)}</span>
            </div>
            <div style={{ height: 1, background: C.border, margin: "2px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: C.ink, fontWeight: 700 }}>{developerName} receives</span>
              <span style={{ fontWeight: 800, color: C.success }}>{fmtMoney(takeHome)}</span>
            </div>
          </div>

          <button
            onClick={() => onSend(amount)}
            disabled={amount <= 0 || due <= 0}
            className="bp-primary-btn"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13.5, fontWeight: 700, padding: "12px", borderRadius: 11, background: `linear-gradient(180deg, #234840, ${C.forest})`, color: C.mint, border: "none", cursor: (amount > 0 && due > 0) ? "pointer" : "not-allowed", opacity: (amount > 0 && due > 0) ? 1 : 0.5 }}
          >
            <Coins size={15} weight="fill" /> Send payment
          </button>
        </>
      )}
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Issue modal                                                 */
/* ═══════════════════════════════════════════════════════ */
function IssueModal({
  phases, draft, onChange, onSubmit, onClose,
}: {
  phases: BlueprintContent["phases"]; draft: { title: string; description: string; priority: ProjectIssue["priority"]; phaseIndex: number | null };
  onChange: (d: typeof draft) => void; onSubmit: () => void; onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(15,28,24,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        style={{ ...cardStyle({ padding: "26px 26px 22px", width: "min(480px, 100%)" }) }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Bug size={17} weight="duotone" style={{ color: C.red }} />
            <span style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>Raise an issue</span>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, background: C.tint, border: `1px solid ${C.borderSoft}`, cursor: "pointer" }}>
            <X size={13} style={{ color: C.muted }} />
          </button>
        </div>

        <Label>Title</Label>
        <input
          value={draft.title}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
          placeholder="e.g. Dashboard chart doesn't update on filter change"
          style={{ width: "100%", fontSize: 13, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, outline: "none", marginBottom: 14, fontFamily: "inherit", color: C.ink }}
        />
        <Label>What needs to change</Label>
        <textarea
          value={draft.description}
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
          placeholder="Describe the fix the developer needs to make…"
          style={{ width: "100%", minHeight: 80, fontSize: 13, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, outline: "none", marginBottom: 14, fontFamily: "inherit", color: C.ink, resize: "vertical" }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div>
            <Label>Priority</Label>
            <select
              value={draft.priority}
              onChange={(e) => onChange({ ...draft, priority: e.target.value as ProjectIssue["priority"] })}
              style={{ width: "100%", fontSize: 13, padding: "9px 10px", borderRadius: 10, border: `1px solid ${C.border}`, outline: "none", fontFamily: "inherit", color: C.ink, background: C.card }}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <Label>Phase (optional)</Label>
            <select
              value={draft.phaseIndex === null ? "" : draft.phaseIndex}
              onChange={(e) => onChange({ ...draft, phaseIndex: e.target.value === "" ? null : Number(e.target.value) })}
              style={{ width: "100%", fontSize: 13, padding: "9px 10px", borderRadius: 10, border: `1px solid ${C.border}`, outline: "none", fontFamily: "inherit", color: C.ink, background: C.card }}
            >
              <option value="">General</option>
              {phases.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={!draft.title.trim()}
          className="bp-gradient-btn"
          style={{ width: "100%", fontSize: 13.5, fontWeight: 700, padding: "11px", borderRadius: 11, background: C.forest, color: C.mint, border: "none", cursor: draft.title.trim() ? "pointer" : "not-allowed", opacity: draft.title.trim() ? 1 : 0.5 }}
        >
          Raise issue
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Deadline modal                                              */
/* ═══════════════════════════════════════════════════════ */
function DeadlineModal({
  phases, draft, onChange, onSubmit, onClose,
}: {
  phases: BlueprintContent["phases"]; draft: { note: string; priority: ProjectDeadline["priority"]; phaseIndex: number | null; date: string };
  onChange: (d: typeof draft) => void; onSubmit: () => void; onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(15,28,24,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        style={{ ...cardStyle({ padding: "26px 26px 22px", width: "min(480px, 100%)" }) }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CalendarBlank size={17} weight="duotone" style={{ color: C.mint }} />
            <span style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>New Deadline</span>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, background: C.tint, border: `1px solid ${C.borderSoft}`, cursor: "pointer" }}>
            <X size={13} style={{ color: C.muted }} />
          </button>
        </div>

        <Label>What needs to be completed</Label>
        <textarea
          value={draft.note}
          onChange={(e) => onChange({ ...draft, note: e.target.value })}
          placeholder="e.g. Finish the Stripe API integration..."
          style={{ width: "100%", minHeight: 60, fontSize: 13, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, outline: "none", marginBottom: 14, fontFamily: "inherit", color: C.ink, resize: "vertical" }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <Label>Phase</Label>
            <select
              value={draft.phaseIndex === null ? "" : draft.phaseIndex}
              onChange={(e) => onChange({ ...draft, phaseIndex: e.target.value === "" ? null : Number(e.target.value) })}
              style={{ width: "100%", fontSize: 13, padding: "9px 10px", borderRadius: 10, border: `1px solid ${C.border}`, outline: "none", fontFamily: "inherit", color: C.ink, background: C.card }}
            >
              <option value="">General</option>
              {phases.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Priority</Label>
            <select
              value={draft.priority}
              onChange={(e) => onChange({ ...draft, priority: e.target.value as ProjectDeadline["priority"] })}
              style={{ width: "100%", fontSize: 13, padding: "9px 10px", borderRadius: 10, border: `1px solid ${C.border}`, outline: "none", fontFamily: "inherit", color: C.ink, background: C.card }}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <Label>Deadline Date</Label>
        <input
          type="date"
          value={draft.date}
          onChange={(e) => onChange({ ...draft, date: e.target.value })}
          style={{ width: "100%", fontSize: 13, padding: "9px 10px", borderRadius: 10, border: `1px solid ${C.border}`, outline: "none", marginBottom: 20, fontFamily: "inherit", color: C.ink, background: C.card }}
        />

        <button
          onClick={onSubmit}
          disabled={!draft.note.trim() || !draft.date}
          className="bp-gradient-btn"
          style={{ width: "100%", fontSize: 13.5, fontWeight: 700, padding: "11px", borderRadius: 11, background: C.forest, color: C.mint, border: "none", cursor: (draft.note.trim() && draft.date) ? "pointer" : "not-allowed", opacity: (draft.note.trim() && draft.date) ? 1 : 0.5 }}
        >
          Set deadline
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Developers panel — replaces the old Activity card.         */
/* Suggested matches for whichever phase you pick, plus a     */
/* search over the founder's real network connections. This   */
/* is the only place hiring decisions get made — phase cards   */
/* just point here.                                           */
/* ═══════════════════════════════════════════════════════ */
function DevelopersPanel({
  phases, selectedPhase, onSelectPhase, connections, onConnect, onHire, onMessage, onViewProfile, onBrowseNetwork,
}: {
  phases: BlueprintContent["phases"];
  selectedPhase: number;
  onSelectPhase: (i: number) => void;
  connections: Record<string, boolean>;
  onConnect: (dev: FounderContactProfile) => void;
  onHire: (phaseIdx: number, dev: FounderContactProfile) => void;
  onMessage?: (contact: FounderNetworkMessageTarget) => void;
  onViewProfile: (dev: FounderContactProfile) => void;
  onBrowseNetwork?: () => void;
}) {
  const [tab, setTab] = useState<"matched" | "connected">("matched");
  const [query, setQuery] = useState("");
  const phase = phases[selectedPhase];
  const allDevs = FOUNDER_NETWORK_PROFILES.filter((p) => p.type === "Developer");
  const matched = phase ? devsForSkillset(phase.skillset) : allDevs;
  const connectedDevs = allDevs.filter((d) => connections[d.id]);
  const base = tab === "matched" ? matched : connectedDevs;
  const filtered = (query.trim() ? base.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()) || d.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))) : base).slice(0, 8);

  const messageDev = (d: FounderContactProfile) => {
    onMessage?.({ id: d.id, name: d.name, role: d.role, match: d.match, initials: d.initials, online: d.online, personType: "Developer" });
  };

  return (
    <div style={cardStyle({ padding: "15px 18px", flexShrink: 0 })}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: "#e8f5ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <UsersThree size={13} weight="duotone" style={{ color: C.success }} />
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>Developers</span>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 10, padding: 3, background: C.tint, borderRadius: 9 }}>
        {(["matched", "connected"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ flex: 1, fontSize: 11, fontWeight: 700, padding: "6px 8px", borderRadius: 7, border: "none", cursor: "pointer", background: tab === t ? C.card : "transparent", color: tab === t ? C.ink : C.muted, boxShadow: tab === t ? "0 1px 3px rgba(19,36,29,0.08)" : "none" }}
          >
            {t === "matched" ? "Matched" : `Connected (${connectedDevs.length})`}
          </button>
        ))}
      </div>

      <select
        value={selectedPhase}
        onChange={(e) => onSelectPhase(Number(e.target.value))}
        style={{ width: "100%", fontSize: 11.5, fontWeight: 600, padding: "7px 9px", borderRadius: 8, border: `1px solid ${C.border}`, outline: "none", fontFamily: "inherit", color: C.ink, background: C.tint, marginBottom: 9 }}
      >
        {phases.map((p, i) => <option key={p.name} value={i}>Staffing for: {p.name}</option>)}
      </select>
      <div style={{ position: "relative", marginBottom: 11 }}>
        <MagnifyingGlass size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.label }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === "matched" ? "Narrow the matches…" : "Search your connections…"}
          style={{ width: "100%", fontSize: 11.5, padding: "7px 9px 7px 27px", borderRadius: 8, border: `1px solid ${C.border}`, outline: "none", fontFamily: "inherit", color: C.ink }}
        />
      </div>

      <div className="blueprint-scroll" style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflowY: "auto", paddingRight: 4, paddingBottom: 4 }}>
        {filtered.map((d) => {
          const connected = Boolean(connections[d.id]);
          const avail = d.availability === "Ready to start";
          return (
            <motion.div
              key={d.id}
              whileHover={{ y: -2, borderColor: "#c5ddd0", boxShadow: "0 8px 22px rgba(15,28,24,0.06)" }}
              style={{ padding: "12px 14px", borderRadius: 10, background: C.card, border: `1px solid ${C.borderSoft}`, display: "flex", flexDirection: "column", gap: 10 }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Avatar initials={d.initials} size={34} />
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
                      {d.online && <span style={{ width: 6, height: 6, borderRadius: 999, background: C.success, flexShrink: 0 }} />}
                    </div>
                    {tab === "matched" && <span style={{ fontSize: 11.5, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: "#e8f5ef", color: "#1d6e47", ...NUM }}>{d.match}%</span>}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.role}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <Chip tone={avail ? "mint" : "amber"}>{avail ? "Available" : d.availability}</Chip>
                    {connected && <Chip tone="neutral">Connected</Chip>}
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                <button
                  onClick={() => onViewProfile(d)}
                  style={{ flex: 1, fontSize: 11, fontWeight: 700, padding: "7px 0", borderRadius: 7, background: C.tint, border: `1px solid ${C.borderSoft}`, color: C.ink, cursor: "pointer" }}
                >
                  View profile
                </button>
                {tab === "matched" && !connected && (
                  <button
                    onClick={() => onConnect(d)}
                    className="bp-primary-btn"
                    style={{ flex: 1 }}
                  >
                    Connect
                  </button>
                )}
                {tab === "connected" && connected && (
                  <>
                    <button
                      onClick={() => onHire(selectedPhase, d)}
                      className="bp-primary-btn"
                      style={{ flex: 1 }}
                    >
                      Add to phase
                    </button>
                    {onMessage && (
                      <button
                        onClick={() => messageDev(d)}
                        title="Message"
                        style={{ width: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, background: C.tint, border: `1px solid ${C.borderSoft}`, cursor: "pointer" }}
                      >
                        <ChatCircleDots size={14} style={{ color: C.teal }} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ fontSize: 11.5, color: C.muted, textAlign: "center", padding: "16px 0", border: `1px dashed ${C.borderSoft}`, borderRadius: 10, background: C.tint }}>
            {tab === "connected" ? "No connections yet — connect with a matched developer first." : "No matches — try a different search."}
          </div>
        )}
      </div>

      {onBrowseNetwork && (
        <button onClick={onBrowseNetwork} style={{ display: "flex", alignItems: "center", gap: 5, width: "100%", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.teal, background: "transparent", border: "none", cursor: "pointer", marginTop: 11, padding: "4px 0" }}>
          Browse full network <ArrowRight size={11} />
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Spend history modal — the one ledger behind "Total Spent":  */
/* developer payments auto-logged on release, plus whatever    */
/* the founder records manually (hosting, domain, tools, API). */
/* ═══════════════════════════════════════════════════════ */
const EXPENSE_CATEGORIES: ExpenseCategory[] = ["Developer Payment", "Hosting", "Domain", "Tools & Services", "API Costs", "Other"];
const EXPENSE_CATEGORY_COLOR: Record<ExpenseCategory, { bg: string; color: string }> = {
  "Developer Payment": { bg: "#e8f5ef", color: "#1d6e47" },
  Hosting: { bg: "#eaf2fb", color: "#2e5fa3" },
  Domain: { bg: "#f5eefc", color: "#6b3fa0" },
  "Tools & Services": { bg: "#fdf3e7", color: "#a35c1a" },
  "API Costs": { bg: "#fffaef", color: "#b07d10" },
  Other: { bg: "#f1f3f2", color: "#647a6e" },
};

function SpendHistoryModal({
  expenses, phases, total, spent, onAdd, onClose,
}: {
  expenses: ProjectExpense[];
  phases: BlueprintContent["phases"];
  total: number; spent: number;
  onAdd: (e: Omit<ProjectExpense, "id">) => void;
  onClose: () => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<{ label: string; category: ExpenseCategory; amount: number; phaseIndex: number | null }>({ label: "", category: "Hosting", amount: 0, phaseIndex: null });

  const submit = () => {
    if (!draft.label.trim() || draft.amount <= 0) return;
    onAdd({ label: draft.label.trim(), category: draft.category, amount: draft.amount, date: todayISO(), phaseIndex: draft.phaseIndex });
    setDraft({ label: "", category: "Hosting", amount: 0, phaseIndex: null });
    setFormOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(15,28,24,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        style={{ ...cardStyle({ padding: "26px 26px 22px", width: "min(520px, 100%)", maxHeight: "80vh", display: "flex", flexDirection: "column" }) }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Money size={17} weight="duotone" style={{ color: C.success }} />
            <span style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>Spend History</span>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, background: C.tint, border: `1px solid ${C.borderSoft}`, cursor: "pointer" }}>
            <X size={13} style={{ color: C.muted }} />
          </button>
        </div>

        <div style={{ padding: "22px 24px", background: "linear-gradient(135deg, #f2f9f5 0%, #e8f5ef 100%)", border: `1.5px solid #cfeadd`, borderRadius: 16, marginBottom: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 6px 20px -8px rgba(66,132,117,0.25)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: "#2d6b53", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Total Spent</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: C.ink, lineHeight: 1, letterSpacing: "-0.02em", ...NUM }}>{fmtMoney(spent)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.teal }}>{expenses.length} recorded transaction{expenses.length === 1 ? "" : "s"}</div>
            {expenses.length > 0 && <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>Latest: {fmtDate(expenses[0].date)}</div>}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {expenses.length === 0 && <div style={{ fontSize: 12.5, color: C.muted, padding: "18px 0", textAlign: "center" }}>Nothing logged yet. Developer payments appear here automatically once released.</div>}
          {expenses.map((e) => {
            const tone = EXPENSE_CATEGORY_COLOR[e.category];
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: C.card, border: `1px solid ${C.borderSoft}`, borderRadius: 10 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: tone.bg, color: tone.color, flexShrink: 0, whiteSpace: "nowrap" }}>{e.category}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.label}</div>
                  <div style={{ fontSize: 10, color: C.label }}>{fmtDate(e.date)}{e.phaseIndex !== null ? ` · ${phases[e.phaseIndex]?.name}` : ""}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.ink, flexShrink: 0, ...NUM }}>{fmtMoney(e.amount)}</span>
              </div>
            );
          })}
        </div>

        {formOpen ? (
          <div style={{ flexShrink: 0, padding: "13px 14px", background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 12, display: "flex", flexDirection: "column", gap: 9 }}>
            <input
              value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              placeholder="e.g. AWS hosting — July" autoFocus
              style={{ width: "100%", fontSize: 12.5, padding: "8px 10px", borderRadius: 9, border: `1px solid ${C.border}`, outline: "none", fontFamily: "inherit", color: C.ink }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 8 }}>
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as ExpenseCategory })} style={{ fontSize: 12, padding: "8px 9px", borderRadius: 9, border: `1px solid ${C.border}`, outline: "none", fontFamily: "inherit", color: C.ink, background: C.card }}>
                {EXPENSE_CATEGORIES.filter((c) => c !== "Developer Payment").map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" value={draft.amount || ""} onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) || 0 })} placeholder="Amount" style={{ fontSize: 12, padding: "8px 9px", borderRadius: 9, border: `1px solid ${C.border}`, outline: "none", fontFamily: "inherit", color: C.ink, ...NUM }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={submit} disabled={!draft.label.trim() || draft.amount <= 0} className="bp-gradient-btn" style={{ flex: 1, fontSize: 12.5, fontWeight: 700, padding: "9px", borderRadius: 9, background: C.forest, color: C.mint, border: "none", cursor: draft.label.trim() && draft.amount > 0 ? "pointer" : "not-allowed", opacity: draft.label.trim() && draft.amount > 0 ? 1 : 0.5 }}>Add expense</button>
              <button onClick={() => setFormOpen(false)} style={{ fontSize: 12.5, fontWeight: 600, padding: "9px 14px", borderRadius: 9, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setFormOpen(true)} style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", fontSize: 12.5, fontWeight: 700, padding: "10px", borderRadius: 10, background: C.tint, border: `1px dashed ${C.forest}`, color: C.forest, cursor: "pointer" }}>
            <Plus size={13} weight="bold" /> Log hosting, domain, tools, or API cost
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Project detail view                                         */
/* ═══════════════════════════════════════════════════════ */
function ProjectDetail({
  bp, onUpdate, onBack, onViewBlueprint, onNavigateNetwork, onMessage, stripeConnected, onNavigateSettingsPayment,
}: {
  bp: ProjectBlueprint;
  onUpdate: (mutate: (b: Blueprint) => Blueprint) => void;
  onBack: () => void;
  onViewBlueprint?: (id: string) => void;
  onNavigateNetwork?: () => void;
  onMessage?: (contact: FounderNetworkMessageTarget) => void;
  stripeConnected: boolean;
  onNavigateSettingsPayment?: () => void;
}) {
  const content = buildBlueprintContent(bp);
  const health = computeProjectHealth(content, bp.project);
  const activeIdx = bp.project.phaseStates.findIndex((ps) => ps.status !== "Complete");
  const allComplete = activeIdx === -1;

  const [viewedPhaseIdx, setViewedPhaseIdx] = useState(() => (activeIdx === -1 ? Math.max(0, bp.project.phaseStates.length - 1) : activeIdx));
  const [payModalPhase, setPayModalPhase] = useState<number | null>(null);
  const [addDevTarget, setAddDevTarget] = useState<{ phaseIdx: number; dev: FounderContactProfile } | null>(null);
  const [removeDevPhase, setRemoveDevPhase] = useState<number | null>(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState<FounderContactProfile | null>(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueDraft, setIssueDraft] = useState<{ title: string; description: string; priority: ProjectIssue["priority"]; phaseIndex: number | null }>({ title: "", description: "", priority: "Medium", phaseIndex: null });
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [deadlineDraft, setDeadlineDraft] = useState<{ note: string; priority: ProjectDeadline["priority"]; phaseIndex: number | null; date: string }>({ note: "", priority: "Medium", phaseIndex: null, date: "" });
  const [spendModalOpen, setSpendModalOpen] = useState(false);
  const [budgetEditPhase, setBudgetEditPhase] = useState<number | null>(null);
  const [deadlineEditPhase, setDeadlineEditPhase] = useState<number | null>(null);
  const [newDeliverable, setNewDeliverable] = useState("");
  const [connections, setConnections] = useState<Record<string, boolean>>(() => readNetworkConnections());
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2200); };

  const updateProject = (mutate: (p: ProjectState) => ProjectState) => {
    onUpdate((b) => {
      const next = mutate(b.project!);
      return { ...b, project: { ...next, status: deriveProjectStatus(next) } };
    });
  };
  const updatePhase = (i: number, mutate: (ps: ProjectPhaseState) => ProjectPhaseState) => {
    updateProject((p) => ({ ...p, phaseStates: p.phaseStates.map((ps, j) => (j === i ? mutate(ps) : ps)) }));
  };

  const startPhase = (phaseIdx: number) => {
    updatePhase(phaseIdx, (ps) => ({ ...ps, status: "In Progress", history: [...ps.history, { label: "Phase started", date: todayISO() }] }));
    showToast(`${content.phases[phaseIdx].name} started`);
  };

  const completePhase = (phaseIdx: number) => {
    updatePhase(phaseIdx, (ps) => ({ ...ps, status: "Complete", history: [...ps.history, { label: "Phase completed", date: todayISO() }] }));
    showToast(`${content.phases[phaseIdx].name} marked complete`);
  };

  const reopenPhase = (phaseIdx: number) => {
    updatePhase(phaseIdx, (ps) => ({ ...ps, status: "In Progress", history: [...ps.history, { label: "Phase re-opened", date: todayISO() }] }));
    showToast(`${content.phases[phaseIdx].name} re-opened`);
  };

  const toggleDeliverable = (phaseIdx: number, delivIdx: number) => {
    updatePhase(phaseIdx, (ps) => {
      if (ps.status === "Not Started") return ps;   // nothing is checkable before the phase actually starts
      const deliverables = ps.deliverables.map((d, k) => (k === delivIdx ? { ...d, done: !d.done } : d));
      const allDone = deliverables.length > 0 && deliverables.every((d) => d.done);
      const status = allDone ? "Complete" : ps.status === "Complete" ? "In Progress" : ps.status;
      const verb = deliverables[delivIdx].done ? "Checked off" : "Unchecked";
      return { ...ps, deliverables, status, history: [...ps.history, { label: `${verb}: ${deliverables[delivIdx].text}`, date: todayISO() }] };
    });
  };
  const addDeliverable = (phaseIdx: number, text: string) => {
    if (!text.trim()) return;
    updatePhase(phaseIdx, (ps) => ({ ...ps, deliverables: [...ps.deliverables, { text: text.trim(), done: false }], history: [...ps.history, { label: `Added deliverable: ${text.trim()}`, date: todayISO() }] }));
    setNewDeliverable("");
  };
  const removeDeliverable = (phaseIdx: number, delivIdx: number) => {
    updatePhase(phaseIdx, (ps) => ({ ...ps, deliverables: ps.deliverables.filter((_, k) => k !== delivIdx) }));
  };

  const setPhaseDeadline = (phaseIdx: number, date: string) => {
    updatePhase(phaseIdx, (ps) => ({ ...ps, deadline: date || null }));
    setDeadlineEditPhase(null);
  };

  const requestAssignDeveloper = (phaseIdx: number, dev: FounderContactProfile) => setAddDevTarget({ phaseIdx, dev });
  const confirmAssignDeveloper = (amount: number) => {
    if (!addDevTarget) return;
    const { phaseIdx, dev } = addDevTarget;
    updatePhase(phaseIdx, (ps) => ({
      ...ps,
      assignment: { developerId: dev.id, developerName: dev.name, developerInitials: dev.initials, hiredAt: todayISO(), amountAgreed: amount, amountPaid: 0, payments: [] },
      history: [...ps.history, { label: `Hired ${dev.name} — agreed ${fmtMoney(amount)}`, date: todayISO() }],
    }));
    setAddDevTarget(null);
    showToast(`${dev.name} hired for ${content.phases[phaseIdx].name}`);
  };

  const requestConnect = (dev: FounderContactProfile) => {
    writeNetworkConnection(dev.id);
    setConnections((c) => ({ ...c, [dev.id]: true }));
    showToast(`Connected with ${dev.name}`);
  };
  const handleToggleDeveloperConnection = (dev: FounderContactProfile) => {
    const next = !connections[dev.id];
    if (next) writeNetworkConnection(dev.id);
    setConnections((c) => ({ ...c, [dev.id]: next }));
  };

  const updatePhaseBudget = (phaseIdx: number, amount: number) => {
    updatePhase(phaseIdx, (ps) => ({ ...ps, budget: Math.max(0, amount) }));
    setBudgetEditPhase(null);
  };

  const addExpense = (expense: Omit<ProjectExpense, "id">) => {
    updateProject((p) => ({ ...p, expenses: [{ ...expense, id: `exp-${Date.now()}` }, ...p.expenses] }));
  };

  const confirmRemoveDeveloper = (reason: string) => {
    if (removeDevPhase === null || !reason.trim()) return;
    const phaseIdx = removeDevPhase;
    const assignment = bp.project.phaseStates[phaseIdx].assignment;
    if (!assignment) { setRemoveDevPhase(null); return; }
    updatePhase(phaseIdx, (ps) => ({
      ...ps, assignment: null, status: "Not Started",
      removals: [...ps.removals, { developerId: assignment.developerId, developerName: assignment.developerName, reason: reason.trim(), amountPaid: assignment.amountPaid, date: todayISO() }],
      history: [...ps.history, { label: `Removed ${assignment.developerName} — ${reason.trim()}`, date: todayISO() }],
    }));
    setRemoveDevPhase(null);
    showToast(`${assignment.developerName} removed from ${content.phases[phaseIdx].name}`);
  };

  const sendPayment = (amount: number) => {
    if (payModalPhase === null || amount <= 0) return;
    const phaseIdx = payModalPhase;
    const devName = bp.project.phaseStates[phaseIdx].assignment?.developerName ?? "the developer";
    updatePhase(phaseIdx, (ps) => (ps.assignment ? {
      ...ps,
      assignment: { ...ps.assignment, amountPaid: ps.assignment.amountPaid + amount, payments: [...ps.assignment.payments, { amount, date: todayISO() }] },
      totalPaid: ps.totalPaid + amount,
      history: [...ps.history, { label: `${fmtMoney(amount)} paid to ${devName}`, date: todayISO() }],
    } : ps));
    addExpense({ label: `Payment to ${devName} — ${content.phases[phaseIdx].name}`, category: "Developer Payment", amount, date: todayISO(), phaseIndex: phaseIdx });
    setPayModalPhase(null);
    showToast(`${fmtMoney(amount)} paid to ${devName}`);
  };

  const addIssue = () => {
    if (!issueDraft.title.trim()) return;
    const issue: ProjectIssue = {
      id: `iss-${Date.now()}`, title: issueDraft.title.trim(), description: issueDraft.description.trim(),
      priority: issueDraft.priority, status: "Open", phaseIndex: issueDraft.phaseIndex, createdAt: todayISO(),
      history: [{ label: "Issue raised", date: todayISO() }],
    };
    updateProject((p) => ({ ...p, issues: [issue, ...p.issues] }));
    setIssueModalOpen(false);
    setIssueDraft({ title: "", description: "", priority: "Medium", phaseIndex: null });
    showToast("Issue raised");
  };
  const setIssueStatus = (id: string, status: ProjectIssue["status"]) => {
    updateProject((p) => ({
      ...p,
      issues: p.issues.map((i) => (i.id === id ? { ...i, status, history: [...i.history, { label: `Marked ${status}`, date: todayISO() }] } : i)),
    }));
  };

  const addDeadline = () => {
    if (!deadlineDraft.note.trim() || !deadlineDraft.date) return;
    const deadline: ProjectDeadline = {
      id: `dl-${Date.now()}`, note: deadlineDraft.note.trim(), priority: deadlineDraft.priority,
      phaseIndex: deadlineDraft.phaseIndex, date: deadlineDraft.date, status: "Pending", createdAt: todayISO()
    };
    updateProject((p) => ({ ...p, deadlines: [deadline, ...p.deadlines] }));
    setDeadlineModalOpen(false);
    setDeadlineDraft({ note: "", priority: "Medium", phaseIndex: null, date: "" });
    showToast("Deadline set");
  };
  const setDeadlineStatus = (id: string, status: ProjectDeadline["status"]) => {
    updateProject((p) => ({
      ...p,
      deadlines: p.deadlines.map((dl) => (dl.id === id ? { ...dl, status } : dl)),
    }));
  };

  const verdictTone = health.verdict === "On track" ? "mint" : health.verdict === "Attention needed" ? "amber" : "red";
  const completion = health.deliverables.total ? Math.round((health.deliverables.done / health.deliverables.total) * 100) : 0;
  const today = todayISO();

  /* Sequential pipeline: exactly one phase is actionable at a time.
     Everything before it is collapsed as done; everything after is
     locked until the phase ahead of it completes. */
  const openIssues = bp.project.issues.filter((i) => i.status !== "Resolved").length;

  const upcoming = bp.project.phaseStates
    .map((ps, i) => ({ ps, phase: content.phases[i] }))
    .filter((x) => x.ps.assignment && x.ps.status !== "Complete")
    .sort((a, b) => (a.ps.deadline || "").localeCompare(b.ps.deadline || ""));

  return (
    <motion.div className="blueprint-scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: "100%", overflowY: "auto", maxWidth: 1240, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14, paddingRight: 4 }}>
      {/* Action bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} className="bp-primary-btn">
          <ArrowLeft size={15} weight="bold" /> Projects
        </button>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{bp.name}</span>
        <Chip tone={bp.project.status === "IN_DEVELOPMENT" ? "mint" : bp.project.status === "ONBOARDING" ? "amber" : "neutral"}>{PROJECT_STATUS_LABEL[bp.project.status]}</Chip>
        <Chip tone={verdictTone as "mint" | "amber" | "red"} icon={health.verdict === "On track" ? <CheckCircle size={11} weight="fill" /> : <Warning size={11} weight="fill" />}>{health.verdict}</Chip>
        {onViewBlueprint && (
          <button onClick={() => onViewBlueprint(bp.id)} className="bp-primary-btn" style={{ marginLeft: "auto" }}>
            View full spec <CaretRight size={12} weight="bold" />
          </button>
        )}
      </div>

      {/* Summary band */}
      <div style={cardStyle({ padding: "16px 24px", display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", flexShrink: 0, background: `linear-gradient(135deg, #e8f5ef 0%, #f4faf7 100%)`, border: `1px solid ${C.mint}`, boxShadow: "0 8px 32px -8px rgba(66, 132, 117, 0.15)" })}>
        <div style={{ flex: "1 1 300px", minWidth: 260 }}>
          <Kicker>Project Summary · Started {fmtDate(bp.project.startedAt)}</Kicker>
          <p className="line-clamp-2" style={{ fontSize: 13, color: C.body, lineHeight: 1.6, margin: "5px 0 0" }}>{bp.ideaDesc}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            <Chip tone="mint">{bp.industry}</Chip>
            <Chip>{content.phases.length} milestones</Chip>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 26, flexShrink: 0 }}>
          <ViabilityGauge score={completion} label="COMPLETE" size={96} />
          <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "12px 30px" }}>
            <button onClick={() => setSpendModalOpen(true)} style={{ textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, fontSize: 16, fontWeight: 800, color: C.ink, lineHeight: 1.1, ...NUM }}>
                Total spent: {fmtMoney(health.budget.spent)} <CaretRight size={10} style={{ color: C.teal }} />
              </div>
              <div style={{ fontSize: 10, color: C.teal, marginTop: 2, whiteSpace: "nowrap", fontWeight: 600 }}>view history</div>
            </button>
            {[
              { v: `${health.deliverables.done}/${health.deliverables.total}`, s: "deliverables done" },
              { v: allComplete ? "All phases" : `Phase ${activeIdx + 1} of ${content.phases.length}`, s: allComplete ? "complete" : content.phases[activeIdx].name },
              { v: String(openIssues), s: `open issue${openIssues === 1 ? "" : "s"}` },
            ].map((x) => (
              <div key={x.s}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, lineHeight: 1.1, ...NUM }}>{x.v}</div>
                <div style={{ fontSize: 10, color: C.label, marginTop: 2, whiteSpace: "nowrap" }}>{x.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workspace Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, alignItems: "start" }}>
        
        {/* LEFT COLUMN: Phase focus */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          
          <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 2 }}>Development Pipeline</div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {content.phases.map((phase, i) => {
              const ps = bp.project.phaseStates[i];
              const isSelected = viewedPhaseIdx === i;
              const isActive = i === activeIdx;
              const isLocked = !allComplete && i > activeIdx;
              const isBudgetEdit = budgetEditPhase === i;
              const isDeadlineEdit = deadlineEditPhase === i;
              const overdue = ps.assignment && ps.status !== "Complete" && ps.deadline && ps.deadline < today;
              const doneCount = ps.deliverables.filter(d => d.done).length;
              
              const statusTag = ps.status === "Complete" ? "Completed" : (isActive ? (ps.status === "In Progress" ? "In Progress" : "Not Started") : "Upcoming");
              const tone = statusTag === "Completed" ? "mint" : statusTag === "In Progress" ? "amber" : statusTag === "Upcoming" ? "neutral" : "dark";

              const budgetChip = isBudgetEdit ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="number" autoFocus defaultValue={ps.budget}
                    onKeyDown={(e) => { if (e.key === "Enter") updatePhaseBudget(i, Number((e.target as HTMLInputElement).value) || ps.budget); if (e.key === "Escape") setBudgetEditPhase(null); }}
                    onBlur={(e) => updatePhaseBudget(i, Number(e.target.value) || ps.budget)}
                    style={{ width: 76, fontSize: 11.5, padding: "3px 6px", borderRadius: 7, border: `1px solid ${C.forest}`, outline: "none", fontFamily: "inherit", color: C.ink, background: "#fff", ...NUM }}
                  />
                </span>
              ) : (
                <Chip>{fmtMoney(ps.budget)}<PencilSimple size={9} weight="bold" style={{ marginLeft: 4, cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setBudgetEditPhase(i); }} /></Chip>
              );

              const deadlineChip = isDeadlineEdit ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="date" autoFocus defaultValue={ps.deadline || ""}
                    onKeyDown={(e) => { if (e.key === "Enter") setPhaseDeadline(i, (e.target as HTMLInputElement).value); if (e.key === "Escape") setDeadlineEditPhase(null); }}
                    onBlur={(e) => setPhaseDeadline(i, e.target.value)}
                    style={{ width: 110, fontSize: 11.5, padding: "3px 6px", borderRadius: 7, border: `1px solid ${C.forest}`, outline: "none", fontFamily: "inherit", color: C.ink, background: "#fff", ...NUM }}
                  />
                </span>
              ) : (
                <Chip icon={<CalendarBlank size={11} weight="fill" />} tone={overdue ? "red" : "neutral"}>
                  {ps.deadline ? fmtDate(ps.deadline) : "No deadline set"}
                  <PencilSimple size={9} weight="bold" style={{ marginLeft: 4, cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setDeadlineEditPhase(i); }} />
                </Chip>
              );

              return (
                <div key={phase.name} style={{ background: isSelected ? "#fff" : C.tint, border: isSelected ? `1.5px solid ${C.mint}` : `1px solid ${C.borderSoft}`, borderRadius: 14, overflow: "hidden", transition: "all 0.2s", boxShadow: isSelected ? "0 6px 18px -8px rgba(66,132,117,0.22)" : "none" }}>
                  
                  {/* Phase Header (Accordion Toggle) */}
                  <div 
                    onClick={() => setViewedPhaseIdx(i)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "16px 20px", background: isSelected ? `linear-gradient(90deg, #e8f5ef 0%, #f4faf7 100%)` : "transparent", borderBottom: isSelected ? `1px solid ${C.borderSoft}` : "none", cursor: "pointer" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ width: 26, height: 26, borderRadius: 999, background: isSelected ? C.forest : C.card, color: isSelected ? C.mint : C.muted, border: isSelected ? "none" : `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, ...NUM }}>{i + 1}</div>
                      <span style={{ fontSize: 14.5, fontWeight: isSelected ? 800 : 700, color: isSelected ? C.ink : C.body }}>{phase.name}</span>
                      <Chip tone={tone}>{statusTag}</Chip>
                      {isSelected && (
                        <>
                          {budgetChip}
                          {deadlineChip}
                        </>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {isSelected && (
                        <>
                          {ps.status === "Not Started" && (
                            <button onClick={(e) => { e.stopPropagation(); startPhase(i); }} className="bp-primary-btn">
                              Start phase
                            </button>
                          )}
                          {ps.status === "In Progress" && (
                            <button onClick={(e) => { e.stopPropagation(); completePhase(i); }} className="bp-primary-btn">
                              <CheckCircle size={14} weight="fill" /> Complete phase
                            </button>
                          )}
                          {ps.status === "Complete" && (
                            <button onClick={(e) => { e.stopPropagation(); reopenPhase(i); }} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 9, background: "transparent", color: C.forest, border: `1px solid ${C.forest}`, cursor: "pointer" }}>
                              Re-open phase
                            </button>
                          )}
                        </>
                      )}
                      <CaretRight size={14} weight="bold" style={{ color: C.muted, transform: isSelected ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                    </div>
                  </div>

                  {/* Phase Body (Expanded) */}
                  <AnimatePresence initial={false}>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ padding: "20px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: C.forest, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                              Deliverables
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>
                              {doneCount}/{ps.deliverables.length} completed
                            </div>
                          </div>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                            {ps.deliverables.map((d, di) => (
                              <div key={di} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 12, background: d.done ? "#e8f5ef" : C.card, border: `1px solid ${d.done ? "#cfeadd" : C.borderSoft}`, transition: "background 0.2s" }}>
                                <button
                                  onClick={() => toggleDeliverable(i, di)}
                                  disabled={ps.status === "Not Started"}
                                  style={{ marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 6, background: d.done ? C.forest : "transparent", border: d.done ? "none" : `1.5px solid ${C.border}`, cursor: ps.status === "Not Started" ? "not-allowed" : "pointer", opacity: ps.status === "Not Started" ? 0.5 : 1, flexShrink: 0 }}
                                >
                                  {d.done && <Check size={14} weight="bold" style={{ color: C.mint }} />}
                                </button>
                                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                                  <span style={{ fontSize: 13.5, fontWeight: d.done ? 600 : 500, color: d.done ? "#1d6e47" : C.ink, textDecoration: d.done ? "line-through" : "none", lineHeight: 1.5, wordBreak: "break-word" }}>
                                    {d.text}
                                  </span>
                                </div>
                                <button onClick={() => removeDeliverable(i, di)} style={{ padding: 4, background: "transparent", border: "none", cursor: "pointer", color: C.muted, opacity: 0.6 }} className="hover:opacity-100 transition-opacity">
                                  <X size={15} weight="bold" />
                                </button>
                              </div>
                            ))}
                            
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 12, background: C.tint, border: `1px dashed ${C.border}` }}>
                              <Plus size={16} style={{ color: C.muted, marginTop: 4, flexShrink: 0 }} />
                              <textarea
                                value={newDeliverable} onChange={(e) => setNewDeliverable(e.target.value)}
                                onKeyDown={(e) => { 
                                  if (e.key === "Enter" && !e.shiftKey) { 
                                    e.preventDefault();
                                    addDeliverable(i, newDeliverable); 
                                  } 
                                }}
                                placeholder="Add a new deliverable (Shift+Enter for newline)"
                                rows={2}
                                style={{ flex: 1, fontSize: 13, padding: "2px", background: "transparent", border: "none", outline: "none", color: C.ink, resize: "none", fontFamily: "inherit" }}
                              />
                            </div>
                          </div>

                          <div style={{ fontSize: 11, fontWeight: 800, color: C.forest, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                            Phase Assignment
                          </div>
                          {ps.assignment ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "14px 18px", background: C.card, border: `1px solid ${C.borderSoft}`, borderRadius: 12 }}>
                              <Avatar initials={ps.assignment.developerInitials} size={36} />
                              <div style={{ flex: 1, minWidth: 150 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{ps.assignment.developerName}</div>
                                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>Hired {fmtDate(ps.assignment.hiredAt)}</div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                                <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink, ...NUM }}>
                                  {fmtMoney(ps.assignment.amountPaid)} / {fmtMoney(ps.assignment.amountAgreed)} paid
                                </div>
                                <div style={{ fontSize: 10.5, color: C.label, fontWeight: 600 }}>
                                  {ps.assignment.amountPaid >= ps.assignment.amountAgreed ? "Paid in full" : (ps.assignment.amountPaid > 0 ? "Partially paid" : "Not paid yet")}
                                </div>
                              </div>
                              <button onClick={() => setPayModalPhase(i)} className="bp-primary-btn">Pay</button>
                              {ps.status !== "Complete" && (
                                <button onClick={() => setRemoveDevPhase(i)} style={{ fontSize: 11.5, fontWeight: 600, color: C.red, background: "transparent", border: "none", cursor: "pointer", padding: "6px 8px" }}>Remove</button>
                              )}
                            </div>
                          ) : ps.status === "Complete" ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "#f8faf8", border: `1px solid ${C.borderSoft}`, borderRadius: 12 }}>
                              <CheckCircle size={18} weight="fill" style={{ color: C.mint, flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>Completed without a network developer</div>
                                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1, fontWeight: 500 }}>Re-open this phase if you need to hire someone.</div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: C.card, border: `1.5px dashed ${C.forest}`, borderRadius: 12 }}>
                              <User size={18} weight="duotone" style={{ color: C.teal, flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>No developer assigned</div>
                                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1, fontWeight: 500 }}>Pick someone from the developers panel to staff this phase.</div>
                              </div>
                              <button onClick={() => { document.getElementById("dev-panel")?.scrollIntoView({ behavior: "smooth" }); }} className="bp-primary-btn">Find matches</button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
        {/* RIGHT COLUMN: Management rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Inline Developer Profile Detail */}
          <AnimatePresence mode="wait">
            {selectedDeveloper && (
              <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} style={{ overflow: "hidden" }}>
                <NetworkProfileDetailScreen
                  profile={selectedDeveloper}
                  onBack={() => setSelectedDeveloper(null)}
                  connected={Boolean(connections[selectedDeveloper.id])}
                  onToggleConnection={() => handleToggleDeveloperConnection(selectedDeveloper)}
                  onMessage={onMessage}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Health */}
          <div style={cardStyle({ padding: "16px 20px", flexShrink: 0, borderLeft: `3px solid ${verdictTone === "mint" ? C.mint : verdictTone === "amber" ? C.amber : C.red}` })}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: C.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShieldCheck size={13} weight="duotone" style={{ color: C.teal }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>Project Health</span>
              <span style={{ marginLeft: "auto" }}><Chip tone={verdictTone as "mint" | "amber" | "red"}>{health.verdict}</Chip></span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: C.muted }}>Budget deployed</span>
                  <span style={{ color: C.ink, fontWeight: 700, ...NUM }}>{health.budget.pct}% · {fmtMoney(health.budget.spent)}</span>
                </div>
                <MeterBar value={health.budget.pct} height={4} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: C.muted }}>Deliverables</span>
                  <span style={{ color: C.ink, fontWeight: 700, ...NUM }}>{health.deliverables.done}/{health.deliverables.total}</span>
                </div>
                <MeterBar value={completion} height={4} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: C.muted }}>Schedule</span>
                <span style={{ color: health.timeline.delayedCount > 0 ? C.red : C.success, fontWeight: 700 }}>
                  {health.timeline.delayedCount > 0 ? `${health.timeline.delayedCount} phase${health.timeline.delayedCount === 1 ? "" : "s"} overdue` : "On schedule"}
                </span>
              </div>
              {health.developers.map((d) => (
                <div key={d.developerId} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{d.developerName}</span>
                  <span style={{ color: d.phasesOverdue > 0 ? C.red : C.success, fontWeight: 700, ...NUM }}>{d.phasesComplete}/{d.phasesAssigned} phases{d.phasesOverdue > 0 ? ` · ${d.phasesOverdue} late` : ""}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Issues */}
          <div style={cardStyle({ padding: "16px 20px", flexShrink: 0 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: C.redBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bug size={13} weight="duotone" style={{ color: C.red }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>Issues & Fixes</span>
              {openIssues > 0 && <Chip tone="red">{openIssues} open</Chip>}
              <button onClick={() => setIssueModalOpen(true)} className="bp-primary-btn" style={{ marginLeft: "auto" }}><Plus size={11} weight="bold" /> New</button>
            </div>
            {bp.project.issues.length === 0 ? (
              <div style={{ fontSize: 11.5, color: C.muted }}>No issues raised — everything shipped so far matches the spec.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {bp.project.issues.map((iss) => (
                  <div key={iss.id} style={{ padding: "12px 14px", background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: iss.description ? 6 : 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{iss.title}</span>
                      <Chip tone={issueTone(iss.priority)}>{iss.priority}</Chip>
                      <Chip tone={issueStatusTone(iss.status)}>{iss.status}</Chip>
                    </div>
                    {iss.description && <p className="line-clamp-2" style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.5, margin: "0 0 8px" }}>{iss.description}</p>}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {iss.phaseIndex !== null && <span style={{ fontSize: 10.5, color: C.label }}>{content.phases[iss.phaseIndex]?.name}</span>}
                      <span style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                        {iss.status !== "In Progress" && <button onClick={() => setIssueStatus(iss.id, "In Progress")} style={{ fontSize: 11, fontWeight: 600, color: C.teal, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>In progress</button>}
                        {iss.status !== "Resolved" && <button onClick={() => setIssueStatus(iss.id, "Resolved")} style={{ fontSize: 11, fontWeight: 600, color: C.success, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>Resolve</button>}
                        {iss.status !== "Open" && <button onClick={() => setIssueStatus(iss.id, "Open")} style={{ fontSize: 11, fontWeight: 600, color: C.muted, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>Reopen</button>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deadlines */}
          <div style={cardStyle({ padding: "16px 20px", flexShrink: 0 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: C.amberBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CalendarBlank size={13} weight="duotone" style={{ color: C.amber }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>Upcoming Deadlines</span>
              <button onClick={() => setDeadlineModalOpen(true)} className="bp-primary-btn" style={{ marginLeft: "auto" }}><Plus size={11} weight="bold" /> New</button>
            </div>
            {bp.project.deadlines.length === 0 ? (
              <div style={{ fontSize: 11.5, color: C.muted }}>No custom deadlines defined.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {bp.project.deadlines.map((dl) => {
                  const late = dl.status === "Pending" && dl.date < today;
                  return (
                    <div key={dl.id} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px 14px", background: C.tint, border: `1px solid ${C.borderSoft}`, borderRadius: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{dl.note}</span>
                        <Chip tone={dl.priority === "High" ? "red" : dl.priority === "Medium" ? "amber" : "mint"}>{dl.priority}</Chip>
                        <Chip tone={dl.status === "Pending" ? "amber" : dl.status === "Met" ? "mint" : "red"}>{dl.status}</Chip>
                        {late && <Chip tone="red">Overdue</Chip>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {dl.phaseIndex !== null && <span style={{ fontSize: 10.5, color: C.label }}>{content.phases[dl.phaseIndex]?.name}</span>}
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: C.muted, ...NUM }}>
                          <Clock size={11} /> {fmtDate(dl.date)}
                        </span>
                        <span style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                          {dl.status !== "Met" && <button onClick={() => setDeadlineStatus(dl.id, "Met")} style={{ fontSize: 11, fontWeight: 600, color: C.success, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>Mark Met</button>}
                          {dl.status !== "Missed" && <button onClick={() => setDeadlineStatus(dl.id, "Missed")} style={{ fontSize: 11, fontWeight: 600, color: C.red, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>Mark Missed</button>}
                          {dl.status !== "Pending" && <button onClick={() => setDeadlineStatus(dl.id, "Pending")} style={{ fontSize: 11, fontWeight: 600, color: C.muted, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>Reopen</button>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Developers Panel */}
          <div id="dev-panel">
            <DevelopersPanel
              phases={content.phases}
              selectedPhase={viewedPhaseIdx}
              onSelectPhase={setViewedPhaseIdx}
              connections={connections}
              onConnect={requestConnect}
              onHire={requestAssignDeveloper}
              onMessage={onMessage}
              onViewProfile={setSelectedDeveloper}
              onBrowseNetwork={onNavigateNetwork}
            />
          </div>

        </div>
      </div>

      {/* Payment modal */}
      <AnimatePresence>
        {payModalPhase !== null && (
          <PaymentModal
            developerName={bp.project.phaseStates[payModalPhase].assignment?.developerName ?? "developer"}
            amountAgreed={bp.project.phaseStates[payModalPhase].assignment?.amountAgreed ?? 0}
            amountPaid={bp.project.phaseStates[payModalPhase].assignment?.amountPaid ?? 0}
            feePct={content.costModel.platformFeePct}
            stripeConnected={stripeConnected}
            onNavigateSettingsPayment={() => { setPayModalPhase(null); onNavigateSettingsPayment?.(); }}
            onSend={sendPayment}
            onClose={() => setPayModalPhase(null)}
          />
        )}
      </AnimatePresence>

      {/* Add Developer Modal */}
      <AnimatePresence>
        {addDevTarget && (
          <AddDeveloperModal
            developer={addDevTarget.dev}
            defaultAmount={bp.project.phaseStates[addDevTarget.phaseIdx].budget}
            onConfirm={confirmAssignDeveloper}
            onClose={() => setAddDevTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Remove Developer Modal */}
      <AnimatePresence>
        {removeDevPhase !== null && bp.project.phaseStates[removeDevPhase].assignment && (
          <RemoveDeveloperModal
            developerName={bp.project.phaseStates[removeDevPhase].assignment!.developerName}
            phaseName={content.phases[removeDevPhase].name}
            amountPaid={bp.project.phaseStates[removeDevPhase].assignment!.amountPaid}
            onConfirm={confirmRemoveDeveloper}
            onClose={() => setRemoveDevPhase(null)}
          />
        )}
      </AnimatePresence>

      {/* Issue modal */}
      <AnimatePresence>
        {issueModalOpen && (
          <IssueModal
            phases={content.phases}
            draft={issueDraft}
            onChange={setIssueDraft}
            onSubmit={addIssue}
            onClose={() => setIssueModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Deadline modal */}
      <AnimatePresence>
        {deadlineModalOpen && (
          <DeadlineModal
            phases={content.phases}
            draft={deadlineDraft}
            onChange={setDeadlineDraft}
            onSubmit={addDeadline}
            onClose={() => setDeadlineModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Spend history modal */}
      <AnimatePresence>
        {spendModalOpen && (
          <SpendHistoryModal
            expenses={bp.project.expenses}
            phases={content.phases}
            total={health.budget.total}
            spent={health.budget.spent}
            onAdd={addExpense}
            onClose={() => setSpendModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            style={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 90, display: "flex", alignItems: "center", gap: 8, background: C.forest, color: C.mint, fontSize: 13, fontWeight: 600, padding: "11px 20px", borderRadius: 12, boxShadow: "0 14px 40px rgba(11,34,27,0.42)" }}>
            <CheckCircle size={16} weight="fill" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>  );
}

/* ═══════════════════════════════════════════════════════ */
/* Main export                                                 */
/* ═══════════════════════════════════════════════════════ */
export function ProjectsTab({
  blueprints: rawBlueprints, onBlueprintsChange, onViewBlueprint, onNavigateNetwork, onMessage, stripeConnected, onNavigateSettingsPayment,
}: {
  blueprints: Blueprint[];
  onBlueprintsChange: (bps: Blueprint[]) => void;
  onViewBlueprint?: (id: string) => void;
  onNavigateNetwork?: () => void;
  onMessage?: (contact: FounderNetworkMessageTarget) => void;
  stripeConnected: boolean;
  onNavigateSettingsPayment?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectParam = searchParams.get("project");
  const [selectedId, setSelectedId] = useState<string | null>(projectParam ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(searchParams.toString());
    if (selectedId) {
      if (p.get("project") !== selectedId) {
        p.set("project", selectedId);
        router.push(`?${p.toString()}`, { scroll: false });
      }
    } else {
      if (p.has("project")) {
        p.delete("project");
        router.push(`?${p.toString()}`, { scroll: false });
      }
    }
  }, [selectedId, router, searchParams]);

  // Backfills older localStorage records (started before `expenses`/phase
  // `budget` existed) so nothing downstream ever has to guard for it.
  const blueprints = rawBlueprints.map((b) =>
    b.project ? { ...b, project: normalizeProjectState(buildBlueprintContent(b), b.project) } : b
  );
  const blueprintsRef = useRef(blueprints);
  blueprintsRef.current = blueprints;

  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2200); };

  const updateBlueprint = (id: string, mutate: (b: Blueprint) => Blueprint) => {
    onBlueprintsChange(blueprintsRef.current.map((b) => (b.id === id ? mutate(b) : b)));
  };

  const projectBlueprints = blueprints.filter((b): b is ProjectBlueprint => Boolean(b.project));
  const startableBlueprints = blueprints.filter((b) => !b.project);

  const startProject = (bp: Blueprint) => {
    const content = buildBlueprintContent(bp);
    updateBlueprint(bp.id, (b) => ({ ...b, isPublic: false, status: "DRAFT", project: initProjectState(content) }));
    setPickerOpen(false);
    setSelectedId(bp.id);
    showToast(`${bp.name} started as a project`);
  };

  const selected = selectedId ? projectBlueprints.find((b) => b.id === selectedId) : undefined;

  if (selected) {
    return (
      <div className="h-full" style={{ background: C.page, padding: "16px 28px 18px", overflow: "hidden" }}>
        <ProjectDetail
          bp={selected}
          onUpdate={(mutate) => updateBlueprint(selected.id, mutate)}
          onBack={() => setSelectedId(null)}
          onViewBlueprint={onViewBlueprint}
          onNavigateNetwork={onNavigateNetwork}
          onMessage={onMessage}
          stripeConnected={stripeConnected}
          onNavigateSettingsPayment={onNavigateSettingsPayment}
        />
      </div>
    );
  }

  // KPI strip
  const summaries = projectBlueprints.map((bp) => {
    const content = buildBlueprintContent(bp);
    return { bp, content, health: computeProjectHealth(content, bp.project) };
  });
  const activeCount = summaries.filter((s) => s.bp.project.status !== "COMPLETED").length;
  const totalDeployed = summaries.reduce((s, x) => s + x.health.budget.spent, 0);
  const avgCompletion = summaries.length
    ? Math.round((summaries.reduce((s, x) => s + (x.health.deliverables.total ? x.health.deliverables.done / x.health.deliverables.total : 0), 0) / summaries.length) * 100)
    : 0;
  const weekAhead = addWeeksISO(1);
  const today = todayISO();
  const deadlinesThisWeek = summaries.reduce((count, x) => count + x.bp.project.phaseStates.filter((ps) => ps.deadline && ps.status !== "Complete" && ps.deadline >= today && ps.deadline <= weekAhead).length, 0);

  const kpis = [
    { label: "Active Projects", value: String(activeCount), icon: <Buildings size={16} weight="duotone" style={{ color: C.teal }} /> },
    { label: "Budget Deployed", value: fmtMoney(totalDeployed), icon: <Coins size={16} weight="duotone" style={{ color: C.success }} /> },
    { label: "Avg. Completion", value: `${avgCompletion}%`, icon: <ChartBar size={16} weight="duotone" style={{ color: C.teal }} /> },
    { label: "Due This Week", value: String(deadlinesThisWeek), icon: <CalendarBlank size={16} weight="duotone" style={{ color: deadlinesThisWeek > 0 ? C.amber : C.teal }} /> },
  ];

  return (
    <div className="h-full overflow-y-auto blueprint-scroll" style={{ background: C.page, padding: "24px 28px 60px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <Kicker>Build Tracker</Kicker>
            <h1 style={{ fontSize: 27, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>Projects</h1>
            <p style={{ fontSize: 13.5, color: C.muted, marginTop: 6, maxWidth: 520 }}>
              Track everything you&apos;re building — assign a developer per phase, manage payments, and watch progress in real time.
            </p>
          </div>
          <button onClick={() => setPickerOpen(true)} className="bp-primary-btn" style={{ flexShrink: 0 }}>
            <Plus size={15} weight="bold" /> New Project
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {kpis.map((k) => (
            <div key={k.label} style={cardStyle({ padding: "16px 18px" })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Label>{k.label}</Label>{k.icon}
              </div>
              <div style={{ fontSize: 21, fontWeight: 800, color: C.ink }}>{k.value}</div>
            </div>
          ))}
        </div>

        {summaries.length === 0 ? (
          <div style={{ ...cardStyle({ padding: "48px 32px" }), display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14, border: `1.5px dashed ${C.border}` }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: C.tint, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Buildings size={24} weight="duotone" style={{ color: C.teal }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>No projects yet</div>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 6, maxWidth: 360 }}>Projects appear here once you start one from a blueprint — assign developers, track deliverables, and manage payments per phase.</p>
            </div>
            <button onClick={() => setPickerOpen(true)} className="bp-primary-btn">
              <Plus size={14} weight="bold" /> Start your first project
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {projectBlueprints.map((bp, i) => (
              <ProjectListCard key={bp.id} bp={bp} idx={i} onClick={() => setSelectedId(bp.id)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {pickerOpen && (
          <StartProjectModal blueprints={startableBlueprints} onPick={startProject} onClose={() => setPickerOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            style={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 90, display: "flex", alignItems: "center", gap: 8, background: C.forest, color: C.mint, fontSize: 13, fontWeight: 600, padding: "11px 20px", borderRadius: 12, boxShadow: "0 14px 40px rgba(11,34,27,0.42)" }}>
            <CheckCircle size={16} weight="fill" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
