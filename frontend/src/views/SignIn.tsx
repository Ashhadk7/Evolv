"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeSlash,
  Sparkle,
} from "@phosphor-icons/react";

const BRAND_DARK = "#1a312c";
const BRAND_INK  = "#0f1c18";
const BRAND_MID  = "#428475";
const BRAND_MINT = "#89d7b7";
const BRAND_CREAM = "#fff4e1";

// ─── Shared logo ─────────────────────────────────────────────────────────────

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="inline-flex w-fit items-center gap-2.5">
      <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M2 15 L6 10.5 L10 13 L14 7 L18 3.5" stroke={dark ? BRAND_MINT : BRAND_MID} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="3.5" r="2.1" fill={dark ? BRAND_MINT : BRAND_MID} />
      </svg>
      <span className="text-[20px] font-bold tracking-tight" style={{ color: dark ? BRAND_CREAM : BRAND_INK }}>
        Ev<span style={{ color: dark ? BRAND_MINT : BRAND_MID }}>olv</span>
      </span>
    </Link>
  );
}

// ─── Input field ─────────────────────────────────────────────────────────────

function InputField({
  label, type, value, onChange, placeholder, right,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  right?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.62)" }}>
        {label}
      </span>
      <span className="relative block">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border bg-white px-4 text-[14px] outline-none transition placeholder:text-[#0f1c18]/30 focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/18"
          style={{ borderColor: "rgba(15,28,24,0.11)", color: BRAND_INK }}
        />
        {right}
      </span>
    </label>
  );
}

// ─── Blueprint card (exact copy from Hero) ───────────────────────────────────

function ProgressBar({ value, delay }: { value: number; delay: number }) {
  return (
    <div className="h-[3px] overflow-hidden rounded-full" style={{ background: "rgba(255,244,225,0.08)" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ delay, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="h-full rounded-full"
        style={{ background: "linear-gradient(90deg, #428475, #89d7b7)" }}
      />
    </div>
  );
}

function BlueprintCard() {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(160deg, #0d1c18 0%, #091410 100%)",
        border: "1px solid rgba(137,215,183,0.14)",
        boxShadow:
          "0 0 0 1px rgba(137,215,183,0.07) inset, 0 40px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: "rgba(255,244,225,0.06)", background: "rgba(255,244,225,0.018)" }}>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,95,86,0.5)" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,189,46,0.5)" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(39,201,63,0.5)" }} />
        </div>
        <span className="font-mono text-[10px] tracking-wide" style={{ color: "rgba(255,244,225,0.2)" }}>
          nexus-health.blueprint
        </span>
        <div className="w-14" />
      </div>

      <div className="p-5">
        {/* Header row */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-55" style={{ background: BRAND_MINT }} />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: BRAND_MINT }} />
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "rgba(137,215,183,0.55)" }}>
                Blueprint live
              </span>
            </div>
            <h3 className="text-[15px] font-semibold leading-tight tracking-tight" style={{ color: "rgba(255,244,225,0.95)" }}>
              Nexus Health
            </h3>
            <p className="mt-0.5 text-[11px]" style={{ color: "rgba(255,244,225,0.32)" }}>HealthTech · AI diagnostics</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[2.2rem] font-bold leading-none tabular-nums" style={{ color: BRAND_MINT }}>84</div>
            <div className="mt-0.5 text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,244,225,0.24)" }}>Viability</div>
          </div>
        </div>

        {/* Metrics */}
        <div className="mb-4 space-y-2.5">
          {[
            { label: "Investor interest", value: 92 },
            { label: "Market potential",  value: 88 },
            { label: "Developer demand",  value: 78 },
          ].map((item, i) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-[10px]">
                <span style={{ color: "rgba(255,244,225,0.36)" }}>{item.label}</span>
                <span style={{ color: "rgba(137,215,183,0.7)" }}>{item.value}%</span>
              </div>
              <ProgressBar value={item.value} delay={0.6 + i * 0.1} />
            </div>
          ))}
        </div>

        {/* Tech tags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {["React", "FastAPI", "PostgreSQL", "AWS"].map((tag) => (
            <span
              key={tag}
              className="rounded-md px-2 py-0.5 text-[10px]"
              style={{ background: "rgba(137,215,183,0.07)", border: "1px solid rgba(137,215,183,0.12)", color: "rgba(137,215,183,0.58)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* AI insight */}
        <div className="flex items-start gap-2 rounded-lg px-3 py-2.5" style={{ background: "rgba(137,215,183,0.055)", border: "1px solid rgba(137,215,183,0.1)" }}>
          <Sparkle size={11} weight="fill" className="mt-0.5 shrink-0" style={{ color: BRAND_MINT }} />
          <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,244,225,0.42)" }}>
            Publish now — HealthTech investor demand is up 17% this month.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Left decorative panel ────────────────────────────────────────────────────

