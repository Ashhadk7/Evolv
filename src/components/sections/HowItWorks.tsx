"use client";

import { motion, type MotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowsOut, Clock, Handshake, Robot, Scroll } from "@phosphor-icons/react";
import { useRef, useEffect } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    Icon: Scroll,
    title: "Submit your idea",
    description:
      "Type the concept, target customer, problem, and early vision. Evolv turns messy notes into a structured intake — no business-plan formatting required.",
    tag: "~2 minutes",
    detail: "Idea intake",
  },
  {
    number: "02",
    Icon: Robot,
    title: "AI forges the blueprint",
    description:
      "Specialized agents validate viability, map competitors, plan MVP features, design the architecture, estimate cost, and project the first financial model.",
    tag: "30–60 seconds",
    detail: "Agent pipeline",
  },
  {
    number: "03",
    Icon: ArrowsOut,
    title: "Matches surface instantly",
    description:
      "Developers are ranked by stack fit while high-scoring blueprints are routed into investor feeds based on domain, stage, and viability thresholds.",
    tag: "Automatic",
    detail: "Vector matching",
  },
  {
    number: "04",
    Icon: Handshake,
    title: "Connect and build",
    description:
      "Message developers, share investor-ready context, and keep the blueprint as the source of truth as the venture moves from concept to execution.",
    tag: "All in one place",
    detail: "Shared workspace",
  },
];

// How large the fade window is (fraction of total scroll progress).
// A step fades OUT over [segEnd-TRANS, segEnd+EPS] and the next fades IN
// over [segEnd-EPS, segEnd+TRANS] — giving a hair of overlap so the
// screen never goes fully dark at the boundary.
const TRANS = 0.07;
const EPS   = 0.015;

// ─── Animated canvas background ───────────────────────────────────────────────

function LiveBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let t = 0;

    const lights = [
      { bx: 0.18, by: 0.12, ax: 0.09, ay: 0.07, r: 0.55, R: 137, G: 215, B: 183, A: 0.13, s: 0.00028 },
      { bx: 0.82, by: 0.82, ax: 0.07, ay: 0.08, r: 0.60, R: 66,  G: 132, B: 117, A: 0.17, s: 0.00022 },
      { bx: 0.50, by: 0.50, ax: 0.06, ay: 0.06, r: 0.45, R: 137, G: 215, B: 183, A: 0.08, s: 0.00038 },
      { bx: 0.80, by: 0.18, ax: 0.05, ay: 0.08, r: 0.40, R: 66,  G: 132, B: 117, A: 0.11, s: 0.00032 },
      { bx: 0.12, by: 0.78, ax: 0.08, ay: 0.06, r: 0.48, R: 137, G: 215, B: 183, A: 0.09, s: 0.00025 },
    ];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      t++;
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const minDim = Math.min(w, h);

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0b1a16";
      ctx.fillRect(0, 0, w, h);

      for (const l of lights) {
        const cx = (l.bx + Math.sin(t * l.s + l.bx * 6) * l.ax) * w;
        const cy = (l.by + Math.cos(t * l.s * 0.77 + l.by * 5) * l.ay) * h;
        const r  = l.r * minDim * 0.85;

        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grd.addColorStop(0,   `rgba(${l.R},${l.G},${l.B},${l.A})`);
        grd.addColorStop(0.5, `rgba(${l.R},${l.G},${l.B},${l.A * 0.45})`);
        grd.addColorStop(1,   `rgba(${l.R},${l.G},${l.B},0)`);

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      style={{ display: "block" }}
    />
  );
}

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
    [index === 0 ? 1 : 0.2, 1],
  );
  const scale = useTransform(
    lineHNum,
    [Math.max(0, nodePos - WIN), Math.min(100, nodePos + WIN)],
    [index === 0 ? 1 : 0.65, 1],
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

function CenterLine({ progress }: { progress: MotionValue<number> }) {
  const n   = steps.length;
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
  const inputPts: number[]  = [0];
  const outputPts: number[] = [0];

  for (let i = 1; i < n; i++) {
    inputPts.push(i * seg - TRANS);           // active-end of step i-1
    outputPts.push(((i - 1) / (n - 1)) * 100);

    inputPts.push(i * seg + TRANS);           // active-start of step i
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
      className="pointer-events-none absolute left-1/2 top-0 bottom-0 hidden -translate-x-px md:block"
      style={{ width: "1px" }}
    >
      {/* Static track */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(137,215,183,0.09)" }}
      />

      {/* Animated fill — grows as lineH increases */}
      <motion.div
        className="absolute left-0 top-0 w-full"
        style={{
          height: lineH,
          background:
            "linear-gradient(to bottom, rgba(137,215,183,0.65), rgba(137,215,183,0.22))",
        }}
      />

      {/* Glowing dot that travels with the fill head */}
      <motion.div
        className="absolute left-1/2 z-20"
        style={{ top: lineH, x: "-50%", y: "-50%" }}
      >
        <div
          className="h-3.5 w-3.5 rounded-full"
          style={{
            background: "#89d7b7",
            boxShadow:
              "0 0 0 3px rgba(137,215,183,0.2), 0 0 20px rgba(137,215,183,0.85)",
          }}
        />
      </motion.div>

      {/* Step marker nodes driven by lineHNum, not raw progress */}
      {steps.map((_, i) => (
        <StepLineNode
          key={i}
          index={i}
          totalSteps={n}
          lineHNum={lineHNum}
        />
      ))}
    </div>
  );
}

// ─── Individual step slide ─────────────────────────────────────────────────────
// Sequential transition: step A exits (opacity→0, y→-70px) BEFORE step B
// enters (y from +70px→0). EPS gives a tiny overlap at the boundary so the
// screen never goes fully blank between steps.

function StepSlide({
  step,
  index,
  totalSteps,
  progress,
}: {
  step: (typeof steps)[number];
  index: number;
  totalSteps: number;
  progress: MotionValue<number>;
}) {
  const seg      = 1 / totalSteps;
  const segStart = index * seg;
  const segEnd   = (index + 1) * seg;
  const isFirst  = index === 0;
  const isLast   = index === totalSteps - 1;

  const pts: number[] = isFirst
    ? [0,              segEnd - TRANS, segEnd + EPS]
    : isLast
    ? [segStart - EPS, segStart + TRANS, 1]
    : [segStart - EPS, segStart + TRANS, segEnd - TRANS, segEnd + EPS];

  const opVals: number[] = isFirst
    ? [1, 1, 0]
    : isLast
    ? [0, 1, 1]
    : [0, 1, 1, 0];

  // Large Y offset (80px) so exiting/entering slides are spatially separated
  // even during the brief EPS overlap — preventing visible text collisions.
  const yVals: string[] = isFirst
    ? ["0px",  "0px",  "-80px"]
    : isLast
    ? ["80px", "0px",  "0px"]
    : ["80px", "0px",  "0px", "-80px"];

  const opacity = useTransform(progress, pts, opVals);
  const y       = useTransform(progress, pts, yVals);

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
            <StepVisual  step={step} />
          </>
        ) : (
          <>
            {/* On mobile content reads first; on desktop visual is col 1 */}
            <div className="order-2 md:order-1"><StepVisual  step={step} /></div>
            <div className="order-1 md:order-2"><StepContent step={step} /></div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function StepContent({ step }: { step: (typeof steps)[number] }) {
  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-[11px] tracking-widest text-mint/35">
          {step.number}
        </span>
        <span className="h-px w-8 bg-mint/15" />
        <span className="text-[10px] uppercase tracking-widest text-cream/25">
          {step.detail}
        </span>
      </div>

      <h3 className="mb-5 text-[1.9rem] font-bold leading-tight tracking-tight text-cream sm:text-[2.2rem]">
        {step.title}
      </h3>

      <p className="mb-8 max-w-md text-[15px] leading-relaxed text-cream/45">
        {step.description}
      </p>

      <div
        className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2"
        style={{
          background: "rgba(137,215,183,0.07)",
          border: "1px solid rgba(137,215,183,0.16)",
        }}
      >
        <Clock size={11} weight="bold" className="text-mint/50" />
        <span className="text-[11px] font-medium text-mint/60">{step.tag}</span>
      </div>
    </div>
  );
}

function StepVisual({ step }: { step: (typeof steps)[number] }) {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div
          className="absolute -inset-16 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(137,215,183,0.18) 0%, transparent 60%)",
            filter: "blur(32px)",
          }}
        />
        <div
          className="relative flex h-[200px] w-[200px] items-center justify-center rounded-2xl md:h-[240px] md:w-[240px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(137,215,183,0.11) 0%, rgba(137,215,183,0.025) 100%)",
            border: "1px solid rgba(137,215,183,0.2)",
            boxShadow:
              "0 0 0 1px rgba(137,215,183,0.06) inset, 0 28px 72px rgba(0,0,0,0.32)",
          }}
        >
          <span className="absolute left-4 top-4 font-mono text-[10px] tracking-widest text-mint/20">
            {step.number}
          </span>
          <step.Icon size={68} weight="bold" className="text-mint/62" />
        </div>
      </div>
    </div>
  );
}

