"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Topbar } from "@/features/developer-dashboard/components/topbar";
import { Kicker } from "@/components/shared/kicker";
import type { DeveloperTab } from "@/features/developer-dashboard/types";
import {
  CURRENT_DEV,
  getMockProjects,
} from "@/features/projects/data/developer-projects-mock-data";
import { DevProjectListCard } from "./dev-project-list-card";
import { PhaseHeader } from "./phase-header";
import { DeliverablesPanel } from "./deliverables-panel";
import { PhaseIssuesPanel } from "./phase-issues-panel";
import { PaymentStatusPanel } from "./payment-status-panel";

export default function Projects({ onNavigate }: { onNavigate?: (tab: DeveloperTab) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projectsData, setProjectsData] = useState(() => getMockProjects());

  const projectIdParam = searchParams?.get("project");
  const defaultIdx = projectsData.findIndex((p) => p.bp.id === projectIdParam);
  const selectedIdx = defaultIdx >= 0 ? defaultIdx : 0;
  const selected = projectsData[selectedIdx];

  useEffect(() => {
    if (selected && projectIdParam !== selected.bp.id) {
      const p = new URLSearchParams(searchParams?.toString() || "");
      p.set("project", selected.bp.id);
      router.push(`?${p.toString()}`, { scroll: false });
    }
  }, [selected, router, searchParams, projectIdParam]);

  const activePhaseIdx = selected.project.phaseStates.findIndex(
    (p) => p.assignment?.developerId === CURRENT_DEV.id
  );
  const activePhase = selected.content.phases[activePhaseIdx];
  const activePhaseState = selected.project.phaseStates[activePhaseIdx];

  const toggleDeliverable = (dIdx: number) => {
    setProjectsData((prev) => {
      const next = [...prev];
      const p = { ...next[selectedIdx] };
      const proj = { ...p.project };
      const phases = [...proj.phaseStates];
      const ps = { ...phases[activePhaseIdx] };
      const delivs = [...ps.deliverables];
      delivs[dIdx] = { ...delivs[dIdx], done: !delivs[dIdx].done };
      ps.deliverables = delivs;
      phases[activePhaseIdx] = ps;
      proj.phaseStates = phases;
      p.project = proj;
      next[selectedIdx] = p;
      return next;
    });
  };

  const toggleIssue = (issueId: string) => {
    setProjectsData((prev) => {
      const next = [...prev];
      const p = { ...next[selectedIdx] };
      const proj = { ...p.project };
      const issues = [...proj.issues];
      const idx = issues.findIndex((i) => i.id === issueId);
      if (idx !== -1) {
        issues[idx] = {
          ...issues[idx],
          status: issues[idx].status === "Resolved" ? "Open" : "Resolved",
        };
      }
      proj.issues = issues;
      p.project = proj;
      next[selectedIdx] = p;
      return next;
    });
  };

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-[1.5rem_2rem_2rem] overflow-x-hidden min-w-0 flex flex-col">
        <Topbar
          title="My Projects"
          subtitle="Manage your assigned phases, deliverables, and payments."
          onNavigate={onNavigate}
        />

        <div className="flex-1 flex flex-col lg:flex-row gap-6 mt-4 min-h-0">
          <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
            <Kicker>Active Projects</Kicker>
            {projectsData.map((data, i) => {
              const pIdx = data.project.phaseStates.findIndex(
                (p) => p.assignment?.developerId === CURRENT_DEV.id
              );
              const pState = data.project.phaseStates[pIdx];
              const pContent = data.content.phases[pIdx];
              const doneCount = pState?.deliverables.filter((d) => d.done).length || 0;
              const totalCount = pState?.deliverables.length || 1;
              const progress = Math.round((doneCount / totalCount) * 100);

              return (
                <DevProjectListCard
                  key={data.bp.id}
                  name={data.bp.name}
                  industry={data.bp.industry}
                  phaseName={pContent?.name || "Unassigned"}
                  progress={progress}
                  isActive={selectedIdx === i}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams?.toString() || "");
                    p.set("project", data.bp.id);
                    router.push(`?${p.toString()}`, { scroll: false });
                  }}
                />
              );
            })}
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            {activePhaseIdx === -1 ? (
              <div className="text-bp-muted bg-bp-card border border-bp-border rounded-2xl p-10 text-center">
                You are not assigned to any phase in this project.
              </div>
            ) : (
              <div className="flex flex-col gap-6 max-w-[900px]">
                <PhaseHeader
                  founderName={selected.bp.name}
                  industry={selected.bp.industry}
                  phaseName={activePhase.name}
                  primarySkill={activePhase.primarySkill}
                  weeks={activePhase.weeks}
                  deadline={activePhaseState.deadline}
                />

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
                  <div className="flex flex-col gap-6 min-w-0">
                    <DeliverablesPanel
                      deliverables={activePhaseState.deliverables}
                      onToggle={toggleDeliverable}
                    />

                    <PhaseIssuesPanel
                      issues={selected.project.issues.filter(
                        (i) => i.phaseIndex === activePhaseIdx || i.phaseIndex === null
                      )}
                      onToggle={toggleIssue}
                    />
                  </div>

                  <div className="flex flex-col gap-6 min-w-0">
                    <PaymentStatusPanel assignment={activePhaseState.assignment} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
