"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  BracketsAngle,
  CheckCircle,
  Compass,
  GraduationCap,
  LightbulbFilament,
  RocketLaunch,
  Sparkle,
  UsersThree,
} from "@phosphor-icons/react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/landing/CtaAndFooter";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

function PageGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(137,215,183,0.16) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(137,215,183,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(137,215,183,0.055) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          maskImage: "linear-gradient(to bottom, black, transparent 72%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-72"
        style={{ background: "linear-gradient(to bottom, transparent, #1a312c)" }}
      />
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-5 inline-flex items-center rounded-full px-3 py-1"
      style={{
        background: "rgba(137,215,183,0.09)",
        border: "1px solid rgba(137,215,183,0.16)",
      }}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-mint">
        {children}
      </span>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-dark text-cream">
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}

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
    <Shell>
      <section className="relative min-h-screen px-4 pb-20 pt-32 sm:px-6 md:px-12 lg:pt-40">
        <PageGlow />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp}>
                <Eyebrow>About Evolv</Eyebrow>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="max-w-4xl text-4xl font-bold leading-[1.03] tracking-[-0.03em] sm:text-5xl md:text-6xl"
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
                className="mt-6 max-w-2xl text-[16px] leading-[1.8] text-cream/52"
                style={{ marginTop: 10 }}
              >
                Evolv is a founder and developer platform for moving from rough idea
                to practical execution. It helps founders shape their concept into a
                clear product blueprint, then helps developers understand the work
                before the first message.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-mint px-6 py-3 text-[13px] font-bold text-dark"
                  style={{ boxShadow: "0 0 36px rgba(137,215,183,0.24)", marginTop: 20 }}
                >
                  Start building
                  <ArrowRight size={14} weight="bold" />
                </Link>
                <Link
                  href="/#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-cream/10 px-6 py-3 text-[13px] font-semibold text-cream/58 transition hover:border-mint/25 hover:text-cream/85"
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
                marginBottom: 55
              }}
            >
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,244,225,0.04)"}}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/12 text-mint">
                    <Sparkle size={20} weight="fill" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-cream">Platform focus</div>
                    <div className="text-xs text-cream/38">Founder clarity, developer execution</div>
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
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint text-[11px] font-extrabold text-dark">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-cream/82">{item}</span>
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
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-mint/12 text-mint">
                  <point.Icon size={20} weight="bold" />
                </div>
                <h2 className="text-[1.05rem] font-bold text-cream">{point.title}</h2>
                <p className="mt-3 text-sm leading-[1.75] text-cream/48">{point.text}</p>
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
              background: "#f8f9f8",
              border: "1px solid rgba(255,244,225,0.08)",
              marginTop: 50
            }}
          >
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
              <div>
                <div className="mb-3 inline-flex rounded-full bg-[#eaf5f0] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#428475]">
                  Why we built it
                </div>
                <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#0f1e1a]">
                  Less confusion before building.
                </h2>
              </div>
              <div className="grid gap-4 text-[15px] leading-[1.8] text-[#0f1e1a]/55">
                <p>
                  Early startup work often gets stuck because founders and developers are
                  not looking at the same information. Founders know the problem, but may
                  not know how to explain the build. Developers know how to build, but
                  need clearer context before they can commit.
                </p>
                <p>
                  Evolv sits between those two sides. It makes the idea structured,
                  practical, and easier to discuss, so collaboration can start with
                  clarity instead of guesswork.
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </section>
    </Shell>
  );
}

const teamMembers = [
  {
    name: "Eman Butt",
    university: "Comsats University Islamabad",
    degree: "BS Artificial Intelligence",
    photo: "/Eman_pic.jpg",
    cacheKey: "eman-20260701-hijab",
    imagePosition: "50% 16%",
    imageScale: 1.03,
  },
  {
    name: "M. Ashhad Khan",
    university: "NED UET",
    degree: "BS Computer Science",
    photo: "/Ashhad_pic.png",
    cacheKey: "ashhad-20260701-crop",
    imagePosition: "57% 15%",
    imageScale: 1.05,
  },
  {
    name: "Laiba Kanwal",
    university: "UBIT",
    degree: "BS Computer Science",
    photo: "/Laiba_pic.png",
    cacheKey: "laiba-20260701",
    imagePosition: "50% 42%",
    imageScale: 1,
  },
  {
    name: "Ammad Qaiser",
    university: "FAST NUCES",
    degree: "BS Data Science",
    photo: "/Ammad_pic.jpg",
    cacheKey: "ammad-20260701",
    imagePosition: "50% 38%",
    imageScale: 1,
  },
];

