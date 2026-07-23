"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProjectsTab } from "@/features/projects/components/projects-tab";
import { useFounderDashboardStore } from "@/features/founder-dashboard/store";
import { useFounderNavigation } from "@/features/founder-dashboard/use-founder-navigation";
import type { Blueprint } from "@/features/blueprints/types";
import { buildBlueprintContent, initProjectState } from "@/features/blueprints/blueprint-content";
import {
  listProjects,
  createProject,
  updateProjectStatus,
  updateProjectMilestones,
  backendStatus,
  frontendStatus,
  deserialiseMilestones,
  serialiseMilestones,
  type ProjectWire,
} from "@/features/projects/projects-api";

// ─── merge backend projects onto blueprints ───────────────────────────────────
// Pure function: given the founder's blueprints and the CURRENT backend project
// rows, produce the enriched blueprint list. No caching, no refs — this is
// always recomputed from the latest of both, so it can never go stale.

function mergeBlueprintsWithProjects(
  blueprints: Blueprint[],
  apiProjects: ProjectWire[]
): Blueprint[] {
  const byBlueprint = new Map<string, ProjectWire>();
  for (const p of apiProjects) byBlueprint.set(p.blueprint_id, p);

  return blueprints.map((bp) => {
    const wire = byBlueprint.get(bp.id);
    if (!wire) return bp;

    // Prefer persisted phase state from milestones; fall back to a fresh init.
    const storedState = deserialiseMilestones(wire.milestones);
    const content = buildBlueprintContent(bp);
    const project = storedState ?? initProjectState(content);

    return {
      ...bp,
      project: {
        ...project,
        // Always authoritative from backend:
        status: frontendStatus(wire.status),
      },
      // Store backend project id on the blueprint for later mutations.
      _projectId: wire.id,
    } as Blueprint & { _projectId: string };
  });
}

// ─── page component ───────────────────────────────────────────────────────────

