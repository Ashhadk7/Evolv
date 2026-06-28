"use client";

import { motion } from "framer-motion";
import { Sparkle } from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { BlueprintCard } from "./BlueprintCard";

const BRAND_DARK = "#1a312c";
const BRAND_MINT = "#89d7b7";
const BRAND_CREAM = "#fff4e1";

export function AuthVisual() {
  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden min-h-screen overflow-hidden lg:flex lg:w-[50%] flex-col"
      style={{ background: BRAND_DARK }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 35% 55%, rgba(137,215,183,0.07) 0%, transparent 65%)," +
            "radial-gradient(ellipse 50% 40% at 78% 25%, rgba(66,132,117,0.05) 0%, transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full"
        style={{ background: "rgba(137,215,183,0.05)", filter: "blur(60px)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex h-full flex-col px-12 xl:px-16"
      >
        <div style={{ paddingTop: "64px" }}>
          <Logo dark />
        </div>

        <div className="flex flex-1 flex-col justify-center gap-9 py-8">
          <div className="flex flex-col gap-5">
            <div
              className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: "rgba(137,215,183,0.1)", border: "1px solid rgba(137,215,183,0.16)", color: BRAND_MINT }}
            >
              <Sparkle size={10} weight="fill" />
              AI venture platform
            </div>

            <div>
              <h2
                className="font-bold leading-[1.08] tracking-[-0.02em]"
                style={{ color: BRAND_CREAM, fontSize: "clamp(2.1rem, 2.8vw, 2.75rem)" }}
              >
                Sign in to your<br />
                <span style={{ color: BRAND_MINT }}>venture workspace.</span>
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "rgba(255,244,225,0.46)" }}>
                Blueprints, developer matches, and investor<br />progress — all in one focused place.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="w-full"
          >
            <BlueprintCard />
          </motion.div>
        </div>
      </motion.div>
    </motion.aside>
  );
}
