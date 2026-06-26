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
  RocketLaunch,
  Sparkle,
  UserCircle,
} from "@phosphor-icons/react";
import { ScrollReelTestimonials } from "@/components/ui/scroll-reel-testimonials";

const BRAND_DARK = "#1a312c";
const BRAND_INK = "#0f1c18";
const BRAND_MID = "#428475";
const BRAND_MINT = "#89d7b7";
const BRAND_CREAM = "#fff4e1";

type Role = "founder" | "developer";

const DOMAINS = ["AI", "SaaS", "FinTech", "MedTech", "CleanTech", "EdTech", "Web3", "E-commerce"];
const SKILLS = ["React", "Next.js", "Node.js", "Python", "FastAPI", "AI/ML", "PostgreSQL", "AWS", "Docker", "Solidity"];
const FOUNDER_STAGES = ["Idea", "Prototype", "MVP", "Early revenue", "Fundraising"];
const WORK_TYPES = ["Remote", "Hybrid", "Onsite"];

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

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  right,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  right?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>{label}</span>
      <span className="relative block">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border bg-white px-4 text-[14px] outline-none transition placeholder:text-[#0f1c18]/35 focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
          style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}
        />
        {right}
      </span>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[92px] w-full resize-none rounded-lg border bg-white px-4 py-3 text-[14px] outline-none transition placeholder:text-[#0f1c18]/35 focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
        style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}
      />
    </label>
  );
}

