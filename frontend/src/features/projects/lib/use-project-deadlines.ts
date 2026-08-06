"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteDeadline,
  listDeadlines,
  setDeadlineMet,
  type Deadline,
} from "@/features/projects/deadlines-api";
import { useProjectsLiveRefresh } from "./use-projects-live-refresh";

export function useProjectDeadlines(projectId: string | undefined) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<Deadline | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!projectId) return Promise.resolve();
    return listDeadlines(projectId)
      .then(setDeadlines)
      .catch((err) => {
        console.error("[projects] Failed to load deadlines:", err);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useProjectsLiveRefresh(reload);

  const openComposer = (deadline: Deadline | null = null) => {
    setEditing(deadline);
    setComposing(true);
  };

  const closeComposer = () => {
    setComposing(false);
    setEditing(null);
  };

  const toggleMet = (deadline: Deadline) => {
    setBusyId(deadline.id);
    return setDeadlineMet(deadline.id, !deadline.met_by_me)
      .then(reload)
      .catch((err) => console.error("[projects] Failed to update deadline:", err))
      .finally(() => setBusyId(null));
  };

  const remove = (deadline: Deadline) => {
    setBusyId(deadline.id);
    return deleteDeadline(deadline.id)
      .then(reload)
      .catch((err) => console.error("[projects] Failed to delete deadline:", err))
      .finally(() => setBusyId(null));
  };

  return {
    deadlines,
    loading,
    composing,
    editing,
    busyId,
    openComposer,
    closeComposer,
    toggleMet,
    remove,
    reload,
  };
}
