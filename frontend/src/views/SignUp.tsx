
"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle,
  Code,
  Eye,
  EyeSlash,
  Lightbulb,
  Lock,
  MagnifyingGlass,
  RocketLaunch,
  Sparkle,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import { ScrollReelTestimonials } from "@/components/ui/scroll-reel-testimonials";

const BRAND_DARK = "#1a312c";
const BRAND_INK = "#0f1c18";
const BRAND_MID = "#428475";
const BRAND_MINT = "#89d7b7";
const BRAND_CREAM = "#fff4e1";

type Role = "founder" | "developer";

const SUGGESTED_DOMAINS = ["AI", "SaaS", "FinTech", "MedTech", "CleanTech", "EdTech", "Web3", "E-commerce"];
const ALL_DOMAINS = [
  "AI", "SaaS", "FinTech", "MedTech", "CleanTech", "EdTech", "Web3", "E-commerce",
  "HealthTech", "AgriTech", "LegalTech", "PropTech", "InsurTech", "RetailTech",
  "CyberSecurity", "IoT", "Blockchain", "Gaming", "Social Media", "DeepTech",
  "SpaceTech", "FoodTech", "TravelTech", "HRTech", "MarketingTech",
];
const SKILLS = ["React", "Next.js", "Node.js", "Python", "FastAPI", "AI/ML", "PostgreSQL", "AWS", "Docker", "Solidity"];
const PRIMARY_GOALS = [
  "Turn my idea into a structured startup blueprint",
  "Find and hire developers to build my product",
  "Get my startup in front of investors",
  "Test and validate my startup concept",
];
const WORK_TYPES = ["Remote", "Hybrid", "Onsite"];

/* ── Logo ── */
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

/* ── TextInput ── */
function TextInput({
  label, value, onChange, placeholder, type = "text", right,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; right?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>{label}</span>
      <span className="relative block">
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="h-11 w-full rounded-lg border bg-white px-4 text-[14px] outline-none transition placeholder:text-[#0f1c18]/35 focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
          style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}
        />
        {right}
      </span>
    </label>
  );
}

/* ── TextArea ── */
function TextArea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>{label}</span>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="min-h-[88px] w-full resize-none rounded-lg border bg-white px-4 py-3 text-[14px] outline-none transition placeholder:text-[#0f1c18]/35 focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
        style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}
      />
    </label>
  );
}

/* ── ChoiceGrid (for developer skills) ── */
function ChoiceGrid({ items, selected, onToggle }: {
  items: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button key={item} type="button" onClick={() => onToggle(item)}
            className="rounded-full border px-3 py-1.5 text-[12px] font-semibold transition"
            style={{ background: active ? BRAND_INK : "#fff", borderColor: active ? BRAND_INK : "rgba(15,28,24,0.12)", color: active ? BRAND_MINT : "rgba(15,28,24,0.62)" }}>
            {item}
          </button>
        );
      })}
    </div>
  );
}

