"use client";

import { useRef, useState } from "react";
import type { FounderProfile } from "./OnboardingWizard";

export type SettingsSection = "profile" | "notifications" | "security" | "preferences";

interface Props {
  profile: FounderProfile;
  onProfileSave: (p: FounderProfile) => void;
  section?: SettingsSection;
  onSectionChange?: (section: SettingsSection) => void;
}

const DOMAINS_LIST = [
  "AI","SaaS","MedTech","FinTech","CleanTech","Web3","EdTech","E-commerce","Deep Tech","B2B",
];

function calcStrength(p: FounderProfile): number {
  const checks = [
    !!p.firstName?.trim(), !!p.lastName?.trim(),
    !!(p.bio?.trim() || p.headline?.trim()),
    !!p.email?.trim(), !!p.phone?.trim(),
    !!p.linkedin?.trim(), !!p.location?.trim(),
    !!p.education?.trim(), !!p.description?.trim(),
    (p.domains?.length ?? 0) > 0, !!p.avatarUrl,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function SettingsTab({ profile: initialProfile, onProfileSave, section, onSectionChange }: Props) {
  const [profile, setProfile]   = useState<FounderProfile>(initialProfile);
  const [activeTab, setActiveTab] = useState<SettingsSection>(section ?? "profile");
  const [editMode, setEditMode]   = useState(false);
  const [draft, setDraft]         = useState<FounderProfile>(initialProfile);
  const [newDomain, setNewDomain] = useState("");
  const [saved, setSaved]         = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", newPass: "", confirm: "" });
  const [pwSaved, setPwSaved]   = useState(false);
  const [otpMode, setOtpMode]   = useState<false | "sent">(false);
  const [otp, setOtp]           = useState("");
  const [notifications, setNotifications] = useState({
    developerMatch: true, investorView: true, blueprintComment: false,
    weeklyDigest: true, billingAlerts: true, interestRequest: true,
    messageReceived: true, productUpdates: false,
  });

  const photoInputRef     = useRef<HTMLInputElement>(null);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  const openEdit = () => {
    setDraft({ ...profile });
    setEditMode(true);
  };

  const handleSave = () => {
    const updated = { ...draft };
    setProfile(updated);
    onProfileSave(updated);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setEditMode(false);
    }, 1200);
  };

  const handlePhotoUpload = (file: File | undefined, target: "profile" | "draft") => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const url = reader.result;
      if (target === "draft") {
        setDraft((p) => ({ ...p, avatarUrl: url }));
      } else {
        const updated = { ...profile, avatarUrl: url };
        setProfile(updated);
        onProfileSave(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePwSave = () => {
    if (!passwordData.newPass || passwordData.newPass !== passwordData.confirm) return;
    if (!otpMode && !passwordData.current) return;
    if (otpMode === "sent" && !otp) return;
    setPwSaved(true);
    setTimeout(() => {
      setPwSaved(false);
      setPasswordData({ current: "", newPass: "", confirm: "" });
      setOtpMode(false);
      setOtp("");
    }, 2000);
  };

  const toggleDomain = (d: string) => {
    const domains = draft.domains || [];
    setDraft((p) => ({
      ...p,
      domains: domains.includes(d) ? domains.filter((x) => x !== d) : [...domains, d],
    }));
  };

  const addCustomDomain = () => {
    const d = newDomain.trim();
    if (d && !(draft.domains || []).includes(d)) {
      setDraft((p) => ({ ...p, domains: [...(p.domains || []), d] }));
    }
    setNewDomain("");
  };

  const removeDomain = (d: string) => {
    setDraft((p) => ({ ...p, domains: (p.domains || []).filter((x) => x !== d) }));
  };

  const tabs: { id: SettingsSection; label: string; icon: string }[] = [
    { id: "profile",       label: "Profile",       icon: "user"      },
    { id: "notifications", label: "Notifications", icon: "bell"      },
    { id: "security",      label: "Security",      icon: "lock"      },
    { id: "preferences",   label: "Preferences",   icon: "sliders-h" },
  ];

  const fullName  = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Your Name";
  const initials  = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() || "F";
  const strength  = calcStrength(profile);
  const topDomain = profile.domains?.[0] || "—";
  const focusLabel = profile.domains?.slice(0, 2).join(" / ") || "—";

  return (
    <div className="Settings_container">
      <main className="Settings_mainWrapper">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1B1B1B" }}>Settings</h1>
            <p style={{ color: "#888", fontSize: "0.8rem", marginTop: "0.2rem" }}>
              Manage your profile, preferences, and account security.
            </p>
          </div>
        </div>

        <div className="Settings_settingsLayout">
          {/* ── Left nav ── */}
          <div className="Settings_tabsCol">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`Settings_tabBtn ${activeTab === tab.id ? "Settings_tabBtnActive" : ""}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setEditMode(false);
                  onSectionChange?.(tab.id);
                }}
              >
                <i className={`fas fa-${tab.icon}`} />
                {tab.label}
              </button>
            ))}
            <div className="Settings_dangerZone">
              <div className="Settings_dangerTitle">
                <i className="fas fa-exclamation-triangle" /> Danger Zone
              </div>
              <button className="Settings_dangerBtn">Delete Account</button>
            </div>
          </div>

          {/* ── Content col ── */}
          <div className="Settings_contentCol">

            {/* ══════════════════ PROFILE — VIEW MODE ══════════════════ */}
            {activeTab === "profile" && !editMode && (
              <div>
                {/* Section title */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1a2e26", margin: 0 }}>Profile</h2>
                  <p style={{ fontSize: "0.78rem", color: "#7a9e8e", marginTop: 4 }}>
                    Update your personal details and public profile.
                  </p>
                </div>

                {/* Main profile card */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e4ece7", overflow: "hidden", marginBottom: "1.25rem", boxShadow: "0 2px 12px rgba(26,49,44,0.05)" }}>

                  {/* Gradient banner */}
                  <div style={{
                    height: 130,
                    background: "linear-gradient(135deg, #1a312c 0%, #234a3c 55%, #428475 100%)",
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", inset: 0,
                      backgroundImage: "radial-gradient(rgba(137,215,183,0.18) 1.5px, transparent 1.5px)",
                      backgroundSize: "22px 22px",
                    }} />
                    <button
                      style={{
                        position: "absolute", bottom: 16, left: 20,
                        display: "flex", alignItems: "center", gap: 6,
                        background: "rgba(255,255,255,0.1)", border: "1px solid rgba(137,215,183,0.35)",
                        borderRadius: 999, padding: "5px 14px",
                        fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.07em",
                        textTransform: "uppercase", color: "rgba(255,255,255,0.88)",
                        cursor: "pointer", backdropFilter: "blur(4px)", fontFamily: "inherit",
                      }}
                    >
                      <i className="fas fa-external-link-alt" style={{ fontSize: "0.52rem" }} />
                      Public Founder Profile
                    </button>
                  </div>

                  {/* Profile info */}
                  <div style={{ padding: "0 24px 26px", position: "relative" }}>

                    {/* Avatar overlapping banner */}
                    <div
                      onClick={() => photoInputRef.current?.click()}
                      style={{
                        width: 80, height: 80, borderRadius: "50%", overflow: "hidden",
                        border: "4px solid #fff",
                        background: "linear-gradient(135deg, #4cb896, #89d7b7)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.5rem", fontWeight: 800, color: "#0f1c18",
                        marginTop: -40, boxShadow: "0 4px 16px rgba(26,49,44,0.18)",
                        cursor: "pointer", flexShrink: 0,
                      }}
                    >
                      {profile.avatarUrl
                        ? <img src={profile.avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : initials}
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file" accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handlePhotoUpload(e.target.files?.[0], "profile")}
                    />

                    {/* Edit Profile button */}
                    <button
                      onClick={openEdit}
                      style={{
                        position: "absolute", top: 16, right: 0,
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "9px 20px", borderRadius: 10,
                        background: "#1a312c", color: "#89d7b7",
                        border: "none", fontSize: "0.78rem", fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit",
                        boxShadow: "0 2px 8px rgba(26,49,44,0.2)",
                      }}
                    >
                      <i className="fas fa-pencil-alt" style={{ fontSize: "0.62rem" }} />
                      Edit Profile
                    </button>

                    {/* Name + badge */}
                    <div style={{ marginTop: 14, marginBottom: 6, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1a2e26", margin: 0, letterSpacing: "-0.02em" }}>
                        {fullName}
                      </h3>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.07em",
                        padding: "4px 10px", borderRadius: 999,
                        background: "#dcf0e6", color: "#1d6e47", textTransform: "uppercase",
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2e7d5c", display: "inline-block" }} />
                        Founder
                      </span>
                    </div>

                    {/* Bio */}
                    {(profile.bio || profile.headline) && (
                      <p style={{ fontSize: "0.85rem", color: "#4a6a5a", margin: "0 0 12px", lineHeight: 1.5 }}>
                        {profile.bio || profile.headline}
                      </p>
                    )}

                    {/* Info row */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", marginBottom: 22 }}>
                      {(profile.headline || profile.bio) && (
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "#7a9e8e" }}>
                          <i className="fas fa-briefcase" style={{ fontSize: "0.62rem", color: "#89d7b7" }} />
                          {profile.headline || "Founder"}
                        </span>
                      )}
                      {profile.location && (
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "#7a9e8e" }}>
                          <i className="fas fa-map-marker-alt" style={{ fontSize: "0.62rem", color: "#89d7b7" }} />
                          {profile.location}
                        </span>
                      )}
                      {profile.email && (
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "#7a9e8e" }}>
                          <i className="fas fa-envelope" style={{ fontSize: "0.62rem", color: "#89d7b7" }} />
                          {profile.email}
                        </span>
                      )}
                    </div>

                    {/* 3 stat cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      {[
                        { label: "PROFILE STRENGTH", value: `${strength}%`,                       sub: "Public readiness"   },
                        { label: "FOCUS AREAS",      value: String(profile.domains?.length || 0), sub: focusLabel           },
                        { label: "VISIBILITY",       value: (profile.domains?.length ?? 0) > 0 ? "Live" : "Draft", sub: "Founder network" },
                      ].map((s) => (
                        <div key={s.label} style={{
                          background: "#f5f8f6", borderRadius: 12,
                          border: "1px solid #e4ece7", padding: "14px 16px",
                        }}>
                          <div style={{ fontSize: "0.58rem", fontWeight: 700, color: "#7a9e8e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                            {s.label}
                          </div>
                          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1a2e26", lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 4 }}>
                            {s.value}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#7a9e8e" }}>{s.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom two-column */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 0.65fr", gap: "1.25rem" }}>

                  {/* Left: About / Focus / Education */}
                  <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e4ece7", overflow: "hidden", boxShadow: "0 1px 6px rgba(26,49,44,0.04)" }}>

                    {/* About header */}
                    <div style={{ padding: "18px 20px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2e26", margin: "0 0 3px" }}>About</h4>
                          <p style={{ fontSize: "0.72rem", color: "#7a9e8e", margin: 0 }}>The story people see on your profile.</p>
                        </div>
                        <button
                          onClick={openEdit}
                          style={{ width: 30, height: 30, borderRadius: 8, background: "#f0f5f2", border: "1px solid #e4ece7", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 12 }}
                        >
                          <i className="fas fa-pencil-alt" style={{ fontSize: "0.62rem", color: "#428475" }} />
                        </button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: "#eef2ef" }} />

                    {/* Description */}
                    <div style={{ padding: "14px 20px 18px" }}>
                      <p style={{ fontSize: "0.82rem", color: "#5a7a6a", lineHeight: 1.65, margin: 0 }}>
                        {profile.description
                          ? profile.description
                          : <span style={{ color: "#9ab4a4", fontStyle: "italic" }}>No description added yet.</span>}
                      </p>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: "#eef2ef" }} />

                    {/* Founder Focus */}
                    <div style={{ padding: "18px 20px" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2e26", margin: "0 0 12px" }}>Founder Focus</h4>
                      {(profile.domains?.length ?? 0) > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {profile.domains.map((d) => (
                            <span key={d} style={{
                              padding: "5px 13px", borderRadius: 999,
                              fontSize: "0.75rem", fontWeight: 600,
                              background: "#eaf5f0", color: "#0d5c35", border: "1px solid #c0dfd0",
                            }}>{d}</span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: "0.78rem", color: "#9ab4a4", fontStyle: "italic", margin: 0 }}>No domains selected.</p>
                      )}
                    </div>

                    {profile.education && (
                      <>
                        {/* Divider */}
                        <div style={{ height: 1, background: "#eef2ef" }} />
                        {/* Education */}
                        <div style={{ padding: "18px 20px" }}>
                          <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2e26", margin: "0 0 14px" }}>Education</h4>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#eaf5f0", border: "1px solid #c0dfd0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <i className="fas fa-graduation-cap" style={{ color: "#2e7d5c", fontSize: "0.82rem" }} />
                            </div>
                            <div>
                              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a2e26", marginBottom: 3 }}>{profile.education}</div>
                              <div style={{ fontSize: "0.72rem", color: "#7a9e8e" }}>Background shown to developers, and collaborators.</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right: Contact + Profile Details */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e4ece7", padding: "18px 20px", boxShadow: "0 1px 6px rgba(26,49,44,0.04)" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2e26", margin: "0 0 14px" }}>Contact</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                          { icon: "fas fa-envelope",  label: "EMAIL",    value: profile.email    },
                          { icon: "fas fa-phone",     label: "PHONE",    value: profile.phone    },
                          { icon: "fab fa-linkedin",  label: "LINKEDIN", value: profile.linkedin },
                        ].filter((r) => r.value).map((r) => (
                          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#e8f5ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <i className={r.icon} style={{ color: "#2e7d5c", fontSize: "0.7rem" }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: "0.58rem", fontWeight: 700, color: "#9ab4a4", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{r.label}</div>
                              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1a2e26", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.value}</div>
                            </div>
                          </div>
                        ))}
                        {!profile.email && !profile.phone && !profile.linkedin && (
                          <p style={{ fontSize: "0.78rem", color: "#9ab4a4", fontStyle: "italic", margin: 0 }}>No contact info yet.</p>
                        )}
                      </div>
                    </div>

                    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e4ece7", padding: "18px 20px", boxShadow: "0 1px 6px rgba(26,49,44,0.04)" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2e26", margin: "0 0 14px" }}>Profile Details</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                          { icon: "fas fa-globe",    label: "NETWORK",    value: "Founder on Evolv" },
                          { icon: "fas fa-briefcase",label: "ROLE",       value: "Founder"          },
                          { icon: "fas fa-link",     label: "TOP DOMAIN", value: topDomain          },
                        ].map((r) => (
                          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f5f8f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <i className={r.icon} style={{ color: "#7a9e8e", fontSize: "0.7rem" }} />
                            </div>
                            <div>
                              <div style={{ fontSize: "0.58rem", fontWeight: 700, color: "#9ab4a4", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{r.label}</div>
                              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1a2e26" }}>{r.value}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════ PROFILE — EDIT MODE ══════════════════ */}
            {activeTab === "profile" && editMode && (
              <div className="Settings_card">
                <div className="Settings_cardHeader" style={{ position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "1px solid #f0ede8" }}>
                  <span><i className="fas fa-user" /> Edit Profile</span>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => setEditMode(false)}
                      style={{ background: "none", border: "1px solid #e4ece7", borderRadius: "0.4rem", cursor: "pointer", fontSize: "0.72rem", color: "#7a9e8e", fontFamily: "inherit", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, padding: "0.35rem 0.75rem" }}
                    >
                      <i className="fas fa-times" /> Cancel
                    </button>
                    <button
                      className={`Settings_saveBtn ${saved ? "Settings_saveBtnSaved" : ""}`}
                      onClick={handleSave}
                      disabled={saved}
                      style={{ padding: "0.35rem 1rem" }}
                    >
                      {saved
                        ? <><i className="fas fa-check" /> Saved! Viewing profile…</>
                        : <><i className="fas fa-save" /> Save &amp; View Profile</>}
                    </button>
                  </div>
                </div>

                {/* Avatar */}
                <div className="Settings_avatarSection">
                  <div
                    className="Settings_avatarCircle"
                    style={{ cursor: "pointer" }}
                    onClick={() => editPhotoInputRef.current?.click()}
                  >
                    {draft.avatarUrl ? (
                      <img src={draft.avatarUrl} alt="Avatar" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold", background: "linear-gradient(135deg, #4cb896, #89d7b7)", color: "#0f1c18" }}>
                        {`${draft.firstName?.[0] || ""}${draft.lastName?.[0] || ""}`.toUpperCase() || "F"}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="Settings_avatarName">{`${draft.firstName || ""} ${draft.lastName || ""}`.trim() || "Your Name"}</div>
                    <div className="Settings_avatarRole">{draft.headline || "Founder"}</div>
                    <button className="Settings_changePhotoBtn" onClick={() => editPhotoInputRef.current?.click()}>
                      <i className="fas fa-camera" /> Change Photo
                    </button>
                    <input
                      ref={editPhotoInputRef}
                      type="file" accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handlePhotoUpload(e.target.files?.[0], "draft")}
                    />
                  </div>
                </div>

                {/* Basic info */}
                <div className="Settings_sectionDivider">Basic Information</div>
                <div className="Settings_formGrid">
                  <div className="Settings_formGroup">
                    <label>First Name</label>
                    <input type="text" value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} />
                  </div>
                  <div className="Settings_formGroup">
                    <label>Last Name</label>
                    <input type="text" value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} />
                  </div>
                  <div className="Settings_formGroup">
                    <label>Bio Line</label>
                    <input type="text" value={draft.bio} placeholder="Building the future of…" onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
                  </div>
                  <div className="Settings_formGroup">
                    <label>Headline / Role</label>
                    <input type="text" value={draft.headline || ""} placeholder="e.g. AI Founder" onChange={(e) => setDraft({ ...draft, headline: e.target.value })} />
                  </div>
                  <div className="Settings_formGroup Settings_formGroupFull">
                    <label>About / Description</label>
                    <textarea rows={4} value={draft.description} placeholder="Tell developers and investors about your journey…" onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
                  </div>
                </div>

                {/* Contact */}
                <div className="Settings_sectionDivider">Contact &amp; Social</div>
                <div className="Settings_formGrid">
                  <div className="Settings_formGroup">
                    <label>Email Address</label>
                    <input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                  </div>
                  <div className="Settings_formGroup">
                    <label>Phone Number</label>
                    <input type="text" value={draft.phone} placeholder="+92 300 0000000" onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                  </div>
                  <div className="Settings_formGroup">
                    <label>LinkedIn</label>
                    <input type="text" value={draft.linkedin} placeholder="https://linkedin.com/in/…" onChange={(e) => setDraft({ ...draft, linkedin: e.target.value })} />
                  </div>
                  <div className="Settings_formGroup">
                    <label>Location</label>
                    <input type="text" value={draft.location || ""} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
                  </div>
                </div>

                {/* Personal */}
                <div className="Settings_sectionDivider">Personal Details</div>
                <div className="Settings_formGrid">
                  <div className="Settings_formGroup">
                    <label>Date of Birth</label>
                    <input type="date" value={draft.dob} onChange={(e) => setDraft({ ...draft, dob: e.target.value })} />
                  </div>
                  <div className="Settings_formGroup">
                    <label>Gender</label>
                    <select value={draft.gender} onChange={(e) => setDraft({ ...draft, gender: e.target.value })}>
                      <option value="">Select…</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                  <div className="Settings_formGroup Settings_formGroupFull">
                    <label>Education</label>
                    <input type="text" value={draft.education} placeholder="BSc Computer Science, LUMS" onChange={(e) => setDraft({ ...draft, education: e.target.value })} />
                  </div>
                </div>

                {/* Domains */}
                <div className="Settings_sectionDivider">Founder Focus / Domains</div>
                <div style={{ padding: "0 1.2rem 1.2rem" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {DOMAINS_LIST.map((d) => {
                      const sel = (draft.domains || []).includes(d);
                      return (
                        <button
                          key={d}
                          onClick={() => toggleDomain(d)}
                          style={{
                            padding: "5px 14px", borderRadius: 999,
                            fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                            background: sel ? "#1a312c" : "#eef4f1",
                            color: sel ? "#89d7b7" : "#428475",
                            border: `1px solid ${sel ? "rgba(137,215,183,0.3)" : "#d8e8e0"}`,
                            fontFamily: "inherit", transition: "all 0.15s",
                          }}
                        >{d}</button>
                      );
                    })}
                  </div>
                  {/* Custom domains not in DOMAINS_LIST */}
                  {(draft.domains || []).filter((d) => !DOMAINS_LIST.includes(d)).length > 0 && (
                    <div className="Settings_skillsWrap" style={{ paddingLeft: 0 }}>
                      {(draft.domains || []).filter((d) => !DOMAINS_LIST.includes(d)).map((d) => (
                        <div key={d} className="Settings_skillTag">
                          {d}
                          <button className="Settings_removeSkill" onClick={() => removeDomain(d)}><i className="fas fa-times" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="Settings_addSkillRow" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <input
                      type="text"
                      className="Settings_skillInput"
                      placeholder="Add custom domain…"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addCustomDomain(); }}
                    />
                    <button className="Settings_addSkillBtn" onClick={addCustomDomain}>
                      <i className="fas fa-plus" /> Add
                    </button>
                  </div>
                </div>

                <div className="Settings_cardFooter">
                  <button
                    onClick={() => setEditMode(false)}
                    style={{ marginRight: 8, padding: "0.45rem 1rem", background: "#f0f5f2", color: "#428475", border: "1px solid #d8e8e0", borderRadius: "0.4rem", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Cancel
                  </button>
                  <button
                    className={`Settings_saveBtn ${saved ? "Settings_saveBtnSaved" : ""}`}
                    onClick={handleSave}
                    disabled={saved}
                  >
                    {saved
                      ? <><i className="fas fa-check" /> Saved! Viewing profile…</>
                      : <><i className="fas fa-save" /> Save &amp; View Profile</>}
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════ NOTIFICATIONS ══════════════════ */}
            {activeTab === "notifications" && (
              <div className="Settings_card">
                <div className="Settings_cardHeader"><span><i className="fas fa-bell" /> Notification Preferences</span></div>
                <div className="Settings_notifList">
                  {Object.entries({
                    developerMatch:  { label: "New Developer Match",        sub: "Get notified when a developer matches your blueprint" },
                    interestRequest: { label: "Interest Request",           sub: "When a developer sends an interest request" },
                    investorView:    { label: "Investor Viewed Blueprint",  sub: "When an investor views your public blueprint" },
                    messageReceived: { label: "New Message Received",       sub: "When someone sends you a message in Inbox" },
                    blueprintComment:{ label: "Blueprint Comments",         sub: "Comments and feedback on your blueprints" },
                    billingAlerts:   { label: "Billing Alerts",             sub: "Payment due, invoice ready, subscription changes" },
                    weeklyDigest:    { label: "Weekly Digest",              sub: "Weekly summary of your portfolio activity" },
                    productUpdates:  { label: "Product Updates",            sub: "New features and improvements on Evolv" },
                  }).map(([key, { label, sub }]) => (
                    <div key={key} className="Settings_notifItem">
                      <div>
                        <div className="Settings_notifLabel">{label}</div>
                        <div className="Settings_notifSub">{sub}</div>
                      </div>
                      <div
                        className={`Settings_toggle ${notifications[key as keyof typeof notifications] ? "Settings_toggleOn" : ""}`}
                        onClick={() => setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })}
                      >
                        <div className="Settings_toggleKnob" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="Settings_cardFooter">
                  <button className={`Settings_saveBtn ${saved ? "Settings_saveBtnSaved" : ""}`} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
                    {saved ? <><i className="fas fa-check" /> Saved!</> : <><i className="fas fa-save" /> Save Preferences</>}
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════ SECURITY ══════════════════ */}
            {activeTab === "security" && (
              <div className="Settings_card">
                <div className="Settings_cardHeader"><span><i className="fas fa-lock" /> Security Settings</span></div>
                <div className="Settings_formGrid">
                  <div className="Settings_formGroup Settings_formGroupFull">
                    <label>Registered Email Address</label>
                    <input type="email" value={profile.email || ""} disabled style={{ cursor: "not-allowed", backgroundColor: "#eef2f0", color: "#888" }} />
                  </div>
                </div>
                <div className="Settings_sectionDivider" style={{ marginTop: 0 }}>Password Update</div>
                {!otpMode ? (
                  <div className="Settings_formGrid">
                    <div className="Settings_formGroup Settings_formGroupFull" style={{ position: "relative" }}>
                      <label>Current Password</label>
                      <input type="password" placeholder="Enter current password" value={passwordData.current} onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })} />
                      <button
                        type="button"
                        onClick={() => setOtpMode("sent")}
                        style={{ position: "absolute", right: 0, top: "-4px", background: "none", border: "none", color: "#888", fontSize: "0.68rem", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="Settings_formGroup">
                      <label>New Password</label>
                      <input type="password" placeholder="Enter new password" value={passwordData.newPass} onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })} />
                    </div>
                    <div className="Settings_formGroup">
                      <label>Confirm New Password</label>
                      <input type="password" placeholder="Confirm new password" value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} />
                    </div>
                  </div>
                ) : (
                  <div className="Settings_formGrid">
                    <div className="Settings_formGroup Settings_formGroupFull">
                      <div style={{ background: "#f8faf8", border: "1px solid #E6E0D7", padding: "1rem", borderRadius: "0.4rem", display: "flex", gap: "1rem" }}>
                        <i className="fas fa-shield-alt" style={{ color: "#5BC8A0", fontSize: "1.2rem", marginTop: "0.2rem" }} />
                        <div style={{ flex: 1 }}>
                          <h5 style={{ margin: 0, fontSize: "0.82rem", color: "#1B1B1B" }}>Verification Code Sent</h5>
                          <p style={{ fontSize: "0.75rem", color: "#888", margin: "0.3rem 0 0.8rem" }}>
                            We've sent a one-time passcode to <strong>{profile.email}</strong>. Enter it below to authorize your password change.
                          </p>
                          <div className="Settings_formGroup">
                            <label>6-Digit OTP</label>
                            <input type="text" placeholder="Enter code" value={otp} onChange={(e) => setOtp(e.target.value)} />
                          </div>
                          <button
                            type="button"
                            onClick={() => setOtpMode(false)}
                            style={{ background: "none", border: "none", color: "#888", fontSize: "0.7rem", fontWeight: 600, textDecoration: "underline", cursor: "pointer", marginTop: "0.8rem", padding: 0 }}
                          >
                            I remembered my password
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="Settings_formGroup">
                      <label>New Password</label>
                      <input type="password" placeholder="Enter new password" value={passwordData.newPass} onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })} />
                    </div>
                    <div className="Settings_formGroup">
                      <label>Confirm New Password</label>
                      <input type="password" placeholder="Confirm new password" value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} />
                    </div>
                  </div>
                )}
                <div className="Settings_securityInfo">
                  <i className="fas fa-shield-alt" style={{ color: "#5BC8A0" }} />
                  <span>Use at least 8 characters, including uppercase, lowercase, numbers, and symbols.</span>
                </div>
                <div className="Settings_sectionDivider">Two-Factor Authentication</div>
                <div className="Settings_twoFARow">
                  <div className="Settings_twoFALeft">
                    <div className="Settings_twoFALabel"><i className="fas fa-mobile-alt" style={{ color: "#5BC8A0" }} /> Authenticator App</div>
                    <div className="Settings_twoFASub">Use Google Authenticator or Authy to generate one-time codes</div>
                  </div>
                  <button className="Settings_enableBtn"><i className="fas fa-plus" /> Enable</button>
                </div>
                <div className="Settings_cardFooter">
                  <button className={`Settings_saveBtn ${pwSaved ? "Settings_saveBtnSaved" : ""}`} onClick={handlePwSave}>
                    {pwSaved ? <><i className="fas fa-check" /> Password Updated!</> : <><i className="fas fa-save" /> Update Password</>}
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════ PREFERENCES ══════════════════ */}
            {activeTab === "preferences" && (
              <div className="Settings_card">
                <div className="Settings_cardHeader"><span><i className="fas fa-sliders-h" /> Preferences</span></div>
                <div className="Settings_formGrid">
                  <div className="Settings_formGroup">
                    <label>Primary Goal</label>
                    <select value={profile.primaryGoal || ""} onChange={(e) => setProfile({ ...profile, primaryGoal: e.target.value })}>
                      <option>Find Developers</option>
                      <option>Find Investors</option>
                      <option>Network</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="Settings_sectionDivider">Visibility Preferences</div>
                <div className="Settings_prefNote"><i className="fas fa-robot" /> These settings control how your profile is shown in the founder network.</div>
                {[
                  { key: "publicProfile", label: "Public Profile",    sub: "Allow others to discover your profile in the Evolv network" },
                  { key: "showContact",   label: "Show Contact Info", sub: "Display your email and phone number to connections" },
                ].map(({ key, label, sub }) => (
                  <div key={key} className="Settings_toggleRow">
                    <div>
                      <div className="Settings_toggleLabel">{label}</div>
                      <div className="Settings_toggleSub">{sub}</div>
                    </div>
                    <div className="Settings_toggle Settings_toggleOn"><div className="Settings_toggleKnob" /></div>
                  </div>
                ))}
                <div className="Settings_cardFooter">
                  <button className={`Settings_saveBtn ${saved ? "Settings_saveBtnSaved" : ""}`} onClick={() => { onProfileSave(profile); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
                    {saved ? <><i className="fas fa-check" /> Saved!</> : <><i className="fas fa-save" /> Save Preferences</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
