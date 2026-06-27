"use client";

import { useRef, useState } from "react";
import {
  User,
  Bell,
  UploadSimple,
  Check,
} from "@phosphor-icons/react";
import type { FounderProfile } from "./OnboardingWizard";

/* ── Toggle switch ── */
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative h-5 w-9 rounded-full transition-colors"
      style={{ background: on ? "#0f1c18" : "#dde5e0" }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
        style={{ transform: on ? "translateX(16px)" : "translateX(2px)" }}
      />
    </button>
  );
}

/* ── Field component ── */
function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  optional,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium mb-1 flex items-center gap-1" style={{ color: "#6b8e7e" }}>
        {label}
        {optional && <span className="text-[10px]" style={{ color: "#b0c0b8" }}>(optional)</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          className="w-full rounded-lg px-4 py-2.5 text-[13px] outline-none resize-none focus:ring-1 focus:ring-[#0f1c18]"
          style={{ background: "#f5f7f5", border: "1px solid #dde5e0", color: "#1a2e26", minHeight: 72 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : type === "select" ? (
        <select
          className="w-full rounded-lg px-4 py-2.5 text-[13px] outline-none focus:ring-1 focus:ring-[#0f1c18]"
          style={{ background: "#f5f7f5", border: "1px solid #dde5e0", color: "#1a2e26" }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          <option>Male</option>
          <option>Female</option>
          <option>Non-binary</option>
          <option>Prefer not to say</option>
        </select>
      ) : (
        <input
          type={type}
          className="w-full rounded-lg px-4 py-2.5 text-[13px] outline-none focus:ring-1 focus:ring-[#0f1c18]"
          style={{ background: "#f5f7f5", border: "1px solid #dde5e0", color: "#1a2e26" }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

const DOMAINS = ["AI", "SaaS", "MedTech", "FinTech", "CleanTech", "Web3", "EdTech", "E-commerce", "Deep Tech", "B2B"];

/* ── Profile section ── */
function ProfileSection({
  profile,
  onSave,
}: {
  profile: FounderProfile;
  onSave: (p: FounderProfile) => void;
}) {
  const [local, setLocal] = useState<FounderProfile>(profile);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof FounderProfile, val: string) =>
    setLocal((p) => ({ ...p, [key]: val }));

  const toggleDomain = (d: string) =>
    setLocal((p) => ({
      ...p,
      domains: p.domains.includes(d) ? p.domains.filter((x) => x !== d) : [...p.domains, d],
    }));

  const handleSave = () => {
    onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

  const initials = `${local.firstName?.[0] ?? ""}${local.lastName?.[0] ?? ""}`.toUpperCase() || "F";

  return (
    <div className="flex flex-col gap-5">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center text-[1.2rem] font-bold"
            style={{ background: "#89d7b7", color: "#0f1c18" }}
          >
            {local.avatarUrl ? (
              <img src={local.avatarUrl} alt="Founder profile" className="h-full w-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center"
            style={{ background: "#0f1c18", border: "2px solid #fff" }}
            title="Upload photo"
          >
            <UploadSimple size={11} style={{ color: "#89d7b7" }} />
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
          <div className="text-[13px] font-semibold" style={{ color: "#1a2e26" }}>
            {local.firstName} {local.lastName}
          </div>
          <div className="text-[11px]" style={{ color: "#7a9e8e" }}>Founder</div>
        </div>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" value={local.firstName} onChange={(v) => set("firstName", v)} placeholder="Sara" />
        <Field label="Last Name" value={local.lastName} onChange={(v) => set("lastName", v)} placeholder="Ahmed" />
      </div>

      <Field label="Email" type="email" value={local.email} onChange={(v) => set("email", v)} placeholder="you@example.com" />
      <Field label="Bio Line" value={local.bio} onChange={(v) => set("bio", v)} placeholder="Building the future of healthcare…" />

      {/* Domains */}
      <div>
        <label className="text-[11px] font-medium mb-2 block" style={{ color: "#6b8e7e" }}>
          Domains / Interests
        </label>
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map((d) => {
            const sel = local.domains.includes(d);
            return (
              <button
                key={d}
                onClick={() => toggleDomain(d)}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                style={{
                  background: sel ? "#0f1c18" : "#f0f5f2",
                  color: sel ? "#89d7b7" : "#428475",
                  border: `1px solid ${sel ? "#0f1c18" : "#dde5e0"}`,
                }}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date of Birth" type="date" value={local.dob} onChange={(v) => set("dob", v)} optional />
        <Field label="Gender" type="select" value={local.gender} onChange={(v) => set("gender", v)} optional />
      </div>

      <Field label="LinkedIn Profile" value={local.linkedin} onChange={(v) => set("linkedin", v)} placeholder="https://linkedin.com/in/…" optional />
      <Field label="Phone Number" value={local.phone} onChange={(v) => set("phone", v)} placeholder="+92 300 0000000" optional />
      <Field label="Education" value={local.education} onChange={(v) => set("education", v)} placeholder="BSc Computer Science, LUMS" optional />
      <Field label="Description" type="textarea" value={local.description} onChange={(v) => set("description", v)} placeholder="Tell developers and investors about your journey…" optional />

      <button
        onClick={handleSave}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-semibold transition-all"
        style={{ background: saved ? "#2e7d5c" : "#0f1c18", color: saved ? "#fff" : "#89d7b7" }}
      >
        {saved ? <><Check size={14} weight="bold" /> Saved!</> : "Save Changes"}
      </button>
    </div>
  );
}

/* ── Notifications section ── */
function NotificationsSection() {
  const [notifs, setNotifs] = useState({
    developerMatch: true,
    investorView: true,
    blueprintComment: false,
    weeklyDigest: true,
    billingAlerts: true,
    interestRequest: true,
    messageReceived: true,
    productUpdates: false,
  });

  const toggle = (key: keyof typeof notifs) =>
    setNotifs((n) => ({ ...n, [key]: !n[key] }));

  const groups = [
    {
      title: "Matches & Connections",
      items: [
        { key: "developerMatch" as const, label: "New developer match", desc: "Get notified when a developer matches your blueprint" },
        { key: "interestRequest" as const, label: "Interest request", desc: "When a developer sends an interest request" },
        { key: "investorView" as const, label: "Investor viewed blueprint", desc: "When an investor views your public blueprint" },
      ],
    },
    {
      title: "Messages & Activity",
      items: [
        { key: "messageReceived" as const, label: "New message", desc: "When someone sends you a message in Inbox" },
        { key: "blueprintComment" as const, label: "Blueprint comments", desc: "Comments and feedback on your blueprints" },
      ],
    },
    {
      title: "Account & Billing",
      items: [
        { key: "billingAlerts" as const, label: "Billing alerts", desc: "Payment due, invoice ready, subscription changes" },
        { key: "weeklyDigest" as const, label: "Weekly digest", desc: "Weekly summary of your portfolio activity" },
        { key: "productUpdates" as const, label: "Product updates", desc: "New features and improvements on Evolv" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.title}>
          <div className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: "#7a9e8e" }}>
            {group.title}
          </div>
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e8ede9" }}>
            {group.items.map(({ key, label, desc }, i) => (
              <div
                key={key}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < group.items.length - 1 ? "1px solid #eaf0eb" : "none" }}
              >
                <div className="flex-1">
                  <div className="text-[13px] font-medium" style={{ color: "#1a2e26" }}>{label}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: "#7a9e8e" }}>{desc}</div>
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
  topActions?: React.ReactNode;
}

export function SettingsTab({ profile, onProfileSave, section, onSectionChange, topActions }: Props) {
  const [localSection, setLocalSection] = useState<SettingsSection>("profile");
  const activeSection = section ?? localSection;
  const setSection = onSectionChange ?? setLocalSection;

  const NAV: { id: SettingsSection; label: string; Icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", Icon: User },
    { id: "notifications", label: "Notifications", Icon: Bell },
  ];

  return (
    <div
      className="h-full flex overflow-hidden"
      style={{ background: "#f5f6f4" }}
    >
      {/* Left nav */}
      <div
        className="flex flex-col shrink-0 py-6 px-4 overflow-hidden"
        style={{ width: 190, background: "#fff", borderRight: "1px solid #e8ede9" }}
      >
        <div className="text-[13px] font-bold mb-4" style={{ color: "#1a2e26" }}>Settings</div>
        <div className="flex-1">
          {NAV.map(({ id, label, Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setSection(id)}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg mb-1 text-left transition-colors"
                onMouseEnter={(e) => {
                  if (active) return;
                  e.currentTarget.style.background = "#f5f7f5";
                  e.currentTarget.style.color = "#0f1c18";
                }}
                onMouseLeave={(e) => {
                  if (active) return;
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#7a9e8e";
                }}
                style={{
                  background: active ? "#f0f5f2" : "transparent",
                  color: active ? "#0f1c18" : "#7a9e8e",
                }}
              >
                <Icon size={14} weight={active ? "fill" : "regular"} />
                <span className="text-[13px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-auto">
          <button
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left transition-colors hover:bg-[#fef2f2]"
            style={{ color: "#c0392b" }}
          >
            <span className="text-[13px] font-medium">Log out</span>
          </button>
        </div>
      </div>

      {/* Right content */}
      <div className="relative flex-1 overflow-y-auto px-8 py-6">
        <div style={{ maxWidth: 560 }}>
          <h2 className="text-[1.15rem] font-bold mb-1" style={{ color: "#1a2e26" }}>
            {activeSection === "profile" ? "Profile" : "Notifications"}
          </h2>
          <p className="text-[12px] mb-5" style={{ color: "#7a9e8e" }}>
            {activeSection === "profile"
              ? "Update your personal details and public profile."
              : "Control which notifications you receive."}
          </p>
          {topActions && <div className="absolute top-6 right-8">{topActions}</div>}
          {activeSection === "profile" ? (
            <ProfileSection profile={profile} onSave={onProfileSave} />
          ) : (
            <NotificationsSection />
          )}
        </div>
      </div>
    </div>
  );
}
