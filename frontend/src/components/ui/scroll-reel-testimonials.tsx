"use client";

import * as React from "react";

/* ----------------------------------------------------------------
 * ScrollReelTestimonials — adapted for Evolv dark-green theme.
 * Original design by 21st.dev; colours, shadows, and gradients
 * reworked to match the mint / cream / #0b1a16 palette.
 * ---------------------------------------------------------------- */

export interface ScrollReelTestimonial {
  quote: string;
  author: string;
  image: string;
  alt?: string;
}

export interface ScrollReelTestimonialsProps {
  testimonials: ScrollReelTestimonial[];
  /** Per-character stagger in ms (default 6) */
  charStaggerMs?: number;
  className?: string;
}

// ─── Geometry ─────────────────────────────────────────────────────────────────
const CELL     = 121.33;
const GAP      = 8;
const STEP     = 3 * (CELL + GAP);   // pitch between portrait centres
const EXIT_MS  = 240;                 // old text exits before new chars rise
const SLIDE_MS = 800;                 // column slide + interaction lock
const EASE     = "cubic-bezier(0.65,0,0.35,1)";

// Shadow that gives the portrait tile depth on a dark background
const FEATURED_SHADOW =
  "0 1.008px 0.705px -0.563px rgba(0,0,0,0.28)," +
  "0 2.389px 1.672px -1.125px rgba(0,0,0,0.26)," +
  "0 4.357px 3.05px  -1.688px rgba(0,0,0,0.25)," +
  "0 7.244px 5.07px  -2.25px  rgba(0,0,0,0.24)," +
  "0 11.698px 8.188px -2.813px rgba(0,0,0,0.22)," +
  "0 19.148px 13.404px -3.375px rgba(0,0,0,0.18)," +
  "0 32.972px 23.08px -3.938px rgba(0,0,0,0.12)," +
  "0 60px 42px -4.5px rgba(0,0,0,0.06)," +
  "inset 0 1px 0 rgba(137,215,183,0.16)," +
  "inset 0 -1px 0 rgba(0,0,0,0.65)";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ─── Blurred placeholder tile ─────────────────────────────────────────────────
function Cell() {
  return (
    <div
      aria-hidden="true"
      className="shrink-0 rounded-xl blur-[1px]"
      style={{
        width: CELL,
        height: CELL,
        background:
          "linear-gradient(to bottom, rgba(26,49,44,0.65), rgba(11,26,22,0.88))",
        border: "1px solid rgba(137,215,183,0.08)",
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.35), inset 0 1px 0 rgba(137,215,183,0.05)",
      }}
    />
  );
}

