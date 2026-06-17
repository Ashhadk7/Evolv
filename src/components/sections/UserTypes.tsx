"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Code2, Lightbulb, TrendingUp } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";

const users = [
  {
    id: "founders",
    icon: Lightbulb,
    role: "Founders",
    accentColor: "#428475",
    title: "Turn an idea into a venture-ready blueprint",
    description:
      "Describe the startup in plain English. Evolv researches the market, maps competitors, and packages the opportunity into a structured plan developers and investors can act on.",
    perks: [
      "Market analysis and competitor map",
      "Prioritized MVP scope and build order",
      "Technical architecture and cost estimate",
      "Investor-ready viability score from 0 to 100",
    ],
    cta: "Start as a founder",
  },
  {
    id: "developers",
    icon: Code2,
    role: "Developers",
    accentColor: "#2d6455",
    title: "Browse projects that match your exact stack",
    description:
      "Skip vague briefs and discovery churn. Every blueprint includes the technical spec, preferred stack, budget range, timeline, and founder context before you commit.",
    perks: [
      "Matched by stack, seniority, and domain",
      "Full specs before the first call",
      "Defined budgets and milestones",
      "Direct messaging with verified founders",
    ],
    cta: "Join as a developer",
  },
  {
    id: "investors",
    icon: TrendingUp,
    role: "Investors",
    accentColor: "#1a312c",
    title: "Review AI-scored deals before they surface",
    description:
      "Use a filtered feed of venture blueprints scored by viability, domain, stage, and funding readiness. Move from signal to founder conversation without spreadsheet sprawl.",
    perks: [
      "Daily deal feed with viability scoring",
      "Filters for domain, stage, and budget",
      "Market and competitor data on every deal",
      "Direct founder access with saved notes",
    ],
    cta: "Browse investor deals",
  },
];

export function UserTypes() {
  return (
    <section className="relative overflow-hidden bg-[#f2fbf7] px-4 py-20 sm:px-6 md:px-12 lg:py-24">
      <div className="absolute left-0 right-0 top-0 h-px bg-dark/10" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-dark/8" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(66,132,117,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(66,132,117,0.055) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <FadeIn className="mb-12 max-w-2xl md:mb-14">
          <div className="mb-3 text-xs font-semibold uppercase text-mid">Who it is for</div>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-dark sm:text-4xl md:text-5xl">
            One platform, <span className="text-mid">three precise workflows</span>
          </h2>
          <p className="text-base leading-relaxed text-dark/60 md:text-lg">
            Evolv gives each side of the venture market the right level of structure, signal, and
            context to move faster.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 gap-4 lg:grid-cols-3" staggerDelay={0.12}>
          {users.map((user) => (
            <StaggerItem key={user.role} className="h-full">
              <motion.article
                id={user.id}
                whileHover={{
                  y: -5,
                  boxShadow: "0 22px 58px rgba(26,49,44,0.13), 0 4px 14px rgba(26,49,44,0.06)",
                  transition: { duration: 0.28 },
                }}
                className="group flex h-full scroll-mt-28 flex-col overflow-hidden rounded-lg border border-dark/10 bg-white p-6 sm:p-7"
                style={{
                  borderTop: `2px solid ${user.accentColor}`,
                  boxShadow: "0 1px 4px rgba(26,49,44,0.06)",
                }}
              >
                <div
                  className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${user.accentColor}16`,
                    border: `1px solid ${user.accentColor}24`,
                  }}
                >
                  <user.icon size={20} style={{ color: user.accentColor }} />
                </div>

                <div className="mb-2 text-xs font-semibold uppercase" style={{ color: user.accentColor }}>
                  {user.role}
                </div>
                <h3 className="mb-3 text-xl font-bold leading-snug text-dark">{user.title}</h3>
                <p className="mb-6 text-sm leading-relaxed text-dark/58">{user.description}</p>

                <div className="mb-8 flex flex-1 flex-col gap-2.5">
                  {user.perks.map((perk) => (
                    <div key={perk} className="flex items-start gap-2.5">
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color: user.accentColor }} />
                      <span className="text-sm leading-relaxed text-dark/68">{perk}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ x: 3 }}
                  className="mt-auto flex items-center gap-2 text-sm font-semibold transition-colors"
                  style={{ color: user.accentColor }}
                >
                  {user.cta} <ArrowRight size={14} />
                </motion.button>
              </motion.article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
