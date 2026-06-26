"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { FadeIn } from "@/components/ui/FadeIn";
import { ScrollReelTestimonials } from "@/components/ui/scroll-reel-testimonials";

const CTAGlobe = dynamic(
  () => import("@/components/ui/CTAGlobe").then((m) => ({ default: m.CTAGlobe })),
  { ssr: false, loading: () => <div className="h-full w-full" /> }
);

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */

interface TestimonialItem {
  quote: string;
  author: string;
  image: string;
  alt: string;
}

interface NavLink {
  label: string;
  href: string;
}

interface DotPatternProps {
  className?: string;
}

interface FooterColumnProps {
  title: string;
  links: NavLink[];
}

/* ════════════════════════════════════════════════════════════
   TESTIMONIALS  (unchanged)
════════════════════════════════════════════════════════════ */

const testimonialData: TestimonialItem[] = [
  {
    quote:
      "I had my idea on Monday. By Wednesday I had a full blueprint, a developer match, and two investor inquiries.",
    author: "Ayesha Khan — Founder, EdTech startup",
    image:
      "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=300&q=80&fit=crop&crop=faces",
    alt: "Ayesha Khan",
  },
  {
    quote:
      "Every blueprint already has the stack, features, constraints, and budget context. It makes freelance discovery dramatically cleaner.",
    author: "James Delgado — Full-stack developer",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80&fit=crop&crop=faces",
    alt: "James Delgado",
  },
  {
    quote:
      "The viability scoring saves hours of first-pass diligence. I can filter by domain and move directly into founder conversations.",
    author: "Sofia Reyes — Angel investor, HealthTech focus",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80&fit=crop&crop=faces",
    alt: "Sofia Reyes",
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-dark px-4 py-20 sm:px-6 md:px-12 lg:py-24">
      <div className="absolute left-0 right-0 top-0 h-px bg-mint/10" />
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-3 text-xs uppercase text-mint">Early users</div>
          <h2 className="text-3xl font-bold leading-tight text-cream sm:text-4xl md:text-5xl">
            Founders, developers, and investors are already using the same
            source of truth
          </h2>
        </FadeIn>
        <FadeIn className="flex justify-center">
          <ScrollReelTestimonials testimonials={testimonialData} />
        </FadeIn>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   CTA — globe section  (unchanged)
════════════════════════════════════════════════════════════ */

const OUTCOMES: string[] = [
  "funded startup",
  "developer team",
  "investor pitch",
  "Series A round",
];

const ROLE_CHIPS: { label: string; top: string; left: string; delay: number }[] = [
  { label: "Founder",   top: "8%",  left: "68%", delay: 0 },
  { label: "Developer", top: "78%", left: "62%", delay: 0.6 },
  { label: "Investor",  top: "46%", left: "76%", delay: 1.2 },
];

function CyclingWord() {
  const [idx, setIdx] = useState<number>(0);

  useEffect(() => {
    const id = setInterval(
      () => setIdx((i) => (i + 1) % OUTCOMES.length),
      2600
    );
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="relative inline-flex overflow-hidden align-bottom"
      style={{ minWidth: "9ch" }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={OUTCOMES[idx]}
          initial={{ y: 22, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -22, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="inline-block whitespace-nowrap font-bold"
          style={{
            background:
              "linear-gradient(135deg, #1a312c 0%, #428475 55%, #89d7b7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {OUTCOMES[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function CTA() {
  return (
    <section className="relative overflow-hidden" style={{ background: "#f8f6f1" }}>
      {/* Top hairline */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(26,49,44,0.16) 30%, rgba(26,49,44,0.16) 70%, transparent)",
        }}
      />

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 75% 45%, rgba(137,215,183,0.14) 0%, transparent 65%)," +
            "radial-gradient(ellipse 45% 40% at 20% 70%, rgba(66,132,117,0.07) 0%, transparent 60%)",
        }}
      />

      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(26,49,44,0.11) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 85% 75% at 50% 50%, black 35%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center px-4 pt-20 pb-24 sm:px-6 md:px-12 lg:grid-cols-[55%_45%] lg:pt-28 lg:pb-32">

        {/* LEFT */}
        <FadeIn className="pb-8 lg:pb-0 lg:pr-16">
          <motion.div
            className="mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              background: "rgba(26,49,44,0.05)",
              border: "1px solid rgba(26,49,44,0.12)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-65"
                style={{ background: "#428475" }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ background: "#428475" }}
              />
            </span>
            <span
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "#428475" }}
            >
              Free to start — no card needed
            </span>
          </motion.div>

          <h2
            className="mb-4 text-4xl font-bold leading-[1.07] tracking-[-0.03em] sm:text-5xl lg:text-[3.2rem]"
            style={{ color: "#0c1a14" }}
          >
            Your next <CyclingWord />
            <br />
            starts with a blueprint.
          </h2>

          <p
            className="mb-9 max-w-lg text-[16px] leading-[1.7]"
            style={{ color: "rgba(12,26,20,0.5)" }}
          >
            Describe your idea in plain English. Evolv generates a complete
            blueprint — market analysis, tech stack, financial model, and
            viability score — in under 60 seconds. Then it matches you with
            the right developers and investors.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {([] as string[]).map((t) => (
              <span
                key={t}
                className="flex items-center gap-1.5 text-[12px]"
                style={{ color: "rgba(12,26,20,0.38)" }}
              >
                <Check size={10} weight="bold" style={{ color: "#428475" }} />
                {t}
              </span>
            ))}
          </div>
        </FadeIn>

        {/* RIGHT — globe */}
        <div className="relative flex items-center justify-center py-8 lg:h-[560px] lg:py-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
            style={{ width: 340, height: 340, background: "rgba(137,215,183,0.18)" }}
          />

          {[380, 440].map((size, i) => (
            <div
              key={size}
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: size,
                height: size,
                border: `1px dashed rgba(66,132,117,${i === 0 ? 0.2 : 0.1})`,
              }}
            />
          ))}

          {ROLE_CHIPS.map(({ label, top, left, delay }) => (
            <motion.div
              key={label}
              className="pointer-events-none absolute z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
              style={{
                top,
                left,
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(26,49,44,0.1)",
                boxShadow: "0 2px 16px rgba(26,49,44,0.1)",
                color: "#1a312c",
                backdropFilter: "blur(8px)",
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3.8 + delay * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#89d7b7" }}
              />
              {label}
            </motion.div>
          ))}

          <div className="h-[320px] w-[320px] lg:h-[420px] lg:w-[420px]">
            <CTAGlobe />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   FOOTER HELPERS
════════════════════════════════════════════════════════════ */

function DotPattern({ className }: DotPatternProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width="120"
      height="120"
      viewBox="0 0 120 120"
    >
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={col * 15 + 7}
            cy={row * 15 + 7}
            r="1.8"
            fill="rgba(137,215,183,0.32)"
          />
        ))
      )}
    </svg>
  );
}

