"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bell,
  UploadSimple,
  Check,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import type { FounderProfile } from "./OnboardingWizard";

// ── Design tokens ─────────────────────────────────────────────────────────────
const INK        = "#0f1c18";
const DARK       = "#1a312c";   // sidebar BG — used for selected chips
const MINT       = "#89d7b7";
const MID        = "#428475";
const TEXT_BODY  = "#1a2e26";
const TEXT_MUTED = "#7a9e8e";
const TEXT_DIM   = "#b0c0b8";
const BORDER     = "#e0e9e3";
const FIELD_BG   = "#f5f7f5";

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
      onClick={onChange}
      className="relative shrink-0 rounded-full transition-colors duration-200"
      style={{ width: 36, height: 20, background: on ? DARK : "#dde5e0" }}
      aria-pressed={on}
    >
      <motion.span
        className="absolute top-[2px] h-4 w-4 rounded-full bg-white shadow-sm"
        animate={{ x: on ? 16 : 2 }}
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
function ProfileSection({ profile, onSave }: { profile: FounderProfile; onSave: (p: FounderProfile) => void }) {
  const [local, setLocal] = useState<FounderProfile>(profile);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof FounderProfile, val: string) => setLocal((p) => ({ ...p, [key]: val }));

  const toggleDomain = (d: string) =>
    setLocal((p) => ({
      ...p,
      domains: p.domains.includes(d) ? p.domains.filter((x) => x !== d) : [...p.domains, d],
    }));

  const handleSave = () => {
    onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const initials = `${local.firstName?.[0] ?? ""}${local.lastName?.[0] ?? ""}`.toUpperCase() || "F";

  return (
    <div className="flex flex-col gap-5">

      {/* Avatar row */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center font-bold"
            style={{ fontSize: "1.25rem", background: `linear-gradient(135deg, #4cb896, ${MINT})`, color: INK }}
          >
            {initials}
          </div>
          <button
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: INK, border: "2px solid #fff" }}
          >
            <UploadSimple size={11} style={{ color: MINT }} />
          </button>
        </div>
        <div>
          <p className="text-[14px] font-semibold" style={{ color: TEXT_BODY }}>
            {local.firstName} {local.lastName}
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: TEXT_MUTED }}>Founder</p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: BORDER }} />

      {/* Name */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" value={local.firstName} onChange={(v) => set("firstName", v)} placeholder="Sara" />
        <Field label="Last Name"  value={local.lastName}  onChange={(v) => set("lastName", v)}  placeholder="Ahmed" />
      </div>

      <Field label="Email" type="email" value={local.email} onChange={(v) => set("email", v)} placeholder="you@example.com" />
      <Field label="Bio Line" value={local.bio} onChange={(v) => set("bio", v)} placeholder="Building the future of healthcare…" />

      {/* Domains with search — consistent with signup */}
      <DomainSearch selected={local.domains} onToggle={toggleDomain} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date of Birth" type="date"   value={local.dob}    onChange={(v) => set("dob", v)}    optional />
        <Field label="Gender"        type="select"  value={local.gender} onChange={(v) => set("gender", v)} optional />
      </div>

      <Field label="LinkedIn Profile" value={local.linkedin}    onChange={(v) => set("linkedin", v)}    placeholder="https://linkedin.com/in/…" optional />
      <Field label="Phone Number"     value={local.phone}       onChange={(v) => set("phone", v)}       placeholder="+92 300 0000000"          optional />
      <Field label="Education"        value={local.education}   onChange={(v) => set("education", v)}   placeholder="BSc Computer Science, LUMS" optional />
      <Field label="Description"      type="textarea" value={local.description} onChange={(v) => set("description", v)} placeholder="Tell developers and investors about your journey…" optional />

      {/* Save */}
      <motion.button
        onClick={handleSave}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-semibold cursor-pointer"
        style={{
          background: saved ? "#2e7d5c" : INK,
          color: saved ? "#fff" : MINT,
          transition: "background 0.3s ease, color 0.3s ease",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {saved ? (
            <motion.span
              key="saved"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2"
            >
              <Check size={14} weight="bold" /> Saved!
            </motion.span>
          ) : (
            <motion.span
              key="save"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              Save Changes
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
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

// ── SettingsTab ───────────────────────────────────────────────────────────────
type SettingsSection = "profile" | "notifications";

interface Props {
  profile: FounderProfile;
  onProfileSave: (p: FounderProfile) => void;
}

export function SettingsTab({ profile, onProfileSave }: Props) {
  const [section, setSection] = useState<SettingsSection>("profile");

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
            const active = section === id;
            return (
              <motion.button
                key={id}
                onClick={() => setSection(id)}
                whileHover={active ? {} : { backgroundColor: "#f5f7f5", color: INK }}
                animate={{ backgroundColor: active ? "#f0f5f2" : "transparent", color: active ? INK : TEXT_MUTED }}
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
      <div className="flex-1 overflow-y-auto px-8 py-7">
        <div style={{ maxWidth: 560 }}>
          <h2 className="font-bold mb-1" style={{ fontSize: "1.15rem", color: TEXT_BODY }}>
            {section === "profile" ? "Profile" : "Notifications"}
          </h2>
          <p className="text-[12px] mb-6" style={{ color: TEXT_MUTED }}>
            {section === "profile"
              ? "Update your personal details and public profile."
              : "Control which notifications you receive."}
          </p>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {section === "profile" ? (
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
