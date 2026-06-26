"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";
import Link from "next/link";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Fallback/mock credentials
    if (email.toLowerCase() === "sarah@evolv.dev" || email.toLowerCase() === "sarah.mitchell@evolv.dev") {
      localStorage.setItem("evolv_user", JSON.stringify({
        firstName: "Sarah",
        lastName: "Mitchell",
        email: email.toLowerCase(),
      }));
      router.push("/developer-dashboard");
      return;
    }
    if (email.toLowerCase() === "asad@evolv.dev") {
      localStorage.setItem("evolv_founder_profile", JSON.stringify({
        firstName: "Asad",
        lastName: "",
        email: email.toLowerCase(),
        bio: "",
        domains: [],
        linkedin: "",
        dob: "",
        gender: "",
        phone: "",
        education: "",
        description: "",
      }));
      router.push("/founder-dashboard");
      return;
    }

    try {
      const storedUsers = localStorage.getItem("evolv_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        setError("Account not found. Please sign up.");
        return;
      }

      if (user.password !== password) {
        setError("Incorrect password.");
        return;
      }

      // Successful login
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
        }));
        router.push("/founder-dashboard");
      } else {
        localStorage.setItem("evolv_user", JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        }));
        router.push("/developer-dashboard");
      }
    } catch (_) {
      setError("An error occurred during sign in.");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "rgb(245, 246, 244)" }}>

      {/* LEFT: form (Light Theme) */}
      <div className="flex w-full h-full flex-col justify-center px-6 py-8 sm:px-10 lg:w-[54%] lg:px-14 xl:px-20 overflow-y-auto" style={{ background: "rgb(245, 246, 244)" }}>

        <Link href="/" className="mb-6 flex items-center gap-2 w-fit">
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <path d="M2 15 L6 10.5 L10 13 L14 7 L18 3.5" stroke="#428475" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="18" cy="3.5" r="2.1" fill="#428475" />
          </svg>
          <span className="text-[19px] font-bold tracking-tight text-[#0f1c18]/85">
            Ev<span className="text-[#428475]">olv</span>
          </span>
        </Link>

        <div className="mb-6">
          <h1 className="mb-1 text-[1.6rem] font-bold tracking-tight text-[#0f1c18]">Welcome back</h1>
          <p className="text-[13px] text-[#0f1c18]/45">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-[#428475] hover:text-[#0f1c18] font-semibold transition-colors">
              Get started free
            </Link>
          </p>
        </div>

        <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 text-[12px] rounded-lg border text-red-600 bg-red-50 border-red-100 flex items-center gap-2 mb-1 font-medium"
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-[#0f1c18]/60 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-lg pr-4 py-2.5 text-[13px] text-[#0f1c18] placeholder-[#0f1c18]/45 outline-none transition-all"
              style={{ paddingLeft: "1rem" ,background: "#ffffff", border: "1px solid rgba(15,28,24,0.12)" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#428475";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(66,132,117,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(15,28,24,0.12)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-[#0f1c18]/60 font-medium">Password</label>
              <a href="#" className="text-[11px] text-[#428475] hover:text-[#0f1c18] font-medium transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full rounded-lg pr-10 py-2.5 text-[13px] text-[#0f1c18] placeholder-[#0f1c18]/45 outline-none transition-all"
                style={{ paddingLeft: "1rem" ,background: "#ffffff", border: "1px solid rgba(15,28,24,0.12)" }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#428475";
                  e.currentTarget.style.boxShadow = "0 0 0 2px rgba(66,132,117,0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(15,28,24,0.12)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0f1c18]/30 hover:text-[#0f1c18]/60 transition-colors"
              >
                {showPassword ? <EyeSlash size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.012 }}
            whileTap={{ scale: 0.988 }}
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold transition-all mt-1"
            style={{ background: "#0f1c18", color: "#89d7b7", boxShadow: "0 4px 12px rgba(15,28,24,0.15)" }}
          >
            Sign in
            <ArrowRight size={13} weight="bold" />
          </motion.button>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1" style={{ background: "rgba(15,28,24,0.08)" }} />
            <span className="text-[11px] text-[#0f1c18]/30">or</span>
            <div className="h-px flex-1" style={{ background: "rgba(15,28,24,0.08)" }} />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2.5 rounded-lg py-2.5 text-[13px] text-[#0f1c18]/70 transition-all hover:bg-slate-50 hover:text-[#0f1c18]"
            style={{ background: "#ffffff", border: "1px solid rgba(15,28,24,0.12)" }}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </form>
      </div>

      {/* RIGHT: panel (Dark Theme) — properly centered */}
      <div
        className="relative hidden lg:flex lg:w-[46%] h-full items-center justify-center px-12"
        style={{
          background: "linear-gradient(150deg, #0a1410 0%, #060e0b 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 55% 45% at 50% 45%, rgba(137,215,183,0.06) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-[300px]">
          <div
            className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl text-xl font-bold text-[#89d7b7]"
            style={{ background: "rgba(137,215,183,0.07)", border: "1px solid rgba(137,215,183,0.12)" }}
          >
            &ldquo;
          </div>

          <blockquote className="mb-6 text-[1.05rem] font-medium leading-relaxed text-white/50">
            &ldquo;The viability scoring saves hours of first-pass diligence. I can filter by domain and move directly into founder conversations.&rdquo;
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
