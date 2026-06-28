"use client";

import { motion } from "framer-motion";
import { Sparkle } from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { ScrollReelTestimonials } from "@/components/ui/scroll-reel-testimonials";

const BRAND_DARK = "#1a312c";
const BRAND_MINT = "#89d7b7";
const BRAND_CREAM = "#fff4e1";

const testimonialData = [
  { quote: "I had my idea on Monday. By Wednesday I had a full blueprint, a developer match, and two investor inquiries.", author: "Ayesha Khan — Founder, EdTech startup", image: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=300&q=80&fit=crop&crop=faces", alt: "Ayesha Khan" },
  { quote: "Every blueprint already has the stack, features, constraints, and budget context. It makes freelance discovery dramatically cleaner.", author: "James Delgado — Full-stack developer", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80&fit=crop&crop=faces", alt: "James Delgado" },
  { quote: "The viability scoring saves hours of first-pass diligence. I can filter by domain and move directly into founder conversations.", author: "Sofia Reyes — Angel investor, HealthTech focus", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80&fit=crop&crop=faces", alt: "Sofia Reyes" },
];

export function SidePanel() {
  return (
    <motion.aside
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden h-screen overflow-hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col"
      style={{ background: BRAND_DARK }}
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 55% at 35% 55%, rgba(137,215,183,0.07) 0%, transparent 65%),radial-gradient(ellipse 50% 40% at 78% 25%, rgba(66,132,117,0.05) 0%, transparent 55%)" }} />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full" style={{ background: "rgba(137,215,183,0.05)", filter: "blur(60px)" }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 flex h-full flex-col px-12 xl:px-16">
        <div style={{ paddingTop: "64px" }}><Logo dark /></div>

        <div className="flex flex-1 flex-col justify-center gap-9 py-8">
          <div className="flex flex-col gap-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ background: "rgba(137,215,183,0.1)", border: "1px solid rgba(137,215,183,0.16)", color: BRAND_MINT }}>
              <Sparkle size={10} weight="fill" /> Join the network
            </div>
            <div>
              <h2 className="font-bold leading-[1.08] tracking-[-0.02em]" style={{ color: BRAND_CREAM, fontSize: "clamp(2.1rem, 2.8vw, 2.75rem)" }}>
                Build your venture.<br /><span style={{ color: BRAND_MINT }}>Find your team.</span>
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "rgba(255,244,225,0.46)" }}>
                Join a curated ecosystem of founders and developers shipping the next generation of startups.
              </p>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }} className="w-full flex justify-center">
            <div className="relative h-[220px] xl:h-[260px] w-full flex items-center justify-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] scale-[0.55] xl:scale-[0.70]">
                <ScrollReelTestimonials testimonials={testimonialData} />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.aside>
  );
}
