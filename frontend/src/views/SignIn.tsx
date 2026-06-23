"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeSlash, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);

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

        <div className="mb-7">
          <h1 className="mb-1 text-[1.6rem] font-bold tracking-tight text-white/88">Welcome back</h1>
          <p className="text-[13px] text-white/32">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-[#89d7b7]/65 hover:text-[#89d7b7] transition-colors">
              Get started free
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-3.5">

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
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-white/30">Password</label>
              <a href="#" className="text-[11px] text-[#89d7b7]/45 hover:text-[#89d7b7]/70 transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
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

          <motion.button
            whileHover={{ scale: 1.012 }}
            whileTap={{ scale: 0.988 }}
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold"
            style={{ background: "#89d7b7", color: "#0f1c18", boxShadow: "0 0 20px rgba(137,215,183,0.15)" }}
          >
            Sign in
            <ArrowRight size={13} weight="bold" />
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

        {/* Feature chips at bottom */}
        <div className="mt-10 flex flex-wrap gap-2">
          {["Market analysis", "Viability score", "Dev matching", "Investor feed"].map((chip) => (
            <span
              key={chip}
              className="rounded-full px-3 py-1 text-[11px] text-white/25"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* RIGHT: subtle visual panel */}
      <div
        className="relative hidden lg:flex lg:w-[46%] flex-col items-center justify-center px-12"
        style={{
          background: "linear-gradient(150deg, #0a1410 0%, #060e0b 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 50% 45%, rgba(137,215,183,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-[300px]">
          <div
            className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl text-xl font-bold text-[#89d7b7]"
            style={{ background: "rgba(137,215,183,0.07)", border: "1px solid rgba(137,215,183,0.12)" }}
          >
            "
          </div>

          <blockquote className="mb-6 text-[1.05rem] font-medium leading-relaxed text-white/50">
            "The viability scoring saves hours of first-pass diligence. I can filter by domain and move directly into founder conversations."
          </blockquote>

          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ background: "#89d7b7", color: "#0f1c18" }}
            >
              SR
            </div>
            <div>
              <div className="text-[12px] font-semibold text-white/60">Sofia Reyes</div>
              <div className="text-[11px] text-white/25">Angel Investor</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}