// ─── Bottom progress dots ──────────────────────────────────────────────────────

function ProgressDot({
  index,
  totalSteps,
  progress,
}: {
  index: number;
  totalSteps: number;
  progress: MotionValue<number>;
}) {
  const seg      = 1 / totalSteps;
  const segStart = index * seg;
  const segEnd   = (index + 1) * seg;
  const isFirst  = index === 0;
  const isLast   = index === totalSteps - 1;

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

  const opVals: number[] = isFirst
    ? [1, 1, 0.3]
    : isLast
    ? [0.3, 1, 1]
    : [0.3, 1, 1, 0.3];

  const scale   = useTransform(progress, pts, scaleVals);
  const opacity = useTransform(progress, pts, opVals);

  return (
    <motion.div
      style={{ scale, opacity }}
      className="h-1.5 w-1.5 rounded-full bg-mint"
    />
  );
}

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
          background: "#0b1a16",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <LiveBackground />

        {/* Top border */}
        <div
          className="absolute left-0 right-0 top-0 z-10 h-px"
          style={{ background: "rgba(137,215,183,0.1)" }}
        />

        {/* ── Section heading — always visible ─────────────────────── */}
        <div
          className="relative z-10 mx-auto w-full max-w-7xl shrink-0 px-4 sm:px-6 md:px-12"
          style={{ paddingTop: "5.5rem", paddingBottom: "1.5rem" }}
        >
          <div
            className="mb-3 inline-flex items-center rounded-full px-3 py-1"
            style={{
              background: "rgba(137,215,183,0.07)",
              border: "1px solid rgba(137,215,183,0.14)",
            }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-mint/60">
              How it works
            </span>
          </div>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-cream sm:text-4xl md:text-[2.4rem]">
            From idea to funded team{" "}
            <span className="text-mint">in four steps</span>
          </h2>
        </div>

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
            <ProgressDot
              key={i}
              index={i}
              totalSteps={steps.length}
              progress={smooth}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
