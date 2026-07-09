import { Bug } from "@phosphor-icons/react";
import { SectionHead } from "@/components/shared/section-head";
import { Chip } from "@/components/shared/chip";
import type { ProjectIssue } from "@/features/blueprints/blueprint-content";

export function PhaseIssuesPanel({
  issues,
  onToggle,
}: {
  issues: ProjectIssue[];
  onToggle: (issueId: string) => void;
}) {
  return (
    <div className="bg-bp-card border border-bp-border rounded-2xl shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)] p-[24px_28px]">
      <SectionHead
        icon={<Bug size={20} weight="duotone" className="text-bp-red" />}
        title="Project Issues"
        desc="Issues raised by the founder for this phase. Mark them resolved once fixed."
      />
      <div className="flex flex-col gap-3 mt-5">
        {issues.length === 0 && (
          <div className="text-bp-muted text-[13px] py-5 text-center">
            No active issues.
          </div>
        )}
        {issues.map((issue) => {
          const resolved = issue.status === "Resolved";
          return (
            <div
              key={issue.id}
              className="bg-bp-tint p-4 rounded-xl border border-bp-border-soft"
            >
              <div className="flex justify-between items-start mb-2">
                <div
                  className={`text-[14px] font-bold ${resolved ? "text-bp-muted line-through" : "text-bp-ink"}`}
                >
                  {issue.title}
                </div>
                <Chip tone={resolved ? "neutral" : issue.priority === "High" ? "red" : "amber"}>
                  {resolved ? "Resolved" : `${issue.priority} Priority`}
                </Chip>
              </div>
              <p className="text-bp-muted text-[13px] leading-relaxed mb-3.5">
                {issue.description}
              </p>
              <button
                onClick={() => onToggle(issue.id)}
                className={`text-[12px] font-bold px-3.5 py-2 rounded-lg cursor-pointer ${resolved ? "bg-bp-card text-bp-ink border border-bp-border" : "bg-bp-forest text-bp-mint border-none"}`}
              >
                {resolved ? "Reopen Issue" : "Mark as Resolved"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
