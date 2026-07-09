"use client";

import { motion } from "framer-motion";
import { CheckCircle, Lightning } from "@phosphor-icons/react";
import { BlueprintCard } from "./blueprint-card";

export function DashboardMockup() {
  return (
    <div
      className="relative mx-auto w-full max-w-[400px]"
      style={{
        paddingTop: "2.8rem",
        paddingBottom: "4rem",
        paddingLeft: "2rem",
        paddingRight: "0.75rem",
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 65% at 50% 60%, rgba(137,215,183,0.2) 0%, rgba(137,215,183,0.06) 52%, transparent 78%)",
          filter: "blur(48px)",
          transform: "scale(1.2) translateY(4%)",
        }}
      />

      {/* Card deck */}
      <div className="relative" style={{ perspective: "1100px" }}>
        {/* Ghost card 3 */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(160deg, #1e3a2f 0%, #162b22 100%)",
            border: "1px solid rgba(137,215,183,0.07)",
            transform: "translateY(14px) translateX(10px) rotate(2.2deg)",
            transformOrigin: "center bottom",
            zIndex: 1,
            opacity: 0.5,
          }}
        />
        {/* Ghost card 2 */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(160deg, #152920 0%, #0f1f18 100%)",
            border: "1px solid rgba(137,215,183,0.1)",
            transform: "translateY(7px) translateX(5px) rotate(1.1deg)",
            transformOrigin: "center bottom",
            zIndex: 2,
            opacity: 0.72,
          }}
        />

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, rotateX: 14, rotateY: -18, y: 16 }}
          animate={{ opacity: 1, rotateX: 4, rotateY: -8, y: 0 }}
          whileHover={{
            rotateX: 1,
            rotateY: -3,
            scale: 1.015,
            transition: { duration: 0.38, ease: "easeOut" },
          }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
          style={{ position: "relative", zIndex: 10, transformStyle: "preserve-3d" }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <BlueprintCard />
          </motion.div>
        </motion.div>
      </div>

      {/* Floating badge: bottom-right */}
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute right-0 -bottom-2 z-30 flex items-center gap-2.5 rounded-xl px-3 py-2.5"
        style={{
          background: "rgba(9,20,16,0.96)",
          border: "1px solid rgba(137,215,183,0.18)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="text-dark flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
          style={{ background: "#89d7b7" }}
        >
          JD
        </div>
        <div>
          <div className="text-cream/88 text-[11px] leading-snug font-semibold tracking-tight">
            Dev match — 94%
          </div>
          <div className="text-cream/36 text-[10px]">React · Node · AWS</div>
        </div>
        <Lightning size={12} weight="fill" className="text-mint shrink-0" />
      </motion.div>

      {/* Floating badge: bottom-left */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-12 left-0 z-30 flex items-center gap-2 rounded-xl px-3 py-2"
        style={{
          background: "rgba(9,20,16,0.96)",
          border: "1px solid rgba(137,215,183,0.18)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
          style={{ background: "rgba(137,215,183,0.15)" }}
        >
          <CheckCircle size={10} weight="bold" className="text-mint" />
        </div>
        <span className="text-cream/78 text-[11px] font-medium tracking-tight whitespace-nowrap">
          Blueprint ready
        </span>
      </motion.div>
    </div>
  );
}
