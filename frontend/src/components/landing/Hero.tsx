"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle,
  Lightning,
  RocketLaunch,
  Sparkle,
  UsersThree,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

// ─── Data ────────────────────────────────────────────────────────────────────

const WORDS = [
  "funded startups.",
  "developer teams.",
  "venture blueprints.",
  "investor deals.",
];

const STATS = [
  { value: 2400, suffix: "+", label: "Blueprints generated" },
  { value: 18, prefix: "$", suffix: "M+", label: "Funding connected" },
  { value: 840, suffix: "", label: "Developer matches" },
  { value: 120, suffix: "+", label: "Active investors" },
];

const AVATARS = [
  { initials: "AK", bg: "#89d7b7" },
  { initials: "JD", bg: "#6cc9a3" },
  { initials: "SR", bg: "#54b38d" },
  { initials: "MK", bg: "#3e9478" },
  { initials: "LP", bg: "#428475" },
];

const CELL = 44;

// ─── Canvas background ────────────────────────────────────────────────────────

function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cols = 0;
    let rows = 0;
    let cells: { phase: number; speed: number; maxOpacity: number }[] = [];
    let raf: number;
    const startTime = performance.now();

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      cols = Math.ceil(canvas.width / CELL) + 2;
      rows = Math.ceil(canvas.height / CELL) + 2;
      cells = Array.from({ length: cols * rows }, () => ({
        phase: Math.random() * Math.PI * 2,
        speed: 0.18 + Math.random() * 0.55,
        maxOpacity:
          Math.random() < 0.22
            ? 0.5 + Math.random() * 0.4
            : 0.04 + Math.random() * 0.08,
      }));
    };

    const draw = (now: number) => {
      const t = (now - startTime) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(137,215,183,0.055)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= cols; x++) {
        ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, canvas.height); ctx.stroke();
      }
      for (let y = 0; y <= rows; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(canvas.width, y * CELL); ctx.stroke();
      }

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const cx = (i % cols) * CELL;
        const cy = Math.floor(i / cols) * CELL;
        const rawOp = (Math.sin(t * cell.speed + cell.phase) + 1) / 2;
        const op = rawOp * cell.maxOpacity;

        if (op > 0.02) {
          ctx.fillStyle = `rgba(137,215,183,${op * 0.22})`;
          ctx.fillRect(cx, cy, CELL, CELL);
        }
        if (op > 0.32) {
          ctx.fillStyle = `rgba(137,215,183,${Math.min(op * 0.85, 0.75)})`;
          ctx.beginPath(); ctx.arc(cx + CELL, cy + CELL, 1.8, 0, Math.PI * 2); ctx.fill();
          const grd = ctx.createRadialGradient(cx + CELL / 2, cy + CELL / 2, 0, cx + CELL / 2, cy + CELL / 2, CELL * 0.9);
          grd.addColorStop(0, `rgba(137,215,183,${op * 0.18})`);
          grd.addColorStop(1, "transparent");
          ctx.fillStyle = grd;
          ctx.fillRect(cx - CELL / 4, cy - CELL / 4, CELL * 1.5, CELL * 1.5);
        }
      }

      const wavePeriod = 14;
      const wavePos = ((t % wavePeriod) / wavePeriod) * (canvas.width + CELL * 6) - CELL * 3;
      const waveW = CELL * 5;
      const waveGrd = ctx.createLinearGradient(wavePos - waveW, 0, wavePos + waveW, 0);
      waveGrd.addColorStop(0, "transparent");
      waveGrd.addColorStop(0.5, "rgba(137,215,183,0.04)");
      waveGrd.addColorStop(1, "transparent");
      ctx.fillStyle = waveGrd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.88 }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(137,215,183,0.1) 0%, transparent 65%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 68% 100% at 2% 50%, rgba(10,20,16,0.9) 0%, rgba(10,20,16,0.38) 48%, transparent 100%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 115% 100% at 50% 50%, transparent 44%, rgba(8,18,14,0.62) 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "28%", background: "linear-gradient(to bottom, transparent, #1a312c)" }} />
    </div>
  );
}

