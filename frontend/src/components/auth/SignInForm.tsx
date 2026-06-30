"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { InputField } from "./InputField";

const BRAND_INK  = "#0f1c18";
const BRAND_MID  = "#428475";
const BRAND_MINT = "#89d7b7";

interface StoredUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "founder" | "developer";
  profile?: Record<string, unknown>;
}

export function SignInForm() {
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
      localStorage.setItem("evolv_user", JSON.stringify({ firstName: "Sarah", lastName: "Mitchell", email: email.toLowerCase(), profileComplete: false, firstTime: false }));
      router.push("/developer-dashboard");
      return;
    }
    if (email.toLowerCase() === "asad@evolv.dev") {
      localStorage.setItem("evolv_founder_profile", JSON.stringify({ firstName: "Asad", lastName: "", email: email.toLowerCase(), bio: "", domains: [], linkedin: "", dob: "", gender: "", phone: "", education: "", description: "" }));
      router.push("/founder-dashboard");
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem("evolv_users") ?? "[]") as StoredUser[];
      const user  = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) { setError("Account not found. Please sign up."); return; }
      if (user.password !== password) { setError("Incorrect password."); return; }

      if (user.role === "founder") {
        localStorage.setItem("evolv_founder_profile", JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          bio: "",
          domains: [],
          linkedin: "",
          dob: "",
          gender: "",
          phone: "",
          education: "",
          description: "",
          ...(user.profile ?? {}),
        }));
        router.push("/founder-dashboard");
      } else {
        localStorage.setItem("evolv_user", JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          ...(user.profile ?? {}),
        }));
        router.push("/developer-dashboard");
      }
    } catch {
      setError("An error occurred during sign in.");
    }
  };

  return (
    <div
      className="flex w-full flex-col lg:w-[50%] overflow-y-auto"
      style={{ background: "#f5f6f4" }}
    >
      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 xl:px-16">
        <Link
          href="/"
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-bold transition hover:bg-black/5"
          style={{ color: "rgba(15,28,24,0.6)" }}
        >
          <ArrowLeft size={14} weight="bold" />
          Back home
        </Link>

        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

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

          <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />

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

          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "rgba(15,28,24,0.08)" }} />
            <span className="text-[11px]" style={{ color: "rgba(15,28,24,0.3)" }}>or</span>
            <div className="h-px flex-1" style={{ background: "rgba(15,28,24,0.08)" }} />
          </div>

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
  );
}
