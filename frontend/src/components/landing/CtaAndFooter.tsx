"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Plus } from "@phosphor-icons/react";
import { FadeIn } from "@/components/ui/FadeIn";
import { ScrollReelTestimonials } from "@/components/ui/scroll-reel-testimonials";

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

interface FooterColumnProps {
  title: string;
  links: NavLink[];
}

interface FAQItem {
  question: string;
  answer: string;
}

/* ════════════════════════════════════════════════════════════
   TESTIMONIALS
════════════════════════════════════════════════════════════ */

const testimonialData: TestimonialItem[] = [
  {
    quote:
      "I had my idea on Monday. By Wednesday I had a full blueprint and four developer match.",
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
    author: "Sofia Reyes — Web develper",
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
   FAQ DATA
════════════════════════════════════════════════════════════ */

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What exactly is a blueprint?",
    answer:
      "A blueprint is the complete operating document for your startup idea. It includes a market analysis with competitor mapping, a prioritised MVP feature list, a recommended technical architecture and stack, and a 12-month financial projection — everything a developer needs to start building, in one structured document.",
  },
  {
    question: "How long does it take to generate one?",
    answer:
      "Between 30 and 60 seconds. You describe your idea in plain English — no decks, no frameworks, no formatting required. Evolv's multi-agent pipeline runs market research, competitor analysis, MVP scoping, architecture design, and financial modelling in parallel, then assembles everything into a readable blueprint.",
  },
  {
    question: "Do I need a technical background?",
    answer:
      "Not at all. The intake is a plain-language description of your idea, the problem you're solving, and who you're solving it for. Evolv translates that into technical specifications, stack recommendations, and cost estimates. You review the output and refine it — no engineering knowledge required.",
  },
  {
    question: "Can I edit the blueprint after it's generated?",
    answer:
      "Yes. Once generated, the blueprint is a living document. You can edit any section, update the scope, revise the financial assumptions, and regenerate specific sections. Changes are reflected in real time for any developers who have access to it.",
  },
  {
    question: "How does developer matching work?",
    answer:
      "When a blueprint is published, Evolv matches it against registered developer profiles using stack fit, domain experience, seniority level, and availability. You receive ranked opportunities that match your actual skills — not keyword-searched job boards. You see the full technical spec before deciding whether to reach out.",
  },
  {
    question: "Is Evolv free to use?",
    answer:
      "Yes — completely free. Every user can generate as many blueprints as they want at no cost. No plans, no credit card required, no limits on generation.",
  },
  {
    question: "How is this different from a business plan generator?",
    answer:
      "Business plan generators produce formatted documents. Evolv produces a live, matchable object — a structured blueprint that actively connects you to the developers most likely to act on it. The blueprint is not a PDF you email around; it's the shared source of truth for everyone working on the venture.",
  },
];

/* ════════════════════════════════════════════════════════════
   FAQ ITEM
════════════════════════════════════════════════════════════ */

function FAQAccordionItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {/* Top divider */}
      <div
        style={{
          height: "1px",
          background: "rgba(12,26,20,0.13)",
        }}
      />

      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-8 py-9 text-left"
        aria-expanded={isOpen}
      >
        {/* Question */}
        <span
          className="text-[21px] font-semibold leading-snug tracking-tight sm:text-[23px]"
          style={{
            color: isOpen ? "#0c1a14" : "rgba(12,26,20,0.7)",
            transition: "color 0.2s",
            fontSize: 18,
            padding: 10
          }}
        >
          {item.question}
        </span>

        {/* Toggle */}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{
            background: isOpen ? "#428475" : "transparent",
            border: `1.5px solid ${isOpen ? "#428475" : "rgba(12,26,20,0.18)"}`,
            transition: "background 0.2s, border-color 0.2s",
          }}
        >
          <Plus
            size={13}
            weight="bold"
            style={{ color: isOpen ? "#fff" : "rgba(12,26,20,0.45)" }}
          />
        </motion.div>
      </button>

      {/* Answer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden"
          >
            <p
              className="max-w-2xl pb-10 pr-16 text-[15.5px] leading-[1.9]"
              style={{ color: "rgba(12,26,20,0.52)" }}
            >
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   FAQ SECTION — 2-col: sticky left heading, right accordion
════════════════════════════════════════════════════════════ */

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      id="faq"
      className="relative overflow-hidden px-4 py-28 sm:px-6 md:px-12 lg:py-36"
      style={{ background: "#f8f6f1"}}
    >
      {/* Top hairline */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: "rgba(12,26,20,0.08)" }}
      />

      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(26,49,44,0.065) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[280px_1fr] lg:gap-24">

          {/* ── LEFT: sticky heading ── */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:sticky lg:top-36 lg:self-start lg:pt-[37px]"
          >
            {/* FAQ badge */}
            <div
              className="mb-5 inline-flex items-center rounded-full px-3 py-1"
              style={{
                background: "rgba(66,132,117,0.08)",
                border: "1px solid rgba(66,132,117,0.14)",
              }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "#428475" }}
              >
                FAQ
              </span>
            </div>

            {/* Heading */}
            <h2
              className="mb-4 text-[2.2rem] font-bold leading-[1.1] tracking-[-0.025em] sm:text-[2.6rem]"
              style={{ color: "#0c1a14" }}
            >
              Got
              <br />
              questions?
              <br />
              <span style={{ color: "#428475" }}>We&apos;ve got answers.</span>
            </h2>

            {/* Description */}
            <p
              className="mb-8 text-[14px] leading-relaxed"
              style={{ color: "rgba(12,26,20,0.52)", maxWidth: "230px" }}
            >
              Didn&apos;t find your answer?
            </p>

            {/* Divider */}
            <div
              className="mb-6"
              style={{
                height: "1px",
                background: "rgba(12,26,20,0.1)",
                width: "40px",
              }}
            />

            <a
              href="mailto:hello@evolv.so"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold underline underline-offset-4"
              style={{ color: "#428475" }}
            >
              Contact us
              <ArrowRight size={12} weight="bold" />
            </a>
          </motion.div>

          {/* ── RIGHT: accordion ── */}
          <div>
            {FAQ_ITEMS.map((item, i) => (
              <FAQAccordionItem
                key={i}
                item={item}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
            {/* Final closing line */}
            <div style={{ height: "1px", background: "rgba(12,26,20,0.13)" }} />
          </div>

        </div>
      </div>
    </section>
  );
}

// CTA alias — Landing.tsx import stays unchanged
export { FAQ as CTA };

/* ════════════════════════════════════════════════════════════
   FOOTER HELPERS
════════════════════════════════════════════════════════════ */

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: "#89d7b7" }}
      >
        {title}
      </p>
      <ul className="flex flex-col gap-3">
        {links.map((link: NavLink) => (
          <li key={link.label}>
            {link.href.startsWith("/") ? (
              <Link
                href={link.href}
                className="text-[13.5px] leading-snug transition-colors duration-200"
                style={{ color: "rgba(255,244,225,0.45)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,244,225,0.9)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,244,225,0.45)")
                }
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className="text-[13.5px] leading-snug transition-colors duration-200"
                style={{ color: "rgba(255,244,225,0.45)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,244,225,0.9)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,244,225,0.45)")
                }
              >
                {link.label}
              </a>
            )}
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
  { label: "How it Works", href: "/#how-it-works" },
  { label: "FAQ",          href: "/#faq"          },
];

const COMPANY_LINKS: NavLink[] = [
  { label: "About",    href: "/about"                },
  { label: "Our Team", href: "/our-team"             },
];

const LEGAL_LINKS: NavLink[] = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use",   href: "#" },
];

/* ════════════════════════════════════════════════════════════
   FOOTER
════════════════════════════════════════════════════════════ */

export function Footer() {
  return (
    <footer
      className="relative"
      style={{ background: "#1a312c"}}
    >
      {/* Top hairline */}
      <div style={{ height: "1px", background: "rgba(137,215,183,0.1)" ,  marginBottom: 50}} />

      {/* ── Main grid ── */}
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">

          {/* ── Col 1: Brand ── */}
          <div className="flex flex-col gap-5">
            {/* Logo */}
            <Link href="/" aria-label="Evolv home" className="flex items-center gap-2">
              <Image
                src="/evolv-logo-transparent.png"
                alt=""
                aria-hidden="true"
                width={48}
                height={32}
                className="h-8 w-12 shrink-0 object-contain"
              />
              <span
                className="text-[20px] font-bold leading-none tracking-tight"
                style={{ color: "#fff4e1" }}
              >
                Evolv
              </span>
            </Link>

            {/* Description */}
            <p
              className="text-[13px] leading-[1.75]"
              style={{ color: "rgba(255,244,225,0.38)", maxWidth: "240px" }}
            >
              Build the next big thing with AI.
              <br />
              Turn ideas into AI-powered product blueprints and connect with developers who can build them.
            </p>

            {/* Email */}
            <a
              href="mailto:hello@evolv.so"
              className="inline-flex items-center gap-2 text-[13px] transition-colors duration-200"
              style={{ color: "#89d7b7" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {/* Email icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
              hello@evolv.so
            </a>

          </div>

          {/* ── Nav columns ── */}
          <FooterColumn title="Product"   links={PRODUCT_LINKS}  />
          <FooterColumn title="Company"   links={COMPANY_LINKS}  />
          <FooterColumn title="Legal"     links={LEGAL_LINKS}    />
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ height: "1px", background: "rgba(137,215,183,0.1)" }} />
      <div className="mx-auto max-w-6xl px-6 py-5 md:px-12">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">

          {/* Left: copyright */}
          <span
            className="text-[12px]"
            style={{ color: "rgba(255,244,225,0.25)" }}
          >
            © 2026 Evolv. All rights reserved.
          </span>

          {/* Center: made for founders */}
          <span
            className="flex items-center gap-1.5 text-[12px]"
            style={{ color: "rgba(255,244,225,0.25)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,244,225,0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Made for founders
          </span>

          {/* Right: legal links */}
          <div className="flex items-center gap-6">
            {LEGAL_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[12px] transition-colors duration-150"
                style={{ color: "rgba(255,244,225,0.25)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,244,225,0.65)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,244,225,0.25)")
                }
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