/* ── DomainSearch ── */
function DomainSearch({ selected, onToggle }: { selected: string[]; onToggle: (v: string) => void }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const suggestions = query.trim()
    ? ALL_DOMAINS.filter((d) => d.toLowerCase().includes(query.toLowerCase()) && !selected.includes(d))
    : SUGGESTED_DOMAINS.filter((d) => !selected.includes(d));

  return (
    <div>
      <span className="mb-2 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>Domains of interest</span>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selected.map((domain) => (
            <span
              key={domain}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
              style={{ background: BRAND_DARK, color: BRAND_MINT }}
            >
              {domain}
              <button
                type="button"
                onClick={() => onToggle(domain)}
                className="flex items-center justify-center rounded-full transition hover:opacity-70"
                aria-label={`Remove ${domain}`}
              >
                <X size={11} weight="bold" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input — flex container so icon and text can never overlap */}
      <div
        className="mb-3 flex h-11 items-center gap-2.5 rounded-lg border bg-white px-3.5 transition-all"
        style={{
          borderColor: focused ? BRAND_MID : "rgba(15,28,24,0.12)",
          boxShadow: focused ? "0 0 0 4px rgba(137,215,183,0.18)" : "none",
        }}
      >
        <MagnifyingGlass size={15} weight="regular" className="shrink-0" style={{ color: "rgba(15,28,24,0.36)" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search all domains…"
          className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#0f1c18]/32"
          style={{ color: BRAND_INK }}
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="shrink-0 rounded-full p-0.5 hover:bg-black/6 transition">
            <X size={12} weight="bold" style={{ color: "rgba(15,28,24,0.4)" }} />
          </button>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 ? (
        <div>
          {!query && (
            <p className="mb-2 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: "rgba(15,28,24,0.35)" }}>
              Suggested
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => onToggle(domain)}
                className="rounded-full border bg-white px-3 py-1.5 text-[12px] font-semibold transition hover:border-[#428475] hover:text-[#428475]"
                style={{ borderColor: "rgba(15,28,24,0.12)", color: "rgba(15,28,24,0.62)" }}
              >
                + {domain}
              </button>
            ))}
          </div>
        </div>
      ) : query && suggestions.length === 0 ? (
        <p className="text-[12px]" style={{ color: "rgba(15,28,24,0.4)" }}>No domains matched "{query}"</p>
      ) : null}
    </div>
  );
}

