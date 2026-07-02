"use client";

import { motion } from "framer-motion";
import {
  BracketsAngle,
  ChartLineUp,
  Check,
  CurrencyDollar,
  Sparkle,
  Star,
} from "@phosphor-icons/react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

function ProgressBar({ value, delay }: { value: number; delay: number }) {
  return (
    <div className="h-[3px] overflow-hidden rounded-full" style={{ background: "rgba(26,49,44,0.08)" }}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ delay, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="h-full rounded-full"
        style={{ background: "linear-gradient(90deg, #428475, #89d7b7)" }}
      />
    </div>
  );
}

function BlueprintPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative"
    >
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(26,49,44,0.1)",
          boxShadow:
            "0 4px 24px rgba(26,49,44,0.08), 0 1px 4px rgba(26,49,44,0.06)",
        }}
      >
        {/* Window chrome */}
        <div
          className="flex items-center justify-between border-b px-5 py-3"
          style={{
            borderColor: "rgba(26,49,44,0.07)",
            background: "rgba(26,49,44,0.018)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/45" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/45" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/45" />
          </div>
          <span className="font-mono text-[10px] tracking-wide" style={{ color: "rgba(26,49,44,0.22)" }}>
            nexus-health.blueprint
          </span>
          <div className="w-16" />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#428475] opacity-55" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#428475]" />
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#428475" }}>
                  Published
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight" style={{ color: "#0f1e1a" }}>
                Nexus Health
              </h3>
              <p className="mt-0.5 text-[11px]" style={{ color: "rgba(15,30,26,0.35)" }}>
                HealthTech · Series A ready
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] mb-1" style={{ color: "rgba(15,30,26,0.3)" }}>
                Viability score
              </div>
              <div className="text-[2.6rem] font-bold leading-none tabular-nums" style={{ color: "#428475" }}>
                <AnimatedCounter to={84} duration={1.5} />
              </div>
              <div className="mt-1 text-[9px] font-semibold uppercase tracking-wider" style={{ color: "rgba(66,132,117,0.6)" }}>
                A+ rating
              </div>
            </div>
          </div>

          {/* Metric grid */}
          <div className="mb-5 grid grid-cols-2 gap-2.5">
            {[
              { label: "Market potential", value: 91 },
              { label: "Developer demand", value: 78 },
              { label: "Funding readiness", value: 82 },
            ].map((item, i) => (
              <div
                key={item.label}
                className="rounded-xl p-3"
                style={{
                  background: "rgba(26,49,44,0.03)",
                  border: "1px solid rgba(26,49,44,0.06)",
                }}
              >
                <div className="mb-1 text-[1.2rem] font-bold tabular-nums" style={{ color: "#428475" }}>
                  <AnimatedCounter to={item.value} suffix="%" duration={1.2 + i * 0.15} />
                </div>
                <div className="text-[10px] leading-snug" style={{ color: "rgba(15,30,26,0.38)" }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* AI insight */}
          <div
            className="mb-5 rounded-xl p-4"
            style={{
              background: "rgba(66,132,117,0.05)",
              border: "1px solid rgba(66,132,117,0.12)",
            }}
          >
            <div className="mb-2.5 flex items-center gap-2">
              <Sparkle size={12} weight="fill" style={{ color: "#428475" }} />
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#428475" }}>
                AI assessment
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <div className="mb-2" style={{ color: "rgba(15,30,26,0.3)" }}>
                  Strengths
                </div>
                {["Strong market demand", "Growing developer interest"].map(
                  (s) => (
                    <div key={s} className="mb-1.5 flex items-center gap-1.5" style={{ color: "rgba(15,30,26,0.6)" }}>
                      <Check size={9} weight="bold" style={{ color: "#428475" }} />
                      {s}
                    </div>
                  )
                )}
              </div>
              <div>
                <div className="mb-2" style={{ color: "rgba(15,30,26,0.3)" }}>
                  Recommendation
                </div>
                <div className="leading-relaxed" style={{ color: "rgba(15,30,26,0.5)" }}>
                  Publish publicly and invite developers. Current appeal is high.
                </div>
              </div>
            </div>
          </div>

          {/* Developer matches */}
          <div style={{ borderTop: "1px solid rgba(26,49,44,0.07)" }} className="pt-4">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(15,30,26,0.3)" }}>
              Matched developers
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { initials: "JD", label: "94%" },
                { initials: "SM", label: "88%" },
                { initials: "AK", label: "76%" },
              ].map((dev) => (
                <div
                  key={dev.initials}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                  style={{
                    background: "rgba(26,49,44,0.04)",
                    border: "1px solid rgba(26,49,44,0.07)",
                  }}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
                    style={{ background: "rgba(66,132,117,0.18)", color: "#428475" }}
                  >
                    {dev.initials}
                  </span>
                  <span className="text-[11px]" style={{ color: "#428475" }}>
                    {dev.label}
                  </span>
                </div>
              ))}
              <span className="text-[11px]" style={{ color: "rgba(15,30,26,0.28)" }}>
                +9 more
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const features = [
  {
    Icon: ChartLineUp,
    title: "Market analysis",
    desc: "Competitor map, market size, entry timing, customer segments, and trend signals synthesized into a readable brief.",
  },
  {
    Icon: BracketsAngle,
    title: "Tech architecture",
    desc: "Recommended stack, system design, infrastructure notes, delivery milestones, and developer cost estimate.",
  },
  {
    Icon: CurrencyDollar,
    title: "Financial projections",
    desc: "Revenue model, funding target, operating assumptions, and 12-month projection based on comparable startups.",
  },
  {
    Icon: Star,
    title: "Viability score",
    desc: "A 0–100 rating across market timing, demand, competition, technical risk, and execution complexity.",
  },
];

export function BlueprintSpotlight() {
  return (
    <section
      id="blueprint"
      className="relative overflow-hidden px-4 py-20 sm:px-6 md:px-12 lg:py-28"
      style={{ background: "#fdf9f4" }}
    >
      <div
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: "rgba(26,49,44,0.08)" }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "rgba(26,49,44,0.06)" }}
      />

      {/* Warm glow bottom-right — creates visual depth without a tile */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px]"
        style={{
          background:
            "radial-gradient(ellipse at bottom right, rgba(66,132,117,0.07) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
          <BlueprintPreview />

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:pl-6"
          >
            <div
              className="mb-4 inline-flex items-center rounded-full px-3 py-1"
              style={{
                background: "rgba(66,132,117,0.08)",
                border: "1px solid rgba(66,132,117,0.14)",
              }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "#428475" }}
              >
                The blueprint
              </span>
            </div>
            <h2
              className="mb-5 text-3xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-4xl md:text-[2.8rem]"
              style={{ color: "#0f1e1a" }}
            >
              Your idea,{" "}
              <span style={{ color: "#428475" }}>fully documented</span>
            </h2>
            <p
              className="mb-10 text-[15px] leading-relaxed"
              style={{ color: "rgba(15,30,26,0.5)" }}
            >
              A blueprint is the shared operating document for founders and developers:
              clear enough for execution, detailed enough for due diligence, and structured enough
              for AI matching.
            </p>

            <div className="flex flex-col gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.5,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  className="flex items-start gap-4"
                >
                  <div
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(66,132,117,0.08)",
                      border: "1px solid rgba(66,132,117,0.14)",
                    }}
                  >
                    <feature.Icon size={18} weight="bold" style={{ color: "#428475" }} />
                  </div>
                  <div>
                    <div
                      className="mb-1 text-[13px] font-semibold tracking-tight"
                      style={{ color: "#0f1e1a" }}
                    >
                      {feature.title}
                    </div>
                    <div
                      className="text-[13px] leading-relaxed"
                      style={{ color: "rgba(15,30,26,0.5)" }}
                    >
                      {feature.desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
