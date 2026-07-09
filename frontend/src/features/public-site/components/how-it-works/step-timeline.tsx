"use client";

import { motion, type MotionValue, useTransform } from "framer-motion";
import { steps, TRANS, EPS } from "./how-it-works-data";

// ─── Vertical center progress line ────────────────────────────────────────────

// StepLineNode receives the derived lineHNum (0–100) so its opacity/scale
// are driven by the fill position, not raw scroll progress.
function StepLineNode({
  index,
  totalSteps,
  lineHNum,
}: {
  index: number;
  totalSteps: number;
  lineHNum: MotionValue<number>;
}) {
  // Nodes are evenly spaced: 0%, 33%, 67%, 100% for 4 steps
  const nodePos = (index / Math.max(totalSteps - 1, 1)) * 100;
  const WIN = 4; // ±4 units around the node position for the bright transition

  // First node is already bright on load; others light up as the fill arrives
  const opacity = useTransform(
    lineHNum,
    [Math.max(0, nodePos - WIN), Math.min(100, nodePos + WIN)],
    [index === 0 ? 1 : 0.2, 1]
  );
  const scale = useTransform(
    lineHNum,
    [Math.max(0, nodePos - WIN), Math.min(100, nodePos + WIN)],
    [index === 0 ? 1 : 0.65, 1]
  );

  return (
    <motion.div
      style={{ top: `${nodePos}%`, opacity, scale }}
      className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
    >
      <div
        className="h-3 w-3 rounded-full"
        style={{
          background: "#89d7b7",
          boxShadow: "0 0 0 4px rgba(137,215,183,0.18), 0 0 10px rgba(137,215,183,0.5)",
        }}
      />
    </motion.div>
  );
}

export function CenterLine({ progress }: { progress: MotionValue<number> }) {
  const n = steps.length;
  const seg = 1 / n;

  // Build a non-linear mapping so the fill PARKS at each node while a step is
  // fully active and MOVES between nodes only during the TRANS transition window.
  //
  // For 4 steps with TRANS=0.07 and seg=0.25 the breakpoints are:
  //   progress [0,    0.18]:  fill stays at   0%  (node 0 — step 1 active)
  //   progress [0.18, 0.32]:  fill moves  0%→33%  (transition 1→2)
  //   progress [0.32, 0.43]:  fill stays at  33%  (node 1 — step 2 active)
  //   progress [0.43, 0.57]:  fill moves 33%→67%  (transition 2→3)
  //   progress [0.57, 0.68]:  fill stays at  67%  (node 2 — step 3 active)
  //   progress [0.68, 0.82]:  fill moves 67%→100% (transition 3→4)
  //   progress [0.82, 1.0]:   fill stays at 100%  (node 3 — step 4 active)
  const inputPts: number[] = [0];
  const outputPts: number[] = [0];

  for (let i = 1; i < n; i++) {
    inputPts.push(i * seg - TRANS); // active-end of step i-1
    outputPts.push(((i - 1) / (n - 1)) * 100);

    inputPts.push(i * seg + TRANS); // active-start of step i
    outputPts.push((i / (n - 1)) * 100);
  }

  inputPts.push(1);
  outputPts.push(100);

  // lineHNum: 0–100, pauses during active phases, moves during transitions
  const lineHNum = useTransform(progress, inputPts, outputPts);
  // Convert to a CSS percentage string for height / top
  const lineH = useTransform(lineHNum, (v: number) => `${v}%`);

  return (
    <div
      className="pointer-events-none absolute top-0 bottom-0 left-1/2 hidden -translate-x-px md:block"
      style={{ width: "1px" }}
    >
      {/* Static track */}
      <div className="absolute inset-0" style={{ background: "rgba(137,215,183,0.09)" }} />

      {/* Animated fill — grows as lineH increases */}
      <motion.div
        className="absolute top-0 left-0 w-full"
        style={{
          height: lineH,
          background: "linear-gradient(to bottom, rgba(137,215,183,0.65), rgba(137,215,183,0.22))",
        }}
      />

      {/* Glowing dot that travels with the fill head */}
      <motion.div className="absolute left-1/2 z-20" style={{ top: lineH, x: "-50%", y: "-50%" }}>
        <div
          className="h-3.5 w-3.5 rounded-full"
          style={{
            background: "#89d7b7",
            boxShadow: "0 0 0 3px rgba(137,215,183,0.2), 0 0 20px rgba(137,215,183,0.85)",
          }}
        />
      </motion.div>

      {/* Step marker nodes driven by lineHNum, not raw progress */}
      {steps.map((_, i) => (
        <StepLineNode key={i} index={i} totalSteps={n} lineHNum={lineHNum} />
      ))}
    </div>
  );
}

// ─── Bottom progress dots ──────────────────────────────────────────────────────

export function ProgressDot({
  index,
  totalSteps,
  progress,
}: {
  index: number;
  totalSteps: number;
  progress: MotionValue<number>;
}) {
  const seg = 1 / totalSteps;
  const segStart = index * seg;
  const segEnd = (index + 1) * seg;
  const isFirst = index === 0;
  const isLast = index === totalSteps - 1;

  // Dots can cross-fade — they're small enough that simultaneous partial
  // visibility at the boundary isn't a problem.
  const pts: number[] = isFirst
    ? [0, segEnd - TRANS, segEnd + EPS]
    : isLast
      ? [segStart - EPS, segStart + TRANS, 1]
      : [segStart - EPS, segStart + TRANS, segEnd - TRANS, segEnd + EPS];

  const scaleVals: number[] = isFirst
    ? [1.4, 1.4, 0.8]
    : isLast
      ? [0.8, 1.4, 1.4]
      : [0.8, 1.4, 1.4, 0.8];

  const opVals: number[] = isFirst ? [1, 1, 0.3] : isLast ? [0.3, 1, 1] : [0.3, 1, 1, 0.3];

  const scale = useTransform(progress, pts, scaleVals);
  const opacity = useTransform(progress, pts, opVals);

  return <motion.div style={{ scale, opacity }} className="bg-mint h-1.5 w-1.5 rounded-full" />;
}
