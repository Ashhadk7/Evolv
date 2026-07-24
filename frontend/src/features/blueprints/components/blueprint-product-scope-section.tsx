"use client";

import { CheckCircle, ListChecks, XCircle } from "@phosphor-icons/react";
import { cardStyle } from "@/components/shared/card-style";
import { Chip } from "@/components/shared/chip";
import { Label } from "@/components/shared/label";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";
import type { ProductFeature } from "@/features/blueprints/blueprint-content";

function priorityTone(priority: string) {
  return (
    priority === "Must-have" || priority === "High"
      ? "mint"
      : priority === "Should-have" || priority === "Medium"
        ? "amber"
        : "neutral"
  ) as "mint" | "amber" | "neutral";
}

const TIERS = ["Must-have", "Should-have", "Nice-to-have"];

export function BlueprintProductScopeSection({
  featureItems,
  outOfScope,
}: {
  featureItems: ProductFeature[];
  outOfScope: string[];
}) {
  return (
    <Reveal>
      <div style={cardStyle({ padding: "28px 30px" })}>
        <SectionHead
          icon={<ListChecks size={18} weight="duotone" className="text-bp-success" />}
          kicker="Scope"
          title="Product Scope"
          desc="The MVP feature spec — grouped by priority, each with a user story and acceptance criteria."
        />
        <div className="flex flex-col gap-6">
          {TIERS.map((tier) => {
            const items = featureItems.filter((feature) => feature.priority === tier);
            if (!items.length) return null;
            return (
              <div key={tier}>
                <div className="mb-3 flex items-center gap-2">
                  <Chip tone={priorityTone(tier)}>{tier}</Chip>
                  <span className="font-mono-app text-bp-label text-[11px]">{items.length}</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {items.map((feature, index) => (
                    <div
                      key={index}
                      className="border-bp-border-soft bg-bp-tint rounded-xl border px-4 py-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle size={15} weight="fill" className="text-bp-mint shrink-0" />
                          <span className="text-bp-ink text-[13.5px] font-semibold">
                            {feature.name}
                          </span>
                          {feature.module ? <Chip tone="neutral">{feature.module}</Chip> : null}
                        </div>
                        {feature.effort ? (
                          <span className="font-mono-app text-bp-label shrink-0 text-[10.5px]">
                            {feature.effort}
                          </span>
                        ) : null}
                      </div>
                      {feature.description ? (
                        <p className="text-bp-muted mt-2 ml-6 text-[12px] leading-[1.55]">
                          {feature.description}
                        </p>
                      ) : null}
                      {feature.userStory ? (
                        <p className="text-bp-muted mt-1.5 ml-6 text-[11.5px] italic leading-[1.5]">
                          &ldquo;{feature.userStory}&rdquo;
                        </p>
                      ) : null}
                      {feature.acceptanceCriteria?.length ? (
                        <ul className="mt-2 ml-6 flex flex-col gap-1">
                          {feature.acceptanceCriteria.map((criterion, j) => (
                            <li
                              key={j}
                              className="text-bp-muted flex items-start gap-1.5 text-[11px]"
                            >
                              <CheckCircle
                                size={11}
                                weight="bold"
                                className="text-bp-label mt-[3px] shrink-0"
                              />
                              <span>{criterion}</span>
                            </li>
                          ))}
                        </ul>
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
