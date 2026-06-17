"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Rocket, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const WORDS = ["funded startups.", "developer teams.", "venture blueprints.", "investor deals."];

const STATS = [
  { value: 2400, suffix: "+", label: "Blueprints generated" },
  { value: 18, prefix: "$", suffix: "M+", label: "Funding connected" },
  { value: 840, suffix: "", label: "Developer matches" },
  { value: 120, suffix: "+", label: "Active investors" },
];

function TypewriterText() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState(WORDS[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed === word) {
      timeout = setTimeout(() => setIsDeleting(true), 1900);
    } else if (isDeleting && displayed === "") {
      setIsDeleting(false);
      setWordIndex((index) => (index + 1) % WORDS.length);
    } else {
      timeout = setTimeout(
        () =>
          setDisplayed(
            isDeleting ? word.slice(0, displayed.length - 1) : word.slice(0, displayed.length + 1)
          ),
        isDeleting ? 34 : 58
      );
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIndex]);

  return (
    <span className="inline-block min-w-[12.5ch] text-mint sm:min-w-[13.5ch]">
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        className="ml-1 inline-block h-[0.82em] w-0.5 align-middle bg-mint"
      />
    </span>
  );
}

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(137,215,183,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(137,215,183,0.045) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "linear-gradient(to bottom, black 0%, black 72%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, rgba(137,215,183,0.12) 0%, rgba(137,215,183,0.02) 34%, transparent 62%), linear-gradient(to bottom, rgba(26,49,44,0.1), #1a312c 94%)",
        }}
      />
    </div>
  );
}

function ProgressBar({ value, delay }: { value: number; delay: number }) {
  return (
    <div className="h-1 overflow-hidden rounded-full bg-cream/8">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ delay, duration: 1, ease: "easeOut" }}
        className="h-full rounded-full bg-mint"
      />
    </div>
  );
}

function Sparkline() {
  const bars = [28, 38, 32, 50, 45, 62, 58, 74, 82, 92];

  return (
    <div className="flex h-8 w-full items-end gap-1">
      {bars.map((height, index) => (
        <motion.div
          key={height + index}
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ delay: 1.2 + index * 0.05, duration: 0.4, ease: "easeOut" }}
          className="flex-1 rounded-sm"
          style={{ background: index >= 7 ? "#89d7b7" : "rgba(137,215,183,0.22)" }}
        />
      ))}
    </div>
  );
}