// ─── Featured portrait tile ────────────────────────────────────────────────────
function Featured({ src, alt }: { src: string; alt?: string }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl"
      style={{
        width: CELL,
        height: CELL,
        background: "rgba(26,49,44,0.8)",
        boxShadow: FEATURED_SHADOW,
        outline: "1px solid rgba(137,215,183,0.12)",
        outlineOffset: "-1px",
      }}
    >
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-[center_25%]"
      />
      {/* Desaturate via saturation blend mode */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] bg-white mix-blend-saturation"
      />
      {/* Diagonal mint sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3] blur-[6px] mix-blend-overlay"
        style={{
          background:
            "linear-gradient(220.99deg, rgba(137,215,183,0) 32%, rgb(137,215,183) 41%, rgb(200,240,224) 47%, rgba(66,132,117,0.55) 54%, rgba(66,132,117,0) 65%)",
        }}
      />
    </div>
  );
}

// ─── Per-character animated text ──────────────────────────────────────────────
function Chars({
  text,
  startIndex,
  staggerMs,
}: {
  text: string;
  startIndex: number;
  staggerMs: number;
}) {
  let idx = startIndex;
  const words = text.split(" ");
  return (
    <>
      {words.map((word, wi) => {
        const wordSpan = (
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, ci) => {
              const delay = idx * staggerMs;
              idx++;
              return (
                <span
                  key={ci}
                  className="scroll-reel-char"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
        if (wi < words.length - 1) idx++;
        return (
          <React.Fragment key={wi}>
            {wordSpan}
            {wi < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function ScrollReelTestimonials({
  testimonials,
  charStaggerMs = 6,
  className,
}: ScrollReelTestimonialsProps) {
  const [index, setIndex]               = React.useState(0);
  const [displayIndex, setDisplayIndex] = React.useState(0);
  const [exiting, setExiting]           = React.useState(false);
  const [mounted, setMounted]           = React.useState(false);
  const animating = React.useRef(false);
  const timeouts  = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const count = testimonials.length;

  React.useEffect(() => {
    // Delay enabling column transitions so the initial position doesn't slide in
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setMounted(true))
    );
    return () => {
      cancelAnimationFrame(raf);
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  const paginate = React.useCallback(
    (dir: 1 | -1) => {
      if (animating.current) return;
      const next = index + dir;
      if (next < 0 || next >= count) return;
      animating.current = true;
      setIndex(next);
      setExiting(true);
      timeouts.current.push(
        setTimeout(() => {
          setDisplayIndex(next);
          setExiting(false);
        }, EXIT_MS)
      );
      timeouts.current.push(
        setTimeout(() => { animating.current = false; }, SLIDE_MS)
      );
    },
    [index, count]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); paginate(1);  }
    if (e.key === "ArrowLeft")  { e.preventDefault(); paginate(-1); }
  };

  // Middle column: 3 leading blanks → portrait + 2 blanks between each → 3 trailing blanks
  const middleItems = React.useMemo(() => {
    const items: Array<{ type: "cell" } | { type: "featured"; i: number }> = [];
    for (let i = 0; i < 3; i++) items.push({ type: "cell" });
    testimonials.forEach((_, i) => {
      items.push({ type: "featured", i });
      if (i < count - 1) {
        items.push({ type: "cell" }, { type: "cell" });
      }
    });
    for (let i = 0; i < 3; i++) items.push({ type: "cell" });
    return items;
  }, [testimonials, count]);

  const sideCellCount = 4 + 2 * count;
  const centerIdx     = (count - 1) / 2;
  const middleY       = (centerIdx - index) * STEP;
  const sideY         = -middleY;

  const colStyle = (y: number): React.CSSProperties => ({
    transform:  `translateY(${y}px)`,
    transition: mounted ? `transform ${SLIDE_MS}ms ${EASE}` : "none",
  });

  const current = testimonials[displayIndex];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimonials"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "relative flex w-full max-w-[1060px] flex-col items-stretch gap-2.5 overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#89d7b7] md:min-h-[340px] md:flex-row",
        className
      )}
      style={{
        background: "rgba(11,26,22,0.82)",
        border:     "1px solid rgba(137,215,183,0.14)",
        boxShadow:  "inset 0 1px 0 rgba(137,215,183,0.07), 0 8px 40px rgba(0,0,0,0.28)",
      }}
    >
      {/* ── Scroll reel ──────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="relative h-56 w-full shrink-0 self-stretch overflow-hidden md:h-auto md:w-[380px]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          {/* Left (counter-rotates) */}
          <div className="flex shrink-0 flex-col gap-2 will-change-transform" style={colStyle(sideY)}>
            {Array.from({ length: sideCellCount }).map((_, i) => <Cell key={i} />)}
          </div>

          {/* Middle — portraits */}
          <div className="flex shrink-0 flex-col gap-2 will-change-transform" style={colStyle(middleY)}>
            {middleItems.map((item, i) =>
              item.type === "featured" ? (
                <Featured key={i} src={testimonials[item.i].image} alt={testimonials[item.i].alt} />
              ) : (
                <Cell key={i} />
              )
            )}
          </div>

          {/* Right (counter-rotates) */}
          <div className="flex shrink-0 flex-col gap-2 will-change-transform" style={colStyle(sideY)}>
            {Array.from({ length: sideCellCount }).map((_, i) => <Cell key={i} />)}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch px-6 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-3">
          {/* Mint quote icon */}
          <svg
            className="block h-11 w-11"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            style={{ color: "rgba(137,215,183,0.45)" }}
          >
            <path d="M4.58 17.32C3.55 16.23 3 15 3 13.01c0-3.5 2.46-6.64 6.03-8.19l.9 1.38c-3.34 1.8-4 4.15-4.25 5.62.54-.28 1.24-.38 1.93-.31 1.8.17 3.23 1.65 3.23 3.49a3.5 3.5 0 0 1-3.5 3.5c-1.07 0-2.1-.49-2.75-1.18zm10 0C13.55 16.23 13 15 13 13.01c0-3.5 2.46-6.64 6.03-8.19l.9 1.38c-3.34 1.8-4 4.15-4.25 5.62.54-.28 1.24-.38 1.93-.31 1.8.17 3.23 1.65 3.23 3.49a3.5 3.5 0 0 1-3.5 3.5c-1.07 0-2.1-.49-2.75-1.18z" />
          </svg>

          {/* Text stage: an invisible copy reserves the correct height so the
              absolute-positioned animated text never clips */}
          <div className="relative w-full max-w-[420px] overflow-hidden" aria-live="polite">
            <div aria-hidden="true" className="invisible flex min-h-[130px] flex-col gap-5">
              <p className="m-0 text-lg font-medium leading-[1.35] tracking-[-0.02em] sm:text-[21px]"
                 style={{ color: "#fff4e1" }}>
                {current.quote}
              </p>
              <p className="m-0 text-sm font-medium leading-[1.3]"
                 style={{ color: "rgba(255,244,225,0.48)" }}>
                {current.author}
              </p>
            </div>

            <div
              key={displayIndex}
              className={cn(
                "absolute inset-x-0 top-0 flex flex-col gap-5 will-change-[transform,opacity]",
                exiting && "scroll-reel-exit"
              )}
            >
              <p className="m-0 text-lg font-medium leading-[1.35] tracking-[-0.02em] sm:text-[21px]"
                 style={{ color: "#fff4e1" }}>
                <Chars text={current.quote} startIndex={0} staggerMs={charStaggerMs} />
              </p>
              <p className="m-0 text-sm font-medium leading-[1.3]"
                 style={{ color: "rgba(255,244,225,0.48)" }}>
                <Chars
                  text={current.author}
                  startIndex={current.quote.length + 6}
                  staggerMs={charStaggerMs}
                />
              </p>
            </div>
          </div>
        </div>

        {/* ── Prev / Next ──────────────────────────────────────── */}
        <div className="mt-6 flex items-center gap-2 md:mt-0">
          <button
            type="button"
            onClick={() => paginate(-1)}
            disabled={index === 0}
            aria-label="Previous testimonial"
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-full p-0 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:enabled:scale-[1.08] active:enabled:scale-[0.94] disabled:cursor-default disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89d7b7]"
            style={{
              background: "rgba(137,215,183,0.08)",
              border:     "1px solid rgba(137,215,183,0.28)",
              color:      "rgba(137,215,183,0.75)",
            }}
          >
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor"
                 strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.5 2.5 3.5 6l4 3.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => paginate(1)}
            disabled={index === count - 1}
            aria-label="Next testimonial"
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-full p-0 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:enabled:scale-[1.08] active:enabled:scale-[0.94] disabled:cursor-default disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89d7b7]"
            style={{
              background: "rgba(137,215,183,0.08)",
              border:     "1px solid rgba(137,215,183,0.28)",
              color:      "rgba(137,215,183,0.75)",
            }}
          >
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor"
                 strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m4.5 2.5 4 3.5-4 3.5" />
            </svg>
          </button>

          {/* Step dots */}
          <div className="ml-1 flex items-center gap-1.5">
            {testimonials.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width:      i === index ? "16px" : "5px",
                  height:     "5px",
                  background: i === index
                    ? "rgba(137,215,183,0.75)"
                    : "rgba(137,215,183,0.25)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScrollReelTestimonials;
