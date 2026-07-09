"use client";

import { motion } from "framer-motion";
import { ArrowRight, RocketLaunch, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import { AVATARS } from "./constants";
import { HeroBackground } from "./hero-background";
import { TypewriterText } from "./typewriter-text";
import { BlueprintCard } from "./blueprint-card";
import { DashboardMockup } from "./dashboard-mockup";
import { ScrollIndicator } from "./scroll-indicator";

export function Hero() {
  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="bg-dark relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-4 pt-24 pb-8 sm:px-6 md:px-12"
    >
      <HeroBackground />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] lg:gap-8">
          {/* LEFT: copy */}
          <div className="max-w-2xl lg:max-w-none">
            {/* Badge pill */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="border-mint/18 bg-mint/[0.06] mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
              style={{ boxShadow: "0 0 24px rgba(137,215,183,0.06) inset" }}
            >
              <Sparkle size={11} weight="fill" className="text-mint" />
              <span className="text-mint/72 text-[11px] font-medium tracking-widest uppercase">
                AI-powered venture platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="text-cream mb-4 text-[2.8rem] leading-[1.06] font-bold tracking-[-0.03em] sm:text-[3.4rem] lg:text-[3.6rem] xl:text-[4rem]"
            >
              Where{" "}
              <span
                style={{
                  background: "linear-gradient(130deg, #fff4e1 25%, #89d7b7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                great ideas
              </span>
              <br />
              become <TypewriterText />
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="text-cream/46 mb-6 max-w-[42ch] text-[15px] leading-[1.7] lg:text-[16px]"
            >
              Evolv turns raw startup ideas into investor-ready blueprints — with market analysis,
              competitor maps, MVP specs, and a viability score — in 60 seconds.
            </motion.p>

            {/* ── CTA buttons ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mb-8 flex flex-col gap-2.5 sm:flex-row"
            >
              {/* PRIMARY — goes to /sign-up */}
              <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.975 }}>
                <Link
                  href="/sign-up"
                  className="bg-mint text-dark flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-[13px] font-semibold tracking-tight transition-all"
                  style={{
                    boxShadow: "0 0 40px rgba(137,215,183,0.28), 0 4px 16px rgba(137,215,183,0.14)",
                  }}
                >
                  <RocketLaunch size={15} weight="bold" />
                  Forge your blueprint
                </Link>
              </motion.div>

              {/* SECONDARY — smooth scrolls to #how-it-works */}
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={scrollToHowItWorks}
                className="group border-cream/10 text-cream/48 hover:border-mint/24 hover:text-cream/72 flex items-center justify-center gap-2 rounded-xl border px-7 py-3.5 text-[13px] tracking-tight transition-all"
              >
                See how it works
                <ArrowRight
                  size={13}
                  weight="bold"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </motion.button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.42 }}
              className="mb-5 flex items-center gap-3"
            >
              <div className="flex" style={{ gap: 0 }}>
                {AVATARS.map((avatar, i) => (
                  <div
                    key={avatar.initials}
                    className="border-dark text-dark flex h-7 w-7 items-center justify-center rounded-full border-2 text-[9px] font-bold"
                    style={{
                      background: avatar.bg,
                      marginLeft: i === 0 ? 0 : "-0.5rem",
                      zIndex: AVATARS.length - i,
                    }}
                  >
                    {avatar.initials}
                  </div>
                ))}
              </div>
              <p className="text-cream/36 text-[11px]">
                <span className="text-cream/58 font-semibold">400+</span> founders already building
              </p>
            </motion.div>

            {/* Mobile card */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mx-auto mt-10 w-full max-w-[360px] lg:hidden"
            >
              <BlueprintCard />
            </motion.div>
          </div>

          {/* RIGHT: 3D card deck */}
          <div className="hidden lg:block">
            <DashboardMockup />
          </div>
        </div>
      </div>

      <ScrollIndicator />
    </section>
  );
}
