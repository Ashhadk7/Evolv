"use client";

import { motion } from "framer-motion";
import { Sparkle } from "@phosphor-icons/react";

function ProgressBar({ value, delay }: { value: number; delay: number }) {
  return (
    <div className="bg-cream/8 h-[3px] overflow-hidden rounded-full">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ delay, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="h-full rounded-full"
        style={{ background: "linear-gradient(90deg, #428475, #89d7b7)" }}
      />
    </div>
  );
}

export function BlueprintCard() {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(160deg, #0d1c18 0%, #091410 100%)",
        border: "1px solid rgba(137,215,183,0.14)",
        boxShadow:
          "0 0 0 1px rgba(137,215,183,0.07) inset, 0 40px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Window chrome */}
      <div className="border-cream/[0.06] bg-cream/[0.018] flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/50" />
        </div>
        <span className="text-cream/20 font-mono text-[10px] tracking-wide">
          nexus-health.blueprint
        </span>
        <div className="w-14" />
      </div>

      <div className="p-5">
        {/* Header row */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="bg-mint absolute inline-flex h-full w-full animate-ping rounded-full opacity-55" />
                <span className="bg-mint relative inline-flex h-1.5 w-1.5 rounded-full" />
              </span>
              <span className="text-mint/55 text-[9px] font-semibold tracking-widest uppercase">
                Blueprint live
              </span>
            </div>
            <h3 className="text-cream/95 text-[15px] leading-tight font-semibold tracking-tight">
              Nexus Health
            </h3>
            <p className="text-cream/32 mt-0.5 text-[11px]">HealthTech · AI diagnostics</p>
          </div>
          <div className="shrink-0 text-right">
            <div
              className="text-[2.2rem] leading-none font-bold tabular-nums"
              style={{ color: "#89d7b7" }}
            >
              84
            </div>
            <div className="text-cream/24 mt-0.5 text-[9px] tracking-wider uppercase">
              Viability
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="mb-4 space-y-2.5">
          {[
            { label: "Investor interest", value: 92 },
            { label: "Market potential", value: 88 },
            { label: "Developer demand", value: 78 },
          ].map((item, i) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-[10px]">
                <span className="text-cream/36">{item.label}</span>
                <span className="text-mint/70">{item.value}%</span>
              </div>
              <ProgressBar value={item.value} delay={0.6 + i * 0.1} />
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {["React", "FastAPI", "PostgreSQL", "AWS"].map((tag) => (
            <span
              key={tag}
              className="text-mint/58 rounded-md px-2 py-0.5 text-[10px]"
              style={{
                background: "rgba(137,215,183,0.07)",
                border: "1px solid rgba(137,215,183,0.12)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* AI insight */}
        <div
          className="flex items-start gap-2 rounded-lg px-3 py-2.5"
          style={{
            background: "rgba(137,215,183,0.055)",
            border: "1px solid rgba(137,215,183,0.1)",
          }}
        >
          <Sparkle size={11} weight="fill" className="text-mint mt-0.5 shrink-0" />
          <p className="text-cream/42 text-[10px] leading-relaxed">
            Publish now — HealthTech demand is up 17% this month.
          </p>
        </div>
      </div>
    </div>
  );
}
