"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listAssignees,
  listIssues,
  type AssigneeOption,
  type Issue,
  type IssueDetail,
} from "@/features/projects/issues-api";

export function useProjectIssues(
  projectId: string | undefined,
  { withAssignees = false, initialIssueId = null }: {
    withAssignees?: boolean;
    initialIssueId?: string | null;
  } = {}
) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [assignees, setAssignees] = useState<AssigneeOption[]>([]);
  const [openIssueId, setOpenIssueId] = useState<string | null>(initialIssueId);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<IssueDetail | null>(null);

  const reload = useCallback(() => {
    if (!projectId) return Promise.resolve();
    const work: Promise<unknown>[] = [listIssues(projectId).then(setIssues)];
    if (withAssignees) work.push(listAssignees(projectId).then(setAssignees));
    return Promise.all(work).catch((err) => {
      console.error("[projects] Failed to load issues:", err);
    });
  }, [projectId, withAssignees]);

  useEffect(() => {
    reload();
  }, [reload]);

  const openComposer = (issue: IssueDetail | null = null) => {
    setEditing(issue);
    setComposing(true);
    if (issue) setOpenIssueId(null);
  };

  const closeComposer = () => {
    setComposing(false);
    setEditing(null);
  };

  return {
    issues,
    assignees,
    openIssueId,
    setOpenIssueId,
    composing,
    editing,
    openComposer,
    closeComposer,
    reload,
  };
}
