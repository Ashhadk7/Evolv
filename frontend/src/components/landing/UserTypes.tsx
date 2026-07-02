"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BracketsAngle,
  Check,
  LightbulbFilament,
  TrendUp,
} from "@phosphor-icons/react";

const users = [
  {
    id: "founders",
    Icon: LightbulbFilament,
    role: "Founders",
    accent: "#428475",
    title: "Turn an idea into a venture-ready blueprint",
    description:
      "Describe the startup in plain language. Evolv researches the market, maps competitors, and packages the opportunity into a structured plan developers can act on.",
    perks: [
      "Market analysis and competitor map",
      "Prioritized MVP scope and build order",
      "Technical architecture and cost estimate",
    ],
    cta: "Start as a founder",
  },
  {
    id: "developers",
    Icon: BracketsAngle,
    role: "Developers",
    accent: "#2d6455",
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

];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

export function UserTypes() {
  return (
    <section
      id="who-it-is-for"
      className="relative overflow-hidden px-4 py-20 sm:px-6 md:px-12 lg:py-28"
      style={{ background: "#fdf9f4" }}
    >
      <div
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: "rgba(26,49,44,0.08)" }}
      />

      {/* Directional light from top — not a tile, just depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(66,132,117,0.055) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-14 max-w-xl md:mb-16"
        >
          <div
            className="mb-4 inline-flex items-center rounded-full px-3 py-1"
            style={{
              background: "rgba(66,132,117,0.08)",
              border: "1px solid rgba(66,132,117,0.14)",
            }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "#428475" }}
            >
              Who it is for
            </span>
          </div>
          <h2
            className="mb-4 text-3xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-4xl md:text-[2.8rem]"
            style={{ color: "#0f1e1a" }}
          >
            One platform,{" "}
            <span style={{ color: "#428475" }}>three precise workflows</span>
          </h2>
          <p
            className="text-[15px] leading-relaxed"
            style={{ color: "rgba(15,30,26,0.5)" }}
          >
            Evolv gives each side of the venture market the right level of
            structure, signal, and context to move faster.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 gap-5 lg:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {users.map((user) => (
            <motion.article
              key={user.id}
              id={user.id}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.22 } }}
              className="group flex flex-col scroll-mt-28 overflow-hidden rounded-2xl"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(15,30,26,0.07)",
                borderTop: `2.5px solid ${user.accent}`,
                boxShadow:
                  "0 1px 3px rgba(15,30,26,0.04), 0 4px 16px rgba(15,30,26,0.04)",
              }}
            >
              <div className="flex flex-1 flex-col p-7">
                {/* Icon */}
                <div
                  className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{
                    background: `${user.accent}13`,
                    border: `1px solid ${user.accent}22`,
                  }}
                >
                  <user.Icon size={20} weight="bold" style={{ color: user.accent }} />
                </div>

                {/* Role */}
                <div
                  className="mb-2 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: user.accent }}
                >
                  {user.role}
                </div>

                {/* Title */}
                <h3
                  className="mb-3 text-[1.15rem] font-bold leading-snug tracking-[-0.015em]"
                  style={{ color: "#0f1e1a" }}
                >
                  {user.title}
                </h3>

                {/* Description */}
                <p
                  className="mb-6 text-sm leading-[1.72]"
                  style={{ color: "rgba(15,30,26,0.5)" }}
                >
                  {user.description}
                </p>

                {/* Perks */}
                <div className="mb-8 flex flex-1 flex-col gap-2.5">
                  {user.perks.map((perk) => (
                    <div key={perk} className="flex items-start gap-2.5">
                      <div
                        className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                        style={{ background: `${user.accent}14` }}
                      >
                        <Check size={9} weight="bold" style={{ color: user.accent }} />
                      </div>
                      <span
                        className="text-[13px] leading-relaxed"
                        style={{ color: "rgba(15,30,26,0.58)" }}
                      >
                        {perk}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                  className="mt-auto flex items-center gap-1.5 text-[13px] font-semibold"
                  style={{ color: user.accent }}
                >
                  {user.cta}
                  <ArrowRight size={13} weight="bold" />
                </motion.button>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
