"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Plus } from "@phosphor-icons/react";
import type { AIState } from "@/features/founder-dashboard/data/dashboard-overview-data";
// Use the real Blueprint type (superset) — the store passes real blueprints and
// buildBlueprintContent needs the full shape, not the local dashboard mock.
import type { Blueprint } from "@/features/blueprints/types";
import {
  computeMetrics,
  computePipeline,
  computeAIContent,
  type AIContentShape,
} from "@/features/founder-dashboard/data/dashboard-overview-data";
import { AIBriefingBanner } from "./ai-briefing-banner";
import { StatCard } from "./stat-card";
import { IdeaCard } from "./idea-card";
import { VentureHealthWidget } from "./venture-health-widget";
import { VentureRoadmapWidget } from "./venture-roadmap-widget";
import { DevPipelineWidget } from "./dev-pipeline-widget";
import { listProjects, deserialiseMilestones } from "@/features/projects/projects-api";
import { fetchApplicationCounts } from "@/features/projects/applications-api";
import { loadNetworkConnections } from "@/features/network/lib/network-api";
import { fetchMatchingDevelopers } from "@/features/network/lib/matching-api";
import { buildBlueprintContent, initProjectState } from "@/features/blueprints/blueprint-content";
import { currentPhaseIndex } from "@/features/projects/lib/project-helpers";

