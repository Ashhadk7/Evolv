import { CheckCircle, Circle } from "@phosphor-icons/react";
import { SectionHead } from "@/components/shared/section-head";

export function DeliverablesPanel({
  deliverables,
  onToggle,
}: {
  deliverables: { text: string; done: boolean }[];
  onToggle: (index: number) => void;
}) {
  return (
    <div className="bg-bp-card border border-bp-border rounded-2xl shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)] p-[24px_28px]">
      <SectionHead
        icon={<CheckCircle size={20} weight="duotone" className="text-bp-teal" />}
        title="Deliverables"
        desc="Check off deliverables as you complete them to keep the founder updated."
      />
      <div className="flex flex-col gap-2.5 mt-5">
        {deliverables.map((d, dIdx) => (
          <button
            key={dIdx}
            onClick={() => onToggle(dIdx)}
            className={`flex items-center gap-3.5 p-[12px_16px] rounded-xl border cursor-pointer text-left transition-all duration-150 ${d.done ? "bg-bp-success-bg border-[#cfeadd]" : "bg-bp-tint border-bp-border-soft"}`}
          >
            {d.done ? (
              <CheckCircle size={20} weight="fill" className="text-bp-success flex-shrink-0" />
            ) : (
              <Circle size={20} className="text-bp-label flex-shrink-0" />
            )}
            <span
              className={`text-[14px] ${d.done ? "text-bp-success font-semibold line-through" : "text-bp-ink font-medium"}`}
            >
              {d.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
