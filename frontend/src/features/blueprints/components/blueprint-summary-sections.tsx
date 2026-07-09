"use client";

import { motion } from "framer-motion";
import { Notebook, Pulse } from "@phosphor-icons/react";
import type { Blueprint } from "@/features/blueprints/types";
import { NUM, cardStyle } from "@/components/shared/card-style";
import { Chip } from "@/components/shared/chip";
import { Label } from "@/components/shared/label";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";
import { SegmentedBar } from "./segmented-bar";
import { Trend } from "./trend";

interface AnalyticsItem {
  label: string;
  value: string;
  trend: string;
  up: boolean;
  cap: string;
  lit: number;
}

interface RecommendationItem {
  p: string;
  text: string;
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

export function BlueprintExecutiveSummarySection({
  bp,
  totalBuildCost,
  timelineLabel,
  phaseCount,
  roleCount,
  mvpFeatureCount,
}: {
  bp: Blueprint;
  totalBuildCost: string;
  timelineLabel: string;
  phaseCount: number;
  roleCount: number;
  mvpFeatureCount: number;
}) {
  const snapshotRows = [
    ["Total build cost", totalBuildCost],
    ["Build time", timelineLabel],
    ["Milestones", `${phaseCount} phases`],
    ["Roles needed", `${roleCount}`],
    ["MVP features", `${mvpFeatureCount} core`],
  ];

  return (
    <Reveal>
      <div className="grid grid-cols-[1.6fr_1fr] gap-[22px]">
        <div style={cardStyle({ padding: "28px 30px" })}>
          <SectionHead
            icon={<Notebook size={18} weight="duotone" className="text-bp-teal" />}
            kicker="Overview"
            title="Executive Summary"
          />
          <p className="text-bp-body mb-3.5 text-[14.5px] leading-[1.75]">
            <strong className="text-bp-ink">{bp.name}</strong> is a {bp.industry} venture built
            around a simple thesis: {bp.differentiator.toLowerCase()}. {bp.ideaDesc}
          </p>
          <p className="text-bp-body text-[14.5px] leading-[1.75]">
            This blueprint translates that idea into an executable plan - a recommended
            architecture, a milestone-based build roadmap, a budget the founder funds directly, and
            the developer profiles best matched to ship it. Everything below is structured so a
            developer could pick it up and start building.
          </p>
        </div>
        <div style={cardStyle({ padding: "26px 28px" })}>
          <Label>Build snapshot</Label>
          <div className="flex flex-col">
            {snapshotRows.map(([label, value], index) => (
              <div
                key={label}
                className={`flex items-center justify-between py-[11px] ${
                  index === 0 ? "border-t-0" : "border-bp-border-soft border-t"
                }`}
              >
                <span className="text-bp-muted text-[12.5px]">{label}</span>
                <span style={NUM} className="text-bp-ink text-[13px] font-bold">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function BlueprintSignalsSection({
  analytics,
  recommendations,
}: {
  analytics: AnalyticsItem[];
  recommendations: RecommendationItem[];
}) {
  return (
    <Reveal>
      <SectionHead
        icon={<Pulse size={18} weight="duotone" className="text-bp-teal" />}
        kicker="Traction"
        title="Signals & Activity"
        desc="How this blueprint is performing on the platform, and what to act on next."
      />
      <div className="mb-[18px] grid grid-cols-3 gap-4">
        {analytics.map((item) => (
          <motion.div
            key={item.label}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={cardStyle({ padding: "20px", textAlign: "center" })}
          >
            <div style={NUM} className="text-bp-ink text-[28px] leading-none font-extrabold">
              {item.value}
            </div>
            <div className="font-mono-app text-bp-label mt-[7px] text-[9.5px] font-bold tracking-[0.08em] uppercase">
              {item.label}
            </div>
            <div className="mt-2.5 flex justify-center">
              <Trend value={item.trend} positive={item.up} />
            </div>
            <div className="text-bp-label mt-[7px] text-[10.5px]">{item.cap}</div>
            <div className="mt-3">
              <SegmentedBar value={0} total={8} lit={item.lit} height={14} />
            </div>
          </motion.div>
        ))}
      </div>
      <div style={cardStyle({ padding: "24px 26px" })}>
        <Label>Recommended next steps</Label>
        <div className="grid grid-cols-2 gap-x-7 gap-y-3">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3">
              <Chip tone={priorityTone(recommendation.p)}>{recommendation.p}</Chip>
              <span className="text-bp-body pt-0.5 text-[13px] leading-[1.5]">
                {recommendation.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