function CircuitLines() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 900 340"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="rgba(137,215,183,0.07)" strokeWidth="1" fill="none">
        <path d="M0 80 H300 V40 H600" />
        <path d="M0 170 H200 V130 H450 V170 H720" />
        <path d="M520 0 V300" />
        <path d="M650 0 V170 H820 V90" />
        <path d="M0 255 H150 V210 H360 V255 H560" />
        <path d="M760 340 V150 H900" />
      </g>
      {(
        [
          [300, 80],
          [600, 40],
          [200, 170],
          [450, 130],
          [720, 170],
          [520, 170],
          [650, 170],
          [360, 210],
          [150, 255],
        ] as [number, number][]
      ).map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="3"
          fill="rgba(137,215,183,0.16)"
        />
      ))}
    </svg>
  );
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: "rgba(12,26,20,0.4)" }}
      >
        {title}
      </p>
      <ul className="flex flex-col gap-3">
        {links.map((link: NavLink) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-[14px] transition-colors duration-150"
              style={{ color: "rgba(12,26,20,0.55)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "rgba(12,26,20,0.9)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(12,26,20,0.55)")
              }
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   FOOTER LINK DATA
════════════════════════════════════════════════════════════ */

const PRODUCT_LINKS: NavLink[] = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Blueprint",    href: "#blueprint" },
  { label: "Developers",   href: "#developers" },
  { label: "Pricing",      href: "#pricing" },
];

const COMPANY_LINKS: NavLink[] = [
  { label: "About",    href: "#" },
  { label: "Our Team", href: "#" },
  { label: "Contact",  href: "mailto:hello@evolv.so" },
  { label: "Careers",  href: "#" },
  { label: "Blog",     href: "#" },
];

const RESOURCE_LINKS: NavLink[] = [
  { label: "Documentation", href: "#" },
  { label: "FAQ",           href: "#" },
  { label: "Support",       href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use",  href: "#" },
];

/* ════════════════════════════════════════════════════════════
   FOOTER  (replaces old Footer export)
════════════════════════════════════════════════════════════ */

export function Footer() {
  return (
    <div className="relative" style={{ background: "#f8f6f1" }}>

      {/* ── FLOATING CTA CARD ─────────────────────────────── */}
      <div className="relative z-10 px-4 sm:px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -5, transition: { duration: 0.3, ease: "easeOut" } }}
          className="relative mx-auto overflow-hidden"
          style={{
            maxWidth: "82%",
            borderRadius: 32,
            background: "#081E18",
            boxShadow:
              "0 40px 100px rgba(8,30,24,0.4), 0 8px 28px rgba(8,30,24,0.22)",
            marginBottom: "-130px",
          }}
        >
          {/* Radial glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 70% at 88% 25%, rgba(137,215,183,0.10) 0%, transparent 65%)," +
                "radial-gradient(ellipse 40% 55% at 8% 85%, rgba(66,132,117,0.08) 0%, transparent 60%)",
            }}
          />

          <CircuitLines />

          <DotPattern className="pointer-events-none absolute right-8 top-6 opacity-90" />
          <DotPattern className="pointer-events-none absolute bottom-6 left-8 opacity-60" />

          {/* Content — left headline, right description only, no buttons */}
          <div className="relative grid grid-cols-1 items-center gap-8 px-12 py-12 lg:grid-cols-2 lg:gap-14 lg:px-20 lg:py-14">

            {/* Left — headline with breathing room from card edge */}
            <div className="flex flex-col justify-center">
              <h2
                className="text-[1.9rem] font-bold leading-[1.18] tracking-tight text-white sm:text-[2.2rem] lg:text-[2.6rem]"
              >
                Every great startup
                <br />
                begins with the
                <br />
                right{" "}
                <span style={{ color: "#89d7b7" }}>blueprint.</span>
              </h2>
            </div>

            {/* Right — description only, no buttons */}
            <div className="flex flex-col justify-center">
              <p
                className="text-[14px] leading-[1.8]"
                style={{ color: "rgba(255,244,225,0.52)" }}
              >
                Describe your idea, generate an AI-powered business and
                technical blueprint, then connect with developers ready to
                bring it to life.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="relative overflow-hidden" style={{ background: "#f0ede6" }}>

        {/* Giant EVOLV watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ zIndex: 0 }}
        >
          <span
            className="select-none whitespace-nowrap font-black uppercase leading-none tracking-tighter"
            style={{
              fontSize: "clamp(100px, 20vw, 300px)",
              color: "#1a312c",
              opacity: 0.05,
              marginTop: "60px",
            }}
          >
            evolv
          </span>
        </div>

        {/* Abstract curved decoration lines */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-full w-full"
          viewBox="0 0 1200 500"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          style={{ zIndex: 0 }}
        >
          <path
            d="M-60 220 Q180 130 420 210 Q680 300 940 190 Q1080 140 1260 170"
            stroke="rgba(26,49,44,0.07)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M-60 300 Q240 210 500 295 Q780 385 1060 275 Q1160 235 1260 260"
            stroke="rgba(26,49,44,0.05)"
            strokeWidth="1"
            fill="none"
          />
        </svg>

        {/* Footer content */}
        <div
          className="relative mx-auto max-w-7xl px-4 pb-10 sm:px-6 md:px-12"
          style={{ paddingTop: "200px", zIndex: 1 }}
        >
          {/* 4-column grid */}
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">

            {/* Col 1 — Brand */}
            <div className="flex flex-col gap-5">
              <a href="#" aria-label="Evolv home" className="flex items-center gap-2.5">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 15 L6 10.5 L10 13 L14 7 L18 3.5"
                    stroke="#428475"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="18" cy="3.5" r="2.1" fill="#428475" />
                </svg>
                <span
                  className="text-[26px] font-bold leading-none tracking-tight"
                  style={{ color: "#0c1a14" }}
                >
                  Ev<span style={{ color: "#428475" }}>olv</span>
                </span>
              </a>

              <p
                className="max-w-[210px] text-[13px] leading-relaxed"
                style={{ color: "rgba(12,26,20,0.5)" }}
              >
                Where ideas become blueprints and blueprints become ventures.
              </p>

              <motion.a
                href="#"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold"
                style={{ background: "#1a312c", color: "#89d7b7" }}
              >
                Get Started Free
                <ArrowRight size={12} weight="bold" />
              </motion.a>

              <p
                className="mt-3 text-[12px] leading-relaxed"
                style={{ color: "rgba(12,26,20,0.35)" }}
              >
                © 2026 Team Evolv.
                <br />
                All rights reserved.
              </p>
            </div>

            <FooterColumn title="Product"   links={PRODUCT_LINKS}  />
            <FooterColumn title="Company"   links={COMPANY_LINKS}  />
            <FooterColumn title="Resources" links={RESOURCE_LINKS} />
          </div>

          {/* Bottom bar */}
          <div
            className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-5 sm:flex-row"
            style={{ borderColor: "rgba(12,26,20,0.1)" }}
          >
            <a
              href="#"
              className="text-[12px] transition-colors duration-150"
              style={{ color: "rgba(12,26,20,0.35)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "rgba(12,26,20,0.7)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(12,26,20,0.35)")
              }
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[12px] transition-colors duration-150"
              style={{ color: "rgba(12,26,20,0.35)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "rgba(12,26,20,0.7)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(12,26,20,0.35)")
              }
            >
              Terms of Use
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}