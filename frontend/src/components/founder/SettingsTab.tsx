"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bell,
  UploadSimple,
  Check,
  MagnifyingGlass,
  X,
  PencilSimple,
  MapPin,
  Briefcase,
  EnvelopeSimple,
  Phone,
  GraduationCap,
  LinkedinLogo,
  CalendarBlank,
  GlobeHemisphereWest,
  Sparkle,
  CheckCircle,
  LinkSimple,
  Plus,
  Trash,
  CreditCard,
  LockKey,
  SlidersHorizontal,
  WarningCircle,
  ShieldCheck,
  CurrencyDollar,
} from "@phosphor-icons/react";
import type { FounderProfile } from "./OnboardingWizard";
import {
  EDUCATION_LEVELS,
  createBlankEducation,
  formatFounderEducation,
  formatFounderEducations,
  getDegreeOptions,
  getFounderEducationSummary,
  getFounderEducations,
  isFounderProfileComplete,
  normalizeFounderProfileForSave,
  type FounderEducation,
} from "./profileUtils";

// ── Design tokens ─────────────────────────────────────────────────────────────
const INK        = "#1a312c";
const DARK       = "#1a312c";   // sidebar BG — used for selected chips
const MINT       = "#89d7b7";
const MID        = "#428475";
const TEXT_BODY  = "#1a2e26";
const TEXT_MUTED = "#7a9e8e";
const TEXT_DIM   = "#b0c0b8";
const BORDER     = "#e0e9e3";
const FIELD_BG   = "#f5f7f5";
const CLEAR      = "rgba(0,0,0,0)";

// ── Domain data (matches signup ALL_DOMAINS) ─────────────────────────────────
const SUGGESTED_DOMAINS = ["AI", "SaaS", "FinTech", "MedTech", "CleanTech", "EdTech", "Web3", "E-commerce"];
const ALL_DOMAINS = [
  "AI", "SaaS", "FinTech", "MedTech", "CleanTech", "EdTech", "Web3", "E-commerce",
  "HealthTech", "AgriTech", "LegalTech", "PropTech", "InsurTech", "RetailTech",
  "CyberSecurity", "IoT", "Blockchain", "Gaming", "Social Media", "DeepTech",
  "SpaceTech", "FoodTech", "TravelTech", "HRTech", "MarketingTech", "B2B",
];

// ── Toggle switch ──────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative shrink-0 rounded-full transition-colors duration-200"
      style={{ width: 36, height: 20, background: on ? DARK : "#dde5e0" }}
      aria-pressed={on}
    >
      <motion.span
        className="absolute left-[2px] top-[2px] h-4 w-4 rounded-full bg-white shadow-sm"
        animate={{ x: on ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
      />
    </button>
  );
}

// ── Field ──────────────────────────────────────────────────────────────────────
function Field({
  label, type = "text", value, onChange, placeholder, optional,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; optional?: boolean;
}) {
  const base = "w-full rounded-lg px-4 py-2.5 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/30 focus:border-[#428475]";
  const style = { background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY };

  return (
    <div>
      <label className="flex items-center gap-1 text-[11px] font-semibold mb-1.5" style={{ color: TEXT_MUTED }}>
        {label}
        {optional && <span className="text-[10px] font-normal" style={{ color: TEXT_DIM }}>(optional)</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          className={base} style={{ ...style, minHeight: 76, resize: "none" }}
          value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        />
      ) : type === "select" ? (
        <select
          className={base} style={style}
          value={value} onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          <option>Male</option>
          <option>Female</option>
          <option>Non-binary</option>
          <option>Prefer not to say</option>
        </select>
      ) : (
        <input
          type={type} className={base} style={style}
          value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        />
      )}
    </div>
  );
}

