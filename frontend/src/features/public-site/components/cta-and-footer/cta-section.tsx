"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { FAQ_ITEMS } from "./cta-and-footer-data";
import { FAQAccordionItem } from "./faq-item";

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
      style={{ background: "#f8f6f1" }}
    >
      {/* Top hairline */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 left-0 h-px"
        style={{ background: "rgba(12,26,20,0.08)" }}
      />

      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(26,49,44,0.065) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)",
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
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "#428475" }}
              >
                FAQ
              </span>
            </div>

            {/* Heading */}
            <h2
              className="mb-4 text-[2.2rem] leading-[1.1] font-bold tracking-[-0.025em] sm:text-[2.6rem]"
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
