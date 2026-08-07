"use client";

import { useState, type ElementType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, Bell, CreditCard, LockKey, WarningCircle, ArrowLeft } from "@phosphor-icons/react";
import type { FounderProfile } from "@/features/founder-dashboard/types";
import { Logo } from "@/features/auth/components/logo";
import { useRouter } from "next/navigation";
import {
  INK,
  DARK,
  TEXT_BODY,
  TEXT_MUTED,
  BORDER,
  CLEAR,
} from "@/features/settings/lib/settings-theme";
import { ProfileSection } from "@/features/settings/components/profile-section";
import { NotificationsSection } from "@/features/settings/components/notifications-section";
import { PaymentSection } from "@/features/settings/components/payment-section";
import { SecuritySection } from "@/features/settings/components/security-section";
import { DeleteAccountModal } from "@/features/settings/components/delete-account-modal";

export type SettingsSection = "profile" | "payment" | "notifications" | "security";

interface Props {
  profile: FounderProfile;
  onProfileSave: (p: FounderProfile) => Promise<void>;
  section?: SettingsSection;
  onSectionChange?: (section: SettingsSection) => void;
}

export function SettingsTab({ profile, onProfileSave, section, onSectionChange }: Props) {
  const [localSection, setLocalSection] = useState<SettingsSection>("profile");
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  // Always land on the menu first on mobile, same as the developer settings
  // page — `section` is always defined here (the store defaults it to
  // "profile"), so gating on `!section` skipped the menu on every visit.
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const activeSection = section ?? localSection;
  const setSection = onSectionChange ?? setLocalSection;
  const router = useRouter();

  const handleSectionChange = (id: SettingsSection) => {
    setSection(id);
    setShowMobileMenu(false);
  };

  const NAV: { id: SettingsSection; label: string; Icon: ElementType }[] = [
    { id: "profile", label: "Profile", Icon: User },
    { id: "payment", label: "Payment", Icon: CreditCard },
    { id: "notifications", label: "Notifications", Icon: Bell },
    { id: "security", label: "Security", Icon: LockKey },
  ];

  const handleDeleteAccount = () => {
    setDeleteAccountOpen(true);
  };

  const displayName = profile.name || profile.firstName ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() : profile.email || "Founder";
  const roleLabel = profile.role || "Founder - Web3";

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "#f5f6f4" }}>
      {/* ─ Left settings nav (Desktop) ─ */}
      <div
        className="hidden md:flex shrink-0 flex-col w-[220px]"
        style={{
          background: "#fff",
          borderRight: `1px solid ${BORDER}`,
          paddingTop: 20,
          paddingBottom: 24,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {/* Brand */}
        <div style={{ marginBottom: "1.25rem" }}>
          <Logo dark={false} compact />
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push("/founder/dashboard")}
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[12.5px] font-semibold text-[#428475] transition-all hover:bg-[#eaf5f0]"
          style={{ border: "none", background: "transparent", marginBottom: "1rem" }}
        >
          <ArrowLeft size={13} weight="bold" /> Back to Dashboard
        </button>

        <div style={{ height: 1, background: "#e6e0d7", marginBottom: "1.25rem" }} />

        <p
          className="mb-4 text-[16px] font-black tracking-tight"
          style={{ color: TEXT_BODY, letterSpacing: "-0.02em" }}
        >
          Settings
        </p>

        <div className="flex flex-1 flex-col gap-0.5">
          {NAV.map(({ id, label, Icon }) => {
            const active = activeSection === id;
            return (
              <motion.button
                key={id}
                onClick={() => handleSectionChange(id)}
                whileHover={active ? {} : { backgroundColor: "#f5f7f5", color: INK }}
                animate={{
                  backgroundColor: active ? "#f0f5f2" : CLEAR,
                  color: active ? INK : TEXT_MUTED,
                }}
                transition={{ duration: 0.13 }}
                className="relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left"
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

        <div className="mt-auto border-t border-[#e6e0d7] pt-6 max-[980px]:hidden">
          <div className="mb-[0.95rem] flex items-center gap-[0.45rem] text-[0.72rem] font-extrabold tracking-[0.08em] text-[#ff4d4d] uppercase">
            <WarningCircle size={13} weight="fill" />
            Danger Zone
          </div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="min-h-[48px] w-full cursor-pointer rounded-lg border border-[rgba(255,107,107,0.38)] bg-[rgba(255,107,107,0.045)] px-[1.1rem] py-[0.7rem] text-left text-[0.86rem] font-medium text-[#ff3333] transition-all duration-150 hover:border-[#ff6b6b] hover:bg-[rgba(255,107,107,0.1)]"
            style={{ fontFamily: '"Inter", sans-serif' }}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* ─ Mobile Settings Menu (Only visible on small screens when showMobileMenu is true) ─ */}
      <div className={`md:hidden flex-col flex-1 overflow-y-auto ${showMobileMenu ? 'flex' : 'hidden'}`}>
        {/* Header */}
        <div className="flex items-center gap-4 px-5 pt-6 pb-2">
          <button
            onClick={() => router.push("/founder/dashboard")}
            className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm"
          >
            <ArrowLeft size={14} weight="bold" className="text-[#0f1c18]" />
          </button>
          <h1 className="text-[20px] font-extrabold text-[#0f1c18]">Settings</h1>
        </div>

        <div className="px-5 pb-8 mt-4 space-y-6">
          {/* Profile Card */}
          <button
            onClick={() => handleSectionChange("profile")}
            className="w-full bg-white rounded-[16px] p-4 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50 text-left"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
              {profile.avatarUrl || profile.photo ? (
                <img src={profile.avatarUrl || profile.photo} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4cb896] to-[#89d7b7] text-[#0f1c18] font-bold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[15px] text-[#0f1c18] truncate">{displayName}</p>
              <p className="text-[13px] text-[#8ba69c] font-medium">{roleLabel}</p>
            </div>
            <div className="text-gray-400 shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          </button>

          {/* Account Section */}
          <div>
            <p className="text-[11px] font-bold text-[#8ba69c] uppercase tracking-wider mb-2.5 px-1">Account</p>
            <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50 overflow-hidden flex flex-col">
              <button onClick={() => handleSectionChange("profile")} className="w-full flex items-center gap-4 p-4 text-left border-b border-gray-50 active:bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-[#f2f8f5] text-[#428475] flex items-center justify-center shrink-0">
                  <User size={16} weight="fill" />
                </div>
                <span className="flex-1 font-bold text-[14px] text-[#0f1c18]">Edit profile</span>
                <div className="text-gray-300 shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
              </button>
              
              <button onClick={() => handleSectionChange("payment")} className="w-full flex items-center gap-4 p-4 text-left border-b border-gray-50 active:bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-[#f2f8f5] text-[#428475] flex items-center justify-center shrink-0">
                  <CreditCard size={16} weight="fill" />
                </div>
                <span className="flex-1 font-bold text-[14px] text-[#0f1c18]">Payment & billing</span>
                <div className="text-gray-300 shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
              </button>

              <button onClick={() => handleSectionChange("security")} className="w-full flex items-center gap-4 p-4 text-left active:bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-[#f2f8f5] text-[#428475] flex items-center justify-center shrink-0">
                  <LockKey size={16} weight="fill" />
                </div>
                <span className="flex-1 font-bold text-[14px] text-[#0f1c18]">Security & password</span>
                <div className="text-gray-300 shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
              </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div>
            <p className="text-[11px] font-bold text-[#8ba69c] uppercase tracking-wider mb-2.5 px-1">Preferences</p>
            <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50 overflow-hidden flex flex-col">
              <button onClick={() => handleSectionChange("notifications")} className="w-full flex items-center gap-4 p-4 text-left border-b border-gray-50 active:bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-[#eff4fe] text-[#4f7bf6] flex items-center justify-center shrink-0">
                  <Bell size={16} weight="fill" />
                </div>
                <span className="flex-1 font-bold text-[14px] text-[#0f1c18]">Notifications</span>
                <div className="text-gray-300 shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
              </button>

              <button onClick={handleDeleteAccount} className="w-full flex items-center gap-4 p-4 text-left active:bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-[#fef2f2] text-[#ef4444] flex items-center justify-center shrink-0">
                  <WarningCircle size={16} weight="fill" />
                </div>
                <span className="flex-1 font-bold text-[14px] text-[#ef4444]">Delete Account</span>
                <div className="text-[#fca5a5] shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─ Right content ─ */}
      <div
        className={`relative flex-1 overflow-y-auto overflow-x-hidden md:block ${showMobileMenu ? "hidden" : "block"}`}
        style={{ paddingTop: 28, paddingBottom: 32 }}
      >
        {/* Mobile Header (Back to menu) */}
        <div className="md:hidden px-5 mb-4">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="flex items-center gap-2 text-[13.5px] font-semibold text-[#428475]"
          >
            <ArrowLeft size={14} weight="bold" /> Settings
          </button>
        </div>

        <div className="px-5 md:px-[40px] max-w-full" style={{ maxWidth: activeSection === "profile" ? 920 : 560 }}>
          <h2
            className="mb-2 font-extrabold"
            style={{
              fontSize: "1.65rem",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: TEXT_BODY,
            }}
          >
            {activeSection === "profile"
              ? "Profile"
              : activeSection === "payment"
                ? "Payment & Billing"
                : activeSection === "security"
                  ? "Security & Password"
                  : "Notifications"}
          </h2>
          <p className="text-xs text-[#8aab9a] mb-6">
            {activeSection === "profile"
              ? "Update your personal details and public profile."
              : activeSection === "payment"
                ? "Manage founder billing contact and workspace plan."
                : activeSection === "security"
                  ? "Protect your founder account and workspace access."
                  : "Control which notifications you receive."}
          </p>
          {activeSection === "profile" ? (
            <ProfileSection profile={profile} onSave={onProfileSave} />
          ) : activeSection === "payment" ? (
            <PaymentSection profile={profile} onSave={onProfileSave} />
          ) : activeSection === "security" ? (
            <SecuritySection />
          ) : (
            <NotificationsSection />
          )}
        </div>
      </div>

      {/* ─ Desktop Side-by-Side Layout ─ */}
      <div className="hidden md:flex h-full overflow-hidden" style={{ background: "#f5f6f4" }}>
        {/* Left settings nav */}
        <div
          className="flex shrink-0 flex-col"
          style={{
            width: 220,
            background: "#fff",
            borderRight: `1px solid ${BORDER}`,
            paddingTop: 20,
            paddingBottom: 24,
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          <div style={{ marginBottom: "1.25rem" }}>
            <Logo dark={false} compact />
          </div>

          <button
            onClick={() => router.push("/founder/dashboard")}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[12.5px] font-semibold text-[#428475] transition-all hover:bg-[#eaf5f0]"
            style={{ border: "none", background: "transparent", marginBottom: "1rem" }}
          >
            <ArrowLeft size={13} weight="bold" /> Back to Dashboard
          </button>

          <div style={{ height: 1, background: "#e6e0d7", marginBottom: "1.25rem" }} />

          <p
            className="mb-4 text-[16px] font-black tracking-tight"
            style={{ color: TEXT_BODY, letterSpacing: "-0.02em" }}
          >
            Settings
          </p>

          <div className="flex flex-1 flex-col gap-0.5">
            {NAV.map(({ id, label, Icon }) => {
              const active = activeSection === id;
              return (
                <motion.button
                  key={id}
                  onClick={() => setSection(id)}
                  whileHover={active ? {} : { backgroundColor: "#f5f7f5", color: INK }}
                  animate={{
                    backgroundColor: active ? "#f0f5f2" : CLEAR,
                    color: active ? INK : TEXT_MUTED,
                  }}
                  transition={{ duration: 0.13 }}
                  className="relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left"
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

          <div className="mt-auto border-t border-[#e6e0d7] pt-6">
            <div className="mb-[0.95rem] flex items-center gap-[0.45rem] text-[0.72rem] font-extrabold tracking-[0.08em] text-[#ff4d4d] uppercase">
              <WarningCircle size={13} weight="fill" />
              Danger Zone
            </div>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="min-h-[48px] w-full cursor-pointer rounded-lg border border-[rgba(255,107,107,0.38)] bg-[rgba(255,107,107,0.045)] px-[1.1rem] py-[0.7rem] text-left text-[0.86rem] font-medium text-[#ff3333] transition-all duration-150 hover:border-[#ff6b6b] hover:bg-[rgba(255,107,107,0.1)]"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Right content */}
        <div
          className="relative flex-1 overflow-y-auto"
          style={{ paddingLeft: 40, paddingRight: 40, paddingTop: 28, paddingBottom: 32 }}
        >
          <div style={{ maxWidth: activeSection === "profile" ? 920 : 560 }}>
            <h2
              className="mb-2 font-extrabold"
              style={{
                fontSize: "1.65rem",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: TEXT_BODY,
              }}
            >
              {activeSection === "profile"
                ? "Profile"
                : activeSection === "payment"
                  ? "Payment"
                  : activeSection === "security"
                    ? "Security"
                    : "Notifications"}
            </h2>
            <p className="mb-8 text-[12px]" style={{ color: TEXT_MUTED }}>
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
                  <ProfileSection profile={profile} onSave={onProfileSave} />
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

      <DeleteAccountModal open={deleteAccountOpen} onClose={() => setDeleteAccountOpen(false)} />
    </div>
  );
}
