"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Plus } from "@phosphor-icons/react";
import type { AIState } from "@/features/founder-dashboard/data/dashboard-overview-data";
// Use the real Blueprint type (superset) — the store passes real blueprints and
// buildBlueprintContent needs the full shape, not the local dashboard mock.
import type { Blueprint } from "@/features/blueprints/types";
import { computeMetrics, computeAIContent } from "@/features/founder-dashboard/data/dashboard-overview-data";
import { AIBriefingBanner } from "./ai-briefing-banner";
import { StatCard } from "./stat-card";
import { IdeaCard } from "./idea-card";
import { VentureHealthWidget } from "./venture-health-widget";
import { VentureRoadmapWidget } from "./venture-roadmap-widget";
import { DevPipelineWidget, type ProjectPipelineCounts } from "./dev-pipeline-widget";
import { listProjects } from "@/features/projects/projects-api";
import { fetchApplicationSummary } from "@/features/projects/applications-api";
import { listBlueprintApplications } from "@/features/projects/applications-api";
import { loadNetworkConnections } from "@/features/network/lib/network-api";
import { fetchMatchingDevelopers } from "@/features/network/lib/matching-api";
import type { FounderContactProfile } from "@/features/network/types";
import { buildBlueprintContent } from "@/features/blueprints/blueprint-content";
import {
  currentPhaseIndex,
  mergeBlueprintsWithProjects,
} from "@/features/projects/lib/project-helpers";

interface Props {
  profile: { firstName: string };
  onNavigateWorkspace: (forge?: boolean) => void;
  blueprints: Blueprint[];
  onViewBlueprint: (id: string) => void;
  profileComplete?: boolean;
  onCompleteProfile?: () => void;
}