/* ── Progress ── */
function Progress({ step, role }: { step: number; role: Role | "" }) {
  const labels = ["Role", "Account", role === "developer" ? "Developer profile" : "Founder profile"];
  return (
    <div className="mb-3 grid grid-cols-3 gap-2">
      {labels.map((label, index) => {
        const active = step >= index;
        return (
          <div key={label}>
            <div className="h-1.5 rounded-full" style={{ background: active ? BRAND_INK : "rgba(15,28,24,0.1)" }} />
            <div className="mt-1.5 text-[10px] font-bold uppercase" style={{ color: active ? BRAND_INK : "rgba(15,28,24,0.35)" }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Testimonial data ── */
const testimonialData = [
  { quote: "I had my idea on Monday. By Wednesday I had a full blueprint, a developer match, and two investor inquiries.", author: "Ayesha Khan — Founder, EdTech startup", image: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=300&q=80&fit=crop&crop=faces", alt: "Ayesha Khan" },
  { quote: "Every blueprint already has the stack, features, constraints, and budget context. It makes freelance discovery dramatically cleaner.", author: "James Delgado — Full-stack developer", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80&fit=crop&crop=faces", alt: "James Delgado" },
  { quote: "The viability scoring saves hours of first-pass diligence. I can filter by domain and move directly into founder conversations.", author: "Sofia Reyes — Angel investor, HealthTech focus", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80&fit=crop&crop=faces", alt: "Sofia Reyes" },
];

/* ── SidePanel ── */
function SidePanel() {
  return (
    <motion.aside
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden h-screen overflow-hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col"
      style={{ background: BRAND_DARK }}
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 55% at 35% 55%, rgba(137,215,183,0.07) 0%, transparent 65%),radial-gradient(ellipse 50% 40% at 78% 25%, rgba(66,132,117,0.05) 0%, transparent 55%)" }} />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full" style={{ background: "rgba(137,215,183,0.05)", filter: "blur(60px)" }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 flex h-full flex-col px-12 xl:px-16">
        <div style={{ paddingTop: "64px" }}><Logo dark /></div>

        <div className="flex flex-1 flex-col justify-center gap-9 py-8">
          <div className="flex flex-col gap-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ background: "rgba(137,215,183,0.1)", border: "1px solid rgba(137,215,183,0.16)", color: BRAND_MINT }}>
              <Sparkle size={10} weight="fill" /> Join the network
            </div>
            <div>
              <h2 className="font-bold leading-[1.08] tracking-[-0.02em]" style={{ color: BRAND_CREAM, fontSize: "clamp(2.1rem, 2.8vw, 2.75rem)" }}>
                Build your venture.<br /><span style={{ color: BRAND_MINT }}>Find your team.</span>
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "rgba(255,244,225,0.46)" }}>
                Join a curated ecosystem of founders and developers shipping the next generation of startups.
              </p>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }} className="w-full flex justify-center">
            <div className="relative h-[220px] xl:h-[260px] w-full flex items-center justify-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] scale-[0.55] xl:scale-[0.70]">
                <ScrollReelTestimonials testimonials={testimonialData} />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.aside>
  );
}

/* ══════════════════════════════════════════
   Main component
══════════════════════════════════════════ */
export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | "">("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [account, setAccount] = useState({
    firstName: "", lastName: "", email: "", confirmEmail: "",
    password: "", confirmPassword: "",
    phone: "", country: "", dob: "", idNumber: "",
  });

  const [founder, setFounder] = useState({
    headline: "", bio: "",
    domains: [] as string[],
    primaryGoal: "",
    location: "", linkedin: "",
  });

  const [developer, setDeveloper] = useState({
    jobTitle: "", experience: "", location: "",
    skills: [] as string[],
    workType: "Remote", bio: "", github: "", linkedIn: "",
  });

  const profileCompleteness = useMemo(() => {
    if (role === "founder") {
      const filled = [founder.headline, founder.bio, founder.location, founder.primaryGoal].filter(Boolean).length
        + (founder.domains.length ? 1 : 0);
      return Math.round((filled / 5) * 100);
    }
    if (role === "developer") {
      const filled = [developer.jobTitle, developer.experience, developer.location, developer.bio].filter(Boolean).length
        + (developer.skills.length ? 1 : 0);
      return Math.round((filled / 5) * 100);
    }
    return 0;
  }, [developer, founder, role]);

  const setAccountField = (k: keyof typeof account, v: string) => setAccount((c) => ({ ...c, [k]: v }));
  const setFounderField = (k: Exclude<keyof typeof founder, "domains">, v: string) => setFounder((c) => ({ ...c, [k]: v }));
  const setDevField = (k: Exclude<keyof typeof developer, "skills">, v: string) => setDeveloper((c) => ({ ...c, [k]: v }));

  const toggleFounderDomain = (d: string) =>
    setFounder((c) => ({ ...c, domains: c.domains.includes(d) ? c.domains.filter((x) => x !== d) : [...c.domains, d] }));
  const toggleSkill = (s: string) =>
    setDeveloper((c) => ({ ...c, skills: c.skills.includes(s) ? c.skills.filter((x) => x !== s) : [...c.skills, s] }));

  const validateRole = () => {
    if (!role) { setError("Choose whether you are joining as a founder or developer."); return false; }
    setError(""); return true;
  };

  const validateAccount = () => {
    const { firstName, lastName, email, confirmEmail, password, confirmPassword, phone, country, dob, idNumber } = account;
    if (!firstName || !lastName || !email || !confirmEmail || !password || !confirmPassword || !phone || !country || !dob || !idNumber) {
      setError("Complete all required fields before continuing."); return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return false; }
    if (email.toLowerCase() !== confirmEmail.toLowerCase()) { setError("Email addresses do not match."); return false; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return false; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return false; }
    if (!agreed) { setError("Accept the Terms and Privacy Policy to continue."); return false; }
    setError(""); return true;
  };

  const persistAccount = (profileComplete: boolean) => {
    const base = { firstName: account.firstName, lastName: account.lastName, email: account.email, password: account.password, role };
    const profile = role === "founder"
      ? { firstName: account.firstName, lastName: account.lastName, email: account.email, phone: account.phone, country: account.country, dob: account.dob, idNumber: account.idNumber, headline: founder.headline, bio: founder.bio, domains: founder.domains, primaryGoal: founder.primaryGoal, location: founder.location, linkedin: founder.linkedin, profileComplete }
      : { firstName: account.firstName, lastName: account.lastName, email: account.email, jobTitle: developer.jobTitle, role: developer.jobTitle, location: developer.location, experience: developer.experience, bio: developer.bio, techStack: developer.skills, workType: developer.workType, github: developer.github, linkedin: developer.linkedIn, availability: true, profileComplete, firstTime: !profileComplete };

    // Upsert — replace any existing record with the same email so retesting never blocks
    const users = JSON.parse(localStorage.getItem("evolv_users") ?? "[]");
    const filtered = users.filter((u: any) => u.email.toLowerCase() !== account.email.toLowerCase());
    localStorage.setItem("evolv_users", JSON.stringify([...filtered, { ...base, profile }]));
    if (role === "founder") {
      localStorage.setItem("evolv_founder_profile", JSON.stringify(profile));
      router.push(profileComplete ? "/founder-dashboard" : "/founder-dashboard?setup=true");
    } else {
      localStorage.setItem("evolv_user", JSON.stringify(profile));
      router.push("/developer-dashboard");
    }
    return true;
  };

  const finish = (skip = false) => {
    setError("");
    if (!role) return;
    const complete = role === "founder"
      ? Boolean(founder.headline && founder.bio && founder.location && founder.primaryGoal && founder.domains.length)
      : Boolean(developer.jobTitle && developer.experience && developer.location && developer.bio && developer.skills.length);
    if (!skip && !complete) {
      setError(role === "founder"
        ? "Add a headline, bio, location, primary goal, and at least one domain."
        : "Add a role, experience, location, bio, and at least one skill.");
      return;
    }
    try { persistAccount(!skip && complete); } catch { setError("Something went wrong while creating your account."); }
  };

  const goNext = () => {
    if (step === 0 && validateRole()) setStep(1);
    if (step === 1 && validateAccount()) setStep(2);
  };

  /* ────────────────────────── render ────────────────────────── */
  return (
    <div className="flex h-screen w-full overflow-hidden lg:flex-row-reverse" style={{ background: "#f5f6f4" }}>
      <SidePanel />

      <main className="relative flex h-screen flex-1 flex-col overflow-y-auto lg:w-[56%] xl:w-[58%] lg:flex-none">

        {/* Top bar — same spacing as role / account steps */}
        <div className="flex shrink-0 items-center justify-between px-8 sm:px-10 xl:px-14" style={{ paddingTop: "52px" }}>
          <Logo />
          <p className="hidden sm:block text-[14px] font-medium" style={{ color: "rgba(15,28,24,0.5)" }}>
            Already have an account?{" "}
            <Link href="/sign-in" className="font-bold underline underline-offset-2 transition-colors hover:opacity-80" style={{ color: BRAND_MID }}>Log in</Link>
          </p>
          <Link href="/sign-in" className="text-[13.5px] font-bold sm:hidden transition-colors hover:opacity-80" style={{ color: BRAND_MID }}>Log in</Link>
        </div>

        {/* Form area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`flex flex-col px-8 sm:px-10 xl:px-14 ${step === 2 ? "pt-10 pb-52" : "flex-1 justify-center"}`}
        >
          <div className="w-full max-w-[560px] mx-auto">

            {/* Progress */}
            <div className="mb-8"><Progress step={step} role={role} /></div>

            {/* Heading */}
            <div className="mb-10">
              <h1 className="text-[1.85rem] font-bold tracking-tight leading-[1.18]" style={{ color: BRAND_INK }}>
                {step === 0 ? "What kind of account are you creating?"
                  : step === 1 ? "Create your login"
                  : role === "founder" ? "Shape your founder profile"
                  : "Build your developer profile"}
              </h1>
              <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "rgba(15,28,24,0.5)" }}>
                {step === 0 ? "Evolv personalizes onboarding, permissions, and matching based on your role."
                  : step === 1 ? "Use an email you can keep tied to your venture or professional profile."
                  : role === "founder" ? "This is what developers see when they discover your project. You can skip and come back."
                  : "Complete this now to appear in founder searches and apply to blueprint-backed projects."}
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">

              {/* ── Step 0: Role ── */}
              {step === 0 && (
                <motion.div key="role" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-6 md:grid-cols-2">
                  {[
                    { id: "founder" as const, title: "Founder", icon: Lightbulb, desc: "I want to turn an idea into a blueprint, find builders, and publish once ready.", meta: "Blueprints, profile gating, developer matching" },
                    { id: "developer" as const, title: "Developer", icon: Code, desc: "I want founders to discover me and apply to scoped startup opportunities.", meta: "Skills, portfolio signal, applications" },
                  ].map(({ id, title, icon: Icon, desc, meta }) => {
                    const active = role === id;
                    return (
                      <button key={id} type="button" onClick={() => setRole(id)}
                        className="rounded-[8px] border bg-white p-5 text-left transition hover:-translate-y-0.5"
                        style={{ borderColor: active ? BRAND_MID : "rgba(15,28,24,0.1)", boxShadow: active ? "0 16px 34px rgba(66,132,117,0.14)" : "0 10px 26px rgba(15,28,24,0.05)" }}>
                        <div className="mb-5 flex items-center justify-between">
                          <span className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ background: active ? BRAND_INK : "#f0f5f2", color: active ? BRAND_MINT : BRAND_MID }}>
                            <Icon size={22} weight={active ? "fill" : "regular"} />
                          </span>
                          <span className="h-5 w-5 rounded-full border" style={{ borderColor: active ? BRAND_MID : "rgba(15,28,24,0.18)", background: active ? BRAND_MINT : "#fff" }} />
                        </div>
                        <h2 className="text-[18px] font-bold" style={{ color: BRAND_INK }}>{title}</h2>
                        <p className="mt-2 text-[13px] leading-5" style={{ color: "rgba(15,28,24,0.58)" }}>{desc}</p>
                        <div className="mt-4 text-[11px] font-bold uppercase" style={{ color: BRAND_MID }}>{meta}</div>
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {/* ── Step 1: Account ── */}
              {step === 1 && (
                <motion.div key="account" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput label="First name" value={account.firstName} onChange={(v) => setAccountField("firstName", v)} placeholder="Sara" />
                    <TextInput label="Last name" value={account.lastName} onChange={(v) => setAccountField("lastName", v)} placeholder="Ahmed" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput label="Email" type="email" value={account.email} onChange={(v) => setAccountField("email", v)} placeholder="you@example.com" />
                    <TextInput label="Confirm email" type="email" value={account.confirmEmail} onChange={(v) => setAccountField("confirmEmail", v)} placeholder="Confirm email" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput label="Password" type={showPassword ? "text" : "password"} value={account.password} onChange={(v) => setAccountField("password", v)} placeholder="Minimum 8 characters"
                      right={
                        <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#0f1c18]/45 hover:bg-[#f0f5f2]" aria-label={showPassword ? "Hide" : "Show"}>
                          {showPassword ? <EyeSlash size={17} /> : <Eye size={17} />}
                        </button>
                      }
                    />
                    <TextInput label="Confirm password" type={showPassword ? "text" : "password"} value={account.confirmPassword} onChange={(v) => setAccountField("confirmPassword", v)} placeholder="Confirm password" />
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-px flex-1" style={{ background: "rgba(15,28,24,0.08)" }} />
                    <span className="text-[10.5px] font-bold uppercase tracking-widest" style={{ color: "rgba(15,28,24,0.35)" }}>Identity & contact</span>
                    <div className="h-px flex-1" style={{ background: "rgba(15,28,24,0.08)" }} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput label="Phone number" type="tel" value={account.phone} onChange={(v) => setAccountField("phone", v)} placeholder="+92 300 0000000" />
                    <TextInput label="Country" value={account.country} onChange={(v) => setAccountField("country", v)} placeholder="Pakistan" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput label="Date of birth" type="date" value={account.dob} onChange={(v) => setAccountField("dob", v)} />
                    <TextInput label="National ID / CNIC" value={account.idNumber} onChange={(v) => setAccountField("idNumber", v)} placeholder="XXXXX-XXXXXXX-X" />
                  </div>

                  <div className="flex items-start gap-2.5 rounded-lg px-3.5 py-3" style={{ background: "rgba(15,28,24,0.035)", border: "1px solid rgba(15,28,24,0.07)" }}>
                    <Lock size={13} weight="fill" className="mt-0.5 shrink-0" style={{ color: BRAND_MID }} />
                    <p className="text-[11.5px] leading-[1.6]" style={{ color: "rgba(15,28,24,0.52)" }}>
                      Phone, date of birth, and National ID are stored securely and never shown on your public profile. Used exclusively for identity verification and legal accountability.
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 text-[12px] leading-5" style={{ color: "rgba(15,28,24,0.58)" }}>
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-[#0f1c18]/20 accent-[#1a312c]" />
                    <span>
                      I agree to the <a href="#" className="font-bold text-[#428475]">Terms</a> and <a href="#" className="font-bold text-[#428475]">Privacy Policy</a>. I confirm my identity information is accurate and legally verifiable.
                    </span>
                  </label>
                </motion.div>
              )}

              {/* ── Step 2: Founder profile ── */}
              {step === 2 && role === "founder" && (
                <motion.div key="founder" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-8">

                  {/* Completion bar */}
                  <div className="rounded-xl border bg-white px-5 py-4" style={{ borderColor: "rgba(15,28,24,0.1)" }}>
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-[12px] font-bold" style={{ color: BRAND_INK }}>Profile completion</span>
                      <span className="text-[12px] font-bold" style={{ color: BRAND_MID }}>{profileCompleteness}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "rgba(15,28,24,0.08)" }}>
                      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${profileCompleteness}%`, background: `linear-gradient(90deg, ${BRAND_MID}, ${BRAND_MINT})` }} />
                    </div>
                  </div>

                  {/* Headline + bio */}
                  <div className="grid gap-5">
                    <TextInput label="Founder headline" value={founder.headline} onChange={(v) => setFounderField("headline", v)} placeholder="Building AI diagnostics for rural hospitals" />
                    <TextArea label="Short bio" value={founder.bio} onChange={(v) => setFounderField("bio", v)} placeholder="Tell developers who you are, what problem you're solving, and what kind of collaboration you're looking for." />
                  </div>

                  {/* Location + LinkedIn */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput label="Location / city" value={founder.location} onChange={(v) => setFounderField("location", v)} placeholder="Lahore, Pakistan" />
                    <TextInput label="LinkedIn (optional)" value={founder.linkedin} onChange={(v) => setFounderField("linkedin", v)} placeholder="https://linkedin.com/in/…" />
                  </div>

                  {/* Searchable domain picker */}
                  <div className="rounded-xl border bg-white px-5 py-5" style={{ borderColor: "rgba(15,28,24,0.1)" }}>
                    <DomainSearch selected={founder.domains} onToggle={toggleFounderDomain} />
                  </div>

                  {/* Primary goal */}
                  <div>
                    <p className="mb-1 text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>What's your primary goal on Evolv?</p>
                    <p className="mb-3 text-[12px]" style={{ color: "rgba(15,28,24,0.4)" }}>Pick one — you can always change this later.</p>
                    <div className="grid gap-2.5">
                      {PRIMARY_GOALS.map((goal) => {
                        const active = founder.primaryGoal === goal;
                        return (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => setFounderField("primaryGoal", active ? "" : goal)}
                            className="flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition"
                            style={{
                              background: active ? BRAND_DARK : "#fff",
                              borderColor: active ? BRAND_DARK : "rgba(15,28,24,0.1)",
                              boxShadow: active ? "0 4px 16px rgba(26,49,44,0.2)" : "none",
                            }}
                          >
                            <span className="text-[13.5px] font-semibold leading-snug" style={{ color: active ? BRAND_MINT : BRAND_INK }}>
                              {goal}
                            </span>
                            <span className="ml-4 shrink-0">
                              {active
                                ? <CheckCircle size={18} weight="fill" style={{ color: BRAND_MINT }} />
                                : <span className="block h-[18px] w-[18px] rounded-full border" style={{ borderColor: "rgba(15,28,24,0.2)" }} />
                              }
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* ── Step 2: Developer profile ── */}
              {step === 2 && role === "developer" && (
                <motion.div key="developer" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-5">
                  <div className="rounded-xl border bg-white px-5 py-4" style={{ borderColor: "rgba(15,28,24,0.1)" }}>
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-[12px] font-bold" style={{ color: BRAND_INK }}>Profile strength</span>
                      <span className="text-[12px] font-bold" style={{ color: BRAND_MID }}>{profileCompleteness}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "rgba(15,28,24,0.08)" }}>
                      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${profileCompleteness}%`, background: `linear-gradient(90deg, ${BRAND_MID}, ${BRAND_MINT})` }} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput label="Professional role" value={developer.jobTitle} onChange={(v) => setDevField("jobTitle", v)} placeholder="Full Stack Developer" />
                    <TextInput label="Location" value={developer.location} onChange={(v) => setDevField("location", v)} placeholder="Islamabad, Pakistan" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>Experience</span>
                      <select value={developer.experience} onChange={(e) => setDevField("experience", e.target.value)} className="h-11 w-full rounded-lg border bg-white px-4 text-[14px] outline-none focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20" style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}>
                        <option value="">Select experience</option>
                        {["< 1 year", "1-2 years", "3-5 years", "5-8 years", "8+ years"].map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>Preferred work type</span>
                      <select value={developer.workType} onChange={(e) => setDevField("workType", e.target.value)} className="h-11 w-full rounded-lg border bg-white px-4 text-[14px] outline-none focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20" style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}>
                        {WORK_TYPES.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </label>
                  </div>
                  <div>
                    <span className="mb-2 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>Core skills</span>
                    <ChoiceGrid items={SKILLS} selected={developer.skills} onToggle={toggleSkill} />
                  </div>
                  <TextArea label="Professional summary" value={developer.bio} onChange={(v) => setDevField("bio", v)} placeholder="Summarize the products you build, your strongest stack, and the startup environments you prefer." />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput label="GitHub (optional)" value={developer.github} onChange={(v) => setDevField("github", v)} placeholder="https://github.com/…" />
                    <TextInput label="LinkedIn (optional)" value={developer.linkedIn} onChange={(v) => setDevField("linkedIn", v)} placeholder="https://linkedin.com/in/…" />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>

        {/* Sticky bottom bar — always visible, content scrolls above it */}
        <div
          className="sticky bottom-0 z-20 px-8 sm:px-10 xl:px-14"
          style={{ background: "#f5f6f4", borderTop: "1px solid rgba(15,28,24,0.07)" }}
        >
          <div className="w-full max-w-[560px] mx-auto">

            {/* Skip notice — shown on step 2 only */}
            <AnimatePresence>
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5 pt-4"
                >
                  <UserCircle size={16} weight="fill" className="mt-0.5 shrink-0" style={{ color: BRAND_MID }} />
                  <p className="text-[11.5px] leading-[1.55]" style={{ color: "rgba(15,28,24,0.48)" }}>
                    {role === "founder"
                      ? "Skipped profiles can save private blueprints — publishing, developer outreach, and investor sharing stay locked until complete."
                      : "Skipped developer profiles can enter the dashboard, but discovery visibility and applications require completion."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inline error on step 2 — shown near buttons since form top is out of view */}
            <AnimatePresence>
              {step === 2 && error && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between py-4">
              <button
                type="button"
                onClick={() => step === 0 ? router.push("/") : setStep((s) => s - 1)}
                className="flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition hover:bg-black/5"
                style={{ color: "rgba(15,28,24,0.6)" }}
              >
                <ArrowLeft size={14} weight="bold" />
                {step === 0 ? "Back home" : "Back"}
              </button>

              <div className="flex items-center gap-3">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => finish(true)}
                    className="h-10 rounded-xl border bg-white px-5 text-[13px] font-bold transition hover:bg-gray-50"
                    style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_MID }}
                  >
                    Skip for now
                  </button>
                )}
                <motion.button
                  whileHover={{ scale: 1.012 }} whileTap={{ scale: 0.988 }}
                  type="button"
                  onClick={step < 2 ? goNext : () => finish(false)}
                  className="flex h-10 items-center gap-2 rounded-xl px-6 text-[13px] font-semibold transition-all"
                  style={{ background: BRAND_INK, color: BRAND_MINT, boxShadow: "0 4px 14px rgba(15,28,24,0.18)" }}
                >
                  {step < 2 ? "Continue" : "Complete profile"}
                  {step < 2 ? <ArrowRight size={14} weight="bold" /> : role === "founder" ? <RocketLaunch size={14} weight="bold" /> : <Briefcase size={14} weight="bold" />}
                </motion.button>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
