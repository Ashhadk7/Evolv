"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Compass, GraduationCap, RocketLaunch } from "@phosphor-icons/react";
import {
  Eyebrow,
  PageGlow,
  PublicPageShell,
  fadeUp,
  stagger,
} from "@/features/public-site/components/public-page-shell";

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
    <PublicPageShell>
      <section className="relative min-h-screen px-4 pt-32 pb-20 sm:px-6 md:px-12 lg:pt-40">
        <PageGlow />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={fadeUp}>
              <Eyebrow>Our Team</Eyebrow>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl leading-[1.03] font-bold tracking-[-0.03em] sm:text-5xl md:text-6xl"
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
            <motion.p
              variants={fadeUp}
              className="text-cream/52 mx-auto mt-6 max-w-2xl text-[16px] leading-[1.8]"
              style={{ marginTop: 20, marginBottom: 20 }}
            >
              We are a student-built team creating a cleaner bridge between startup ideas and the
              developers who can turn them into real products.
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
                    className="bg-mint/12 absolute h-44 w-44 rounded-full blur-2xl"
                  />
                  <div
                    className="bg-dark ring-mint/30 relative h-44 w-44 overflow-hidden rounded-full shadow-2xl ring-1 sm:h-48 sm:w-48"
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
                  <h2 className="text-cream text-center text-[1.08rem] font-bold">{member.name}</h2>
                  <div className="mt-4 grid gap-2.5">
                    <div className="bg-cream/5 flex items-start gap-2 rounded-xl px-3 py-2.5">
                      <GraduationCap
                        size={15}
                        weight="bold"
                        className="text-mint mt-0.5 shrink-0"
                      />
                      <div>
                        <div className="text-cream/28 text-[10px] font-bold tracking-widest uppercase">
                          University
                        </div>
                        <div className="text-cream/70 mt-0.5 text-[12px] font-semibold">
                          {member.university}
                        </div>
                      </div>
                    </div>
                    <div className="bg-cream/5 flex items-start gap-2 rounded-xl px-3 py-2.5">
                      <CheckCircle size={15} weight="bold" className="text-mint mt-0.5 shrink-0" />
                      <div>
                        <div className="text-cream/28 text-[10px] font-bold tracking-widest uppercase">
                          Degree
                        </div>
                        <div className="text-cream/70 mt-0.5 text-[12px] font-semibold">
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
              background: "#fdf9f4",
              border: "1px solid rgba(255,244,225,0.08)",
              marginTop: 50,
            }}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf5f0] text-[#428475]">
              <Compass size={23} weight="bold" />
            </div>
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#0f1e1a]">
              Built with a student founder mindset.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-[1.75] text-[#0f1e1a]/55">
              We are shaping Evolv around clarity, speed, and practical collaboration: a place where
              founders can explain ideas better, and developers can decide what is worth building
              with more confidence.
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
              className="border-mint/18 text-cream/62 hover:bg-mint/8 hover:text-cream inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-[13px] font-semibold transition"
            >
              Learn about the platform
              <RocketLaunch size={14} weight="bold" />
            </Link>
          </motion.div>
        </div>
      </section>
    </PublicPageShell>
  );
}
