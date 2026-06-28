"use client";

import { useRef, useState, type ElementType } from "react";
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
} from "@phosphor-icons/react";
import type { FounderProfile } from "./OnboardingWizard";

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
        className="flex items-center gap-3 px-3 py-2 transition-colors"
        style={{ borderRadius: 8 }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div
      whileHover={{ x: 2, backgroundColor: "#f8fbf9" }}
      className="flex items-center gap-3 px-3 py-2 transition-colors"
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

function ProfileSection({ profile, onSave }: { profile: FounderProfile; onSave: (p: FounderProfile) => void }) {
  const [local, setLocal] = useState<FounderProfile>(profile);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeDomains = Array.isArray(local.domains) ? local.domains : [];
  const fullName = getProfileName(local);
  const initials = getProfileInitials(local);
  const headline = local.bio?.trim() || "Founder building on Evolv";
  const about = local.description?.trim() || "Add a fuller founder story so developers, investors, and collaborators can understand what you are building and why it matters.";
  const normalizedLinkedin = normalizeUrl(local.linkedin);
  const completionItems = [
    local.firstName,
    local.lastName,
    local.bio,
    safeDomains.length ? "domains" : "",
    local.description,
    local.linkedin,
    local.education,
    local.avatarUrl,
  ];
  const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

  const set = (key: keyof FounderProfile, val: string) => setLocal((p) => ({ ...p, [key]: val }));

  const toggleDomain = (d: string) =>
    setLocal((p) => {
      const domains = Array.isArray(p.domains) ? p.domains : [];
      return {
        ...p,
        domains: domains.includes(d) ? domains.filter((x) => x !== d) : [...domains, d],
      };
    });

  const handleSave = () => {
    onSave({ ...local, domains: safeDomains });
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
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
    <div className="relative flex flex-col gap-4">
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
            className="flex flex-col gap-4"
          >
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ boxShadow: "0 20px 48px rgba(15,28,24,0.10)" }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="overflow-hidden bg-white"
              style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}
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
                <div className="absolute bottom-4 left-6 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                  <Sparkle size={13} weight="fill" style={{ color: MINT }} />
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#e8f4ef" }}>
                    Public Founder Profile
                  </span>
                </div>
              </div>

              <div className="relative px-6 pb-6">
                <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <ProfileAvatar avatarUrl={local.avatarUrl} fullName={fullName} initials={initials} />

                  <div className="flex flex-wrap gap-2 sm:pb-1">
                    {normalizedLinkedin && (
                      <motion.a
                        href={normalizedLinkedin}
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 rounded-lg border bg-white px-3.5 py-2 text-[12px] font-bold"
                        style={{ borderColor: BORDER, color: MID }}
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
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold"
                      style={{ background: INK, color: MINT }}
                    >
                      <PencilSimple size={15} weight="bold" />
                      Edit Profile
                    </motion.button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[1.55rem] font-extrabold leading-tight" style={{ color: TEXT_BODY }}>
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
                  <p className="mt-1 max-w-2xl text-[14px] leading-6" style={{ color: "#334d42" }}>
                    {headline}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px]" style={{ color: TEXT_MUTED }}>
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={13} weight="bold" />
                      {safeDomains[0] || "Startup"} founder
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} weight="bold" />
                      Evolv Network
                    </span>
                    {local.email && (
                      <span className="flex items-center gap-1.5">
                        <EnvelopeSimple size={13} weight="bold" />
                        {local.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Profile strength", value: `${completion}%`, detail: "Public readiness" },
                    { label: "Focus areas", value: `${safeDomains.length}`, detail: safeDomains.slice(0, 2).join(" / ") || "Add domains" },
                    { label: "Visibility", value: local.profileComplete ? "Live" : "Draft", detail: "Founder network" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2, borderColor: "#c5ddd0" }}
                      className="bg-[#f8faf8] px-4 py-3"
                      style={{ border: "1px solid #edf1ee", borderRadius: 8 }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_DIM }}>
                        {item.label}
                      </p>
                      <p className="mt-1 text-[20px] font-extrabold leading-none" style={{ color: TEXT_BODY }}>
                        {item.value}
                      </p>
                      <p className="mt-1 truncate text-[11px]" style={{ color: TEXT_MUTED }}>
                        {item.detail}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="bg-white p-5"
                style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-[14px] font-extrabold" style={{ color: TEXT_BODY }}>About</h4>
                    <p className="text-[11px]" style={{ color: TEXT_MUTED }}>The story people see on your profile.</p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => setEditing(true)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: "#edf5f1", color: MID }}
                    aria-label="Edit about section"
                  >
                    <PencilSimple size={14} weight="bold" />
                  </motion.button>
                </div>
                <p className="text-[13px] leading-6" style={{ color: "#334d42" }}>
                  {about}
                </p>

                <div className="mt-5" style={{ height: 1, background: "#edf1ee" }} />

                <div className="mt-5">
                  <h4 className="text-[14px] font-extrabold" style={{ color: TEXT_BODY }}>Founder Focus</h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {safeDomains.length > 0 ? (
                      safeDomains.map((domain) => (
                        <motion.span
                          key={domain}
                          whileHover={{ y: -2, backgroundColor: "#e8f5ef" }}
                          className="rounded-full px-3 py-1.5 text-[12px] font-bold"
                          style={{ background: "#f0f5f2", color: MID, border: "1px solid #dce9e2" }}
                        >
                          {domain}
                        </motion.span>
                      ))
                    ) : (
                      <span className="text-[12px]" style={{ color: TEXT_DIM }}>Add domains to show your focus areas.</span>
                    )}
                  </div>
                </div>

                <div className="mt-5" style={{ height: 1, background: "#edf1ee" }} />

                <div className="mt-5">
                  <h4 className="text-[14px] font-extrabold" style={{ color: TEXT_BODY }}>Experience</h4>
                  <div className="mt-3 flex gap-3">
                    <span
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "#edf5f1", color: MID }}
                    >
                      <GraduationCap size={17} weight="bold" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold" style={{ color: TEXT_BODY }}>
                        {local.education || "Add education or founder background"}
                      </p>
                      <p className="mt-1 text-[12px] leading-5" style={{ color: TEXT_MUTED }}>
                        {local.education
                          ? "Background shown to investors, developers, and collaborators."
                          : "Your education or prior experience helps others understand your credibility."}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.aside
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-4"
              >
                <section className="bg-white p-4" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                  <h4 className="mb-3 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>Contact</h4>
                  <div className="flex flex-col gap-1">
                    <ProfileDetailRow Icon={EnvelopeSimple} label="Email" value={local.email} href={local.email ? `mailto:${local.email}` : undefined} />
                    <ProfileDetailRow Icon={Phone} label="Phone" value={local.phone} href={local.phone ? `tel:${local.phone}` : undefined} />
                    <ProfileDetailRow Icon={LinkedinLogo} label="LinkedIn" value={local.linkedin} href={normalizedLinkedin || undefined} />
                    {!local.email && !local.phone && !local.linkedin && (
                      <p className="px-3 py-2 text-[12px]" style={{ color: TEXT_DIM }}>Add contact links in edit mode.</p>
                    )}
                  </div>
                </section>

                <section className="bg-white p-4" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                  <h4 className="mb-3 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>Profile Details</h4>
                  <div className="flex flex-col gap-1">
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
            className="flex flex-col gap-4"
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
                      style={{ background: INK, border: "3px solid #fff", color: MINT }}
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
                  className="rounded-lg border bg-white px-3.5 py-2 text-[12px] font-bold transition hover:bg-[#f8faf8]"
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
                <div className="mt-4">
                  <Field label="Bio Line" value={local.bio} onChange={(v) => set("bio", v)} placeholder="Building the future of healthcare" />
                </div>
                <div className="mt-4">
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
                  <Field label="Phone Number" value={local.phone} onChange={(v) => set("phone", v)} placeholder="+92 300 0000000" optional />
                  <Field label="Education" value={local.education} onChange={(v) => set("education", v)} placeholder="BSc Computer Science, LUMS" optional />
                </div>
              </section>

              <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>Private Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date of Birth" type="date" value={local.dob} onChange={(v) => set("dob", v)} optional />
                  <Field label="Gender" type="select" value={local.gender} onChange={(v) => set("gender", v)} optional />
                </div>
                <div className="mt-4 flex items-start gap-3 rounded-lg px-3 py-3" style={{ background: "#f8faf8", border: "1px solid #edf1ee" }}>
                  <CalendarBlank size={15} weight="bold" style={{ color: MID, marginTop: 1 }} />
                  <p className="text-[11px] leading-5" style={{ color: TEXT_MUTED }}>
                    Birthday and gender help account context, but they are not shown on the public profile preview.
                  </p>
                </div>
              </section>

              <section className="bg-white p-5 xl:col-span-2" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>About</h4>
                <Field
                  label="Description"
                  type="textarea"
                  value={local.description}
                  onChange={(v) => set("description", v)}
                  placeholder="Tell developers and investors about your journey, traction, and what you are building."
                  optional
                />
              </section>
            </div>

            <motion.button
              type="button"
              onClick={handleSave}
              whileHover={{ y: -2, boxShadow: "0 10px 26px rgba(26,49,44,0.22)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="flex items-center justify-center gap-2 rounded-lg py-3 text-[13px] font-extrabold"
              style={{ background: INK, color: MINT }}
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

export type SettingsSection = "profile" | "notifications";

interface Props {
  profile: FounderProfile;
  onProfileSave: (p: FounderProfile) => void;
  section?: SettingsSection;
  onSectionChange?: (section: SettingsSection) => void;
}

export function SettingsTab({ profile, onProfileSave, section, onSectionChange }: Props) {
  const [localSection, setLocalSection] = useState<SettingsSection>("profile");
  const activeSection = section ?? localSection;
  const setSection = onSectionChange ?? setLocalSection;

  const NAV: { id: SettingsSection; label: string; Icon: React.ElementType }[] = [
    { id: "profile",       label: "Profile",       Icon: User },
    { id: "notifications", label: "Notifications", Icon: Bell },
  ];

  return (
    <div className="h-full flex overflow-hidden" style={{ background: "#f5f6f4" }}>

      {/* ── Left settings nav ── */}
      <div
        className="flex flex-col shrink-0 py-6 px-4"
        style={{ width: 196, background: "#fff", borderRight: `1px solid ${BORDER}` }}
      >
        <p className="text-[13px] font-bold mb-5" style={{ color: TEXT_BODY }}>Settings</p>

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

        <div className="mt-auto pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
          <button
            onClick={() => (window.location.href = "/")}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-left cursor-pointer transition-colors hover:bg-red-50"
            style={{ color: "#c0392b" }}
          >
            <span className="text-[13px] font-medium">Log out</span>
          </button>
        </div>
      </div>

      {/* ── Right content ── */}
      <div className="relative flex-1 overflow-y-auto px-8 py-7">
        <div style={{ maxWidth: activeSection === "profile" ? 920 : 560 }}>
          <h2 className="font-bold mb-1" style={{ fontSize: "1.15rem", color: TEXT_BODY }}>
            {activeSection === "profile" ? "Profile" : "Notifications"}
          </h2>
          <p className="text-[12px] mb-6" style={{ color: TEXT_MUTED }}>
            {activeSection === "profile"
              ? "Update your personal details and public profile."
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
                <ProfileSection profile={profile} onSave={onProfileSave} />
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
