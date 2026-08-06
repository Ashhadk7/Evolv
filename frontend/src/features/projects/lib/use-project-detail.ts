import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import type { Blueprint } from "@/features/blueprints/types";
import {
  buildBlueprintContent,
  computeProjectHealth,
  deriveProjectStatus,
  todayISO,
  fmtMoney,
  type ProjectExpense,
  type ProjectPhaseState,
  type ProjectState,
} from "@/features/blueprints/blueprint-content";
import {
  connectionApi,
  loadNetworkConnections,
  loadNetworkPeople,
} from "@/features/network/lib/network-api";
import { fetchMatchingDevelopers } from "@/features/network/lib/matching-api";
import type { FounderContactProfile } from "@/features/network/types";
import {
  inviteProjectMember,
  listProjectMembers,
  recordProjectPayment,
  removeProjectMember,
  revokeProjectInvite,
  type ProjectMemberWire,
} from "@/features/projects/projects-api";
import { NOTIFICATION_REFRESH_EVENT } from "@/features/notifications/notification-events";
import type { ProjectBlueprint } from "./project-helpers";
import { useProjectsLiveRefresh } from "./use-projects-live-refresh";

export function useProjectDetail({
  bp,
  onUpdate,
}: {
  bp: ProjectBlueprint;
  onUpdate: (mutate: (b: Blueprint) => Blueprint) => void;
}) {
  const content = buildBlueprintContent(bp);
  const health = computeProjectHealth(content, bp.project);
  const activeIdx = bp.project.phaseStates.findIndex((ps) => ps.status !== "Complete");
  const allComplete = activeIdx === -1;
  const today = todayISO();

  const [viewedPhaseIdx, setViewedPhaseIdx] = useState(() =>
    activeIdx === -1 ? Math.max(0, bp.project.phaseStates.length - 1) : activeIdx
  );
  
  const [selectedDeveloper, setSelectedDeveloper] = useState<FounderContactProfile | null>(null);
  const [budgetEditPhase, setBudgetEditPhase] = useState<number | null>(null);
  const [deadlineEditPhase, setDeadlineEditPhase] = useState<number | null>(null);
  const [members, setMembers] = useState<ProjectMemberWire[]>([]);
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [connectionIdByUser, setConnectionIdByUser] = useState<Record<string, string>>({});
  const [networkDevs, setNetworkDevs] = useState<FounderContactProfile[]>([]);
  const [matchedDevs, setMatchedDevs] = useState<FounderContactProfile[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const projectId = bp._projectId;

  const loadMembers = useCallback(() => {
    if (!projectId) return Promise.resolve();
    return listProjectMembers(projectId)
      .then(setMembers)
      .catch((err) => {
        console.error("[projects] Failed to load project members:", err);
      });
  }, [projectId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useProjectsLiveRefresh(loadMembers);

  const pendingInvites = useMemo(() => {
    const byPhase = new Map<number, ProjectMemberWire[]>();
    for (const member of members) {
      if (member.status === "invited") {
        const list = byPhase.get(member.phase_index) ?? [];
        list.push(member);
        byPhase.set(member.phase_index, list);
      }
    }
    return byPhase;
  }, [members]);

  const acceptedMembers = useMemo(() => {
    const byPhase = new Map<number, ProjectMemberWire[]>();
    for (const member of members) {
      if (member.status === "accepted") {
        const list = byPhase.get(member.phase_index) ?? [];
        list.push(member);
        byPhase.set(member.phase_index, list);
      }
    }
    return byPhase;
  }, [members]);

  useEffect(() => {
    let cancelled = false;
    loadNetworkConnections()
      .then((state) => {
        if (cancelled) return;
        setConnections(Object.fromEntries(state.connectedIds.map((id) => [id, true])));
        setConnectionIdByUser(state.connectionIdByUser);
      })
      .catch((err) => {
        console.error("[projects] Failed to load network connections:", err);
        if (!cancelled) setConnections({});
      });
    loadNetworkPeople()
      .then((people) => {
        if (!cancelled) setNetworkDevs(people.filter((p) => p.type === "Developer"));
      })
      .catch((err) => {
        console.error("[projects] Failed to load network people:", err);
        if (!cancelled) setNetworkDevs([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentSkillset = content.phases[viewedPhaseIdx]?.skillset?.join(',') || '';

  useEffect(() => {
    const phase = content.phases[viewedPhaseIdx];
    if (!phase) return;
    let cancelled = false;
    setMatchLoading(true);
    fetchMatchingDevelopers(phase.skillset)
      .then((devs) => {
        if (!cancelled) setMatchedDevs(devs);
      })
      .catch((err) => {
        console.error(
          `[projects] Failed to fetch matching developers for phase ${viewedPhaseIdx}:`,
          err
        );
        if (!cancelled) setMatchedDevs([]);
      })
      .finally(() => {
        if (!cancelled) setMatchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [viewedPhaseIdx, currentSkillset]);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2200);
  };

  const dispatchRefresh = () => window.dispatchEvent(new Event(NOTIFICATION_REFRESH_EVENT));

  const updateProject = (mutate: (p: ProjectState) => ProjectState) => {
    onUpdate((b) => {
      const next = mutate(b.project!);
      return { ...b, project: { ...next, status: deriveProjectStatus(next) } };
    });
  };

  const updatePhase = (i: number, mutate: (ps: ProjectPhaseState) => ProjectPhaseState) => {
    updateProject((p) => ({
      ...p,
      phaseStates: p.phaseStates.map((ps, j) => (j === i ? mutate(ps) : ps)),
    }));
  };

  const startPhase = (phaseIdx: number) => {
    updatePhase(phaseIdx, (ps) => ({
      ...ps,
      status: "In Progress",
      history: [...ps.history, { label: "Phase started", date: todayISO() }],
    }));
    showToast(`${content.phases[phaseIdx].name} started`);
  };

  const completePhase = (phaseIdx: number) => {
    updatePhase(phaseIdx, (ps) => ({
      ...ps,
      status: "Complete",
      history: [...ps.history, { label: "Phase completed", date: todayISO() }],
    }));
    showToast(`${content.phases[phaseIdx].name} marked complete`);
  };

  const reopenPhase = (phaseIdx: number) => {
    updatePhase(phaseIdx, (ps) => ({
      ...ps,
      status: "In Progress",
      history: [...ps.history, { label: "Phase re-opened", date: todayISO() }],
    }));
    showToast(`${content.phases[phaseIdx].name} re-opened`);
  };

  const setPhaseDeadline = (phaseIdx: number, date: string) => {
    updatePhase(phaseIdx, (ps) => ({ ...ps, deadline: date || null }));
    setDeadlineEditPhase(null);
  };

  const assignDeveloper = async (
    phaseIdx: number,
    dev: FounderContactProfile,
    amount: number
  ) => {
    if (!projectId) {
      showToast("This project is still being created — try again in a moment.");
      return;
    }
    try {
      await inviteProjectMember(projectId, {
        developer_id: dev.id,
        phase_index: phaseIdx,
        amount_agreed_cents: Math.round(amount * 100),
      });
      await loadMembers();
      updatePhase(phaseIdx, (ps) => ({
        ...ps,
        history: [
          ...ps.history,
          {
            label: `Invited ${dev.name} — offered ${fmtMoney(amount)}`,
            date: todayISO(),
          },
        ],
      }));
      dispatchRefresh();
      showToast(`Invitation sent to ${dev.name}`);
    } catch (err) {
      showToast(getApiErrorMessage(err));
    }
  };

  const revokeInvite = async (memberId: string) => {
    try {
      await revokeProjectInvite(memberId);
      await loadMembers();
      dispatchRefresh();
      showToast("Invitation cancelled");
    } catch (err) {
      showToast(getApiErrorMessage(err));
    }
  };

  const removeDeveloper = async (memberId: string, phaseIdx: number, reason: string) => {
    if (!reason.trim()) return;
    const assignment = bp.project.phaseStates[phaseIdx].assignment;
    try {
      await removeProjectMember(memberId, reason.trim());
      if (assignment) {
        updatePhase(phaseIdx, (ps) => ({
          ...ps,
          assignment: null,
          status: "Not Started",
          removals: [
            ...ps.removals,
            {
              developerId: assignment.developerId,
              developerName: assignment.developerName,
              reason: reason.trim(),
              amountPaid: assignment.amountPaid,
              date: todayISO(),
            },
          ],
          history: [
            ...ps.history,
            { label: `Removed ${assignment.developerName} — ${reason.trim()}`, date: todayISO() },
          ],
        }));
      }
      await loadMembers();
      dispatchRefresh();
      showToast(assignment ? `${assignment.developerName} removed` : "Developer removed");
    } catch (err) {
      showToast(getApiErrorMessage(err));
    }
  };

  const requestConnect = (dev: FounderContactProfile) => {
    connectionApi
      .send(dev.id)
      .then((record) => {
        setConnections((c) => ({ ...c, [dev.id]: true }));
        setConnectionIdByUser((m) => ({ ...m, [dev.id]: record.id }));
        showToast(`Connected with ${dev.name}`);
      })
      .catch((err) => {
        console.error(`[projects] Failed to send connection request to ${dev.id}:`, err);
        showToast(`Could not connect with ${dev.name}`);
      });
  };

  const handleToggleDeveloperConnection = (dev: FounderContactProfile) => {
    const next = !connections[dev.id];
    if (next) {
      connectionApi
        .send(dev.id)
        .then((record) => {
          setConnections((c) => ({ ...c, [dev.id]: true }));
          setConnectionIdByUser((m) => ({ ...m, [dev.id]: record.id }));
        })
        .catch((err) => {
          console.error(`[projects] Failed to send connection request to ${dev.id}:`, err);
        });
    } else {
      const connectionId = connectionIdByUser[dev.id];
      setConnections((c) => ({ ...c, [dev.id]: false }));
      if (connectionId) {
        connectionApi.remove(connectionId).catch((err) => {
          console.error(`[projects] Failed to remove connection ${connectionId}:`, err);
        });
      }
    }
  };

  const updatePhaseBudget = (phaseIdx: number, amount: number) => {
    updatePhase(phaseIdx, (ps) => ({ ...ps, budget: Math.max(0, amount) }));
    setBudgetEditPhase(null);
  };

  const addExpense = (expense: Omit<ProjectExpense, "id">) => {
    updateProject((p) => ({
      ...p,
      expenses: [{ ...expense, id: `exp-${Date.now()}` }, ...p.expenses],
    }));
  };

  const sendPayment = async (member: ProjectMemberWire, phaseIdx: number, amount: number) => {
    if (amount <= 0) return;
    try {
      await recordProjectPayment(member.id, {
        amount_cents: Math.round(amount * 100),
        idempotency_key: `${member.id}-${Date.now()}`,
      });
      await loadMembers();
      updatePhase(phaseIdx, (ps) => ({
        ...ps,
        history: [
          ...ps.history,
          {
            label: `${fmtMoney(amount)} recorded for ${member.developer_name}`,
            date: todayISO(),
          },
        ],
      }));
      dispatchRefresh();
      showToast(`${fmtMoney(amount)} recorded for ${member.developer_name}`);
    } catch (err) {
      showToast(getApiErrorMessage(err));
    }
  };

  return {
    content,
    health,
    activeIdx,
    allComplete,
    viewedPhaseIdx,
    setViewedPhaseIdx,
    selectedDeveloper,
    setSelectedDeveloper,
    budgetEditPhase,
    setBudgetEditPhase,
    deadlineEditPhase,
    setDeadlineEditPhase,
    connections,
    networkDevs,
    matchedDevs,
    matchLoading,
    pendingInvites,
    acceptedMembers,
    revokeInvite,
    toast,
    today,
    startPhase,
    completePhase,
    reopenPhase,
    setPhaseDeadline,
    assignDeveloper,
    removeDeveloper,
    requestConnect,
    handleToggleDeveloperConnection,
    updatePhaseBudget,
    addExpense,
    sendPayment,
  };
}
