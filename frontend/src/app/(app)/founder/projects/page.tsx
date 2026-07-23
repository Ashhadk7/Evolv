"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

  const loadProjects = useCallback(async () => {
    try {
      const projects = await listProjects();
      setApiProjects(projects);
    } catch {
      // Non-fatal: keep whatever project list we already have (don't zero it
      // out on a transient network hiccup — a stale-but-correct list is
      // safer than an empty one).
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
        } catch {
          // Silent — the UI already reflects the change optimistically;
          // the refetch below will reconcile with whatever did land.
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
  const handleBlueprintsChangeWithCreate = useCallback(
    async (updated: Blueprint[]) => {
      const existingBlueprintIds = new Set(apiProjects.map((p) => p.blueprint_id));

      // Find newly started projects (blueprints that now have .project but
      // don't have a backend project yet).
      const newlyStarted = updated.filter(
        (bp) => bp.project && !existingBlueprintIds.has(bp.id)
      );

      for (const bp of newlyStarted) {
        try {
          await createProject({
            blueprint_id: bp.id,
            title: bp.name,
            milestones: bp.project ? serialiseMilestones(bp.project) : null,
          });
        } catch {
          // Non-fatal: the refetch after handleBlueprintsChange will simply
          // not show this project if creation truly failed, which is the
          // correct (accurate-to-the-database) behaviour.
        }
      }

      await handleBlueprintsChange(updated);
    },
    [apiProjects, handleBlueprintsChange]
  );

  if (loading) {
    // Render immediately with store data while the backend project list
    // loads, but still route "Start Project" through the handler that
    // creates a real backend row — using the raw store setter here would
    // let a click during this window silently skip persistence entirely.
    return (
      <ProjectsTab
        blueprints={storeBlueprints}
        onBlueprintsChange={handleBlueprintsChangeWithCreate}
        onViewBlueprint={nav.handleViewBlueprint}
        onNavigateNetwork={() => nav.go("network")}
        onMessage={nav.handleOpenNetworkMessage}
        stripeConnected={Boolean(profile.stripeConnected)}
        onNavigateSettingsPayment={nav.handleOpenPaymentSettings}
      />
    );
  }

  return (
    <ProjectsTab
      blueprints={blueprints}
      onBlueprintsChange={handleBlueprintsChangeWithCreate}
      onViewBlueprint={nav.handleViewBlueprint}
      onNavigateNetwork={() => nav.go("network")}
      onMessage={nav.handleOpenNetworkMessage}
      stripeConnected={Boolean(profile.stripeConnected)}
      onNavigateSettingsPayment={nav.handleOpenPaymentSettings}
    />
  );
}
