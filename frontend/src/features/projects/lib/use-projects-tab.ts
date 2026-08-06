import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Blueprint } from "@/features/blueprints/types";
import {
  addWeeksISO,
  buildBlueprintContent,
  CLOSED_PROJECT_STATUSES,
  computeProjectHealth,
  initProjectState,
  normalizeProjectState,
  todayISO,
} from "@/features/blueprints/blueprint-content";
import type { ProjectBlueprint } from "./project-helpers";

export function useProjectsTab({
  blueprints: rawBlueprints,
  onBlueprintsChange,
}: {
  blueprints: Blueprint[];
  onBlueprintsChange: (bps: Blueprint[]) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectParam = searchParams.get("project");
  const issueParam = searchParams.get("issue");
  const deliverableParam = searchParams.get("deliverable");
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

  const blueprints = rawBlueprints.map((b) =>
    b.project ? { ...b, project: normalizeProjectState(buildBlueprintContent(b), b.project) } : b
  );
  const blueprintsRef = useRef(blueprints);
  useEffect(() => {
    blueprintsRef.current = blueprints;
  });

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2200);
  };

  const updateBlueprint = (id: string, mutate: (b: Blueprint) => Blueprint) => {
    onBlueprintsChange(blueprintsRef.current.map((b) => (b.id === id ? mutate(b) : b)));
  };

  const projectBlueprints = blueprints.filter((b): b is ProjectBlueprint => Boolean(b.project));
  const startableBlueprints = blueprints.filter((b) => !b.project);
  const ongoingBlueprints = projectBlueprints.filter(
    (b) => !CLOSED_PROJECT_STATUSES.includes(b.project.status)
  );
  const closedBlueprints = projectBlueprints.filter((b) =>
    CLOSED_PROJECT_STATUSES.includes(b.project.status)
  );

  const startProject = (bp: Blueprint) => {
    const content = buildBlueprintContent(bp);
    updateBlueprint(bp.id, (b) => ({
      ...b,
      isPublic: false,
      status: "DRAFT",
      project: initProjectState(content),
    }));
    setPickerOpen(false);
    setSelectedId(bp.id);
    showToast(`${bp.name} started as a project`);
  };

  // A notification deep-link carries the backend project id, while selection
  // within the tab is keyed by blueprint id. Accept either so both resolve.
  const selected = selectedId
    ? projectBlueprints.find((b) => b.id === selectedId || b._projectId === selectedId)
    : undefined;

  const summaries = projectBlueprints.map((bp) => {
    const content = buildBlueprintContent(bp);
    return { bp, content, health: computeProjectHealth(content, bp.project) };
  });

  const activeCount = ongoingBlueprints.length;
  const totalDeployed = summaries.reduce((s, x) => s + x.health.budget.spent, 0);
  // Deliverables are relational, not part of the blob health.deliverables reads
  // from — the wire's aggregate (attached per project by mergeBlueprintsWithProjects)
  // is the real count.
  const avgCompletion = summaries.length
    ? Math.round(
        (summaries.reduce((s, x) => {
          const total = x.bp._deliverablesTotal ?? 0;
          const done = x.bp._deliverablesDone ?? 0;
          return s + (total ? done / total : 0);
        }, 0) /
          summaries.length) *
          100
      )
    : 0;

  const weekAhead = addWeeksISO(1);
  const today = todayISO();
  const deadlinesThisWeek = summaries.reduce(
    (count, x) =>
      count +
      x.bp.project.phaseStates.filter(
        (ps) =>
          ps.deadline &&
          ps.status !== "Complete" &&
          ps.deadline >= today &&
          ps.deadline <= weekAhead
      ).length,
    0
  );

  return {
    selectedId,
    setSelectedId,
    pickerOpen,
    setPickerOpen,
    toast,
    showToast,
    projectBlueprints,
    ongoingBlueprints,
    closedBlueprints,
    startableBlueprints,
    startProject,
    selected,
    issueParam,
    deliverableParam,
    activeCount,
    totalDeployed,
    avgCompletion,
    deadlinesThisWeek,
    summaries,
    updateBlueprint,
  };
}