export function DashboardOverview({
  profile,
  onNavigateWorkspace,
  blueprints,
  onViewBlueprint,
  profileComplete = true,
  onCompleteProfile,
}: Props) {
  const name = profile.firstName || "Founder";
  const [greeting, setGreeting] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  // Live backend stats
  const [activeProjectCount, setActiveProjectCount] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [applicationsInConversation, setApplicationsInConversation] = useState(0);
  // Backend project rows, merged onto `blueprints` below so every venture card
  // (Progress / Roadmap / Pipeline) reads the SAME real phase state.
  const [apiProjects, setApiProjects] = useState<Awaited<ReturnType<typeof listProjects>>>([]);
  // Per-venture breakdowns, scoped to one blueprint_id instead of aggregated
  // across all active projects.
  const [matchedByBlueprintId, setMatchedByBlueprintId] = useState<
    Record<string, FounderContactProfile[]>
  >({});
  const [pipelineByBlueprintId, setPipelineByBlueprintId] = useState<
    Record<string, ProjectPipelineCounts>
  >({});

  const mergedBlueprints = useMemo(
    () => mergeBlueprintsWithProjects(blueprints, apiProjects),
    [blueprints, apiProjects]
  );

  // Active Ideas cards: highest viability first, lowest last — a fresh sorted
  // copy so the store's own ordering (creation/fetch order) is never mutated.
  const activeIdeasByViability = useMemo(
    () => [...mergedBlueprints].sort((a, b) => b.viability - a.viability),
    [mergedBlueprints]
  );

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
    // were successfully computed from the others. Errors are logged (not
    // swallowed) so a real failure is visible instead of masquerading as a
    // legitimate zero.
    let projects: Awaited<ReturnType<typeof listProjects>> = [];
    try {
      projects = await listProjects();
      setApiProjects(projects);
    } catch (err) {
      console.error("[dashboard] Failed to load projects for pipeline stats:", err);
      projects = [];
    }

    const activeProjectCount = projects.filter(
      (p) => p.status === "active" || p.status === "paused"
    ).length;
    setActiveProjectCount(activeProjectCount);

    try {
      const applicationSummary = await fetchApplicationSummary(blueprints.map((b) => b.id));
      setTotalApplications(applicationSummary.total);
      setApplicationsInConversation(applicationSummary.inConversation);
    } catch (err) {
      console.error("[dashboard] Failed to load application summary:", err);
    }

    // Founder-account-wide accepted connections. There is no blueprint_id on
    // a connection, so per-venture "Connected" below is a PROXY (accepted
    // connection + an application to that specific blueprint) — flag this so
    // it gets replaced with a real field if project_id is ever added to
    // connections on the backend.
    let connectedIds = new Set<string>();
    try {
      const connectionState = await loadNetworkConnections();
      connectedIds = new Set(connectionState.connectedIds);
    } catch (err) {
      console.error("[dashboard] Failed to load network connections:", err);
    }

    // Per-venture breakdown: matches/pending/connected/hired scoped to ONE
    // blueprint_id at a time, instead of a single aggregate across every
    // active project. Every source is looked up per blueprint independently
    // so one blueprint's failure can't blank out another's numbers.
    const merged = mergeBlueprintsWithProjects(blueprints, projects);
    const matchedEntries: [string, FounderContactProfile[]][] = [];
    const pipelineEntries: [string, ProjectPipelineCounts][] = [];

    await Promise.all(
      merged.map(async (bp) => {
        // Matches + hired need the venture's real phase state — skip (zero)
        // when the idea hasn't been started as a project yet.
        let matchedDevelopers: FounderContactProfile[] = [];
        let hiredCount = 0;
        if (bp.project) {
          hiredCount = new Set(
            bp.project.phaseStates
              .map((ps) => ps.assignment?.developerId)
              .filter((id): id is string => Boolean(id))
          ).size;

          try {
            const content = buildBlueprintContent(bp);
            const phaseIdx = currentPhaseIndex(bp.project);
            const skillset = content.phases[phaseIdx]?.skillset ?? [];
            if (skillset.length) matchedDevelopers = await fetchMatchingDevelopers(skillset);
          } catch (err) {
            console.error(`[dashboard] Failed to fetch matches for blueprint ${bp.id}:`, err);
          }
        }
        matchedEntries.push([bp.id, matchedDevelopers]);

        // Pending/Connected come from this blueprint's own applications —
        // these exist independent of whether a project was ever started.
        let pendingCount = 0;
        let connectedCount = 0;
        try {
          const applications = await listBlueprintApplications(bp.id);
          const live = applications.filter((a) => a.status !== "withdrawn");
          pendingCount = live.filter((a) => !a.connection_id).length;
          connectedCount = live.filter((a) => connectedIds.has(a.developer_id)).length;
        } catch (err) {
          console.error(`[dashboard] Failed to fetch applications for blueprint ${bp.id}:`, err);
        }

        pipelineEntries.push([
          bp.id,
          {
            matchedCount: matchedDevelopers.length,
            incomingCount: pendingCount,
            connectedCount,
            hiredCount,
          },
        ]);
      })
    );

    setMatchedByBlueprintId(Object.fromEntries(matchedEntries));
    setPipelineByBlueprintId(Object.fromEntries(pipelineEntries));
  }, [blueprints]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLiveStats();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadLiveStats]);

  const liveData = {
    blueprints,
    activeProjectCount,
    totalApplications,
    applicationsInConversation,
  };

  const metrics = computeMetrics(liveData);

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
    <div className="flex flex-col h-full min-h-full overflow-y-auto gap-4 px-4 py-5 md:px-7 md:py-6 md:gap-[18px]" style={{ background: "#f7f8f6" }}>
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex items-start justify-between gap-3 shrink-0"
      >
        <div className="min-w-0 flex-1">
          <h1
            style={{
              fontSize: "clamp(1.25rem, 5vw, 1.65rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#1a2e26",
              lineHeight: 1.15,
              minHeight: "1.5rem",
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
          <p style={{ fontSize: "clamp(12px, 3vw, 13.5px)", color: "#7a9e8e", marginTop: 6, lineHeight: 1.55 }}>
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
          className="bp-gradient-btn flex items-center gap-2 shrink-0"
          style={{
            padding: "9px 14px",
            borderRadius: 13,
            fontSize: "clamp(11px, 3vw, 13.5px)",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <Plus size={14} weight="bold" />
          <span className="hidden sm:inline">New idea</span>
          <span className="inline sm:hidden">New</span>
        </motion.button>
      </motion.div>

      {/* ── AI Briefing ── */}
      <div style={{ flexShrink: 0 }}>
        <AIBriefingBanner
          state={aiState}
          onCta={() => {
            if (aiState === "profile_incomplete") {
              onCompleteProfile?.();
            } else {
              onNavigateWorkspace(false);
            }
          }}
          overrideContent={aiContent}
        />
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-[14px] shrink-0">
        {metrics.map((m, i) => (
          <StatCard key={m.id} metric={m} index={i} />
        ))}
      </div>

      {/* ── Active Ideas ── */}
      <div className="shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#89d7b7", flexShrink: 0 }} />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-[14px]">
          {activeIdeasByViability.slice(0, 3).map((bp, i) => (
            <IdeaCard key={bp.id} bp={bp} onView={onViewBlueprint} index={i} />
          ))}
        </div>
      </div>

      {/* ── Bottom widgets ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-[14px] shrink-0">
        <VentureHealthWidget
          blueprints={mergedBlueprints}
          matchedByBlueprintId={matchedByBlueprintId}
        />
        <VentureRoadmapWidget blueprints={mergedBlueprints} />
        <DevPipelineWidget
          blueprints={mergedBlueprints}
          pipelineByBlueprintId={pipelineByBlueprintId}
        />
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