"use client";

import { useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { steps } from "./how-it-works-data";
import { SectionHeader } from "./section-header";
import { CenterLine, ProgressDot } from "./step-timeline";
import { StepSlide } from "./step-card";

// ─── Main export ───────────────────────────────────────────────────────────────
// Outer <section> is tall (500 vh) to create scroll room.
// Inner sticky div (100 vh) stays pinned; scrollYProgress 0→1 drives everything.

export function HowItWorks() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Spring-smooth the raw progress so fast scrolling doesn't snap between steps
  const smooth = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });

  return (
    <section
      ref={containerRef}
      id="how-it-works"
      style={{ height: `${(steps.length + 1) * 100}vh`, scrollMarginTop: "80px" }}
    >
      {/* ── Sticky viewport ──────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          background: "#1a312c",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top border */}
        <div
          className="absolute top-0 right-0 left-0 z-10 h-px"
          style={{ background: "rgba(137,215,183,0.1)" }}
        />

        {/* ── Section heading — always visible ─────────────────────── */}
        <SectionHeader />

        {/* ── Steps + vertical progress line ───────────────────────── */}
        <div className="relative z-10 flex-1">
          {/* Center line sits behind the slides */}
          <CenterLine progress={smooth} />

          {steps.map((step, i) => (
            <StepSlide
              key={step.number}
              step={step}
              index={i}
              totalSteps={steps.length}
              progress={smooth}
            />
          ))}
        </div>

        {/* ── Bottom progress dots ──────────────────────────────────── */}
        <div className="relative z-20 flex shrink-0 items-center justify-center gap-2.5 pb-8">
          {steps.map((_, i) => (
            <ProgressDot key={i} index={i} totalSteps={steps.length} progress={smooth} />
          ))}
        </div>
      </div>
    </section>
  );
}
