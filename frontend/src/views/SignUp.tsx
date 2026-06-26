"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeSlash, RocketLaunch, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";

const ROLE_OPTIONS = [
  { value: "founder", label: "Founder", desc: "I have an idea" },
  { value: "developer", label: "Developer", desc: "I build products" },
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
              { label: "Market fit", val: 78 },
              { label: "Dev demand", val: 82 },
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
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [role, setRole] = useState<"founder" | "developer" | "">("");
  const [error, setError] = useState("");

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !confirmEmail || !password || !confirmPassword || !role) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (email.toLowerCase() !== confirmEmail.toLowerCase()) {
      setError("Emails do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreed) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }

    try {
      const storedUsers = localStorage.getItem("evolv_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        setError("An account with this email already exists.");
        return;
      }

      // Add user to database
      const newUser = { firstName, lastName, email, password, role };
      users.push(newUser);
      localStorage.setItem("evolv_users", JSON.stringify(users));

      // Perform login & redirect
      if (role === "founder") {
        localStorage.setItem("evolv_founder_profile", JSON.stringify({
          firstName,
          lastName,
          email,
          bio: "",
          domains: [],
          linkedin: "",
          dob: "",
          gender: "",
          phone: "",
          education: "",
          description: "",
        }));
        router.push("/founder-dashboard?setup=true");
      } else {
        localStorage.setItem("evolv_user", JSON.stringify({
          firstName,
          lastName,
          email,
          firstTime: true
        }));
        router.push("/developer-dashboard");
      }
    } catch (_) {
      setError("An error occurred during account creation.");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "rgb(245, 246, 244)" }}>

      {/* LEFT: form (Light Theme) */}
      <div className="flex w-full h-full flex-col justify-center px-6 py-6 sm:px-10 lg:w-[54%] lg:px-14 xl:px-20 overflow-y-auto" style={{ background: "rgb(245, 246, 244)" }}>

        <Link href="/" className="mb-4 flex items-center gap-2 w-fit">
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <path d="M2 15 L6 10.5 L10 13 L14 7 L18 3.5" stroke="#428475" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="18" cy="3.5" r="2.1" fill="#428475" />
          </svg>
          <span className="text-[19px] font-bold tracking-tight text-[#0f1c18]/85">
            Ev<span className="text-[#428475]">olv</span>
          </span>
        </Link>

        <div className="mb-4">
          <h1 className="mb-0.5 text-[1.5rem] font-bold tracking-tight text-[#0f1c18]">Create your account</h1>
          <p className="text-[12.5px] text-[#0f1c18]/45">
            Already have one?{" "}
            <Link href="/sign-in" className="text-[#428475] hover:text-[#0f1c18] font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-2.5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2.5 text-[12px] rounded-lg border text-red-600 bg-red-50 border-red-100 flex items-center gap-2 font-medium"
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.div>
          )}

          {/* Row 1: Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] text-[#0f1c18]/60 font-medium">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Sara"
                className="rounded-lg pr-4 py-2 text-[13px] text-[#0f1c18] placeholder-[#0f1c18]/45 outline-none transition-all"
                style={{ paddingLeft: "1rem", background: "#ffffff", border: "1px solid rgba(15,28,24,0.12)" }}
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
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] text-[#0f1c18]/60 font-medium">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ahmed"
                className="rounded-lg pr-4 py-2 text-[13px] text-[#0f1c18] placeholder-[#0f1c18]/45 outline-none transition-all"
                style={{ paddingLeft: "1rem",background: "#ffffff", border: "1px solid rgba(15,28,24,0.12)" }}
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
          </div>

          {/* Row 2: Email & Confirm Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] text-[#0f1c18]/60 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-lg pr-4 py-2 text-[13px] text-[#0f1c18] placeholder-[#0f1c18]/45 outline-none transition-all"
                style={{paddingLeft: "1rem", background: "#ffffff", border: "1px solid rgba(15,28,24,0.12)" }}
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
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] text-[#0f1c18]/60 font-medium">Confirm Email</label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Confirm email"
                className="rounded-lg pr-4 py-2 text-[13px] text-[#0f1c18] placeholder-[#0f1c18]/45 outline-none transition-all"
                style={{paddingLeft: "1rem", background: "#ffffff", border: "1px solid rgba(15,28,24,0.12)" }}
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
          </div>

          {/* Row 3: Password & Confirm Password */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] text-[#0f1c18]/60 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 chars"
                  className="w-full rounded-lg pr-10 py-2 text-[13px] text-[#0f1c18] placeholder-[#0f1c18]/45 outline-none transition-all"
                  style={{paddingLeft: "1rem", background: "#ffffff", border: "1px solid rgba(15,28,24,0.12)" }}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0f1c18]/30 hover:text-[#0f1c18]/60 transition-colors"
                >
                  {showPassword ? <EyeSlash size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] text-[#0f1c18]/60 font-medium">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full rounded-lg pr-10 py-2 text-[13px] text-[#0f1c18] placeholder-[#0f1c18]/45 outline-none transition-all"
                  style={{paddingLeft: "1rem", background: "#ffffff", border: "1px solid rgba(15,28,24,0.12)" }}
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
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-[11px] text-[#0f1c18]/60 font-medium">I am joining as</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className="rounded-lg px-3 py-1.5 text-left transition-all"
                  style={{
                    background: role === r.value ? "rgba(137,215,183,0.18)" : "#ffffff",
                    border: role === r.value ? "1px solid rgba(66,132,117,0.4)" : "1px solid rgba(15,28,24,0.08)",
                  }}
                >
                  <div className="text-[12px] font-semibold" style={{ color: role === r.value ? "#1b4d3e" : "rgba(15,28,24,0.6)" }}>
                    {r.label}
                  </div>
                  <div className="text-[10px] text-[#0f1c18]/50">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 mt-0.5">
            <div
              onClick={() => setAgreed((a) => !a)}
              className="mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded"
              style={{
                background: agreed ? "#0f1c18" : "transparent",
                border: agreed ? "1px solid #0f1c18" : "1px solid rgba(15,28,24,0.2)",
              }}
            >
              {agreed && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="#89d7b7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-[12px] text-[#0f1c18]/50 leading-tight">
              I agree to the{" "}
              <a href="#" className="text-[#428475] underline underline-offset-2 hover:text-[#0f1c18] font-semibold">Terms</a>
              {" "}and{" "}
              <a href="#" className="text-[#428475] underline underline-offset-2 hover:text-[#0f1c18] font-semibold">Privacy Policy</a>
            </span>
          </label>

          <motion.button
            whileHover={{ scale: 1.012 }}
            whileTap={{ scale: 0.988 }}
            type="submit"
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-semibold transition-all"
            style={{ background: "#0f1c18", color: "#89d7b7", boxShadow: "0 4px 12px rgba(15,28,24,0.15)" }}
          >
            <RocketLaunch size={13} weight="bold" />
            Create account
          </motion.button>

          <div className="flex items-center gap-3">
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

      {/* RIGHT: animation panel (Dark Theme) — fixed alignment */}
      <div
        className="relative hidden lg:flex lg:w-[46%] h-full"
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
