"use client";

import { motion } from "framer-motion";
import { ArrowRight, Quote, Rocket } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";

const testimonials = [
  {
    quote:
      "I had my idea on Monday. By Wednesday I had a full blueprint, a developer match, and two investor inquiries.",
    name: "Ayesha Khan",
    role: "Founder",
    company: "EdTech startup",
    initials: "AK",
    color: "#89d7b7",
  },
  {
    quote:
      "Every blueprint already has the stack, features, constraints, and budget context. It makes freelance discovery dramatically cleaner.",
    name: "James Delgado",
    role: "Full-stack developer",
    company: "React, Node, AWS",
    initials: "JD",
    color: "#428475",
  },
  {
    quote:
      "The viability scoring saves hours of first-pass diligence. I can filter by domain and move directly into founder conversations.",
    name: "Sofia Reyes",
    role: "Angel investor",
    company: "HealthTech focus",
    initials: "SR",
    color: "#fff4e1",
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

        <StaggerContainer className="grid grid-cols-1 gap-4 lg:grid-cols-3" staggerDelay={0.12}>
          {testimonials.map((testimonial) => (
            <StaggerItem key={testimonial.name} className="h-full">
              <motion.article
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-col rounded-lg border border-cream/10 bg-cream/[0.065] p-6 sm:p-7"
                style={{ borderTopColor: `${testimonial.color}50`, borderTopWidth: "2px" }}
              >
                <Quote size={23} className="mb-5 opacity-35" style={{ color: testimonial.color }} />
                <p className="mb-6 flex-1 text-sm leading-relaxed text-cream/76">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: `${testimonial.color}15`, color: testimonial.color }}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-cream">{testimonial.name}</div>
                    <div className="text-xs text-cream/42">
                      {testimonial.role} - {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-dark px-4 py-20 sm:px-6 md:px-12 lg:py-28">
      <div className="absolute left-0 right-0 top-0 h-px bg-mint/10" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(110deg, transparent 0%, rgba(137,215,183,0.08) 44%, rgba(137,215,183,0.03) 62%, transparent 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <FadeIn>
          <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-lg border border-mint/20 bg-mint/10">
            <Rocket size={26} className="text-mint" />
          </div>

          <h2 className="mb-5 text-3xl font-bold leading-tight text-cream sm:text-4xl md:text-5xl">
            Your venture starts with a <span className="text-mint">blueprint</span>
          </h2>

          <p className="mx-auto mb-9 max-w-2xl text-base leading-relaxed text-cream/52 md:text-lg">
            Create the document that aligns founders, developers, and investors before the first
            meeting. Blueprint generation is free to start.
          </p>

          <div className="mb-7 flex flex-col justify-center gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2.5 rounded-lg bg-mint px-8 py-4 text-base font-semibold text-dark transition-colors hover:bg-mint/90"
            >
              <Rocket size={18} />
              Forge your blueprint
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 rounded-lg border border-cream/12 px-8 py-4 text-base text-cream/58 transition-all hover:border-mint/30 hover:text-mint"
            >
              Talk to our team <ArrowRight size={15} />
            </motion.button>
          </div>

          <p className="text-sm text-cream/30">
            No credit card needed - blueprint ready in 60 seconds - cancel anytime
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-cream/6 bg-[#0e1e1a] px-4 py-8 sm:px-6 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint/18">
            <Rocket size={13} className="text-mint" />
          </div>
          <span className="text-sm text-cream/42">
            Ev<span className="text-mint/65">olv</span> - &copy; 2026
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          {["Privacy", "Terms", "Docs", "Contact", "Blog"].map((link) => (
            <a key={link} href="#" className="text-xs text-cream/30 transition-colors hover:text-mint/70">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
