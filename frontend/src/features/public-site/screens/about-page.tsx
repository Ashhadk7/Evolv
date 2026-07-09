"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BracketsAngle,
  LightbulbFilament,
  Sparkle,
  UsersThree,
} from "@phosphor-icons/react";
import {
  Eyebrow,
  PageGlow,
  PublicPageShell,
  fadeUp,
  stagger,
} from "@/features/public-site/components/public-page-shell";

const platformPoints = [
  {
    Icon: LightbulbFilament,
    title: "Idea to blueprint",
    text: "Founders describe their startup idea in plain language. Evolv turns that into a structured blueprint with market context, MVP scope, technical direction, and cost clarity.",
  },
  {
    Icon: BracketsAngle,
    title: "Builder-ready detail",
    text: "Developers see useful project information before committing: the problem, features, stack direction, timeline, budget context, and the founder's goals.",
  },
  {
    Icon: UsersThree,
    title: "Founder-developer matching",
    text: "The platform connects founders with developers based on skills, stack fit, domain interest, and project needs so both sides can move faster.",
  },
];

const workflow = [
  "Capture the idea",
  "Generate the blueprint",
  "Match with developers",
  "Collaborate and build",
];

export function AboutPage() {
  return (
    <PublicPageShell>
      <section className="relative min-h-screen px-4 pt-32 pb-20 sm:px-6 md:px-12 lg:pt-40">
        <PageGlow />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp}>
                <Eyebrow>About Evolv</Eyebrow>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="max-w-4xl text-4xl leading-[1.03] font-bold tracking-[-0.03em] sm:text-5xl md:text-6xl"
              >
                Turning startup ideas into{" "}
                <span
                  style={{
                    background: "linear-gradient(130deg, #fff4e1 22%, #89d7b7 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  buildable plans
                </span>
                .
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-cream/52 mt-6 max-w-2xl text-[16px] leading-[1.8]"
                style={{ marginTop: 10 }}
              >
                Evolv is a founder and developer platform for moving from rough idea to practical
                execution. It helps founders shape their concept into a clear product blueprint,
                then helps developers understand the work before the first message.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="bg-mint text-dark inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-[13px] font-bold"
                  style={{ boxShadow: "0 0 36px rgba(137,215,183,0.24)", marginTop: 20 }}
                >
                  Start building
                  <ArrowRight size={14} weight="bold" />
                </Link>
                <Link
                  href="/#how-it-works"
                  className="border-cream/10 text-cream/58 hover:border-mint/25 hover:text-cream/85 inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-[13px] font-semibold transition"
                  style={{ marginTop: 20 }}
                >
                  See the workflow
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.72, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="rounded-3xl p-5"
              style={{
                background: "rgba(9,20,16,0.62)",
                border: "1px solid rgba(137,215,183,0.14)",
                boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
                backdropFilter: "blur(20px)",
                marginBottom: 55,
              }}
            >
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,244,225,0.04)" }}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="bg-mint/12 text-mint flex h-11 w-11 items-center justify-center rounded-xl">
                    <Sparkle size={20} weight="fill" />
                  </div>
                  <div>
                    <div className="text-cream text-sm font-bold">Platform focus</div>
                    <div className="text-cream/38 text-xs">
                      Founder clarity, developer execution
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {workflow.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + index * 0.08, duration: 0.45 }}
                      className="flex items-center gap-3 rounded-xl px-3 py-3"
                      style={{
                        background: "rgba(137,215,183,0.065)",
                        border: "1px solid rgba(137,215,183,0.1)",
                      }}
                    >
                      <span className="bg-mint text-dark flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-extrabold">
                        {index + 1}
                      </span>
                      <span className="text-cream/82 text-sm font-semibold">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mt-20 grid gap-5 md:grid-cols-3"
          >
            {platformPoints.map((point) => (
              <motion.article
                key={point.title}
                variants={fadeUp}
                whileHover={{ y: -5 }}
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(255,244,225,0.055)",
                  border: "1px solid rgba(137,215,183,0.12)",
                }}
              >
                <div className="bg-mint/12 text-mint mb-5 flex h-11 w-11 items-center justify-center rounded-xl">
                  <point.Icon size={20} weight="bold" />
                </div>
                <h2 className="text-cream text-[1.05rem] font-bold">{point.title}</h2>
                <p className="text-cream/48 mt-3 text-sm leading-[1.75]">{point.text}</p>
              </motion.article>
            ))}
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-20 rounded-3xl p-7 sm:p-9"
            style={{
              background: "#fdf9f4",
              border: "1px solid rgba(255,244,225,0.08)",
              marginTop: 50,
            }}
          >
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
              <div>
                <div className="mb-3 inline-flex rounded-full bg-[#eaf5f0] px-3 py-1 text-[10px] font-bold tracking-widest text-[#428475] uppercase">
                  Why we built it
                </div>
                <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#0f1e1a]">
                  Less confusion before building.
                </h2>
              </div>
              <div className="grid gap-4 text-[15px] leading-[1.8] text-[#0f1e1a]/55">
                <p>
                  Early startup work often gets stuck because founders and developers are not
                  looking at the same information. Founders know the problem, but may not know how
                  to explain the build. Developers know how to build, but need clearer context
                  before they can commit.
                </p>
                <p>
                  Evolv sits between those two sides. It makes the idea structured, practical, and
                  easier to discuss, so collaboration can start with clarity instead of guesswork.
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </section>
    </PublicPageShell>
  );
}
