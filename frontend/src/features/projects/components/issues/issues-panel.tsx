"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bug, CaretRight, ChatCircle, Paperclip, Plus } from "@phosphor-icons/react";
import { Chip } from "@/components/shared/chip";
import { Kicker } from "@/components/shared/kicker";
import { ScrollArea } from "@/components/shared/scroll-area";
import { fmtDate } from "@/features/blueprints/blueprint-content";
import type { IssueStatus } from "@/features/projects/developer-projects-api";
import { ISSUE_PRIORITY_LABEL, type Issue } from "@/features/projects/issues-api";
import { AssigneeFilter, EVERYONE, MINE, type AssigneeOption } from "../assignee-filter";

const PRIORITY_TONE = { high: "red", medium: "amber", low: "mint" } as const;

const GROUPS: { key: string; label: string; statuses: IssueStatus[] }[] = [
  { key: "open", label: "Open", statuses: ["open"] },
  { key: "active", label: "In Progress", statuses: ["in_progress"] },
  { key: "done", label: "Done", statuses: ["in_review", "resolved"] },
];

export function IssuesPanel({
  issues,
  phaseNameFor,
  onOpenIssue,
  onCreate,
  showMineFilter = false,
}: {
  issues: Issue[];
  phaseNameFor: (index: number) => string | undefined;
  onOpenIssue: (issueId: string) => void;
  onCreate?: () => void;
  showMineFilter?: boolean;
}) {
  const [filter, setFilter] = useState(showMineFilter ? MINE : EVERYONE);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    open: true,
    active: true,
    done: false,
  });

  const mineCount = issues.filter((i) => i.assigned_to_me).length;
  const visible =
    filter === EVERYONE
      ? issues
      : filter === MINE
        ? issues.filter((i) => i.assigned_to_me)
        : issues.filter((i) => i.assignee_id === filter);
  const openCount = issues.filter((i) => i.status !== "resolved").length;

  const assigneeOptions = Array.from(
    issues.reduce((acc, issue) => {
      if (!issue.assignee_id || !issue.assignee_name) return acc;
      const existing = acc.get(issue.assignee_id);
      acc.set(issue.assignee_id, {
        id: issue.assignee_id,
        name: issue.assignee_name,
        count: (existing?.count ?? 0) + 1,
      });
      return acc;
    }, new Map<string, AssigneeOption>()).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="bg-bp-card border-bp-border rounded-2xl border p-[18px_20px] shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)]">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Bug size={17} weight="duotone" className="text-bp-red" />
          <div>
            <Kicker>Issues &amp; fixes</Kicker>
            <h3 className="text-bp-ink text-[15px] font-extrabold">
              {openCount} unresolved
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AssigneeFilter
            options={assigneeOptions}
            value={filter}
            mineCount={mineCount}
            totalCount={issues.length}
            onChange={setFilter}
          />
          {onCreate && (
            <button type="button" onClick={onCreate} className="bp-primary-btn">
              <Plus size={11} weight="bold" /> New
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-bp-muted m-0 text-[12.5px]">
          {filter === EVERYONE
            ? "No issues raised — everything shipped so far matches the spec."
            : "Nothing assigned here right now."}
        </p>
      ) : (
        <ScrollArea size="lg">
        <div className="flex flex-col gap-3">
          {GROUPS.map((group) => {
            const groupIssues = visible.filter((i) => group.statuses.includes(i.status));
            if (groupIssues.length === 0) return null;
            const isOpen = openGroups[group.key];

            return (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroups((prev) => ({ ...prev, [group.key]: !prev[group.key] }))
                  }
                  className="mb-1.5 flex w-full cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-left"
                >
                  <CaretRight
                    size={11}
                    weight="bold"
                    className={`text-bp-muted transition-transform ${isOpen ? "rotate-90" : ""}`}
                  />
                  <span className="text-bp-label text-[10px] font-semibold uppercase tracking-[0.12em]">
                    {group.label}
                  </span>
                  <span className="text-bp-muted text-[10px] tabular-nums">
                    {groupIssues.length}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="m-0 flex list-none flex-col gap-2 overflow-hidden p-0"
                    >
                      {groupIssues.map((issue) => (
                        <li key={issue.id}>
                          <button
                            type="button"
                            onClick={() => onOpenIssue(issue.id)}
                            className="border-bp-border-soft bg-bp-tint hover:border-bp-mint w-full cursor-pointer rounded-xl border p-[10px_12px] text-left transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-bp-ink text-[12.5px] font-bold leading-snug">
                                {issue.title}
                              </span>
                              <Chip tone={PRIORITY_TONE[issue.priority]}>
                                {ISSUE_PRIORITY_LABEL[issue.priority]}
                              </Chip>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              {issue.assigned_to_me ? (
                                <Chip tone="dark">Assigned to you</Chip>
                              ) : (
                                issue.assignee_name && <Chip>{issue.assignee_name}</Chip>
                              )}
                              {issue.phase_index !== null && (
                                <Chip>
                                  {phaseNameFor(issue.phase_index) ??
                                    `Phase ${issue.phase_index + 1}`}
                                </Chip>
                              )}
                              {issue.status === "in_review" && (
                                <Chip tone="amber">Awaiting founder confirmation</Chip>
                              )}
                              {issue.due_date && (
                                <Chip tone="neutral">Due {fmtDate(issue.due_date)}</Chip>
                              )}
                              {issue.comment_count > 0 && (
                                <span className="text-bp-muted flex items-center gap-1 text-[11px]">
                                  <ChatCircle size={11} weight="fill" />
                                  {issue.comment_count}
                                </span>
                              )}
                              {issue.attachment_count > 0 && (
                                <span className="text-bp-muted flex items-center gap-1 text-[11px]">
                                  <Paperclip size={11} weight="bold" />
                                  {issue.attachment_count}
                                </span>
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        </ScrollArea>
      )}
    </div>
  );
}
