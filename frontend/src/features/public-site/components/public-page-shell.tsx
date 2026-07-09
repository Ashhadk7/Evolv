"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/features/public-site/components/navbar";
import { Footer } from "@/features/public-site/components/cta-and-footer";

export const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

export function PageGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(137,215,183,0.16) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(137,215,183,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(137,215,183,0.055) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          maskImage: "linear-gradient(to bottom, black, transparent 72%)",
        }}
      />
      <div
        className="absolute right-0 bottom-0 left-0 h-72"
        style={{ background: "linear-gradient(to bottom, transparent, #1a312c)" }}
      />
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div
      className="mb-5 inline-flex items-center rounded-full px-3 py-1"
      style={{
        background: "rgba(137,215,183,0.09)",
        border: "1px solid rgba(137,215,183,0.16)",
      }}
    >
      <span className="text-mint text-[10px] font-bold tracking-widest uppercase">{children}</span>
    </div>
  );
}

export function PublicPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="bg-dark text-cream min-h-screen overflow-hidden">
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}
