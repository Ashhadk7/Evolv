"use client";

export function SectionHeader() {
  return (
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
        <span className="text-mint/60 text-[10px] font-semibold tracking-widest uppercase">
          How it works
        </span>
      </div>
      <h2 className="text-cream text-3xl leading-tight font-bold tracking-tight sm:text-4xl md:text-[2.4rem]">
        From idea to funded team <span className="text-mint">in four steps</span>
      </h2>
    </div>
  );
}
