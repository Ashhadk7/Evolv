"use client";

import { motion } from "framer-motion";
import { Check, Code2, DollarSign, Sparkles, TrendingUp } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { FadeIn } from "@/components/ui/FadeIn";

function BlueprintPreview() {
  return (
    <FadeIn direction="right" className="relative">
      <div
        className="relative overflow-hidden rounded-lg border border-mint/20 bg-dark"
        style={{
          boxShadow:
            "0 30px 78px rgba(26,49,44,0.2), 0 8px 24px rgba(26,49,44,0.12), 0 1px 0 rgba(137,215,183,0.1) inset",
        }}
      >
        <div className="flex items-center justify-between border-b border-cream/6 bg-cream/[0.02] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
          </div>
          <span className="truncate px-3 text-xs font-mono text-cream/25">nexus-health.blueprint</span>
          <div className="w-12" />
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-mint" />
                <span className="text-xs uppercase text-mint/64">Published</span>
              </div>
              <h3 className="text-xl font-bold text-cream">Nexus Health</h3>
              <p className="mt-1 text-xs text-cream/38">HealthTech - Series A ready</p>
            </div>
            <div className="text-right">
              <div className="mb-1 text-xs text-cream/32">Viability score</div>
              <div className="text-4xl font-bold leading-none text-mint">
                <AnimatedCounter to={84} duration={1.5} />
              </div>
              <div className="mt-1 text-xs text-mint/55">A+ rating</div>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3">
            {[
              { label: "Investor interest", value: 92 },
              { label: "Market potential", value: 91 },
              { label: "Developer demand", value: 78 },
              { label: "Funding readiness", value: 82 },
            ].map((item, index) => (
              <div key={item.label} className="rounded-lg border border-cream/8 bg-cream/[0.04] p-3">
                <div className="mb-1 text-xl font-bold text-mint">
                  <AnimatedCounter to={item.value} suffix="%" duration={1.2 + index * 0.15} />
                </div>
                <div className="text-xs leading-snug text-cream/38">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="mb-5 rounded-lg border border-mint/12 bg-mint/[0.06] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={13} className="text-mint" />
              <span className="text-xs font-medium uppercase text-mint/72">AI assessment</span>
            </div>
            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div>
                <div className="mb-2 text-cream/32">Strengths</div>
                {["Strong market demand", "High investor engagement", "Growing developer interest"].map(
                  (strength) => (
                    <div key={strength} className="mb-1.5 flex items-center gap-1.5 text-cream/64">
                      <Check size={10} className="shrink-0 text-mint" /> {strength}
                    </div>
                  )
                )}
              </div>
              <div>
                <div className="mb-2 text-cream/32">Recommendation</div>
                <div className="leading-relaxed text-cream/52">
                  Publish the blueprint publicly and invite seed investors. Current investor appeal
                  is high.
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-cream/6 pt-4">
            <div className="mb-3 text-xs uppercase text-cream/32">Matched developers</div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { initials: "JD", label: "94%" },
                { initials: "SM", label: "88%" },
                { initials: "AK", label: "76%" },
              ].map((dev) => (
                <div
                  key={dev.initials}
                  className="flex items-center gap-1.5 rounded-lg border border-cream/8 bg-cream/[0.04] px-2.5 py-1.5"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mid/50 text-[9px] font-bold text-cream/75">
                    {dev.initials}
                  </span>
                  <span className="text-xs text-mint/72">{dev.label}</span>
                </div>
              ))}
              <span className="text-xs text-cream/28">+9 more</span>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

const features = [
  {
    icon: TrendingUp,
    title: "Market analysis",
    desc: "Competitor map, market size, entry timing, customer segments, and trend signals synthesized into a readable brief.",
  },
  {
    icon: Code2,
    title: "Tech architecture",
    desc: "Recommended stack, system design, infrastructure notes, delivery milestones, and developer cost estimate.",
  },
  {
    icon: DollarSign,
    title: "Financial projections",
    desc: "Revenue model, funding target, operating assumptions, and 12-month projection based on comparable startups.",
  },
  {
    icon: Sparkles,
    title: "Viability score",
    desc: "A 0 to 100 rating across market timing, demand, competition, investor fit, technical risk, and execution complexity.",
  },
];

export function BlueprintSpotlight() {
  return (
    <section className="relative overflow-hidden bg-[#fdf8f0] px-4 py-20 sm:px-6 md:px-12 lg:py-24">
      <div className="absolute left-0 right-0 top-0 h-px bg-dark/10" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-dark/6" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,49,44,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(26,49,44,0.045) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "linear-gradient(to bottom, transparent, black 18%, black 84%, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
          <BlueprintPreview />

          <FadeIn direction="left" className="lg:pl-6">
            <div className="mb-3 text-xs font-semibold uppercase text-mid">The blueprint</div>
            <h2 className="mb-5 text-3xl font-bold leading-tight text-dark sm:text-4xl md:text-5xl">
              Your idea, fully <span className="text-mid">documented</span>
            </h2>
            <p className="mb-9 text-base leading-relaxed text-dark/58 md:text-lg">
              A blueprint is the shared operating document for founders, developers, and investors:
              clear enough for execution, detailed enough for due diligence, and structured enough
              for AI matching.
            </p>

            <div className="flex flex-col gap-5">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={false}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex items-start gap-4"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-mid/20 bg-mid/10">
                    <feature.icon size={18} className="text-mid" />
                  </div>
                  <div>
                    <div className="mb-1 text-sm font-semibold text-dark">{feature.title}</div>
                    <div className="text-sm leading-relaxed text-dark/55">{feature.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