export default function FounderProjectsPage() {
  const { blueprints: storeBlueprints, profile, saveBlueprints } = useFounderDashboardStore();
  const nav = useFounderNavigation();

  // The ONLY source of truth for "which blueprints have a backend project" is
  // this state, always populated straight from GET /projects. No ref cache,
  // no locally-mutated shadow copy — every mutation re-fetches this from the
  // database, so a page refresh (which re-runs loadProjects once) always
  // reflects exactly what is persisted, and nothing can silently drift stale.
  const [apiProjects, setApiProjects] = useState<ProjectWire[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Distinct from `loading`/`loadError`: this is only ever set to true once a
  // GET /projects call has actually succeeded at least once. It's what lets
  // us tell "we have real data, a later refresh just failed" (safe to keep
  // showing what we have, with a banner) apart from "we have never
  // successfully loaded, so we have no idea what's persisted" (unsafe to
  // render ProjectsTab at all — apiProjects being [] here does NOT mean the
  // founder has no projects).
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const projects = await listProjects();
      setApiProjects(projects);
      setLoadError(null);
      setHasLoadedOnce(true);
    } catch (err) {
      // Exposed, not swallowed: log the real error and surface it in the UI
      // so a failed refresh is never visually indistinguishable from a
      // genuine "no active projects" state.
      console.error("[projects] Failed to load projects from the database:", err);
      setLoadError(
        err instanceof Error ? err.message : "Failed to load your projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch — this is what makes projects survive a refresh: on every
  // fresh mount (including after a full page reload or re-login), we go
  // straight to the database for the current project list.
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Derived, not stored: recomputed whenever either input changes, so it can
  // never fall out of sync with the backend project list.
  const blueprints = useMemo(
    () => mergeBlueprintsWithProjects(storeBlueprints, apiProjects),
    [storeBlueprints, apiProjects]
  );

  // ── mutations ──────────────────────────────────────────────────────────────

  /**
   * Called by ProjectsTab whenever any blueprint changes.
   * We persist project state (status + milestones) to the backend when
   * the blueprint has an associated backend project id, then re-fetch the
   * project list so `blueprints` reflects exactly what's in the database.
   */
  const handleBlueprintsChange = useCallback(
    async (updated: Blueprint[]) => {
      // Optimistic local update first (store only — `blueprints` itself is
      // derived and will refresh once the backend refetch below completes).
      saveBlueprints(updated);

      const byBlueprint = new Map<string, ProjectWire>();
      for (const p of apiProjects) byBlueprint.set(p.blueprint_id, p);

      // Persist each changed project to the backend.
      for (const bp of updated) {
        if (!bp.project) continue;
        const wire = byBlueprint.get(bp.id);
        if (!wire) continue;

        const newBackendStatus = backendStatus(bp.project.status);

        try {
          if (wire.status !== newBackendStatus) {
            await updateProjectStatus(wire.id, newBackendStatus);
          }
          await updateProjectMilestones(wire.id, serialiseMilestones(bp.project));
        } catch (err) {
          console.error(
            `[projects] Failed to persist project ${wire.id} (blueprint ${bp.id}):`,
            err
          );
        }
      }

      // Always resync from the database after a mutation — this is the
      // guarantee that what's on screen matches what's persisted.
      await loadProjects();
    },
    [saveBlueprints, apiProjects, loadProjects]
  );

  /**
   * Intercepts the "start project" action from ProjectsTab.
   * Creates a real backend project record before anything else, so a
   * newly-started project is never left un-persisted (e.g. by a refresh
   * happening while the request is in flight leaving nothing in the DB).
   */
  // Blueprint ids with a createProject() request currently in flight. Checked
  // and updated synchronously (before the `await`), so two calls that both
  // read `apiProjects` as not-yet-containing this blueprint — because the
  // first request hasn't resolved and refetched yet — cannot both fire a
  // POST. This is independent of (and in addition to) the backend's own
  // idempotency guard.
  const inFlightCreatesRef = useRef<Set<string>>(new Set());

  const handleBlueprintsChangeWithCreate = useCallback(
    async (updated: Blueprint[]) => {
      const existingBlueprintIds = new Set(apiProjects.map((p) => p.blueprint_id));

      // Find newly started projects (blueprints that now have .project but
      // don't have a backend project yet, and aren't already being created).
      const newlyStarted = updated.filter(
        (bp) =>
          bp.project &&
          !existingBlueprintIds.has(bp.id) &&
          !inFlightCreatesRef.current.has(bp.id)
      );

      for (const bp of newlyStarted) {
        inFlightCreatesRef.current.add(bp.id);
      }

      try {
        for (const bp of newlyStarted) {
          try {
            await createProject({
              blueprint_id: bp.id,
              title: bp.name,
              milestones: bp.project ? serialiseMilestones(bp.project) : null,
            });
          } catch (err) {
            // Exposed: if project creation genuinely fails (auth, validation,
            // server error), the refetch below will correctly show it as not
            // persisted — but we must not hide *why* while debugging.
            console.error(
              `[projects] Failed to create backend project for blueprint ${bp.id}:`,
              err
            );
          }
        }
      } finally {
        for (const bp of newlyStarted) {
          inFlightCreatesRef.current.delete(bp.id);
        }
      }

      await handleBlueprintsChange(updated);
    },
    [apiProjects, handleBlueprintsChange]
  );

  if (loading) {
    // Do NOT render ProjectsTab here. Before apiProjects has loaded,
    // storeBlueprints never carries `.project` (that only exists after
    // merging with GET /projects), so ProjectsTab would show an already
    // -persisted project as "not started" and let the founder hit "Start
    // Project" again — which, with apiProjects still empty, has nothing to
    // compare against and fires a duplicate createProject() for a blueprint
    // that already has one. An inert loading state makes that window
    // unreachable instead of papering over it.
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-bp-muted text-[13px]">Loading your projects…</div>
      </div>
    );
  }

  if (!hasLoadedOnce && loadError) {
    // GET /projects has never succeeded this session. apiProjects is [], but
    // that tells us nothing about what's actually persisted — it could just
    // as easily mean "founder has three projects and we can't see them" as
    // "founder has none". Rendering ProjectsTab here would show every
    // existing project as startable and let a duplicate createProject() fire
    // for one that already exists. Block entirely until a load succeeds.
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="max-w-[380px] rounded-2xl border border-[#e3b3ab] bg-[#fbe9e7] p-6 text-center">
          <div className="text-[14px] font-semibold text-[#7a2e24]">
            Couldn&apos;t load your projects
          </div>
          <p className="mt-1.5 text-[13px] text-[#7a2e24]">
            We couldn&apos;t reach the server to check your existing projects ({loadError}). To
            avoid showing incorrect data, we&apos;re not displaying the Projects page until this
            succeeds.
          </p>
          <button
            type="button"
            className="bp-primary-btn mt-4"
            onClick={() => {
              setLoading(true);
              loadProjects();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {loadError && (
        <div className="mx-auto mb-3 max-w-[1240px] rounded-lg border border-[#e3b3ab] bg-[#fbe9e7] px-4 py-2.5 text-[12.5px] text-[#7a2e24]">
          Couldn&apos;t load your projects from the server ({loadError}). What you see below may
          be out of date —{" "}
          <button
            type="button"
            className="font-semibold underline underline-offset-2"
            onClick={() => {
              setLoading(true);
              loadProjects();
            }}
          >
            retry
          </button>
          .
        </div>
      )}
      <ProjectsTab
        blueprints={blueprints}
        onBlueprintsChange={handleBlueprintsChangeWithCreate}
        onViewBlueprint={nav.handleViewBlueprint}
        onNavigateNetwork={() => nav.go("network")}
        onMessage={nav.handleOpenNetworkMessage}
        stripeConnected={Boolean(profile.stripeConnected)}
        onNavigateSettingsPayment={nav.handleOpenPaymentSettings}
      />
    </>
  );
}
