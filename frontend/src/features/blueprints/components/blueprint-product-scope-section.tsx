"use client";

import { CheckCircle, ListChecks, XCircle } from "@phosphor-icons/react";
import { NUM, cardStyle } from "@/components/shared/card-style";
import { Chip } from "@/components/shared/chip";
import { Label } from "@/components/shared/label";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";

interface ScopeItem {
  name: string;
  note?: string;
  priority: string;
}

function priorityTone(priority: string) {
  return (
    priority === "Must-have" || priority === "High"
      ? "mint"
      : priority === "Should-have" || priority === "Medium"
        ? "amber"
        : "neutral"
  ) as "mint" | "amber" | "neutral";
}

export function BlueprintProductScopeSection({
  featureItems,
  outOfScope,
}: {
  featureItems: ScopeItem[];
  outOfScope: string[];
}) {
  return (
    <Reveal>
      <div style={cardStyle({ padding: "28px 30px" })}>
        <SectionHead
          icon={<ListChecks size={18} weight="duotone" className="text-bp-success" />}
          kicker="Scope"
          title="Product Scope"
          desc="The feature set, grouped by priority so the team builds the right thing first."
        />
        <div className="grid grid-cols-3 gap-4">
          {["Must-have", "Should-have", "Nice-to-have"].map((tier) => {
            const items = featureItems.filter((feature) => feature.priority === tier);
            return (
              <div key={tier}>
                <div className="mb-3 flex items-center gap-2">
                  <Chip tone={priorityTone(tier)}>{tier}</Chip>
                  <span style={NUM} className="font-mono-app text-bp-label text-[11px]">
                    {items.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {items.map((feature, index) => (
                    <div
                      key={index}
                      className="border-bp-border-soft bg-bp-tint rounded-xl border px-3.5 py-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle size={15} weight="fill" className="text-bp-mint shrink-0" />
                        <span className="text-bp-ink text-[13px] font-semibold">
                          {feature.name}
                        </span>
                      </div>
                      {feature.note ? (
                        <div className="font-mono-app text-bp-muted mt-[3px] ml-6 text-[10.5px]">
                          {feature.note}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {outOfScope.length ? (
          <div className="mt-5">
            <Label>Out of scope for v1</Label>
            <div className="flex flex-col gap-2">
              {outOfScope.map((item, index) => (
                <div key={index} className="flex items-start gap-[9px]">
                  <XCircle size={15} weight="fill" className="text-bp-label mt-px shrink-0" />
                  <span className="text-bp-muted text-[12.5px] leading-[1.5]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