function BlueprintWindow({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-mint/18 bg-[#0c1c18]/95"
      style={{
        boxShadow:
          "0 0 0 1px rgba(137,215,183,0.05) inset, 0 34px 90px rgba(0,0,0,0.42), 0 8px 28px rgba(0,0,0,0.28)",
      }}
    >
      <div className="flex items-center justify-between border-b border-cream/6 bg-cream/[0.018] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
        </div>
        <span className="truncate px-3 text-[10px] font-mono text-cream/24">
          nexus-health.blueprint
        </span>
        <div className="w-10" />
      </div>

      <div className={compact ? "p-4" : "p-5"}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-55" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
              </span>
              <span className="text-[10px] font-semibold uppercase text-mint/65">
                Blueprint live
              </span>
            </div>
            <h3 className="text-[15px] font-bold leading-tight text-cream/95">Nexus Health</h3>
            <p className="mt-1 text-[11px] text-cream/38">HealthTech - AI diagnostics</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold leading-none text-mint">84</div>
            <div className="mt-1 text-[10px] text-cream/32">Viability</div>
          </div>
        </div>

        <div className="mb-5 space-y-3">
          {[
            { label: "Investor interest", value: 92 },
            { label: "Market potential", value: 88 },
            { label: "Developer demand", value: 78 },
          ].map((item, index) => (
            <div key={item.label}>
              <div className="mb-1.5 flex justify-between text-[10px]">
                <span className="text-cream/45">{item.label}</span>
                <span className="text-mint/80">{item.value}%</span>
              </div>
              <ProgressBar value={item.value} delay={0.7 + index * 0.12} />
            </div>
          ))}
        </div>

        {!compact && (
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] uppercase text-cream/30">Investor interest - 30d</span>
              <span className="text-[10px] text-mint/70">+17%</span>
            </div>
            <Sparkline />
          </div>
        )}

        <div className="mb-5 flex flex-wrap gap-1.5">
          {["React", "FastAPI", "PostgreSQL", compact ? "AWS" : "PyTorch"].map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-mint/12 bg-mint/[0.07] px-2 py-1 text-[10px] text-mint/70"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-start gap-2 border-t border-cream/6 pt-4">
          <Sparkles size={12} className="mt-0.5 shrink-0 text-mint" />
          <p className="text-[11px] leading-relaxed text-cream/45">
            Publish now. HealthTech investor demand is up 17% this month.
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[430px] py-12">
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded-lg border border-mint/20 bg-[#0e1e1a]/95 px-3 py-2 shadow-2xl backdrop-blur"
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
        </span>
        <span className="whitespace-nowrap text-[11px] font-medium text-cream/85">
          3 investors active now
        </span>
      </motion.div>

      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10"
      >
        <BlueprintWindow />
      </motion.div>

      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
        className="absolute bottom-4 right-2 z-20 flex items-center gap-2.5 rounded-lg border border-mint/20 bg-[#0e1e1a]/95 px-3 py-2.5 shadow-2xl backdrop-blur"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mid/40 text-[10px] font-bold text-cream/80">
          JD
        </div>
        <div>
          <div className="mb-1 text-[11px] font-semibold leading-none text-cream/90">Dev match - 94%</div>
          <div className="text-[10px] text-cream/42">React - Node - AWS</div>
        </div>
        <Zap size={12} className="shrink-0 text-mint" />
      </motion.div>
    </div>
  );
}

function MobileBlueprintCard() {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.55 }}
      className="mx-auto mt-10 w-full max-w-[380px] lg:hidden"
    >
      <BlueprintWindow compact />
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-dark px-4 pb-16 pt-24 sm:px-6 md:px-12 lg:pt-28">
      <HeroBackground />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)]">
          <div className="max-w-2xl lg:max-w-none">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-mint/22 bg-mint/[0.07] px-4 py-1.5"
            >
              <Sparkles size={13} className="text-mint" />
              <span className="text-xs text-mint/82">AI-powered venture platform</span>
            </motion.div>

            <motion.h1
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mb-6 text-4xl font-bold leading-[1.08] text-cream sm:text-5xl lg:text-[3.65rem]"
            >
              Where great ideas
              <br />
              become <TypewriterText />
            </motion.h1>

            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mb-9 max-w-xl text-[17px] leading-relaxed text-cream/58"
            >
              Evolv turns raw startup ideas into investor-ready blueprints with market analysis,
              competitor maps, MVP specs, architecture, budgets, and a viability score in 60 seconds.
            </motion.p>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mb-12 flex flex-col gap-3 sm:flex-row"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 rounded-lg bg-mint px-7 py-3.5 text-sm font-semibold text-dark transition-colors hover:bg-mint/90"
                style={{
                  boxShadow: "0 0 30px rgba(137,215,183,0.22), 0 4px 14px rgba(137,215,183,0.12)",
                }}
              >
                <Rocket size={15} />
                Forge your blueprint
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 rounded-lg border border-cream/12 px-7 py-3.5 text-sm text-cream/62 transition-all hover:border-mint/30 hover:text-mint"
              >
                See how it works <ArrowRight size={14} />
              </motion.button>
            </motion.div>

            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.48 }}
              className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-cream/8 pt-7 sm:grid-cols-4"
            >
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-mint">
                    <AnimatedCounter to={stat.value} suffix={stat.suffix} prefix={stat.prefix ?? ""} />
                  </div>
                  <div className="mt-1 flex items-start gap-1.5 text-xs leading-snug text-cream/42">
                    <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-mint/55" />
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            <MobileBlueprintCard />
          </div>

          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.38, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="hidden lg:block"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
