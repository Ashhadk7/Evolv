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
  const labels = ["Role", "Account", role === "developer" ? "Developer profile" : "Founder profile"];
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

function SidePanel({ role }: { role: Role | "" }) {
  const points = role === "developer"
    ? ["Build a profile founders can evaluate quickly", "Get matched by stack, availability, and venture fit", "Apply to blueprint-backed projects"]
    : ["Generate private blueprints immediately", "Publish only after profile completion", "Unlock developers and investor-ready sharing"];

  return (
    <aside className="relative hidden min-h-screen overflow-hidden lg:flex lg:w-[42%]" style={{ background: BRAND_DARK }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(137,215,183,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(135deg, black 30%, rgba(0,0,0,0.6) 70%, transparent 100%)",
        }}
      />
      <div className="relative z-10 flex w-full flex-col px-10 py-9 xl:px-14">
        <Logo dark />
        <div className="my-auto">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase" style={{ background: "rgba(137,215,183,0.1)", border: "1px solid rgba(137,215,183,0.18)", color: BRAND_MINT }}>
            <Sparkle size={12} weight="fill" />
            Guided onboarding
          </div>
          <h2 className="max-w-[470px] text-[2.15rem] font-bold leading-[1.08]" style={{ color: BRAND_CREAM }}>
            Create the right account before you enter the marketplace.
          </h2>
          <p className="mt-4 max-w-[420px] text-[14px] leading-6" style={{ color: "rgba(255,244,225,0.58)" }}>
            Evolv separates founder and developer workflows so profiles, matching, publishing, and applications start with the right context.
          </p>

          <div className="mt-8 rounded-[8px] p-4" style={{ background: "rgba(11,26,22,0.72)", border: "1px solid rgba(137,215,183,0.16)" }}>
            {points.map((point, index) => (
              <div key={point} className="flex gap-3 py-3" style={{ borderBottom: index < points.length - 1 ? "1px solid rgba(137,215,183,0.1)" : undefined }}>
                <CheckCircle size={18} weight="fill" color={BRAND_MINT} className="mt-0.5 shrink-0" />
                <span className="text-[13px] leading-5" style={{ color: "rgba(255,244,225,0.76)" }}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
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
    <div className="min-h-screen w-full lg:flex" style={{ background: "#f5f6f4" }}>
      <SidePanel role={role} />

      <main className="flex min-h-screen flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-[650px]">
          <div className="mb-8 flex items-center justify-between">
            <Logo />
            <Link href="/sign-in" className="text-[13px] font-bold transition hover:text-[#0f1c18]" style={{ color: BRAND_MID }}>
              Sign in
            </Link>
          </div>

          <Progress step={step} role={role} />

          <div className="mb-6">
            <h1 className="text-[2rem] font-bold leading-tight" style={{ color: BRAND_INK }}>
              {step === 0 ? "What kind of account are you creating?" : step === 1 ? "Create your login" : role === "founder" ? "Shape your founder profile" : "Build your developer profile"}
            </h1>
            <p className="mt-2 max-w-[560px] text-[14px] leading-6" style={{ color: "rgba(15,28,24,0.56)" }}>
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
              <motion.div key="role" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-3 md:grid-cols-2">
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
              <motion.div key="account" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-4">
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

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => step === 0 ? router.push("/") : setStep((current) => current - 1)}
              className="flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-bold transition hover:bg-white"
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
                  className="h-11 rounded-lg border bg-white px-4 text-[13px] font-bold transition hover:border-[#428475]/40"
                  style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_MID }}
                >
                  Skip for now
                </button>
              )}
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={step < 2 ? goNext : () => finish(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-[13px] font-bold"
                style={{ background: BRAND_INK, color: BRAND_MINT, boxShadow: "0 14px 32px rgba(15,28,24,0.16)" }}
              >
                {step < 2 ? "Continue" : role === "founder" ? "Complete founder profile" : "Complete developer profile"}
                {step < 2 ? <ArrowRight size={15} weight="bold" /> : role === "founder" ? <RocketLaunch size={15} weight="bold" /> : <Briefcase size={15} weight="bold" />}
              </motion.button>
            </div>
          </div>

          {step === 2 && (
            <div className="mt-5 flex items-start gap-3 rounded-lg border bg-white px-4 py-3" style={{ borderColor: "rgba(15,28,24,0.1)" }}>
              <UserCircle size={18} weight="fill" color={BRAND_MID} className="mt-0.5 shrink-0" />
              <p className="text-[12px] leading-5" style={{ color: "rgba(15,28,24,0.58)" }}>
                {role === "founder"
                  ? "Skipped founder profiles can create and save private blueprints, but publishing, developer outreach, and investor sharing stay locked."
                  : "Skipped developer profiles can enter the dashboard, but discovery visibility, applications, and network actions require profile completion."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
