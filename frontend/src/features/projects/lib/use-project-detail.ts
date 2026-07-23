import { useEffect, useState } from "react";
import type { Blueprint } from "@/features/blueprints/types";
import {
  buildBlueprintContent,
  computeProjectHealth,
  deriveProjectStatus,
  todayISO,
  fmtMoney,
  type ProjectDeadline,
  type ProjectExpense,
  type ProjectIssue,
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
import type { ProjectBlueprint } from "./project-helpers";

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
  const [newDeliverable, setNewDeliverable] = useState("");
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [connectionIdByUser, setConnectionIdByUser] = useState<Record<string, string>>({});
  const [networkDevs, setNetworkDevs] = useState<FounderContactProfile[]>([]);
  const [matchedDevs, setMatchedDevs] = useState<FounderContactProfile[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadNetworkConnections()
      .then((state) => {
        if (cancelled) return;
        setConnections(Object.fromEntries(state.connectedIds.map((id) => [id, true])));
        setConnectionIdByUser(state.connectionIdByUser);
      })
      .catch(() => {
        if (!cancelled) setConnections({});
      });
    loadNetworkPeople()
      .then((people) => {
        if (!cancelled) setNetworkDevs(people.filter((p) => p.type === "Developer"));
      })
      .catch(() => {
        if (!cancelled) setNetworkDevs([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const phase = content.phases[viewedPhaseIdx];
    if (!phase) return;
    let cancelled = false;
    setMatchLoading(true);
    fetchMatchingDevelopers(phase.skillset)
      .then((devs) => {
        if (!cancelled) setMatchedDevs(devs);
      })
      .catch(() => {
        if (!cancelled) setMatchedDevs([]);
      })
      .finally(() => {
        if (!cancelled) setMatchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [viewedPhaseIdx, content.phases]);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2200);
  };

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

  const toggleDeliverable = (phaseIdx: number, delivIdx: number) => {
    updatePhase(phaseIdx, (ps) => {
      if (ps.status === "Not Started") return ps;
      const deliverables = ps.deliverables.map((d, k) =>
        k === delivIdx ? { ...d, done: !d.done } : d
      );
      const allDone = deliverables.length > 0 && deliverables.every((d) => d.done);
      const status = allDone ? "Complete" : ps.status === "Complete" ? "In Progress" : ps.status;
      const verb = deliverables[delivIdx].done ? "Checked off" : "Unchecked";
      return {
        ...ps,
        deliverables,
        status,
        history: [
          ...ps.history,
          { label: `${verb}: ${deliverables[delivIdx].text}`, date: todayISO() },
        ],
      };
    });
  };

  const addDeliverable = (phaseIdx: number, text: string) => {
    if (!text.trim()) return;
    updatePhase(phaseIdx, (ps) => ({
      ...ps,
      deliverables: [...ps.deliverables, { text: text.trim(), done: false }],
      history: [...ps.history, { label: `Added deliverable: ${text.trim()}`, date: todayISO() }],
    }));
    setNewDeliverable("");
  };

  const removeDeliverable = (phaseIdx: number, delivIdx: number) => {
    updatePhase(phaseIdx, (ps) => ({
      ...ps,
      deliverables: ps.deliverables.filter((_, k) => k !== delivIdx),
    }));
  };

  const setPhaseDeadline = (phaseIdx: number, date: string) => {
    updatePhase(phaseIdx, (ps) => ({ ...ps, deadline: date || null }));
    setDeadlineEditPhase(null);
  };

  const assignDeveloper = (phaseIdx: number, dev: FounderContactProfile, amount: number) => {
    updatePhase(phaseIdx, (ps) => ({
      ...ps,
      assignment: {
        developerId: dev.id,
        developerName: dev.name,
        developerInitials: dev.initials,
        hiredAt: todayISO(),
        amountAgreed: amount,
        amountPaid: 0,
        payments: [],
      },
      history: [
        ...ps.history,
        {
          label: `Hired ${dev.name} — agreed ${fmtMoney(amount)}`,
          date: todayISO(),
        },
      ],
    }));
    showToast(`${dev.name} hired for ${content.phases[phaseIdx].name}`);
  };

  const removeDeveloper = (phaseIdx: number, reason: string) => {
    if (!reason.trim()) return;
    const assignment = bp.project.phaseStates[phaseIdx].assignment;
    if (!assignment) return;

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
    showToast(`${assignment.developerName} removed from ${content.phases[phaseIdx].name}`);
  };

  const requestConnect = (dev: FounderContactProfile) => {
    connectionApi
      .send(dev.id)
      .then((record) => {
        setConnections((c) => ({ ...c, [dev.id]: true }));
        setConnectionIdByUser((m) => ({ ...m, [dev.id]: record.id }));
        showToast(`Connected with ${dev.name}`);
      })
      .catch(() => {
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
        .catch(() => {});
    } else {
      const connectionId = connectionIdByUser[dev.id];
      setConnections((c) => ({ ...c, [dev.id]: false }));
      if (connectionId) {
        connectionApi.remove(connectionId).catch(() => {});
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

  const sendPayment = (phaseIdx: number, amount: number) => {
    if (amount <= 0) return;
    const devName = bp.project.phaseStates[phaseIdx].assignment?.developerName ?? "the developer";
    updatePhase(phaseIdx, (ps) =>
      ps.assignment
        ? {
            ...ps,
            assignment: {
              ...ps.assignment,
              amountPaid: ps.assignment.amountPaid + amount,
              payments: [...ps.assignment.payments, { amount, date: todayISO() }],
            },
            totalPaid: ps.totalPaid + amount,
            history: [
              ...ps.history,
              { label: `${fmtMoney(amount)} paid to ${devName}`, date: todayISO() },
            ],
          }
        : ps
    );
    addExpense({
      label: `Payment to ${devName} — ${content.phases[phaseIdx].name}`,
      category: "Developer Payment",
      amount,
      date: todayISO(),
      phaseIndex: phaseIdx,
    });
    showToast(`${fmtMoney(amount)} paid to ${devName}`);
  };

  const addIssue = (draft: { title: string; description: string; priority: ProjectIssue["priority"]; phaseIndex: number | null }) => {
    const { title, description, priority, phaseIndex } = draft;
    if (!title.trim()) return;
    const issue: ProjectIssue = {
      id: `iss-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      priority,
      status: "Open",
      phaseIndex,
      createdAt: todayISO(),
      history: [{ label: "Issue raised", date: todayISO() }],
    };
    updateProject((p) => ({ ...p, issues: [issue, ...p.issues] }));
    showToast("Issue raised");
  };

  const setIssueStatus = (id: string, status: ProjectIssue["status"]) => {
    updateProject((p) => ({
      ...p,
      issues: p.issues.map((i) =>
        i.id === id
          ? {
              ...i,
              status,
              history: [...i.history, { label: `Marked ${status}`, date: todayISO() }],
            }
          : i
      ),
    }));
  };

  const addDeadline = (draft: { note: string; priority: ProjectDeadline["priority"]; phaseIndex: number | null; date: string }) => {
    const { note, priority, phaseIndex, date } = draft;
    if (!note.trim() || !date) return;
    const deadline: ProjectDeadline = {
      id: `dl-${Date.now()}`,
      note: note.trim(),
      priority,
      phaseIndex,
      date,
      status: "Pending",
      createdAt: todayISO(),
    };
    updateProject((p) => ({ ...p, deadlines: [deadline, ...p.deadlines] }));
    showToast("Deadline set");
  };

  const setDeadlineStatus = (id: string, status: ProjectDeadline["status"]) => {
    updateProject((p) => ({
      ...p,
      deadlines: p.deadlines.map((dl) => (dl.id === id ? { ...dl, status } : dl)),
    }));
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
    newDeliverable,
    setNewDeliverable,
    connections,
    networkDevs,
    matchedDevs,
    matchLoading,
    toast,
    today,
    startPhase,
    completePhase,
    reopenPhase,
    toggleDeliverable,
    addDeliverable,
    removeDeliverable,
    setPhaseDeadline,
    assignDeveloper,
    removeDeveloper,
    requestConnect,
    handleToggleDeveloperConnection,
    updatePhaseBudget,
    addExpense,
    sendPayment,
    addIssue,
    setIssueStatus,
    addDeadline,
    setDeadlineStatus,
  };
}
