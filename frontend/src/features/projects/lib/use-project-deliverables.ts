"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listDeliverables,
  type Deliverable,
  type DeliverableDetail,
} from "@/features/projects/deliverables-api";

export function useProjectDeliverables(
  projectId: string | undefined,
  { initialDeliverableId = null }: { initialDeliverableId?: string | null } = {}
) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [openDeliverableId, setOpenDeliverableId] = useState<string | null>(
    initialDeliverableId
  );
  const [composing, setComposing] = useState(false);
  const [composerPhase, setComposerPhase] = useState(0);
  const [editing, setEditing] = useState<DeliverableDetail | null>(null);

  const reload = useCallback(() => {
    if (!projectId) return Promise.resolve();
    return listDeliverables(projectId)
      .then(setDeliverables)
      .catch((err) => {
        console.error("[projects] Failed to load deliverables:", err);
      });
  }, [projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const byPhase = useMemo(() => {
    const grouped = new Map<number, Deliverable[]>();
    for (const deliverable of deliverables) {
      const list = grouped.get(deliverable.phase_index) ?? [];
      list.push(deliverable);
      grouped.set(deliverable.phase_index, list);
    }
    return grouped;
  }, [deliverables]);

  const openComposer = (phaseIndex: number, deliverable: DeliverableDetail | null = null) => {
    setComposerPhase(phaseIndex);
    setEditing(deliverable);
    setComposing(true);
    if (deliverable) setOpenDeliverableId(null);
  };

  const closeComposer = () => {
    setComposing(false);
    setEditing(null);
  };

  return {
    deliverables,
    byPhase,
    openDeliverableId,
    setOpenDeliverableId,
    composing,
    composerPhase,
    editing,
    openComposer,
    closeComposer,
    reload,
  };
}