function AuthVisual() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden lg:flex lg:w-[50%] flex-col" style={{ background: BRAND_DARK }}>
      {/* Soft ambient glow only — no grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 35% 55%, rgba(137,215,183,0.07) 0%, transparent 65%)," +
            "radial-gradient(ellipse 50% 40% at 78% 25%, rgba(66,132,117,0.05) 0%, transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full"
        style={{ background: "rgba(137,215,183,0.05)", filter: "blur(60px)" }}
      />

      <div className="relative z-10 flex h-full flex-col px-12 xl:px-16">

        {/* Logo — with breathing room from the top */}
        <div style={{ paddingTop: "64px"}}>
          <Logo dark />
        </div>

        {/* Everything else centered in remaining height */}
        <div className="flex flex-1 flex-col justify-center gap-9 py-8">

          {/* Badge + heading + subtitle — each element has its own room */}
          <div className="flex flex-col gap-5">
            <div
              className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: "rgba(137,215,183,0.1)", border: "1px solid rgba(137,215,183,0.16)", color: BRAND_MINT }}
            >
              <Sparkle size={10} weight="fill" />
              AI venture platform
            </div>

            <div>
              <h2
                className="font-bold leading-[1.08] tracking-[-0.02em]"
                style={{ color: BRAND_CREAM, fontSize: "clamp(2.1rem, 2.8vw, 2.75rem)" }}
              >
                Sign in to your<br />
                <span style={{ color: BRAND_MINT }}>venture workspace.</span>
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "rgba(255,244,225,0.46)" }}>
                Blueprints, developer matches, and investor<br />progress — all in one focused place.
              </p>
            </div>
          </div>

          {/* Blueprint card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="w-full"
          >
            <BlueprintCard />
          </motion.div>
        </div>
      </div>
    </aside>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [error, setError]               = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) { setError("Please fill in all fields."); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError("Please enter a valid email address."); return; }

    if (email.toLowerCase() === "sarah@evolv.dev" || email.toLowerCase() === "sarah.mitchell@evolv.dev") {
      localStorage.setItem("evolv_user", JSON.stringify({ firstName: "Sarah", lastName: "Mitchell", email: email.toLowerCase() }));
      router.push("/developer-dashboard");
      return;
    }
    if (email.toLowerCase() === "asad@evolv.dev") {
      localStorage.setItem("evolv_founder_profile", JSON.stringify({ firstName: "Asad", lastName: "", email: email.toLowerCase(), bio: "", domains: [], linkedin: "", dob: "", gender: "", phone: "", education: "", description: "" }));
      router.push("/founder-dashboard");
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem("evolv_users") ?? "[]");
      const user  = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) { setError("Account not found. Please sign up."); return; }
      if (user.password !== password) { setError("Incorrect password."); return; }

      if (user.role === "founder") {
        localStorage.setItem("evolv_founder_profile", JSON.stringify({ firstName: user.firstName, lastName: user.lastName, email: user.email, bio: "", domains: [], linkedin: "", dob: "", gender: "", phone: "", education: "", description: "" }));
        router.push("/founder-dashboard");
      } else {
        localStorage.setItem("evolv_user", JSON.stringify({ firstName: user.firstName, lastName: user.lastName, email: user.email }));
        router.push("/developer-dashboard");
      }
    } catch {
      setError("An error occurred during sign in.");
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <AuthVisual />

      {/* RIGHT: form */}
      <div
        className="flex w-full flex-col lg:w-[50%] overflow-y-auto"
        style={{ background: "#f5f6f4" }}
      >
        {/* Vertically center the form within the panel */}
        <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 xl:px-16">

          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[1.75rem] font-bold tracking-tight" style={{ color: BRAND_INK }}>
              Welcome back
            </h1>
            <p className="mt-1.5 text-[13.5px]" style={{ color: "rgba(15,28,24,0.44)" }}>
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="font-semibold underline underline-offset-2 transition-colors hover:opacity-80" style={{ color: BRAND_MID }}>
                Get started free
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-[12.5px] font-medium text-red-600"
              >
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </motion.div>
            )}

            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
            />

            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="Your password"
              right={
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: "rgba(15,28,24,0.32)" }}
                >
                  {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2.5">
                <div
                  onClick={() => setRememberMe((r) => !r)}
                  className="flex h-4 w-4 cursor-pointer items-center justify-center rounded"
                  style={{
                    background: rememberMe ? BRAND_INK : "transparent",
                    border: rememberMe ? `1px solid ${BRAND_INK}` : "1px solid rgba(15,28,24,0.2)",
                  }}
                >
                  {rememberMe && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke={BRAND_MINT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[12px]" style={{ color: "rgba(15,28,24,0.52)" }}>Keep me signed in</span>
              </label>
              <a href="#" className="text-[12px] font-semibold transition-opacity hover:opacity-70" style={{ color: BRAND_MID }}>
                Forgot password?
              </a>
            </div>

            {/* Sign in */}
            <motion.button
              whileHover={{ scale: 1.012 }}
              whileTap={{ scale: 0.988 }}
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13.5px] font-semibold transition-all"
              style={{ background: BRAND_INK, color: BRAND_MINT, boxShadow: "0 4px 14px rgba(15,28,24,0.18)" }}
            >
              Sign in
              <ArrowRight size={14} weight="bold" />
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: "rgba(15,28,24,0.08)" }} />
              <span className="text-[11px]" style={{ color: "rgba(15,28,24,0.3)" }}>or</span>
              <div className="h-px flex-1" style={{ background: "rgba(15,28,24,0.08)" }} />
            </div>

            {/* Google */}
            <button
              type="button"
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border text-[13px] transition-all hover:bg-white/70"
              style={{ background: "#ffffff", borderColor: "rgba(15,28,24,0.1)", color: "rgba(15,28,24,0.65)" }}
            >
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <p className="pt-1 text-center text-[12.5px]" style={{ color: "rgba(15,28,24,0.4)" }}>
              New to Evolv?{" "}
              <Link href="/sign-up" className="font-semibold transition-opacity hover:opacity-70" style={{ color: BRAND_INK }}>
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
