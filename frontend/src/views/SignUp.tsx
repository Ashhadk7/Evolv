"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeSlash, RocketLaunch, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";

const ROLE_OPTIONS = [
  { value: "founder",   label: "Founder",   desc: "I have an idea" },
  { value: "developer", label: "Developer", desc: "I build products" },
  { value: "investor",  label: "Investor",  desc: "I fund ventures" },
] as const;

const STEPS = [
  "Analysing market size...",
  "Mapping competitors...",
  "Generating MVP scope...",
  "Scoring viability...",
  "Blueprint ready ✦",
];

function BlueprintAnimation() {
  const [step, setStep] = useState(0);

  useState(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1800);
    return () => clearInterval(id);
  });

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(137,215,183,0.07) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative z-10 w-full max-w-[320px] overflow-hidden rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className="flex items-center gap-1.5 border-b px-4 py-3"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <span className="h-2 w-2 rounded-full bg-[#ff5f56]/45" />
          <span className="h-2 w-2 rounded-full bg-[#ffbd2e]/45" />
          <span className="h-2 w-2 rounded-full bg-[#27c93f]/45" />
          <span className="ml-auto font-mono text-[10px] text-white/18">my-startup.blueprint</span>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#89d7b7] opacity-55" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#89d7b7]" />
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-[#89d7b7]/55">Generating</span>
              </div>
              <div className="text-[15px] font-semibold text-white/80">Your Idea</div>
              <div className="text-[11px] text-white/28">AI · Blueprint</div>
            </div>
            <div className="text-right">
              <div className="text-[2rem] font-bold tabular-nums text-[#89d7b7]/60">—</div>
              <div className="text-[9px] uppercase tracking-wider text-white/18">Viability</div>
            </div>
          </div>

          <div className="mb-4 space-y-2.5">
            {[
              { label: "Market fit",    val: 78 },
              { label: "Investor pull", val: 65 },
              { label: "Dev demand",    val: 82 },
            ].map((item, i) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-[10px]">
                  <span className="text-white/28">{item.label}</span>
                  <span className="text-[#89d7b7]/55">{item.val}%</span>
                </div>
                <div className="h-[3px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.val}%` }}
                    transition={{ delay: 0.4 + i * 0.15, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #428475, #89d7b7)" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ background: "rgba(137,215,183,0.05)", border: "1px solid rgba(137,215,183,0.09)" }}
          >
            <Sparkle size={10} weight="fill" className="shrink-0 text-[#89d7b7]" />
            <AnimatePresence mode="wait">
              <motion.span
                key={step}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.28 }}
                className="text-[10px] text-white/38"
              >
                {STEPS[step]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="relative z-10 mt-6 text-center text-[12px] leading-relaxed text-white/22"
      >
        From raw idea to investor-ready blueprint
        <br />
        <span className="text-[#89d7b7]/40">in under 60 seconds.</span>
      </motion.p>
    </div>
  );
}

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [role, setRole] = useState<"founder" | "developer" | "investor" | "">("");

  return (
    <div className="flex min-h-screen w-full" style={{ background: "#0f1c18" }}>

      {/* LEFT: form */}
      <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-[54%] lg:px-14 xl:px-20">

        <Link href="/" className="mb-8 flex items-center gap-2 w-fit">
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <path d="M2 15 L6 10.5 L10 13 L14 7 L18 3.5" stroke="#89d7b7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="18" cy="3.5" r="2.1" fill="#89d7b7" />
          </svg>
          <span className="text-[19px] font-bold tracking-tight text-white/85">
            Ev<span className="text-[#89d7b7]">olv</span>
          </span>
        </Link>

        <div className="mb-6">
          <h1 className="mb-1 text-[1.6rem] font-bold tracking-tight text-white/88">Create your account</h1>
          <p className="text-[13px] text-white/32">
            Already have one?{" "}
            <Link href="/sign-in" className="text-[#89d7b7]/65 hover:text-[#89d7b7] transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-3">

          <div className="grid grid-cols-2 gap-3">
            {(["First name", "Last name"] as const).map((label) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="text-[11px] text-white/30">{label}</label>
                <input
                  type="text"
                  placeholder={label === "First name" ? "Sara" : "Ahmed"}
                  className="rounded-lg px-3.5 py-2.5 text-[13px] text-white/70 placeholder-white/15 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(137,215,183,0.28)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-white/30">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="rounded-lg px-3.5 py-2.5 text-[13px] text-white/70 placeholder-white/15 outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(137,215,183,0.28)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-white/30">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                className="w-full rounded-lg px-3.5 py-2.5 pr-10 text-[13px] text-white/70 placeholder-white/15 outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(137,215,183,0.28)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/45 transition-colors"
              >
                {showPassword ? <EyeSlash size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-white/30">I am joining as</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className="rounded-lg px-3 py-2.5 text-left transition-all"
                  style={{
                    background: role === r.value ? "rgba(137,215,183,0.09)" : "rgba(255,255,255,0.03)",
                    border: role === r.value ? "1px solid rgba(137,215,183,0.25)" : "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="text-[12px] font-medium" style={{ color: role === r.value ? "#89d7b7" : "rgba(255,255,255,0.45)" }}>
                    {r.label}
                  </div>
                  <div className="mt-0.5 text-[10px] text-white/20">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5">
            <div
              onClick={() => setAgreed((a) => !a)}
              className="mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded"
              style={{
                background: agreed ? "#89d7b7" : "transparent",
                border: agreed ? "1px solid #89d7b7" : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {agreed && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="#0f1c18" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-[12px] text-white/28">
              I agree to the{" "}
              <a href="#" className="text-[#89d7b7]/55 underline underline-offset-2 hover:text-[#89d7b7]">Terms</a>
              {" "}and{" "}
              <a href="#" className="text-[#89d7b7]/55 underline underline-offset-2 hover:text-[#89d7b7]">Privacy Policy</a>
            </span>
          </label>

          <motion.button
            whileHover={{ scale: 1.012 }}
            whileTap={{ scale: 0.988 }}
            type="button"
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold"
            style={{ background: "#89d7b7", color: "#0f1c18", boxShadow: "0 0 20px rgba(137,215,183,0.15)" }}
          >
            <RocketLaunch size={13} weight="bold" />
            Create account
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
            <span className="text-[11px] text-white/18">or</span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2.5 rounded-lg py-2.5 text-[13px] text-white/35 transition-all hover:text-white/55"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      {/* RIGHT: animation panel — fixed alignment */}
      <div
        className="relative hidden lg:flex lg:w-[46%]"
        style={{
          background: "linear-gradient(150deg, #0a1410 0%, #060e0b 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <BlueprintAnimation />
      </div>
    </div>
  );
}