"use client";

import { motion } from "framer-motion";
import { Sparkle } from "@phosphor-icons/react";

const BRAND_MINT = "#89d7b7";

function ProgressBar({ value, delay }: { value: number; delay: number }) {
  return (
    <div
      className="h-[3px] overflow-hidden rounded-full"
      style={{ background: "rgba(255,244,225,0.08)" }}
    >
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
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: "rgba(255,244,225,0.06)", background: "rgba(255,244,225,0.018)" }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: "rgba(255,95,86,0.5)" }}
          />
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: "rgba(255,189,46,0.5)" }}
          />
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: "rgba(39,201,63,0.5)" }}
          />
        </div>
        <span
          className="font-mono text-[10px] tracking-wide"
          style={{ color: "rgba(255,244,225,0.2)" }}
        >
          nexus-health.blueprint
        </span>
        <div className="w-14" />
      </div>

      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-55"
                  style={{ background: BRAND_MINT }}
                />
                <span
                  className="relative inline-flex h-1.5 w-1.5 rounded-full"
                  style={{ background: BRAND_MINT }}
                />
              </span>
              <span
                className="text-[9px] font-semibold tracking-widest uppercase"
                style={{ color: "rgba(137,215,183,0.55)" }}
              >
                Blueprint live
              </span>
            </div>
            <h3
              className="text-[15px] leading-tight font-semibold tracking-tight"
              style={{ color: "rgba(255,244,225,0.95)" }}
            >
              Nexus Health
            </h3>
            <p className="mt-0.5 text-[11px]" style={{ color: "rgba(255,244,225,0.32)" }}>
              HealthTech · AI diagnostics
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div
              className="text-[2.2rem] leading-none font-bold tabular-nums"
              style={{ color: BRAND_MINT }}
            >
              84
            </div>
            <div
              className="mt-0.5 text-[9px] tracking-wider uppercase"
              style={{ color: "rgba(255,244,225,0.24)" }}
            >
              Viability
            </div>
          </div>
        </div>

        <div className="mb-4 space-y-2.5">
          {[
            { label: "Investor interest", value: 92 },
            { label: "Market potential", value: 88 },
            { label: "Developer demand", value: 78 },
          ].map((item, i) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-[10px]">
                <span style={{ color: "rgba(255,244,225,0.36)" }}>{item.label}</span>
                <span style={{ color: "rgba(137,215,183,0.7)" }}>{item.value}%</span>
              </div>
              <ProgressBar value={item.value} delay={0.6 + i * 0.1} />
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {["React", "FastAPI", "PostgreSQL", "AWS"].map((tag) => (
            <span
              key={tag}
              className="rounded-md px-2 py-0.5 text-[10px]"
              style={{
                background: "rgba(137,215,183,0.07)",
                border: "1px solid rgba(137,215,183,0.12)",
                color: "rgba(137,215,183,0.58)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          className="flex items-start gap-2 rounded-lg px-3 py-2.5"
          style={{
            background: "rgba(137,215,183,0.055)",
            border: "1px solid rgba(137,215,183,0.1)",
          }}
        >
          <Sparkle
            size={11}
            weight="fill"
            className="mt-0.5 shrink-0"
            style={{ color: BRAND_MINT }}
          />
          <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,244,225,0.42)" }}>
            Publish now — HealthTech investor demand is up 17% this month.
          </p>
        </div>
      </div>
    </div>
  );
}
