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

  // Derive selection
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

  // Derive active phase for the selected project
  const activePhaseIdx = selected.project.phaseStates.findIndex(
    (p) => p.assignment?.developerId === CURRENT_DEV.id
  );
  const activePhase = selected.content.phases[activePhaseIdx];
  const activePhaseState = selected.project.phaseStates[activePhaseIdx];

  // Actions
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
    <div className="bg-bp-page flex-1 flex flex-col h-screen overflow-hidden">
      <Topbar
        title="My Projects"
        subtitle="Manage your assigned phases, deliverables, and payments."
        onNavigate={onNavigate}
      />

      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
        {/* Left Sidebar - Assigned Projects */}
        <div className="w-full md:w-[340px] shrink-0 flex flex-col gap-4 overflow-y-auto pr-2">
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto pr-6">
          {activePhaseIdx === -1 ? (
            <div className="text-bp-muted bg-bp-card border border-bp-border rounded-2xl shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)] p-10 text-center">
              You are not assigned to any phase in this project.
            </div>
          ) : (
            <div className="flex flex-col gap-6 max-w-[860px]">
              <PhaseHeader
                founderName={selected.bp.name}
                industry={selected.bp.industry}
                phaseName={activePhase.name}
                primarySkill={activePhase.primarySkill}
                weeks={activePhase.weeks}
                deadline={activePhaseState.deadline}
              />

              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                {/* Deliverables Column */}
                <div className="flex flex-col gap-6">
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

                {/* Right Column: Payment & Meta */}
                <div className="flex flex-col gap-6">
                  <PaymentStatusPanel assignment={activePhaseState.assignment} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
