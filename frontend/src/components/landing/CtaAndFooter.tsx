"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Sparkle, InstagramLogo, LinkedinLogo, TwitterLogo } from "@phosphor-icons/react";
import { FadeIn } from "@/components/ui/FadeIn";
import { ScrollReelTestimonials } from "@/components/ui/scroll-reel-testimonials";

const CTAGlobe = dynamic(
  () => import("@/components/ui/CTAGlobe").then((m) => ({ default: m.CTAGlobe })),
  { ssr: false, loading: () => <div className="h-full w-full" /> }
);

/* ════════════════════════════════════════════════════════════
   TESTIMONIALS
════════════════════════════════════════════════════════════ */
const testimonialData = [
  {
    quote: "I had my idea on Monday. By Wednesday I had a full blueprint, a developer match, and two investor inquiries.",
    author: "Ayesha Khan — Founder, EdTech startup",
    image: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=300&q=80&fit=crop&crop=faces",
    alt: "Ayesha Khan",
  },
  {
    quote: "Every blueprint already has the stack, features, constraints, and budget context. It makes freelance discovery dramatically cleaner.",
    author: "James Delgado — Full-stack developer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80&fit=crop&crop=faces",
    alt: "James Delgado",
  },
  {
    quote: "The viability scoring saves hours of first-pass diligence. I can filter by domain and move directly into founder conversations.",
    author: "Sofia Reyes — Angel investor, HealthTech focus",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80&fit=crop&crop=faces",
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
            Founders, developers, and investors are already using the same source of truth
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
   CTA — light cream, globe accent, senior-level design
════════════════════════════════════════════════════════════ */

// Mirrors the Hero section cycling words for brand consistency
const OUTCOMES = [
  "funded startup",
  "developer team",
  "investor pitch",
  "Series A round",
];

const ROLE_CHIPS = [
  { label: "Founder",   top: "8%",  left: "68%", delay: 0 },
  { label: "Developer", top: "78%", left: "62%", delay: 0.6 },
  { label: "Investor",  top: "46%", left: "76%", delay: 1.2 },
];

const VALUE_CARDS = [
  {
    tag:    "Founders",
    title:  "Blueprint in 60 seconds",
    body:   "Describe your idea and Evolv generates a full market analysis, tech stack, financial model, and pitch structure — instantly.",
    checks: ["Market sizing & timing", "Recommended tech stack", "12-month revenue model"],
    accent: "#1a312c",
  },
  {
    tag:    "Developers",
    title:  "Real-time project matching",
    body:   "Browse blueprints that fit your exact skills, stack, and budget. Scope is already defined — no ambiguous briefs.",
    checks: ["Skill-fit scoring", "Budget & timeline clarity", "Warm founder introductions"],
    accent: "#428475",
  },
  {
    tag:    "Investors",
    title:  "Investor-ready scoring",
    body:   "A 0–100 viability rating across market timing, execution risk, and traction — structured for first-pass diligence.",
    checks: ["A+ / A / B tier rating", "Competitive gap analysis", "Pitch prep checklist"],
    accent: "#89d7b7",
  },
];

function CyclingWord() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % OUTCOMES.length), 2600);
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
          animate={{ y: 0,  opacity: 1 }}
          exit={  { y: -22, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="inline-block whitespace-nowrap font-bold"
          style={{
            background: "linear-gradient(135deg, #1a312c 0%, #428475 55%, #89d7b7 100%)",
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

function ValueCard({ card, index, inView }: {
  card: typeof VALUE_CARDS[0];
  index: number;
  inView: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="group relative flex flex-col overflow-hidden rounded-2xl"
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.14,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={{ y: -8, scale: 1.015 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.78)",
        border: "1px solid rgba(26,49,44,0.07)",
        boxShadow: hovered
          ? "0 20px 60px rgba(26,49,44,0.12), 0 0 0 1.5px rgba(66,132,117,0.25)"
          : "0 2px 12px rgba(26,49,44,0.05)",
        transition: "box-shadow 0.3s ease",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Shimmer overlay on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{
          background:
            "linear-gradient(135deg, rgba(137,215,183,0.1) 0%, rgba(66,132,117,0.04) 40%, transparent 70%)",
        }}
      />

      {/* Top gradient accent line (per role color) */}
      <div
        className="absolute left-0 right-0 top-0 h-[2.5px] rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, ${card.accent}60, ${card.accent}20, transparent)`,
          opacity: hovered ? 1 : 0.55,
          transition: "opacity 0.3s ease",
        }}
      />

      <div className="relative flex flex-1 flex-col p-6">
        {/* Role tag */}
        <div className="mb-4 flex items-center justify-between">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
            style={{
              background: `${card.accent}12`,
              border: `1px solid ${card.accent}28`,
              color: card.accent === "#89d7b7" ? "#428475" : card.accent,
            }}
          >
            {card.tag}
          </span>
          <motion.div
            animate={{ rotate: hovered ? 15 : 0, scale: hovered ? 1.15 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Sparkle
              size={14}
              weight="fill"
              style={{
                color: card.accent === "#89d7b7" ? "#428475" : card.accent,
                opacity: hovered ? 0.8 : 0.3,
              }}
            />
          </motion.div>
        </div>

        <h3
          className="mb-2.5 text-[15px] font-semibold leading-snug tracking-tight"
          style={{ color: "#0f1e1a" }}
        >
          {card.title}
        </h3>

        <p
          className="mb-5 flex-1 text-[13px] leading-relaxed"
          style={{ color: "rgba(15,30,26,0.52)" }}
        >
          {card.body}
        </p>

        {/* Checklist */}
        <ul className="flex flex-col gap-2">
          {card.checks.map((c, ci) => (
            <motion.li
              key={c}
              className="flex items-center gap-2.5"
              initial={false}
              animate={{ x: hovered ? 2 : 0 }}
              transition={{ delay: ci * 0.04, duration: 0.2 }}
            >
              <span
                className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                style={{
                  background: hovered ? `${card.accent}18` : "rgba(66,132,117,0.08)",
                  transition: "background 0.3s ease",
                }}
              >
                <Check
                  size={9}
                  weight="bold"
                  style={{ color: card.accent === "#89d7b7" ? "#428475" : card.accent }}
                />
              </span>
              <span className="text-[12px]" style={{ color: "rgba(15,30,26,0.55)" }}>
                {c}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export function CTA() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const inView   = useInView(cardsRef, { once: true, margin: "-60px" });

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#f8f6f1" }}
    >
      {/* Top hairline from dark section */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(26,49,44,0.16) 30%, rgba(26,49,44,0.16) 70%, transparent)",
        }}
      />

      {/* Ambient background glow */}
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
          backgroundImage: "radial-gradient(circle, rgba(26,49,44,0.11) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 50%, black 35%, transparent 100%)",
        }}
      />

      {/* ══════════════════════════════════════════════════
          MAIN HERO ROW
      ══════════════════════════════════════════════════ */}
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center px-4 pt-20 sm:px-6 md:px-12 lg:grid-cols-[55%_45%] lg:pt-28">

        {/* ── LEFT: headline + CTA ──────────────────────── */}
        <FadeIn className="pb-8 lg:pb-28 lg:pr-16">

          {/* Badge */}
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

          {/* Headline with cycling word */}
          <h2
            className="mb-4 text-4xl font-bold leading-[1.07] tracking-[-0.03em] sm:text-5xl lg:text-[3.2rem]"
            style={{ color: "#0c1a14" }}
          >
            Your next{" "}
            <CyclingWord />
            <br />
            starts with a blueprint.
          </h2>

          {/* Sub-headline */}
          <p
            className="mb-9 max-w-lg text-[16px] leading-[1.7]"
            style={{ color: "rgba(12,26,20,0.5)" }}
          >
            Describe your idea in plain English. Evolv generates a complete blueprint —
            market analysis, tech stack, financial model, and viability score — in under
            60 seconds. Then it matches you with the right developers and investors.
          </p>

          <div className="mb-10 grid gap-4 sm:grid-cols-3 items-stretch">
            {[
              {
                title: "Blueprint in 60 seconds",
                text: "Instantly turn your idea into an execution-ready project brief.",
              },
              {
                title: "Developer matches ready",
                text: "See scoped teams that fit your stack, budget, and timeline.",
              },
              {
                title: "Investor-ready score",
                text: "Share a concise viability grade for faster diligence.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="flex h-full flex-col rounded-3xl border border-slate-900/40 bg-white/95 p-5 shadow-sm"
                style={{
                  color: "#0f1e1a",
                }}
              >
                <h3 className="mb-3 text-sm font-semibold">{card.title}</h3>
                <p className="mt-auto text-[13px] leading-relaxed" style={{ color: "rgba(12,26,20,0.68)" }}>
                  {card.text}
                </p>
              </div>
            ))}
          </div>

          {/* Trust micro-row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {[
              
            ].map((t) => (
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

        {/* ── RIGHT: Three.js globe ─────────────────────── */}
        <div className="relative flex items-center justify-center py-8 lg:h-[560px] lg:py-0">

          {/* Ambient halo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
            style={{
              width: 340,
              height: 340,
              background: "rgba(137,215,183,0.18)",
            }}
          />

          {/* Outer dashed orbital rings */}
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

          {/* Floating role chips */}
          {ROLE_CHIPS.map(({ label, top, left, delay }) => (
            <motion.div
              key={label}
              className="pointer-events-none absolute z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
              style={{
                top, left,
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(26,49,44,0.1)",
                boxShadow: "0 2px 16px rgba(26,49,44,0.1)",
                color: "#1a312c",
                backdropFilter: "blur(8px)",
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.8 + delay * 0.4, repeat: Infinity, ease: "easeInOut", delay }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#89d7b7" }}
              />
              {label}
            </motion.div>
          ))}

          {/* Globe canvas */}
          <div className="h-[320px] w-[320px] lg:h-[420px] lg:w-[420px]">
            <CTAGlobe />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          VALUE CARDS
      ══════════════════════════════════════════════════ */}
      <div
        ref={cardsRef}
        className="relative mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 pb-24 pt-2 sm:px-6 md:grid-cols-3 md:px-12 lg:pb-32"
      >
        {VALUE_CARDS.map((card, i) => (
          <ValueCard key={card.tag} card={card} index={i} inView={inView} />
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   FOOTER — improved: proper layout, solid colors, good spacing
════════════════════════════════════════════════════════════ */

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Who it's for", href: "#who-it-for" },
  { label: "Early users", href: "#early-users" },
  { label: "Blueprint", href: "#blueprint" },
];

const COMPANY_LINKS = [
  { label: "About", href: "#" },
  { label: "Our Team", href: "#" },
  { label: "Contact", href: "mailto:hello@evolv.so" },
];

const SOCIAL_LINKS = [
  { label: "Twitter", href: "#", icon: TwitterLogo },
  { label: "LinkedIn", href: "#", icon: LinkedinLogo },
  { label: "Instagram", href: "#", icon: InstagramLogo },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use", href: "#" },
];

export function Footer() {
  return (
    <footer
      className="relative px-4 pt-16 pb-8 sm:px-6 md:px-12"
      style={{ background: "#0f1e1a" }}
    >
      {/* Top separator */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: "rgba(137,215,183,0.15)" }}
      />

      <div className="relative mx-auto max-w-7xl">

        {/* ── Main 3-column grid ── */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 lg:gap-16">

          {/* Col 1 — Brand */}
          <div className="flex flex-col gap-5">
            <a href="#" aria-label="Evolv home" className="flex items-center gap-3">
              <svg
                width="36"
                height="36"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <path
                  d="M2 15 L6 10.5 L10 13 L14 7 L18 3.5"
                  stroke="#89d7b7"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="18" cy="3.5" r="2.1" fill="#89d7b7" />
              </svg>
              <span
                className="text-[26px] font-bold tracking-tight leading-none"
                style={{ color: "#fff4e1" }}
              >
                Ev<span style={{ color: "#89d7b7" }}>olv</span>
              </span>
            </a>

            <p
              className="text-[13px] leading-relaxed max-w-[240px]"
              style={{ color: "rgba(255,244,225,0.45)" }}
            >
              Where ideas become blueprints and blueprints become ventures.
            </p>

            {/* CTA button */}
            <motion.a
              href="#"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-1 inline-flex w-fit items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold"
              style={{
                background: "#89d7b7",
                color: "#0f1e1a",
              }}
            >
              Get started free
              <ArrowRight size={13} weight="bold" />
            </motion.a>
          </div>

          {/* Col 2 — Navigation */}
          <div className="flex flex-col gap-4">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "rgba(137,215,183,0.5)" }}
            >
              Sections
            </p>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[14px] transition-colors duration-150"
                    style={{ color: "rgba(255,244,225,0.55)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "rgba(255,244,225,0.9)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,244,225,0.55)")
                    }
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Built by / contact */}
          <div className="flex flex-col gap-4">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "rgba(137,215,183,0.5)" }}
            >
              Company
            </p>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="#"
                  className="text-[14px] transition-colors duration-150"
                  style={{ color: "rgba(255,244,225,0.55)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(255,244,225,0.9)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,244,225,0.55)")
                  }
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[14px] transition-colors duration-150"
                  style={{ color: "rgba(255,244,225,0.55)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(255,244,225,0.9)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,244,225,0.55)")
                  }
                >
                  Our Team
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@evolv.so"
                  className="text-[14px] transition-colors duration-150"
                  style={{ color: "rgba(255,244,225,0.55)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(255,244,225,0.9)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,244,225,0.55)")
                  }
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div
          className="mt-14 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row"
          style={{ borderColor: "rgba(137,215,183,0.1)" }}
        >
          <p
            className="text-[12px]"
            style={{ color: "rgba(255,244,225,0.28)" }}
          >
            &copy; 2026 Team Evolv. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[12px] transition-colors duration-150"
                style={{ color: "rgba(255,244,225,0.28)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,244,225,0.6)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,244,225,0.28)")
                }
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