// ─── Typewriter ───────────────────────────────────────────────────────────────

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
      setWordIndex((i) => (i + 1) % WORDS.length);
    } else {
      timeout = setTimeout(
        () => setDisplayed(isDeleting ? word.slice(0, displayed.length - 1) : word.slice(0, displayed.length + 1)),
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

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, delay }: { value: number; delay: number }) {
  return (
    <div className="h-[3px] overflow-hidden rounded-full bg-cream/8">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ delay, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="h-full rounded-full"
        style={{ background: "linear-gradient(90deg, #428475, #89d7b7)" }}
      />
    </div>
  );
}

// ─── Blueprint card ───────────────────────────────────────────────────────────

function BlueprintCard() {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(160deg, #0d1c18 0%, #091410 100%)",
        border: "1px solid rgba(137,215,183,0.14)",
        boxShadow:
          "0 0 0 1px rgba(137,215,183,0.07) inset, 0 40px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-cream/[0.06] bg-cream/[0.018] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/50" />
        </div>
        <span className="font-mono text-[10px] tracking-wide text-cream/20">
          nexus-health.blueprint
        </span>
        <div className="w-14" />
      </div>

      <div className="p-5">
        {/* Header row */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-55" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-mint/55">
                Blueprint live
              </span>
            </div>
            <h3 className="text-[15px] font-semibold leading-tight text-cream/95 tracking-tight">
              Nexus Health
            </h3>
            <p className="mt-0.5 text-[11px] text-cream/32">HealthTech · AI diagnostics</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[2.2rem] font-bold leading-none tabular-nums" style={{ color: "#89d7b7" }}>
              84
            </div>
            <div className="mt-0.5 text-[9px] uppercase tracking-wider text-cream/24">Viability</div>
          </div>
        </div>

        {/* Metrics */}
        <div className="mb-4 space-y-2.5">
          {[
            { label: "Investor interest", value: 92 },
            { label: "Market potential", value: 88 },
            { label: "Developer demand", value: 78 },
          ].map((item, i) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-[10px]">
                <span className="text-cream/36">{item.label}</span>
                <span className="text-mint/70">{item.value}%</span>
              </div>
              <ProgressBar value={item.value} delay={0.6 + i * 0.1} />
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {["React", "FastAPI", "PostgreSQL", "AWS"].map((tag) => (
            <span
              key={tag}
              className="rounded-md px-2 py-0.5 text-[10px] text-mint/58"
              style={{ background: "rgba(137,215,183,0.07)", border: "1px solid rgba(137,215,183,0.12)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* AI insight */}
        <div className="flex items-start gap-2 rounded-lg px-3 py-2.5" style={{ background: "rgba(137,215,183,0.055)", border: "1px solid rgba(137,215,183,0.1)" }}>
          <Sparkle size={11} weight="fill" className="mt-0.5 shrink-0 text-mint" />
          <p className="text-[10px] leading-relaxed text-cream/42">
            Publish now — HealthTech investor demand is up 17% this month.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard mockup with card deck ─────────────────────────────────────────

function DashboardMockup() {
  return (
    <div
      className="relative mx-auto w-full max-w-[400px]"
      style={{ paddingTop: "2.8rem", paddingBottom: "4rem", paddingLeft: "2rem", paddingRight: "0.75rem" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse 80% 65% at 50% 60%, rgba(137,215,183,0.2) 0%, rgba(137,215,183,0.06) 52%, transparent 78%)",
          filter: "blur(48px)",
          transform: "scale(1.2) translateY(4%)",
        }}
      />

      {/* Floating badge: top-left */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        className="absolute top-0 left-0 z-30 flex items-center gap-2 rounded-xl px-3 py-2"
        style={{
          background: "rgba(9,20,16,0.96)",
          border: "1px solid rgba(137,215,183,0.18)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(137,215,183,0.14)" }}>
          <UsersThree size={11} weight="bold" className="text-mint" />
        </div>
        <span className="whitespace-nowrap text-[11px] font-medium tracking-tight text-cream/82">
          3 investors active now
        </span>
      </motion.div>

      {/* Card deck */}
      <div className="relative" style={{ perspective: "1100px" }}>
        {/* Ghost card 3 */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(160deg, #1e3a2f 0%, #162b22 100%)",
            border: "1px solid rgba(137,215,183,0.07)",
            transform: "translateY(14px) translateX(10px) rotate(2.2deg)",
            transformOrigin: "center bottom",
            zIndex: 1,
            opacity: 0.5,
          }}
        />
        {/* Ghost card 2 */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(160deg, #152920 0%, #0f1f18 100%)",
            border: "1px solid rgba(137,215,183,0.1)",
            transform: "translateY(7px) translateX(5px) rotate(1.1deg)",
            transformOrigin: "center bottom",
            zIndex: 2,
            opacity: 0.72,
          }}
        />

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, rotateX: 14, rotateY: -18, y: 16 }}
          animate={{ opacity: 1, rotateX: 4, rotateY: -8, y: 0 }}
          whileHover={{ rotateX: 1, rotateY: -3, scale: 1.015, transition: { duration: 0.38, ease: "easeOut" } }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
          style={{ position: "relative", zIndex: 10, transformStyle: "preserve-3d" }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <BlueprintCard />
          </motion.div>
        </motion.div>
      </div>

      {/* Floating badge: bottom-right */}
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute -bottom-2 right-0 z-30 flex items-center gap-2.5 rounded-xl px-3 py-2.5"
        style={{
          background: "rgba(9,20,16,0.96)",
          border: "1px solid rgba(137,215,183,0.18)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-dark" style={{ background: "#89d7b7" }}>
          JD
        </div>
        <div>
          <div className="text-[11px] font-semibold leading-snug tracking-tight text-cream/88">Dev match — 94%</div>
          <div className="text-[10px] text-cream/36">React · Node · AWS</div>
        </div>
        <Lightning size={12} weight="fill" className="shrink-0 text-mint" />
      </motion.div>

      {/* Floating badge: bottom-left */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-12 left-0 z-30 flex items-center gap-2 rounded-xl px-3 py-2"
        style={{
          background: "rgba(9,20,16,0.96)",
          border: "1px solid rgba(137,215,183,0.18)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(137,215,183,0.15)" }}>
          <CheckCircle size={10} weight="bold" className="text-mint" />
        </div>
        <span className="whitespace-nowrap text-[11px] font-medium tracking-tight text-cream/78">
          Blueprint ready
        </span>
      </motion.div>
    </div>
  );
}

// ─── Scroll indicator ─────────────────────────────────────────────────────────

function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.2, duration: 1 }}
      className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
    >
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown size={13} className="text-cream/18" />
      </motion.div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function Hero() {
  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden bg-dark px-4 pt-24 pb-8 sm:px-6 md:px-12">
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
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-mint/18 bg-mint/[0.06] px-4 py-1.5"
              style={{ boxShadow: "0 0 24px rgba(137,215,183,0.06) inset" }}
            >
              <Sparkle size={11} weight="fill" className="text-mint" />
              <span className="text-[11px] font-medium tracking-widest uppercase text-mint/72">
                AI-powered venture platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mb-4 text-[2.8rem] font-bold leading-[1.06] tracking-[-0.03em] text-cream sm:text-[3.4rem] lg:text-[3.6rem] xl:text-[4rem]"
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
              className="mb-6 max-w-[42ch] text-[15px] leading-[1.7] text-cream/46 lg:text-[16px]"
            >
              Evolv turns raw startup ideas into investor-ready blueprints — with market
              analysis, competitor maps, MVP specs, and a viability score — in 60 seconds.
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
                  className="flex items-center justify-center gap-2 rounded-xl bg-mint px-7 py-3.5 text-[13px] font-semibold tracking-tight text-dark transition-all"
                  style={{ boxShadow: "0 0 40px rgba(137,215,183,0.28), 0 4px 16px rgba(137,215,183,0.14)" }}
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
                className="group flex items-center justify-center gap-2 rounded-xl border border-cream/10 px-7 py-3.5 text-[13px] tracking-tight text-cream/48 transition-all hover:border-mint/24 hover:text-cream/72"
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
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dark text-[9px] font-bold text-dark"
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
              <p className="text-[11px] text-cream/36">
                <span className="font-semibold text-cream/58">400+</span>{" "}
                founders already building
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-2 gap-x-5 gap-y-4 border-t border-cream/[0.07] pt-5 sm:grid-cols-4"
            >
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-[1.5rem] font-bold leading-none tracking-tight text-mint">
                    <AnimatedCounter
                      to={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.prefix ?? ""}
                    />
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] leading-snug text-cream/32">
                    <CheckCircle size={9} weight="bold" className="shrink-0 text-mint/40" />
                    {stat.label}
                  </div>
                </div>
              ))}
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