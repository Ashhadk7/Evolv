"use client";

import { Bug, Plus } from "@phosphor-icons/react";
import { Chip } from "@/components/shared/chip";
import type { ProjectIssue } from "@/features/blueprints/blueprint-content";
import { issueStatusTone, issueTone } from "@/features/projects/lib/project-helpers";

export function IssuesPanel({
  issues,
  openIssues,
  phaseNameFor,
  onOpenModal,
  onSetStatus,
}: {
  issues: ProjectIssue[];
  openIssues: number;
  phaseNameFor: (phaseIndex: number) => string | undefined;
  onOpenModal: () => void;
  onSetStatus: (id: string, status: ProjectIssue["status"]) => void;
}) {
  return (
    <div className="bg-bp-card border border-bp-border rounded-2xl shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)] p-[16px_20px] shrink-0">
      <div className="mb-3 flex items-center gap-2">
        <div className="bg-bp-red-bg flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg">
          <Bug size={13} weight="duotone" className="text-bp-red" />
        </div>
        <span className="text-bp-ink text-[13px] font-extrabold">Issues & Fixes</span>
        {openIssues > 0 && <Chip tone="red">{openIssues} open</Chip>}
        <button onClick={onOpenModal} className="bp-primary-btn ml-auto">
          <Plus size={11} weight="bold" /> New
        </button>
      </div>
      {issues.length === 0 ? (
        <div className="text-bp-muted text-[11.5px]">
          No issues raised — everything shipped so far matches the spec.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {issues.map((iss) => (
            <div
              key={iss.id}
              className="border-bp-border-soft bg-bp-tint rounded-[10px] border px-3.5 py-3"
            >
              <div
                className={`flex flex-wrap items-center gap-1.5 ${iss.description ? "mb-1.5" : "mb-2"}`}
              >
                <span className="text-bp-ink text-[12.5px] font-bold">{iss.title}</span>
                <Chip tone={issueTone(iss.priority)}>{iss.priority}</Chip>
                <Chip tone={issueStatusTone(iss.status)}>{iss.status}</Chip>
              </div>
              {iss.description && (
                <p className="text-bp-muted mb-2 line-clamp-2 text-[11.5px] leading-[1.5]">
                  {iss.description}
                </p>
              )}
              <div className="flex items-center gap-2.5">
                {iss.phaseIndex !== null && (
                  <span className="text-bp-label text-[10.5px]">
                    {phaseNameFor(iss.phaseIndex)}
                  </span>
                )}
                <span className="ml-auto flex gap-2.5">
                  {iss.status !== "In Progress" && (
                    <button
                      onClick={() => onSetStatus(iss.id, "In Progress")}
                      className="text-bp-teal cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold"
                    >
                      In progress
                    </button>
                  )}
                  {iss.status !== "Resolved" && (
                    <button
                      onClick={() => onSetStatus(iss.id, "Resolved")}
                      className="text-bp-success cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold"
                    >
                      Resolve
                    </button>
                  )}
                  {iss.status !== "Open" && (
                    <button
                      onClick={() => onSetStatus(iss.id, "Open")}
                      className="text-bp-muted cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold"
                    >
                      Reopen
                    </button>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
