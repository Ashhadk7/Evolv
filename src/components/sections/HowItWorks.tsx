"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Bot, FileText, Handshake, Users } from "lucide-react";
import { useRef } from "react";
import { FadeIn } from "@/components/ui/FadeIn";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Submit your idea",
    description:
      "Type the concept, target customer, problem, and early vision. Evolv turns messy notes into a structured intake without forcing business-plan formatting.",
    tag: "2 minutes",
    detail: "Idea intake",
  },
  {
    number: "02",
    icon: Bot,
    title: "AI forges the blueprint",
    description:
      "Specialized agents validate viability, map competitors, plan MVP features, design the architecture, estimate cost, and project the first financial model.",
    tag: "30 to 60 seconds",
    detail: "Agent pipeline",
  },
  {
    number: "03",
    icon: Users,
    title: "Matches surface instantly",
    description:
      "Developers are ranked by stack fit while high-scoring blueprints are routed into investor feeds based on domain, stage, and viability thresholds.",
    tag: "Automatic",
    detail: "Vector matching",
  },
  {
    number: "04",
    icon: Handshake,
    title: "Connect and build",
    description:
      "Message developers, share investor-ready context, and keep the blueprint as the source of truth as the venture moves from concept to execution.",
    tag: "All in one place",
    detail: "Shared workspace",
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.78", "end 0.22"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#132b25] px-4 py-20 sm:px-6 md:px-12 lg:py-24"
    >
      <div className="absolute left-0 right-0 top-0 h-px bg-mint/12" />

      <div className="mx-auto max-w-7xl">
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center md:mb-16">
          <div className="mb-3 text-xs uppercase text-mint">How it works</div>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-cream sm:text-4xl md:text-5xl">
            From idea to funded team in four steps
          </h2>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-cream/48 md:text-lg">
            The platform handles research, structure, matching, and routing so the next action is
            clear for every stakeholder.
          </p>
        </FadeIn>

        <div ref={containerRef} className="relative">
          <div className="absolute bottom-0 left-[calc(50%-1px)] top-0 hidden w-px bg-cream/6 md:block">
            <motion.div className="w-full rounded-full bg-mint/55" style={{ height: lineHeight }} />
          </div>

          <div className="flex flex-col gap-7 md:hidden">
            {steps.map((step, index) => (
              <motion.article
                key={step.number}
                initial={false}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-mint/18 bg-mint/10">
                    <step.icon size={20} className="text-mint/75" />
                  </div>
                  {index < steps.length - 1 && <div className="mt-3 min-h-8 flex-1 border-l border-mint/16" />}
                </div>

                <div className="flex-1 pb-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-mint/55">{step.number}</span>
                    <span className="h-px w-5 bg-mint/20" />
                    <span className="text-[10px] uppercase text-cream/34">{step.detail}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-cream sm:text-xl">{step.title}</h3>
                  <p className="mb-3 text-sm leading-relaxed text-cream/56">{step.description}</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-mint/15 bg-mint/8 px-3 py-1.5 text-xs text-mint/74">
                    <span className="h-1.5 w-1.5 rounded-full bg-mint/60" />
                    {step.tag}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="hidden flex-col gap-14 md:flex">
            {steps.map((step, index) => (
              <FadeIn key={step.number} delay={index * 0.1}>
                <article
                  className={`grid grid-cols-2 items-center gap-14 ${
                    index % 2 === 1 ? "[&>:first-child]:order-2" : ""
                  }`}
                >
                  <div className={index % 2 === 1 ? "text-right" : ""}>
                    <div
                      className="mb-4 flex items-center gap-3"
                      style={{ justifyContent: index % 2 === 1 ? "flex-end" : "flex-start" }}
                    >
                      <span className="font-mono text-xs text-mint/55">{step.number}</span>
                      <span className="h-px w-8 bg-mint/20" />
                      <span className="text-xs uppercase text-cream/34">{step.detail}</span>
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-cream md:text-3xl">{step.title}</h3>
                    <p className="mb-5 text-sm leading-relaxed text-cream/56 md:text-base">
                      {step.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-mint/15 bg-mint/8 px-3 py-1.5 text-xs text-mint/74">
                      <span className="h-1.5 w-1.5 rounded-full bg-mint/60" />
                      {step.tag}
                    </span>
                  </div>

                  <div className={`flex ${index % 2 === 1 ? "justify-start" : "justify-end"}`}>
                    <div className="relative">
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.25, type: "spring", stiffness: 200 }}
                          className="relative z-10 h-4 w-4 rounded-full border-4 border-[#132b25] bg-mint"
                        />
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.04 }}
                        transition={{ duration: 0.3 }}
                        className="flex h-36 w-36 items-center justify-center rounded-lg border border-mint/18 bg-mint/8 md:h-40 md:w-40"
                      >
                        <step.icon size={44} className="text-mint/76" />
                      </motion.div>
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
