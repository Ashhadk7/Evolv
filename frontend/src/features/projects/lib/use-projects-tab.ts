import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Blueprint } from "@/features/blueprints/types";
import {
  addWeeksISO,
  buildBlueprintContent,
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

  const selected = selectedId ? projectBlueprints.find((b) => b.id === selectedId) : undefined;

  const summaries = projectBlueprints.map((bp) => {
    const content = buildBlueprintContent(bp);
    return { bp, content, health: computeProjectHealth(content, bp.project) };
  });

  const activeCount = summaries.filter((s) => s.bp.project.status !== "COMPLETED").length;
  const totalDeployed = summaries.reduce((s, x) => s + x.health.budget.spent, 0);
  const avgCompletion = summaries.length
    ? Math.round(
        (summaries.reduce(
          (s, x) =>
            s +
            (x.health.deliverables.total
              ? x.health.deliverables.done / x.health.deliverables.total
              : 0),
          0
        ) /
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
    startableBlueprints,
    startProject,
    selected,
    activeCount,
    totalDeployed,
    avgCompletion,
    deadlinesThisWeek,
    summaries,
    updateBlueprint,
  };
}