export function TeamPage() {
  return (
    <Shell>
      <section className="relative min-h-screen px-4 pb-20 pt-32 sm:px-6 md:px-12 lg:pt-40">
        <PageGlow />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={fadeUp} > 
              <Eyebrow>Our Team</Eyebrow>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl font-bold leading-[1.03] tracking-[-0.03em] sm:text-5xl md:text-6xl"
            >
              The people building{" "}
              <span
                style={{
                  background: "linear-gradient(130deg, #fff4e1 20%, #89d7b7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Evolv
              </span>
              .
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-[16px] leading-[1.8] text-cream/52" style={{marginTop:20, marginBottom:20}}>
              We are a student-built team creating a cleaner bridge between startup ideas
              and the developers who can turn them into real products.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mx-auto mt-12 grid max-w-6xl items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-4"
          >
            {teamMembers.map((member, index) => (
              <motion.article
                key={member.name}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="group flex h-full flex-col overflow-hidden rounded-3xl"
                style={{
                  background: "rgba(255,244,225,0.055)",
                  border: "1px solid rgba(137,215,183,0.13)",
                  boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
                }}
              >
                <div
                  className="relative flex h-[245px] items-center justify-center overflow-hidden px-5 pt-8"
                  style={{
                    background:
                      "linear-gradient(155deg, rgba(137,215,183,0.18), rgba(255,244,225,0.035))",
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.75, 0.5] }}
                    transition={{ duration: 4.5, repeat: Infinity, delay: index * 0.22 }}
                    className="absolute h-44 w-44 rounded-full bg-mint/12 blur-2xl"
                  />
                  <div
                    className="relative h-44 w-44 overflow-hidden rounded-full bg-dark shadow-2xl ring-1 ring-mint/30 sm:h-48 sm:w-48"
                    style={{ boxShadow: "0 22px 46px rgba(0,0,0,0.28)" }}
                  >
                    <Image
                      src={`${member.photo}?v=${member.cacheKey}`}
                      alt={`${member.name} profile photo`}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 176px, 192px"
                      className="object-cover"
                      style={{
                        objectPosition: member.imagePosition,
                        transform: `scale(${member.imageScale})`,
                        transformOrigin: member.imagePosition,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-center text-[1.08rem] font-bold text-cream">{member.name}</h2>
                  <div className="mt-4 grid gap-2.5">
                    <div className="flex items-start gap-2 rounded-xl bg-cream/5 px-3 py-2.5">
                      <GraduationCap size={15} weight="bold" className="mt-0.5 shrink-0 text-mint" />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-cream/28">
                          University
                        </div>
                        <div className="mt-0.5 text-[12px] font-semibold text-cream/70">
                          {member.university}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-xl bg-cream/5 px-3 py-2.5">
                      <CheckCircle size={15} weight="bold" className="mt-0.5 shrink-0 text-mint" />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-cream/28">
                          Degree
                        </div>
                        <div className="mt-0.5 text-[12px] font-semibold text-cream/70">
                          {member.degree}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.62, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mx-auto mt-14 max-w-4xl rounded-3xl px-6 py-8 text-center sm:px-9"
            style={{
              background: "#f8f9f8",
              border: "1px solid rgba(255,244,225,0.08)",
              marginTop: 50
            }}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf5f0] text-[#428475]">
              <Compass size={23} weight="bold" />
            </div>
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#0f1e1a]">
              Built with a student founder mindset.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-[1.75] text-[#0f1e1a]/55">
              We are shaping Evolv around clarity, speed, and practical collaboration:
              a place where founders can explain ideas better, and developers can decide
              what is worth building with more confidence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-10 flex justify-center"
          >
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-xl border border-mint/18 px-5 py-3 text-[13px] font-semibold text-cream/62 transition hover:bg-mint/8 hover:text-cream"
            >
              Learn about the platform
              <RocketLaunch size={14} weight="bold" />
            </Link>
          </motion.div>
        </div>
      </section>
    </Shell>
  );
}
