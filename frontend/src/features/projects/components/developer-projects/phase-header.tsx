import { CalendarBlank } from "@phosphor-icons/react";
import { Kicker } from "@/components/shared/kicker";
import { Chip } from "@/components/shared/chip";
import { Label } from "@/components/shared/label";
import { fmtDate } from "@/features/blueprints/blueprint-content";

export function PhaseHeader({
  founderName,
  industry,
  phaseName,
  primarySkill,
  weeks,
  deadline,
}: {
  founderName: string;
  industry: string;
  phaseName: string;
  primarySkill: string;
  weeks: number;
  deadline: string | null;
}) {
  return (
    <div className="bg-bp-card border border-bp-border rounded-2xl shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)] p-[28px_32px]">
      <div className="flex justify-between items-start">
        <div>
          <Kicker>
            {founderName} · {industry}
          </Kicker>
          <h1 className="text-bp-ink text-[26px] font-extrabold mb-2">
            {phaseName}
          </h1>
          <div className="flex gap-2 mt-3">
            <Chip tone="dark">{primarySkill}</Chip>
            <Chip tone="neutral">{weeks} Weeks Estimate</Chip>
          </div>
        </div>
        {deadline && (
          <div className="text-right">
            <Label>Deadline</Label>
            <div className="text-bp-ink text-[16px] font-bold flex items-center gap-1.5">
              <CalendarBlank size={18} weight="duotone" className="text-bp-amber" />
              {fmtDate(deadline)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
