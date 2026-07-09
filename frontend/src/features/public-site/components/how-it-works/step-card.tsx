"use client";

import { motion, type MotionValue, useTransform } from "framer-motion";
import { Icon } from "@iconify/react";
import { TRANS, EPS, type Step } from "./how-it-works-data";

// ─── Individual step slide ─────────────────────────────────────────────────────
// Sequential transition: step A exits (opacity→0, y→-70px) BEFORE step B
// enters (y from +70px→0). EPS gives a tiny overlap at the boundary so the
// screen never goes fully blank between steps.

export function StepSlide({
  step,
  index,
  totalSteps,
  progress,
}: {
  step: Step;
  index: number;
  totalSteps: number;
  progress: MotionValue<number>;
}) {
  const seg = 1 / totalSteps;
  const segStart = index * seg;
  const segEnd = (index + 1) * seg;
  const isFirst = index === 0;
  const isLast = index === totalSteps - 1;

  const pts: number[] = isFirst
    ? [0, segEnd - TRANS, segEnd + EPS]
    : isLast
      ? [segStart - EPS, segStart + TRANS, 1]
      : [segStart - EPS, segStart + TRANS, segEnd - TRANS, segEnd + EPS];

  const opVals: number[] = isFirst ? [1, 1, 0] : isLast ? [0, 1, 1] : [0, 1, 1, 0];

  // Large Y offset (80px) so exiting/entering slides are spatially separated
  // even during the brief EPS overlap — preventing visible text collisions.
  const yVals: string[] = isFirst
    ? ["0px", "0px", "-80px"]
    : isLast
      ? ["80px", "0px", "0px"]
      : ["80px", "0px", "0px", "-80px"];

  const opacity = useTransform(progress, pts, opVals);
  const y = useTransform(progress, pts, yVals);

  const isLeft = index % 2 === 0;

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 md:px-12"
    >
      <div className="grid w-full max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-20">
        {isLeft ? (
          <>
            <StepContent step={step} />
            <StepVisual step={step} />
          </>
        ) : (
          <>
            {/* On mobile content reads first; on desktop visual is col 1 */}
            <div className="order-2 md:order-1">
              <StepVisual step={step} />
            </div>
            <div className="order-1 md:order-2">
              <StepContent step={step} />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function StepContent({ step }: { step: Step }) {
  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-mint/70 font-mono text-[11px] tracking-widest">{step.number}</span>
        <span className="bg-mint/30 h-px w-8" />
        <span className="text-cream/55 text-[10px] tracking-widest uppercase">{step.detail}</span>
      </div>

      <h3 className="text-cream mb-5 text-[1.9rem] leading-tight font-bold tracking-tight sm:text-[2.2rem]">
        {step.title}
      </h3>

      <p className="text-cream/70 mb-8 max-w-md text-[15px] leading-relaxed">{step.description}</p>

      <div
        className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2"
        style={{
          background: "rgba(137,215,183,0.1)",
          border: "1px solid rgba(137,215,183,0.28)",
        }}
      >
        <Icon icon="solar:clock-circle-bold" width="12" height="12" className="text-mint/75" />
        <span className="text-mint/85 text-[11px] font-medium">{step.tag}</span>
      </div>
    </div>
  );
}

function StepVisual({ step }: { step: Step }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="relative flex h-[200px] w-[200px] items-center justify-center rounded-2xl md:h-[240px] md:w-[240px]"
        style={{
          background: "rgba(11,26,22,0.82)",
          border: "1px solid rgba(137,215,183,0.14)",
          boxShadow:
            "0 1px 2px rgba(0,0,0,0.35), inset 0 1px 0 rgba(137,215,183,0.07), 0 28px 72px rgba(0,0,0,0.45)",
        }}
      >
        <span className="text-mint/45 absolute top-4 left-4 font-mono text-[10px] tracking-widest">
          {step.number}
        </span>
        <Icon icon={step.Icon} width="68" height="68" className="text-mint/85" />
      </div>
    </div>
  );
}