// ── DomainSearch (matches signup page — consistent UX) ────────────────────────
function DomainSearch({ selected, onToggle }: { selected: string[]; onToggle: (d: string) => void }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const suggestions = query.trim()
    ? ALL_DOMAINS.filter((d) => d.toLowerCase().includes(query.toLowerCase()) && !selected.includes(d))
    : SUGGESTED_DOMAINS.filter((d) => !selected.includes(d));

  return (
    <div>
      <p className="text-[11px] font-semibold mb-2" style={{ color: TEXT_MUTED }}>
        Domains / Interests
      </p>

      {/* Selected chips */}
      <AnimatePresence initial={false}>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex flex-wrap gap-2"
          >
            {selected.map((d) => (
              <motion.span
                key={d}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
                style={{ background: DARK, color: MINT, border: `1px solid rgba(137,215,183,0.2)` }}
              >
                {d}
                <button
                  type="button"
                  onClick={() => onToggle(d)}
                  className="flex items-center justify-center rounded-full transition hover:opacity-60"
                  aria-label={`Remove ${d}`}
                >
                  <X size={10} weight="bold" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search input */}
      <div
        className="mb-3 flex h-10 items-center gap-2.5 rounded-lg border bg-white px-3.5 transition-all"
        style={{
          borderColor: focused ? MID : BORDER,
          boxShadow: focused ? "0 0 0 3px rgba(137,215,183,0.18)" : "none",
        }}
      >
        <MagnifyingGlass size={14} weight="regular" className="shrink-0" style={{ color: TEXT_DIM }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search all domains…"
          className="flex-1 bg-transparent text-[13px] outline-none"
          style={{ color: TEXT_BODY }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="shrink-0 rounded-full p-0.5 transition hover:bg-black/5"
          >
            <X size={11} weight="bold" style={{ color: TEXT_DIM }} />
          </button>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 ? (
        <div>
          {!query && (
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_DIM }}>
              Suggested
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((d) => (
              <motion.button
                key={d}
                type="button"
                onClick={() => onToggle(d)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="rounded-full border bg-white px-3 py-1.5 text-[12px] font-semibold cursor-pointer transition-colors"
                style={{ borderColor: BORDER, color: TEXT_MUTED }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = MID;
                  e.currentTarget.style.color = MID;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.color = TEXT_MUTED;
                }}
              >
                + {d}
              </motion.button>
            ))}
          </div>
        </div>
      ) : query && suggestions.length === 0 ? (
        <p className="text-[12px]" style={{ color: TEXT_DIM }}>No domains matched &ldquo;{query}&rdquo;</p>
      ) : null}
    </div>
  );
}

// ── ProfileSection ────────────────────────────────────────────────────────────
function EducationEditor({
  educations,
  onChange,
}: {
  educations: FounderEducation[];
  onChange: (next: FounderEducation[]) => void;
}) {
  const update = (id: string, patch: Partial<FounderEducation>) => {
    onChange(educations.map((education) => {
      if (education.id !== id) return education;
      const next = { ...education, ...patch };
      if (patch.level !== undefined) {
        next.degree = "";
        next.customDegree = "";
      }
      if (patch.degree && patch.degree !== "Other") next.customDegree = "";
      return next;
    }));
  };

  return (
    <div className="flex flex-col gap-3">
      {educations.map((education, index) => {
        const degreeOptions = getDegreeOptions(education.level);
        return (
          <div key={education.id} className="rounded-xl border bg-white p-4" style={{ borderColor: BORDER }}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[12px] font-bold" style={{ color: TEXT_BODY }}>
                <GraduationCap size={14} weight="bold" style={{ color: MID }} />
                Education {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onChange(educations.filter((item) => item.id !== education.id))}
                className="rounded-lg p-1.5 transition hover:bg-red-50"
                aria-label="Remove education"
                style={{ color: "#c0392b" }}
              >
                <Trash size={14} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>Education level</span>
                <select
                  value={education.level}
                  onChange={(event) => update(education.id, { level: event.target.value })}
                  className="h-10 w-full rounded-lg px-3 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/30"
                  style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
                >
                  <option value="">Select level</option>
                  {EDUCATION_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>Degree / program</span>
                <select
                  value={education.degree}
                  onChange={(event) => update(education.id, { degree: event.target.value })}
                  disabled={!education.level}
                  className="h-10 w-full rounded-lg px-3 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/30 disabled:cursor-not-allowed disabled:text-[#1a2e26]/35"
                  style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
                >
                  <option value="">{education.level ? "Select degree" : "Select level first"}</option>
                  {degreeOptions.map((degree) => (
                    <option key={degree} value={degree}>{degree}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className={`mt-3 grid gap-3 ${education.degree === "Other" ? "sm:grid-cols-2" : ""}`}>
              {education.degree === "Other" && (
                <input
                  value={education.customDegree ?? ""}
                  onChange={(event) => update(education.id, { customDegree: event.target.value })}
                  placeholder="Write degree name"
                  className="h-10 rounded-lg px-3 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/30"
                  style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
                />
              )}
              <input
                value={education.school ?? ""}
                onChange={(event) => update(education.id, { school: event.target.value })}
                placeholder="School / university"
                className="h-10 rounded-lg px-3 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/30"
                style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...educations, createBlankEducation()])}
        className="flex h-10 items-center justify-center gap-2 rounded-xl border bg-white text-[12px] font-bold transition hover:bg-[#f8faf8]"
        style={{ borderColor: BORDER, color: MID }}
      >
        <Plus size={14} weight="bold" />
        Add education
      </button>
    </div>
  );
}

function getProfileName(profile: FounderProfile) {
  return `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "Founder Profile";
}

function getProfileInitials(profile: FounderProfile) {
  return `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() || "F";
}

function normalizeUrl(value: string) {
  if (!value.trim()) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function ProfileDetailRow({
  Icon,
  label,
  value,
  href,
}: {
  Icon: ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  if (!value) return null;

  const content = (
    <>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: "#edf5f1", color: MID }}
      >
        <Icon size={15} weight="bold" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_DIM }}>
          {label}
        </span>
        <span className="block truncate text-[12px] font-semibold" style={{ color: TEXT_BODY }}>
          {value}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noreferrer"
        whileHover={{ x: 2, backgroundColor: "#f8fbf9" }}
        className="flex items-center gap-3 px-3.5 py-2.5 transition-colors"
        style={{ borderRadius: 8 }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div
      whileHover={{ x: 2, backgroundColor: "#f8fbf9" }}
      className="flex items-center gap-3 px-3.5 py-2.5 transition-colors"
      style={{ borderRadius: 8 }}
    >
      {content}
    </motion.div>
  );
}

function ProfileAvatar({
  avatarUrl,
  fullName,
  initials,
  size = 112,
}: {
  avatarUrl?: string;
  fullName: string;
  initials: string;
  size?: number;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full font-extrabold"
      style={{
        width: size,
        height: size,
        fontSize: size > 80 ? 34 : 14,
        background: `linear-gradient(135deg, #4cb896, ${MINT})`,
        color: INK,
        border: "4px solid #ffffff",
        boxShadow: "0 12px 34px rgba(15,28,24,0.16)",
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={`${fullName} profile`} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

function ProfileSection({
  profile,
  onSave,
  startEditingSignal = 0,
}: {
  profile: FounderProfile;
  onSave: (p: FounderProfile) => void;
  startEditingSignal?: number;
}) {
  const [local, setLocal] = useState<FounderProfile>(profile);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeDomains = Array.isArray(local.domains) ? local.domains : [];
  const safeEducations = getFounderEducations(local);
  const educationItems = safeEducations.map(formatFounderEducation).filter(Boolean);
  const educationSummary = getFounderEducationSummary(local);
  const fullName = getProfileName(local);
  const initials = getProfileInitials(local);
  const headline = local.headline?.trim() || local.bio?.trim() || "Founder building on Evolv";
  const bioText = local.bio?.trim() || "Add a short bio to introduce yourself to developers and collaborators.";
  const cityCountryParts: string[] = [];
  [local.city, local.country].forEach((item) => {
    const value = item?.trim();
    if (value && !cityCountryParts.some((part) => part.toLowerCase() === value.toLowerCase())) {
      cityCountryParts.push(value);
    }
  });
  const cityCountry = cityCountryParts.join(", ");
  const locationText = cityCountry || local.location?.trim() || local.country?.trim() || "Evolv Network";
  const founderFocus = safeDomains[0] ? `${safeDomains[0]} founder` : local.primaryGoal?.trim() || "Startup founder";
  const normalizedLinkedin = normalizeUrl(local.linkedin);
  const completionItems = [
    local.firstName,
    local.lastName,
    local.headline,
    local.bio,
    safeDomains.length ? "domains" : "",
    educationSummary,
    local.linkedin,
  ];
  const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

  const set = (key: keyof FounderProfile, val: string) => setLocal((p) => ({ ...p, [key]: val }));

  useEffect(() => {
    if (editing) return;
    let active = true;
    queueMicrotask(() => {
      if (active) setLocal(profile);
    });
    return () => { active = false; };
  }, [editing, profile]);

  useEffect(() => {
    if (startEditingSignal <= 0) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setLocal(profile);
      setEditing(true);
    });
    return () => { active = false; };
  }, [profile, startEditingSignal]);

  const toggleDomain = (d: string) =>
    setLocal((p) => {
      const domains = Array.isArray(p.domains) ? p.domains : [];
      return {
        ...p,
        domains: domains.includes(d) ? domains.filter((x) => x !== d) : [...domains, d],
      };
    });

  const handleSave = () => {
    onSave(normalizeFounderProfileForSave({ ...local, domains: safeDomains, educations: safeEducations }) as FounderProfile);
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const handleEducationsChange = (next: FounderEducation[]) => {
    setLocal((current) => ({
      ...current,
      educations: next,
      education: formatFounderEducations(next),
    }));
  };

  const handleCancel = () => {
    setLocal(profile);
    setEditing(false);
  };

  const handlePhotoUpload = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLocal((p) => ({ ...p, avatarUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative flex flex-col gap-5 pb-10">
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="absolute right-0 top-0 z-20 flex items-center gap-2 px-3 py-2 text-[12px] font-bold"
            style={{
              background: "#e8f5ef",
              color: "#2e7d5c",
              border: "1px solid #cde8da",
              borderRadius: 8,
              boxShadow: "0 10px 26px rgba(15,28,24,0.10)",
            }}
          >
            <Check size={14} weight="bold" />
            Saved changes
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {!editing ? (
          <motion.div
            key="profile-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col gap-6 pb-2"
          >
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ boxShadow: "0 20px 48px rgba(15,28,24,0.10)" }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="overflow-hidden bg-white"
              style={{ border: "1.5px solid #d4e4db", borderRadius: 8 }}
            >
              <div
                className="relative h-36"
                style={{
                  background: `linear-gradient(135deg, ${INK} 0%, ${MID} 58%, ${MINT} 140%)`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div className="absolute bottom-5 left-8 flex max-w-[calc(100%-4rem)] items-center gap-2 rounded-full bg-white/12 px-5 py-2.5 backdrop-blur">
                  <Sparkle size={13} weight="fill" style={{ color: MINT }} />
                  <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "#e8f4ef" }}>
                    Public Founder Profile
                  </span>
                </div>
              </div>

              <div className="relative px-9 pb-10">
                <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="pl-6" style={{marginTop:"1rem", marginBottom:"1rem"}}><ProfileAvatar avatarUrl={local.avatarUrl} fullName={fullName} initials={initials} /></div>

                  <div className="flex flex-wrap gap-2 sm:pb-2">
                    {normalizedLinkedin && (
                      <motion.a
                        href={normalizedLinkedin}
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 rounded-lg border bg-white px-3.5 py-2 text-[12px] font-bold"
                        style={{ borderColor: BORDER, color: MID, paddingLeft: '1rem', paddingRight: '1rem' }}
                      >
                        <LinkedinLogo size={15} weight="bold" />
                        LinkedIn
                      </motion.a>
                    )}
                    <motion.button
                      type="button"
                      onClick={() => setEditing(true)}
                      whileHover={{ y: -2, boxShadow: "0 8px 18px rgba(26,49,44,0.18)" }}
                      whileTap={{ scale: 0.98 }}
                      className="bp-gradient-btn flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold"
                      style={{ background: INK, color: MINT, marginRight: '1rem' }}
                    >
                      <PencilSimple size={15} weight="bold" />
                      Edit Profile
                    </motion.button>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="pl-6 text-[1.55rem] font-extrabold leading-tight" style={{ color: TEXT_BODY }}>
                      {fullName}
                    </h3>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                      style={{ background: "#edf5f1", color: MID }}
                    >
                      <CheckCircle size={12} weight="fill" />
                      Founder
                    </span>
                  </div>
                  <p className="pl-6 mt-2 text-[12px] font-bold uppercase tracking-widest" style={{ color: TEXT_MUTED }}>
                    Professional Role
                  </p>
                  <p className="pl-6 mt-1 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>
                    Founder
                  </p>
                  <p className="pl-6 mt-2 max-w-2xl text-[14px] font-semibold leading-6" style={{ color: "#334d42" }}>
                    {headline}
                  </p>
                  <div className="mb-4 mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 py-1.5 text-[12px]" style={{ color: TEXT_MUTED }}>
                    <span className="pl-6 flex items-center gap-1.5 leading-5">
                      <Briefcase size={13} weight="bold" />
                      {founderFocus}
                    </span>
                    <span className="flex items-center gap-1.5 leading-5">
                      <MapPin size={13} weight="bold" />
                      {locationText}
                    </span>
                    {local.email && (
                      <span className="flex items-center gap-1.5 leading-5">
                        <EnvelopeSimple size={13} weight="bold" />
                        {local.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-6 pl-6 mt-8 grid gap-2 sm:grid-cols-3">
                  {[
                    { label: "Profile strength", value: `${completion}%`, detail: "Public readiness" },
                    { label: "Focus areas", value: `${safeDomains.length}`, detail: safeDomains.slice(0, 2).join(" / ") || "Add domains" },
                    { label: "Visibility", value: isFounderProfileComplete(local) ? "Live" : "Draft", detail: "Founder network" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2, borderColor: "#c5ddd0" }}
                      className="bg-[#f8faf8] px-5 py-5"
                      style={{ border: "1.5px solid #d8e7df",marginRight: "1.5rem",borderRadius: 8, boxShadow: "0 8px 20px rgba(15,28,24,0.04)" }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_DIM }}>
                        {item.label}
                      </p>
                      <p className="mt-2 text-[20px] font-extrabold leading-none" style={{ color: TEXT_BODY }}>
                        {item.value}
                      </p>
                      <p className="mt-2 truncate text-[11px]" style={{ color: TEXT_MUTED }}>
                        {item.detail}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr] ">
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="bg-white p-7"
                style={{ border: "1.5px solid #d4e4db", borderRadius: 8 , marginBottom: 30}}
              >
                <div className="mb-2 flex items-center justify-between gap-5">
                  <div>
                    <h4 className="text-[14px] font-extrabold" style={{ color: TEXT_BODY }}>Bio</h4>
                    <p className="text-[11px]" style={{ color: TEXT_MUTED }}>The short intro people see on your profile.</p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => setEditing(true)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: "#edf5f1", color: MID }}
                    aria-label="Edit bio section"
                  >
                    <PencilSimple size={14} weight="bold" />
                  </motion.button>
                </div>
                <p className="text-[13px] leading-7" style={{ color: "#334d42" }}>
                  {bioText}
                </p>

                <div className="my-7" style={{ height: 1, marginBottom:"1rem", background: "#dfe9e3" }} />

                <div>
                  <h4 className="text-[14px] font-extrabold" style={{ color: TEXT_BODY }}>Interested Domains</h4>
                  <div className="mt-4 flex flex-wrap gap-2.5 pb-1">
                    {safeDomains.length > 0 ? (
                      safeDomains.map((domain) => (
                        <motion.span
                          key={domain}
                          whileHover={{ y: -2, backgroundColor: "#e8f5ef" }}
                          className="rounded-full px-3 py-1.5 text-[12px] font-bold"
                          style={{ background: "#f0f5f2", color: MID, border: "1px solid #dce9e2", marginTop:"0.5rem" }}
                        >
                          {domain}
                        </motion.span>
                      ))
                    ) : (
                      <span className="block py-2 text-[12px]" style={{ color: TEXT_DIM }}>Add domains to show your focus areas.</span>
                    )}
                  </div>
                </div>

                <div className="my-7" style={{ height: 1, background: "#dfe9e3" ,marginBottom:"1rem", marginTop: "0.5rem"}} />

                <div>
                  <h4 className="text-[14px] font-extrabold" style={{ color: TEXT_BODY , marginBottom:"1rem"}}>Education</h4>
                  <div className="mt-5 flex gap-4">
                    <span
                      className="mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "#edf5f1", color: MID }}
                    >
                      <GraduationCap size={17} weight="bold" />
                    </span>
                    <div className="min-w-0 flex-1">
                      {educationItems.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {educationItems.map((education) => (
                            <div
                              key={education}
                              className="rounded-lg px-3.5 py-2.5"
                              style={{ background: "#f8faf8", border: "1px solid #dfe9e3" }}
                            >
                              <p className="text-[13px] p-3 font-bold leading-5" style={{ color: TEXT_BODY }}>
                                {education}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <p className="text-[13px] font-bold" style={{ color: TEXT_BODY }}>
                            Add education
                          </p>
                          <p className="mt-1 text-[12px] leading-5" style={{ color: TEXT_MUTED }}>
                            Your education helps others understand your credibility.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.aside
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-5"
              >
                <section className="bg-white p-6" style={{ border: "1.5px solid #d4e4db", borderRadius: 8 }}>
                  <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>Contact</h4>
                  <div className="flex flex-col gap-2">
                    <ProfileDetailRow Icon={EnvelopeSimple} label="Email" value={local.email} href={local.email ? `mailto:${local.email}` : undefined} />
                    <ProfileDetailRow Icon={Phone} label="Phone" value={local.phone} href={local.phone ? `tel:${local.phone}` : undefined} />
                    <ProfileDetailRow Icon={LinkedinLogo} label="LinkedIn" value={local.linkedin} href={normalizedLinkedin || undefined} />
                    {!local.email && !local.phone && !local.linkedin && (
                      <p className="px-3.5 py-2.5 text-[12px]" style={{ color: TEXT_DIM }}>Add contact links in edit mode.</p>
                    )}
                  </div>
                </section>

                <section className="bg-white p-6" style={{ border: "1.5px solid #d4e4db", borderRadius: 8 , marginBottom: 30}}>
                  <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>Profile Details</h4>
                  <div className="flex flex-col gap-2">
                    <ProfileDetailRow Icon={GlobeHemisphereWest} label="Network" value="Founder on Evolv" />
                    <ProfileDetailRow Icon={Briefcase} label="Role" value="Founder" />
                    <ProfileDetailRow Icon={LinkSimple} label="Top domain" value={safeDomains[0] || "Add a domain"} />
                  </div>
                </section>
              </motion.aside>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="profile-edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col gap-4 pb-10"
          >
            <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <ProfileAvatar avatarUrl={local.avatarUrl} fullName={fullName} initials={initials} size={74} />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full"
                      style={{
                        background: "linear-gradient(180deg, #244b42 0%, #18382f 55%, #102b24 100%)",
                        border: "3px solid #fff",
                        color: MINT,
                        boxShadow: "0 8px 18px -12px rgba(9,32,26,0.72)",
                      }}
                      title="Upload photo"
                    >
                      <UploadSimple size={13} weight="bold" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_DIM }}>
                      Profile Editor
                    </p>
                    <h3 className="mt-1 text-[1.05rem] font-extrabold" style={{ color: TEXT_BODY }}>
                      {fullName}
                    </h3>
                    <p className="text-[12px]" style={{ color: TEXT_MUTED }}>
                      Edit each section, then save to refresh the public view.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border bg-white px-3.5 py-2 p-6 text-[12px] font-bold transition hover:bg-[#f8faf8]"
                  style={{ borderColor: BORDER, color: TEXT_MUTED }}
                >
                  Cancel
                </button>
              </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-2">
              <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>Public Identity</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name" value={local.firstName} onChange={(v) => set("firstName", v)} placeholder="Sara" />
                  <Field label="Last Name" value={local.lastName} onChange={(v) => set("lastName", v)} placeholder="Ahmed" />
                </div>
                <div className="mt-4" style={{marginTop:10}}>
                  <Field label="Founder Headline" value={local.headline ?? ""} onChange={(v) => set("headline", v)} placeholder="Building the future of healthcare" />
                </div>
                <div className="mt-4" style={{marginTop:10}}>
                  <Field label="Short Bio" value={local.bio} onChange={(v) => set("bio", v)} placeholder="Tell collaborators what you are building and why it matters." />
                </div>
                <div className="mt-4" style={{marginTop:10}}>
                  <Field label="Email" type="email" value={local.email} onChange={(v) => set("email", v)} placeholder="you@example.com" />
                </div>
              </section>

              <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>Domains</h4>
                <DomainSearch selected={safeDomains} onToggle={toggleDomain} />
              </section>

              <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>Links & Background</h4>
                <div className="flex flex-col gap-4">
                  <Field label="LinkedIn Profile" value={local.linkedin} onChange={(v) => set("linkedin", v)} placeholder="https://linkedin.com/in/yourname" optional />
                  <Field label="Phone Number" value={local.phone} onChange={(v) => set("phone", v)} placeholder="+92 300 0000000" />
                  <EducationEditor educations={safeEducations} onChange={handleEducationsChange} />
                </div>
              </section>

              <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>Private Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date of Birth" type="date" value={local.dob} onChange={(v) => set("dob", v)} />
                  <Field label="Gender" type="select" value={local.gender} onChange={(v) => set("gender", v)} optional />
                </div>
                <div className="mt-4 flex items-start gap-3 rounded-lg px-3 py-3" style={{ background: "#f8faf8", border: "1px solid #edf1ee", marginTop: 10}}>
                  <CalendarBlank size={15} weight="bold" style={{ color: MID, marginTop: 1 }} />
                  <p className="text-[11px] leading-5" style={{ color: TEXT_MUTED }}>
                    Birthday and gender help account context, but they are not shown on the public profile preview.
                  </p>
                </div>
              </section>
            </div>

            <motion.button
              type="button"
              onClick={handleSave}
              whileHover={{ y: -2, boxShadow: "0 10px 26px rgba(26,49,44,0.22)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="bp-gradient-btn mb-2 flex items-center justify-center gap-2 rounded-lg py-3 text-[13px] font-extrabold"
              style={{ background: INK, color: MINT, marginBottom: 35 }}
            >
              <Check size={15} weight="bold" />
              Save Changes
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── NotificationsSection ───────────────────────────────────────────────────────
function NotificationsSection() {
  const [notifs, setNotifs] = useState({
    developerMatch: true, investorView: true, blueprintComment: false,
    weeklyDigest: true, billingAlerts: true, interestRequest: true,
    messageReceived: true, productUpdates: false,
  });

  const toggle = (key: keyof typeof notifs) => setNotifs((n) => ({ ...n, [key]: !n[key] }));

  const groups = [
    {
      title: "Matches & Connections",
      items: [
        { key: "developerMatch" as const,  label: "New developer match",       desc: "Get notified when a developer matches your blueprint" },
        { key: "interestRequest" as const, label: "Interest request",          desc: "When a developer sends an interest request" },
        { key: "investorView" as const,    label: "Investor viewed blueprint", desc: "When an investor views your public blueprint" },
      ],
    },
    {
      title: "Messages & Activity",
      items: [
        { key: "messageReceived" as const,  label: "New message",         desc: "When someone sends you a message in Inbox" },
        { key: "blueprintComment" as const, label: "Blueprint comments",  desc: "Comments and feedback on your blueprints" },
      ],
    },
    {
      title: "Account & Billing",
      items: [
        { key: "billingAlerts" as const,  label: "Billing alerts",   desc: "Payment due, invoice ready, subscription changes" },
        { key: "weeklyDigest" as const,   label: "Weekly digest",    desc: "Weekly summary of your portfolio activity" },
        { key: "productUpdates" as const, label: "Product updates",  desc: "New features and improvements on Evolv" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="text-[10.5px] font-bold uppercase tracking-widest mb-3" style={{ color: TEXT_DIM }}>
            {group.title}
          </p>
          <div className="rounded-xl overflow-hidden bg-white" style={{ border: `1px solid ${BORDER}` }}>
            {group.items.map(({ key, label, desc }, i) => (
              <div
                key={key}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < group.items.length - 1 ? `1px solid #eaf0eb` : "none" }}
              >
                <div className="flex-1">
                  <p className="text-[13px] font-medium" style={{ color: TEXT_BODY }}>{label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTED }}>{desc}</p>
                </div>
                <Toggle on={notifs[key]} onChange={() => toggle(key)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Main export                                                 */
/* ────────────────────────────────────────────────────────── */

function PaymentSection({ profile, onSave }: { profile: FounderProfile; onSave: (p: FounderProfile) => void }) {
  const [saved, setSaved] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [billing, setBilling] = useState({
    plan: "Founder Launch",
    billingEmail: profile.email || "",
    currency: "USD",
    budgetRange: "$50K - $100K",
    companyName: "My Startup",
  });

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const connectStripe = () => onSave({ ...profile, stripeConnected: true });
  const disconnectStripe = () => onSave({ ...profile, stripeConnected: false });

  return (
    <div className="flex flex-col gap-5">
      <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <LinkSimple size={16} weight="bold" style={{ color: MID }} />
            <h4 className="text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>Stripe Connect</h4>
          </div>
          {profile.stripeConnected && (
            <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "#e8f5ef", color: "#1d6e47" }}>
              <CheckCircle size={12} weight="fill" /> Connected
            </span>
          )}
        </div>
        <p className="mb-4 text-[12.5px] leading-relaxed" style={{ color: TEXT_MUTED }}>
          Connect a Stripe account so you can pay developers per milestone. Funds route through Evolv&apos;s platform account, the platform fee is deducted, and the rest is released to the developer.
        </p>
        {profile.stripeConnected ? (
          <button
            type="button"
            onClick={disconnectStripe}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-[13px] font-bold"
            style={{ borderColor: BORDER, color: TEXT_MUTED, background: "#fff" }}
          >
            Disconnect Stripe account
          </button>
        ) : (
          <button
            type="button"
            onClick={connectStripe}
            className="bp-gradient-btn flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-extrabold"
            style={{ background: INK, color: MINT }}
          >
            <LinkSimple size={15} weight="bold" /> Connect Stripe account
          </button>
        )}
      </section>

      <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
        <div className="mb-4 flex items-center gap-2">
          <CreditCard size={16} weight="bold" style={{ color: MID }} />
          <h4 className="text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>Payment & Billing</h4>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company / Startup Name" value={billing.companyName} onChange={(value) => setBilling((current) => ({ ...current, companyName: value }))} placeholder="Your startup" />
          <Field label="Billing Email" type="email" value={billing.billingEmail} onChange={(value) => setBilling((current) => ({ ...current, billingEmail: value }))} placeholder="billing@example.com" />
          <label>
            <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>Workspace plan</span>
            <select
              value={billing.plan}
              onChange={(event) => setBilling((current) => ({ ...current, plan: event.target.value }))}
              className="h-10 w-full rounded-lg px-3 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/30"
              style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
            >
              <option>Founder Launch</option>
              <option>Founder Growth</option>
              <option>Investor Ready</option>
              <option>Enterprise Founder Team</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>Preferred currency</span>
            <select
              value={billing.currency}
              onChange={(event) => setBilling((current) => ({ ...current, currency: event.target.value }))}
              className="h-10 w-full rounded-lg px-3 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/30"
              style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>PKR</option>
            </select>
          </label>
        </div>
      </section>

      <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
        <div className="mb-4 flex items-center gap-2">
          <CurrencyDollar size={16} weight="bold" style={{ color: MID }} />
          <h4 className="text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>Founder Funding Preferences</h4>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>Expected build budget</span>
            <select
              value={billing.budgetRange}
              onChange={(event) => setBilling((current) => ({ ...current, budgetRange: event.target.value }))}
              className="h-10 w-full rounded-lg px-3 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/30"
              style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
            >
              <option>Under $25K</option>
              <option>$25K - $50K</option>
              <option>$50K - $100K</option>
              <option>$100K - $250K</option>
              <option>$250K+</option>
            </select>
          </label>
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>Payment method</span>
            <div className="flex flex-wrap gap-2 ">
              {["card", "bank", "stripe"].map((method) => {
                const active = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className="rounded-lg border px-3.5 py-2 text-[12px] font-bold capitalize transition w-15"
                    style={{ borderColor: active ? MID : BORDER, background: active ? "#e8f5ef" : "#fff", color: active ? MID : TEXT_MUTED }}
                  >
                    {method === "card" ? "Card" : method}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={save}
          className="bp-gradient-btn mt-5 flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-extrabold"
          style={{ background: INK, color: MINT, margin:15 }}
        >
          <Check size={15} weight="bold"/>
          {saved ? "Saved" : "Save Payment Info"}
        </button>
      </section>
    </div>
  );
}

function SecuritySection() {
  const [saved, setSaved] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });

  const save = () => {
    setSaved(true);
    setPasswords({ current: "", next: "", confirm: "" });
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white p-6 sm:p-8 max-w-2xl" style={{ border: "1.5px solid #d4e4db", borderRadius: 12, boxShadow: "0 4px 20px rgba(26,49,44,0.04)" }}>
        <div className="mb-6 flex items-center gap-2">
          <LockKey size={18} weight="bold" style={{ color: MID }} />
          <h4 className="text-[14px] font-extrabold" style={{ color: TEXT_BODY }}>Security Settings</h4>
        </div>
        
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold" style={{ color: TEXT_MUTED }}>
                  Current Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password reset link sent to your email.")}
                  className="text-[11px] font-bold transition-colors hover:text-[#2e7d5c] cursor-pointer"
                  style={{ color: "#428475", background: "none", border: "none", padding: 0 }}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords((current) => ({ ...current, current: e.target.value }))}
                placeholder="Enter current password"
                className="w-full rounded-lg px-4 py-2.5 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/30 focus:border-[#428475]"
                style={{ background: "#f8faf8", border: "1px solid #d4e4db", color: "#1a2e26" }}
              />
            </div>
          </div>
          
          <Field 
            label="New Password" 
            type="password" 
            value={passwords.next} 
            onChange={(value) => setPasswords((current) => ({ ...current, next: value }))} 
            placeholder="Enter new password" 
          />
          
          <Field 
            label="Confirm New Password" 
            type="password" 
            value={passwords.confirm} 
            onChange={(value) => setPasswords((current) => ({ ...current, confirm: value }))} 
            placeholder="Confirm new password" 
          />
        </div>
        
        <div className="flex items-start gap-3 rounded-lg px-4 py-3.5" style={{ background: "#f8faf8", border: "1px solid #edf1ee", marginTop: 24 }}>
          <ShieldCheck size={16} weight="bold" style={{ color: MID, marginTop: 1 }} />
          <p className="text-[11.5px] leading-5" style={{ color: TEXT_MUTED }}>
            Protect your founder workspace, saved blueprints, activity logs, and team conversations.
          </p>
        </div>
        
        <button
          type="button"
          onClick={save}
          className="bp-gradient-btn flex h-10 items-center justify-center gap-2 rounded-lg px-6 text-[13px] font-extrabold transition-all hover:opacity-90 active:scale-95 cursor-pointer" style={{ background: INK, color: MINT, marginTop: 24 }}
        >
          <Check size={15} weight="bold" />
          {saved ? "Password Updated" : "Update Password"}
        </button>
      </section>
    </div>
  );
}
type FounderPrefs = {
  blueprintVisibility: string;
  founderStage: string;
  matchPriority: string;
  developerRequests: boolean;
  investorIntros: boolean;
  weeklyDigest: boolean;
};

function PreferencesSection() {
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState<FounderPrefs>({
    blueprintVisibility: "Private by default",
    founderStage: "Idea / MVP",
    matchPriority: "Technical cofounder",
    developerRequests: true,
    investorIntros: true,
    weeklyDigest: true,
  });

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={16} weight="bold" style={{ color: MID }} />
          <h4 className="text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>Founder Preferences</h4>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>Blueprint visibility</span>
            <select
              value={prefs.blueprintVisibility}
              onChange={(event) => setPrefs((current) => ({ ...current, blueprintVisibility: event.target.value }))}
              className="h-10 w-full rounded-lg px-3 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/30"
              style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
            >
              <option>Private by default</option>
              <option>Ask before publishing</option>
              <option>Public after approval</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>Startup stage</span>
            <select
              value={prefs.founderStage}
              onChange={(event) => setPrefs((current) => ({ ...current, founderStage: event.target.value }))}
              className="h-10 w-full rounded-lg px-3 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/30"
              style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
            >
              <option>Idea / MVP</option>
              <option>Prototype</option>
              <option>Pre-seed</option>
              <option>Seed</option>
              <option>Scaling</option>
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>Match priority</span>
            <select
              value={prefs.matchPriority}
              onChange={(event) => setPrefs((current) => ({ ...current, matchPriority: event.target.value }))}
              className="h-10 w-full rounded-lg px-3 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/30"
              style={{ background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY }}
            >
              <option>Technical cofounder</option>
              <option>MVP developer team</option>
              <option>Investor introductions</option>
              <option>Advisor network</option>
            </select>
          </label>
        </div>
      </section>

      <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
        <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>Discovery Controls</h4>
        <div className="flex flex-col gap-3">
          {[
            { key: "developerRequests" as const, label: "Developer interest requests", sub: "Allow matched developers to request a conversation." },
            { key: "investorIntros" as const, label: "Investor introduction suggestions", sub: "Let Evolv surface relevant investor intros for public blueprints." },
            { key: "weeklyDigest" as const, label: "Weekly founder digest", sub: "Receive weekly progress, match, and blueprint summaries." },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between gap-4 rounded-lg px-3 py-3" style={{ background: "#f8faf8", border: "1px solid #edf1ee" }}>
              <div>
                <p className="text-[13px] font-bold" style={{ color: TEXT_BODY }}>{label}</p>
                <p className="mt-1 text-[11px]" style={{ color: TEXT_MUTED }}>{sub}</p>
              </div>
              <Toggle on={prefs[key]} onChange={() => setPrefs((current) => ({ ...current, [key]: !current[key] }))} />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={save}
          className="bp-gradient-btn mt-5 flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-extrabold"
          style={{ background: INK, color: MINT }}
        >
          <Check size={15} weight="bold" />
          {saved ? "Saved" : "Save Preferences"}
        </button>
      </section>
    </div>
  );
}

export type SettingsSection = "profile" | "payment" | "notifications" | "security";

interface Props {
  profile: FounderProfile;
  onProfileSave: (p: FounderProfile) => void;
  section?: SettingsSection;
  onSectionChange?: (section: SettingsSection) => void;
  editSignal?: number;
}

export function SettingsTab({ profile, onProfileSave, section, onSectionChange, editSignal = 0 }: Props) {
  const [localSection, setLocalSection] = useState<SettingsSection>("profile");
  const activeSection = section ?? localSection;
  const setSection = onSectionChange ?? setLocalSection;

  const NAV: { id: SettingsSection; label: string; Icon: ElementType }[] = [
    { id: "profile",       label: "Profile",       Icon: User },
    { id: "payment",       label: "Payment",       Icon: CreditCard },
    { id: "notifications", label: "Notifications", Icon: Bell },
    { id: "security",      label: "Security",      Icon: LockKey },
  ];

  const handleDeleteAccount = () => {
    const confirmed = window.confirm("Delete this founder account from this browser? This removes saved founder profile and blueprint data.");
    if (!confirmed) return;
    try {
      localStorage.removeItem("evolv_founder_profile");
      localStorage.removeItem("evolv_founder_blueprints");
    } catch { /* ignore */ }
    window.location.href = "/sign-in";
  };

  return (
    <div className="h-full flex overflow-hidden" style={{ background: "#f5f6f4" }}>

      {/* ─ Left settings nav ─ */}
      <div
        className="flex flex-col shrink-0"
        style={{ width: 220, background: "#fff", borderRight: `1px solid ${BORDER}`, paddingTop: 28, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 }}
      >
        <p className="text-[18px] font-black tracking-tight mb-6" style={{ color: TEXT_BODY, letterSpacing: "-0.02em" }}>Settings</p>

        <div className="flex-1 flex flex-col gap-0.5">
          {NAV.map(({ id, label, Icon }) => {
            const active = activeSection === id;
            return (
              <motion.button
                key={id}
                onClick={() => setSection(id)}
                whileHover={active ? {} : { backgroundColor: "#f5f7f5", color: INK }}
                animate={{ backgroundColor: active ? "#f0f5f2" : CLEAR, color: active ? INK : TEXT_MUTED }}
                transition={{ duration: 0.13 }}
                className="relative flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-left cursor-pointer"
              >
                {active && (
                  <motion.span
                    layoutId="settings-indicator"
                    className="absolute left-0 rounded-r-full"
                    style={{ width: 3, height: "55%", background: DARK, top: "22.5%" }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon size={14} weight={active ? "fill" : "regular"} />
                <span className="text-[13px] font-medium">{label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="Settings_dangerZone">
          <div className="Settings_dangerTitle">
            <WarningCircle size={13} weight="fill" />
            Danger Zone
          </div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="Settings_dangerBtn"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* ─ Right content ─ */}
      <div 
        className="relative flex-1 overflow-y-auto"
        style={{ paddingLeft: 40, paddingRight: 40, paddingTop: 28, paddingBottom: 32 }}
      >
        <div style={{ maxWidth: activeSection === "profile" ? 920 : 560 }}>
          <h2 className="font-extrabold mb-2" style={{ fontSize: "1.65rem", fontWeight: 900, letterSpacing: "-0.04em", color: TEXT_BODY }}>
            {activeSection === "profile"
              ? "Profile"
              : activeSection === "payment"
              ? "Payment"
              : activeSection === "security"
              ? "Security"
              : "Notifications"}
          </h2>
          <p className="text-[12px] mb-8" style={{ color: TEXT_MUTED }}>
            {activeSection === "profile"
              ? "Update your personal details and public profile."
              : activeSection === "payment"
              ? "Manage founder billing, plans, and funding preferences."
              : activeSection === "security"
              ? "Protect your founder account and workspace access."
              : "Control which notifications you receive."}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {activeSection === "profile" ? (
                <ProfileSection profile={profile} onSave={onProfileSave} startEditingSignal={editSignal} />
              ) : activeSection === "payment" ? (
                <PaymentSection profile={profile} onSave={onProfileSave} />
              ) : activeSection === "security" ? (
                <SecuritySection />
              ) : (
                <NotificationsSection />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