function ChoiceGrid({
  items,
  selected,
  onToggle,
  multi = true,
}: {
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className="rounded-full border px-3 py-1.5 text-[12px] font-semibold transition"
            style={{
              background: active ? BRAND_INK : "#fff",
              borderColor: active ? BRAND_INK : "rgba(15,28,24,0.12)",
              color: active ? BRAND_MINT : "rgba(15,28,24,0.62)",
            }}
            aria-pressed={multi ? active : undefined}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

function Progress({ step, role }: { step: number; role: Role | "" }) {
  const labels = ["Role", "Account", role === "developer" ? "Developer profile" : role === "founder" ? "Founder profile" : "Profile"];
  return (
    <div className="mb-7">
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
    </div>
  );
}

const testimonialData = [
  {
    quote: "I had my idea on Monday. By Wednesday I had a full blueprint, a developer match, and two investor inquiries.",
    author: "Ayesha Khan — Founder, EdTech startup",
    image: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=300&q=80&fit=crop&crop=faces",
    alt: "Ayesha Khan",
  },
  {
    quote: "Every blueprint already has the stack, features, constraints, and budget context. It makes freelance discovery dramatically cleaner.",
    author: "James Delgado — Full-stack developer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80&fit=crop&crop=faces",
    alt: "James Delgado",
  },
  {
    quote: "The viability scoring saves hours of first-pass diligence. I can filter by domain and move directly into founder conversations.",
    author: "Sofia Reyes — Angel investor, HealthTech focus",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80&fit=crop&crop=faces",
    alt: "Sofia Reyes",
  },
];

function SidePanel() {
  return (
    <motion.aside 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden h-screen overflow-hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col" 
      style={{ background: BRAND_DARK }}
    >
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

      <motion.div 
        initial={{ opacity: 0, y: 24 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex h-full flex-col px-12 xl:px-16"
      >
        {/* Logo — with breathing room from the top */}
        <div style={{ paddingTop: "64px" }}>
          <Logo dark />
        </div>

        {/* Everything else centered in remaining height */}
        <div className="flex flex-1 flex-col justify-center gap-9 py-8">
          <div className="flex flex-col gap-5">
            <div
              className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: "rgba(137,215,183,0.1)", border: "1px solid rgba(137,215,183,0.16)", color: BRAND_MINT }}
            >
              <Sparkle size={10} weight="fill" />
              Join the network
            </div>

            <div>
              <h2
                className="font-bold leading-[1.08] tracking-[-0.02em]"
                style={{ color: BRAND_CREAM, fontSize: "clamp(2.1rem, 2.8vw, 2.75rem)" }}
              >
                Build your venture.<br />
                <span style={{ color: BRAND_MINT }}>Find your team.</span>
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "rgba(255,244,225,0.46)" }}>
                Join a curated ecosystem of founders and developers shipping the next generation of startups. We separate workflows from day one so you get exactly the tools you need.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="w-full flex justify-center"
          >
            {/* Scaled-down Landing Page Component */}
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

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | "">("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [account, setAccount] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });

  const [founder, setFounder] = useState({
    bio: "",
    domains: [] as string[],
    stage: "",
    idea: "",
    linkedIn: "",
    phone: "",
  });

  const [developer, setDeveloper] = useState({
    jobTitle: "",
    experience: "",
    location: "",
    skills: [] as string[],
    workType: "Remote",
    bio: "",
    github: "",
    linkedIn: "",
  });

  const profileCompleteness = useMemo(() => {
    if (role === "founder") {
      const completed = [founder.bio, founder.stage, founder.idea].filter(Boolean).length + (founder.domains.length ? 1 : 0);
      return Math.round((completed / 4) * 100);
    }
    if (role === "developer") {
      const completed = [developer.jobTitle, developer.experience, developer.location, developer.bio].filter(Boolean).length + (developer.skills.length ? 1 : 0);
      return Math.round((completed / 5) * 100);
    }
    return 0;
  }, [developer, founder, role]);

  const setAccountField = (key: keyof typeof account, value: string) => setAccount((current) => ({ ...current, [key]: value }));
  const setFounderField = (key: Exclude<keyof typeof founder, "domains">, value: string) => setFounder((current) => ({ ...current, [key]: value }));
  const setDeveloperField = (key: Exclude<keyof typeof developer, "skills">, value: string) => setDeveloper((current) => ({ ...current, [key]: value }));

  const toggleFounderDomain = (domain: string) => {
    setFounder((current) => ({
      ...current,
      domains: current.domains.includes(domain) ? current.domains.filter((item) => item !== domain) : [...current.domains, domain],
    }));
  };

  const toggleSkill = (skill: string) => {
    setDeveloper((current) => ({
      ...current,
      skills: current.skills.includes(skill) ? current.skills.filter((item) => item !== skill) : [...current.skills, skill],
    }));
  };

  const validateRole = () => {
    if (!role) {
      setError("Choose whether you are joining as a founder or developer.");
      return false;
    }
    setError("");
    return true;
  };

  const validateAccount = () => {
    if (!account.firstName || !account.lastName || !account.email || !account.confirmEmail || !account.password || !account.confirmPassword) {
      setError("Complete the required account fields.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) {
      setError("Enter a valid email address.");
      return false;
    }
    if (account.email.toLowerCase() !== account.confirmEmail.toLowerCase()) {
      setError("Email addresses do not match.");
      return false;
    }
    if (account.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (account.password !== account.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (!agreed) {
      setError("Accept the Terms and Privacy Policy to continue.");
      return false;
    }
    setError("");
    return true;
  };

  const persistAccount = (profileComplete: boolean) => {
    const baseUser = {
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      password: account.password,
      role,
    };

    const profile = role === "founder"
      ? {
          firstName: account.firstName,
          lastName: account.lastName,
          email: account.email,
          bio: founder.bio,
          domains: founder.domains,
          linkedin: founder.linkedIn,
          dob: "",
          gender: "",
          phone: founder.phone,
          education: "",
          description: founder.idea,
          ventureStage: founder.stage,
          profileComplete,
        }
      : {
          firstName: account.firstName,
          lastName: account.lastName,
          email: account.email,
          jobTitle: developer.jobTitle,
          role: developer.jobTitle,
          location: developer.location,
          experience: developer.experience,
          bio: developer.bio,
          techStack: developer.skills,
          workType: developer.workType,
          github: developer.github,
          linkedin: developer.linkedIn,
          availability: true,
          profileComplete,
          firstTime: !profileComplete,
        };

    const storedUsers = localStorage.getItem("evolv_users");
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    if (users.some((user: any) => user.email.toLowerCase() === account.email.toLowerCase())) {
      setError("An account with this email already exists.");
      return false;
    }

    localStorage.setItem("evolv_users", JSON.stringify([...users, { ...baseUser, profile }]));
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
      ? Boolean(founder.bio && founder.stage && founder.idea && founder.domains.length)
      : Boolean(developer.jobTitle && developer.experience && developer.location && developer.bio && developer.skills.length);

    if (!skip && !complete) {
      setError(role === "founder"
        ? "Add a bio, stage, idea summary, and at least one domain to complete your founder profile."
        : "Add a role, experience, location, bio, and at least one skill to complete your developer profile.");
      return;
    }

    try {
      persistAccount(!skip && complete);
    } catch {
      setError("Something went wrong while creating your account.");
    }
  };

  const goNext = () => {
    if (step === 0 && validateRole()) setStep(1);
    if (step === 1 && validateAccount()) setStep(2);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden lg:flex-row-reverse" style={{ background: "#f5f6f4" }}>
      <SidePanel />

      <main className="relative flex h-screen flex-1 flex-col overflow-y-auto lg:w-[56%] xl:w-[58%] lg:flex-none">
        
        {/* Fixed Top Bar */}
        <div className="flex items-center justify-between px-8 sm:px-10 xl:px-14" style={{ paddingTop: "56px" }}>
          <Logo />
          <div className="hidden sm:block">
            <p className="text-[14px] font-medium" style={{ color: "rgba(15,28,24,0.5)" }}>
              Already have an account?{" "}
              <Link href="/sign-in" className="font-bold underline underline-offset-2 transition-colors hover:opacity-80" style={{ color: BRAND_MID }}>
                Log in
              </Link>
            </p>
          </div>
          <Link href="/sign-in" className="text-[13.5px] font-bold sm:hidden transition-colors hover:opacity-80" style={{ color: BRAND_MID }}>
            Log in
          </Link>
        </div>

        {/* Form Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 flex-col justify-center px-8 sm:px-10 xl:px-14"
        >
          <div className="w-full max-w-[580px] mx-auto">

            <div className="mb-8">
              <Progress step={step} role={role} />
            </div>

            <div className="mb-12">
              <h1 className="text-[1.9rem] font-bold tracking-tight leading-[1.18]" style={{ color: BRAND_INK }}>
                {step === 0 ? "What kind of account are you creating?" : step === 1 ? "Create your login" : role === "founder" ? "Shape your founder profile" : "Build your developer profile"}
              </h1>
              <p className="mt-3 max-w-[500px] text-[14px] leading-relaxed" style={{ color: "rgba(15,28,24,0.5)" }}>
                {step === 0
                  ? "Evolv personalizes onboarding, permissions, and matching based on your role."
                  : step === 1
                  ? "Use an email you can keep tied to your venture or professional profile."
                  : role === "founder"
                  ? "You can skip this and still generate blueprints, but publishing and developer connections stay locked until completion."
                  : "Complete this now to appear in founder searches and apply to blueprint-backed projects."}
              </p>
            </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700"
            >
              {error}
            </motion.div>
          )}

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="role" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-6 md:grid-cols-2">
                {[
                  { id: "founder" as const, title: "Founder", icon: Lightbulb, desc: "I want to turn an idea into a blueprint, find builders, and publish once ready.", meta: "Blueprints, profile gating, developer matching" },
                  { id: "developer" as const, title: "Developer", icon: Code, desc: "I want founders to discover me and apply to scoped startup opportunities.", meta: "Skills, portfolio signal, applications" },
                ].map(({ id, title, icon: Icon, desc, meta }) => {
                  const active = role === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setRole(id)}
                      className="rounded-[8px] border bg-white p-5 text-left transition hover:-translate-y-0.5"
                      style={{
                        borderColor: active ? BRAND_MID : "rgba(15,28,24,0.1)",
                        boxShadow: active ? "0 16px 34px rgba(66,132,117,0.14)" : "0 10px 26px rgba(15,28,24,0.05)",
                      }}
                    >
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

            {step === 1 && (
              <motion.div key="account" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="First name" value={account.firstName} onChange={(value) => setAccountField("firstName", value)} placeholder="Sara" />
                  <TextInput label="Last name" value={account.lastName} onChange={(value) => setAccountField("lastName", value)} placeholder="Ahmed" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="Email" type="email" value={account.email} onChange={(value) => setAccountField("email", value)} placeholder="you@example.com" />
                  <TextInput label="Confirm email" type="email" value={account.confirmEmail} onChange={(value) => setAccountField("confirmEmail", value)} placeholder="Confirm email" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={account.password}
                    onChange={(value) => setAccountField("password", value)}
                    placeholder="Minimum 8 characters"
                    right={
                      <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#0f1c18]/45 hover:bg-[#f0f5f2]" aria-label={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? <EyeSlash size={17} /> : <Eye size={17} />}
                      </button>
                    }
                  />
                  <TextInput label="Confirm password" type={showPassword ? "text" : "password"} value={account.confirmPassword} onChange={(value) => setAccountField("confirmPassword", value)} placeholder="Confirm password" />
                </div>
                <label className="flex cursor-pointer items-start gap-3 text-[12px] leading-5" style={{ color: "rgba(15,28,24,0.58)" }}>
                  <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-[#0f1c18]/20 accent-[#1a312c]" />
                  <span>
                    I agree to the <a href="#" className="font-bold text-[#428475]">Terms</a> and <a href="#" className="font-bold text-[#428475]">Privacy Policy</a>.
                  </span>
                </label>
              </motion.div>
            )}

            {step === 2 && role === "founder" && (
              <motion.div key="founder" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-4">
                <div className="rounded-lg border bg-white p-4" style={{ borderColor: "rgba(15,28,24,0.1)" }}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[12px] font-bold" style={{ color: BRAND_INK }}>Profile completion</span>
                    <span className="text-[12px] font-bold" style={{ color: BRAND_MID }}>{profileCompleteness}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#e8ede9]"><div className="h-2 rounded-full" style={{ width: `${profileCompleteness}%`, background: BRAND_MID }} /></div>
                </div>
                <TextInput label="Founder headline" value={founder.bio} onChange={(value) => setFounderField("bio", value)} placeholder="Building the future of healthcare diagnostics" />
                <div>
                  <span className="mb-2 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>Domains</span>
                  <ChoiceGrid items={DOMAINS} selected={founder.domains} onToggle={toggleFounderDomain} />
                </div>
                <div>
                  <span className="mb-2 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>Current stage</span>
                  <ChoiceGrid items={FOUNDER_STAGES} selected={founder.stage ? [founder.stage] : []} multi={false} onToggle={(value) => setFounderField("stage", value)} />
                </div>
                <TextArea label="Startup idea summary" value={founder.idea} onChange={(value) => setFounderField("idea", value)} placeholder="Describe the problem, target customer, and the outcome your product should create." />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="LinkedIn (optional)" value={founder.linkedIn} onChange={(value) => setFounderField("linkedIn", value)} placeholder="https://linkedin.com/in/..." />
                  <TextInput label="Phone (optional)" value={founder.phone} onChange={(value) => setFounderField("phone", value)} placeholder="+92 300 0000000" />
                </div>
              </motion.div>
            )}

            {step === 2 && role === "developer" && (
              <motion.div key="developer" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-4">
                <div className="rounded-lg border bg-white p-4" style={{ borderColor: "rgba(15,28,24,0.1)" }}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[12px] font-bold" style={{ color: BRAND_INK }}>Profile strength</span>
                    <span className="text-[12px] font-bold" style={{ color: BRAND_MID }}>{profileCompleteness}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#e8ede9]"><div className="h-2 rounded-full" style={{ width: `${profileCompleteness}%`, background: BRAND_MID }} /></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="Professional role" value={developer.jobTitle} onChange={(value) => setDeveloperField("jobTitle", value)} placeholder="Full Stack Developer" />
                  <TextInput label="Location" value={developer.location} onChange={(value) => setDeveloperField("location", value)} placeholder="Islamabad, Pakistan" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>Experience</span>
                    <select value={developer.experience} onChange={(event) => setDeveloperField("experience", event.target.value)} className="h-11 w-full rounded-lg border bg-white px-4 text-[14px] outline-none focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20" style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}>
                      <option value="">Select experience</option>
                      {["< 1 year", "1-2 years", "3-5 years", "5-8 years", "8+ years"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>Preferred work type</span>
                    <select value={developer.workType} onChange={(event) => setDeveloperField("workType", event.target.value)} className="h-11 w-full rounded-lg border bg-white px-4 text-[14px] outline-none focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20" style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}>
                      {WORK_TYPES.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                </div>
                <div>
                  <span className="mb-2 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>Core skills</span>
                  <ChoiceGrid items={SKILLS} selected={developer.skills} onToggle={toggleSkill} />
                </div>
                <TextArea label="Professional summary" value={developer.bio} onChange={(value) => setDeveloperField("bio", value)} placeholder="Summarize the products you build, your strongest stack, and the startup environments you prefer." />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="GitHub (optional)" value={developer.github} onChange={(value) => setDeveloperField("github", value)} placeholder="https://github.com/..." />
                  <TextInput label="LinkedIn (optional)" value={developer.linkedIn} onChange={(value) => setDeveloperField("linkedIn", value)} placeholder="https://linkedin.com/in/..." />
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Bottom Button Bar */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between px-8 sm:px-10 xl:px-14 pt-8 pb-12 xl:pb-16">
          <div className="w-full max-w-[580px] mx-auto flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => step === 0 ? router.push("/") : setStep((current) => current - 1)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-[13.5px] font-bold transition hover:bg-black/5"
              style={{ color: "rgba(15,28,24,0.6)" }}
            >
              <ArrowLeft size={15} weight="bold" />
              {step === 0 ? "Back home" : "Back"}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => finish(true)}
                  className="h-11 rounded-xl border bg-white px-5 text-[13.5px] font-bold transition hover:bg-gray-50"
                  style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_MID }}
                >
                  Skip for now
                </button>
              )}
              <motion.button
                whileHover={{ scale: 1.012 }}
                whileTap={{ scale: 0.988 }}
                type="button"
                onClick={step < 2 ? goNext : () => finish(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl px-7 text-[13.5px] font-semibold transition-all"
                style={{ background: BRAND_INK, color: BRAND_MINT, boxShadow: "0 4px 14px rgba(15,28,24,0.18)" }}
              >
                {step < 2 ? "Continue" : "Complete profile"}
                {step < 2 ? <ArrowRight size={15} weight="bold" /> : role === "founder" ? <RocketLaunch size={15} weight="bold" /> : <Briefcase size={15} weight="bold" />}
              </motion.button>
            </div>
          </div>
        </div>

        {step === 2 && (
          <div className="px-8 sm:px-10 xl:px-14 pb-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-[580px] flex items-start gap-3 rounded-xl border bg-white px-4 py-3" style={{ borderColor: "rgba(15,28,24,0.1)" }}>
              <UserCircle size={18} weight="fill" color={BRAND_MID} className="mt-0.5 shrink-0" />
              <p className="text-[12px] leading-5" style={{ color: "rgba(15,28,24,0.58)" }}>
                {role === "founder"
                  ? "Skipped founder profiles can create and save private blueprints, but publishing, developer outreach, and investor sharing stay locked."
                  : "Skipped developer profiles can enter the dashboard, but discovery visibility, applications, and network actions require profile completion."}
              </p>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
