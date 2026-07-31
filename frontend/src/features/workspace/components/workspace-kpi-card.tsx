import type { ReactNode } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Progress } from "@/components/ui/progress";

export interface KpiDelta {
  label: string;
  /** `positive` renders the green rising-arrow pill, `neutral` the grey one. */
  tone: "positive" | "neutral";
}

export interface WorkspaceKpiCardProps {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  delta?: KpiDelta;
  /** Renders a meter under the label when set (0–100). */
  progress?: number;
}

export function WorkspaceKpiCard({ icon, value, label, delta, progress }: WorkspaceKpiCardProps) {
  return (
    <div className="border-bp-border bg-bp-card flex flex-col gap-3.5 rounded-[18px] border px-[22px] py-5 shadow-[0_1px_2px_rgba(19,36,29,0.04),0_10px_30px_-22px_rgba(19,36,29,0.18)]">
      <div className="flex items-center justify-between">
        <span className="text-bp-success flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ef]">
          {icon}
        </span>
        {delta && (
          <span
            className={
              delta.tone === "positive"
                ? "text-bp-success bg-bp-success-bg inline-flex items-center gap-[3px] rounded-full px-2 py-1 text-[11px] font-bold"
                : "text-bp-muted inline-flex items-center gap-[3px] rounded-full bg-[#eef2ef] px-2 py-1 text-[11px] font-semibold"
            }
          >
            {delta.tone === "positive" && <ArrowUpRight size={11} weight="bold" />}
            {delta.label}
          </span>
        )}
      </div>

      <div>
        <div className="font-mono-app text-bp-ink text-[32px] leading-none font-bold">{value}</div>
        <div className="text-bp-muted mt-2 text-[12.5px] font-medium">{label}</div>
        {progress !== undefined && (
          <Progress
            value={progress}
            aria-label={label}
            className="bg-bp-border-soft mt-[11px] h-1.5"
            indicatorClassName="bg-gradient-to-r from-mint-bright to-bp-mint"
          />
        )}
      </div>
    </div>
  );
}