interface Props {
  profile: { firstName: string };
  onNavigateWorkspace: (forge?: boolean) => void;
  blueprints: Blueprint[];
  onViewBlueprint: (id: string) => void;
  profileComplete?: boolean;
}

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

  // Live backend stats
  const [activeProjectCount, setActiveProjectCount] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [applicationsInConversation, setApplicationsInConversation] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [incomingCount, setIncomingCount] = useState(0);
  const [connectedCount, setConnectedCount] = useState(0);
  const [hiredCount, setHiredCount] = useState(0);

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
        setTimeout(() => setCursorVisible(false), 1000);
      }
    }, 42);
    return () => clearInterval(iv);
  }, [name]);

  const loadLiveStats = useCallback(async () => {
    // Each data source is fetched and applied independently — a failure in
    // one (e.g. a transient network error) must never wipe out stats that
    // were successfully computed from the others.
    let projects: Awaited<ReturnType<typeof listProjects>> = [];
    try {
      projects = await listProjects();
    } catch {
      projects = [];
    }

    const activeProjects = projects.filter(
      (p) => p.status === "active" || p.status === "paused"
    );
    setActiveProjectCount(activeProjects.length);

    try {
      const appCountMap = await fetchApplicationCounts(blueprints.map((b) => b.id));
      let total = 0;
      for (const count of appCountMap.values()) total += count;
      setTotalApplications(total);
      // "In conversation" = applications that have a connection_id
      // fetchApplicationCounts only returns counts; inConversation not available here — set 0
      setApplicationsInConversation(0);
    } catch {
      // Non-fatal — leave application counts at their last known value.
    }

    try {
      const connectionState = await loadNetworkConnections();
      setConnectedCount(connectionState.connectedIds.length);
      setIncomingCount(connectionState.incomingIds.length);
    } catch {
      // Non-fatal — leave connection counts at their last known value.
    }

    // Hired = distinct developers actually assigned to a phase across active projects.
    try {
      const hiredIds = new Set<string>();
      for (const project of activeProjects) {
        const state = deserialiseMilestones(project.milestones);
        if (!state) continue;
        for (const ps of state.phaseStates) {
          if (ps.assignment?.developerId) hiredIds.add(ps.assignment.developerId);
        }
      }
      setHiredCount(hiredIds.size);
    } catch {
      // Non-fatal
    }

    // Matched = distinct developers matched (via /matching) against each active
    // project's current phase skillset, sourced from the project's own blueprint.
    try {
      const matchedIds = new Set<string>();
      await Promise.all(
        activeProjects.map(async (project) => {
          const blueprint = blueprints.find((b) => b.id === project.blueprint_id);
          if (!blueprint) return;
          const content = buildBlueprintContent(blueprint);
          const state = deserialiseMilestones(project.milestones) ?? initProjectState(content);
          const phaseIdx = currentPhaseIndex(state);
          const skillset = content.phases[phaseIdx]?.skillset ?? [];
          if (!skillset.length) return;
          try {
            const devs = await fetchMatchingDevelopers(skillset);
            devs.forEach((d) => matchedIds.add(d.id));
          } catch {
            // Non-fatal — skip this project's matches
          }
        })
      );
      setMatchedCount(matchedIds.size);
    } catch {
      // Non-fatal
    }
  }, [blueprints]);

  useEffect(() => {
    loadLiveStats();
  }, [loadLiveStats]);

  const liveData = {
    blueprints,
    activeProjectCount,
    totalApplications,
    applicationsInConversation,
  };

  const metrics = computeMetrics(liveData);
  const pipeline = computePipeline({ matchedCount, incomingCount, connectedCount, hiredCount });

  const topBlueprint = [...blueprints].sort((a, b) => b.viability - a.viability)[0];
  const aiState: AIState = !profileComplete
    ? "profile_incomplete"
    : topBlueprint?.viability >= 70
      ? "high_viability"
      : "recruiting";

  const aiContent = computeAIContent(aiState, {
    totalApplications,
    topViability: topBlueprint?.viability ?? 0,
    activeProjectCount,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
        background: "#f7f8f6",
        padding: "26px 30px 36px",
        gap: 18,
      }}
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
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
              fontSize: "1.65rem",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#1a2e26",
              lineHeight: 1.15,
              minHeight: "1.98rem",
            }}
          >
            {greeting}
            {cursorVisible && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: "1em",
                  background: "#89d7b7",
                  borderRadius: 1,
                  marginLeft: 2,
                  verticalAlign: "middle",
                  animation: "dashCursor 0.7s step-end infinite",
                }}
              />
            )}
          </h1>
          <p style={{ fontSize: 13.5, color: "#7a9e8e", marginTop: 6, lineHeight: 1.55 }}>
            You have{" "}
            <strong style={{ color: "#1a2e26" }}>
              {blueprints.length} venture{blueprints.length !== 1 ? "s" : ""}
            </strong>{" "}
            in motion,{" "}
            <strong style={{ color: "#1a2e26" }}>
              {totalApplications} developer {totalApplications !== 1 ? "matches" : "match"}
            </strong>
            , and active building momentum.
          </p>
        </div>

        {/* Single primary action */}
        <motion.button
          onClick={() => onNavigateWorkspace(true)}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(26,49,44,0.28)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="bp-gradient-btn"
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 20px",
            borderRadius: 13,
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
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
          overrideContent={aiContent}
        />
      </div>

      {/* ── Stat cards ── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, flexShrink: 0 }}
      >
        {metrics.map((m, i) => (
          <StatCard key={m.id} metric={m} index={i} />
        ))}
      </div>

      {/* ── Active Ideas ── */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#89d7b7" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1a2e26" }}>Active Ideas</span>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: "2px 8px",
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
            whileHover={{ x: 3 }}
            transition={{ duration: 0.15 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12.5,
              fontWeight: 600,
              color: "#428475",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
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
        <DevPipelineWidget pipeline={pipeline} />
      </div>

      {/* Footer note */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 4,
        }}
      >
        <span style={{ fontSize: 11.5, color: "#9ab4a4" }}>LaunchPad AI · Founder Workspace</span>
        <span style={{ fontSize: 11.5, color: "#9ab4a4" }}>
          {blueprints.length} idea{blueprints.length !== 1 ? "s" : ""} ·{" "}
          {blueprints.filter((b) => b.isPublic).length} active
        </span>
      </div>

      <style>{`
        @keyframes dashCursor { from, to { opacity: 1 } 50% { opacity: 0 } }
      `}</style>
    </div>
  );
}
