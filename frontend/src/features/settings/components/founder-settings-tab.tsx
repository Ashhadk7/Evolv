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
  const [mobileDetailActive, setMobileDetailActive] = useState<boolean>(Boolean(section));
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const activeSection = section ?? localSection;
  const setSection = onSectionChange ?? setLocalSection;
  const router = useRouter();

  const handleSelectSection = (s: SettingsSection) => {
    setSection(s);
    setMobileDetailActive(true);
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

  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Founder User";
  const roleSubtitle = `Founder · ${profile.domains?.[0] || "HealthTech"}`;

  return (
    <div className="h-full overflow-y-auto md:overflow-hidden bg-[#f5f6f4]">
      {/* ─ Mobile Menu View (Image 1) ─ */}
      <div className={`md:hidden p-4 sm:p-6 flex flex-col gap-5 min-h-full ${mobileDetailActive ? "hidden" : "flex"}`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/founder/dashboard")}
            className="w-9 h-9 rounded-full bg-white border border-[#eaeeed] flex items-center justify-center text-[#1a2e26] hover:bg-[#eaf5f0]"
          >
            <ArrowLeft size={16} weight="bold" />
          </button>
          <h1 className="text-xl font-extrabold text-[#1a2e26] tracking-tight">Settings</h1>
        </div>

        {/* Profile Card */}
        <button
          type="button"
          onClick={() => handleSelectSection("profile")}
          className="w-full text-left bg-white border border-[#eaeeed] rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-[#89d7b7] transition-all"
        >
          <div className="flex items-center gap-3.5">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={fullName} className="w-12 h-12 rounded-full object-cover border border-[#eaeeed]" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#1a312c] text-[#89d7b7] flex items-center justify-center font-bold text-base">
                {fullName[0]?.toUpperCase() || "F"}
              </div>
            )}
            <div>
              <div className="font-bold text-[#1a2e26] text-[15px]">{fullName}</div>
              <div className="text-xs text-[#8aab9a] font-medium">{roleSubtitle}</div>
            </div>
          </div>
          <span className="text-[#8aab9a] text-lg">›</span>
        </button>

        {/* Account Section */}
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#8aab9a] mb-2 px-1">
            Account
          </div>
          <div className="bg-white border border-[#eaeeed] rounded-2xl overflow-hidden shadow-sm divide-y divide-[#f2f6f4]">
            <button
              type="button"
              onClick={() => handleSelectSection("profile")}
              className="w-full p-4 flex items-center justify-between hover:bg-[#f9fbf0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eaf5f0] text-[#2e7d5c] flex items-center justify-center">
                  <User size={18} weight="bold" />
                </div>
                <span className="font-bold text-[14px] text-[#1a2e26]">Edit profile</span>
              </div>
              <span className="text-[#8aab9a] text-lg">›</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSection("payment")}
              className="w-full p-4 flex items-center justify-between hover:bg-[#f9fbf0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eaf5f0] text-[#2e7d5c] flex items-center justify-center">
                  <CreditCard size={18} weight="bold" />
                </div>
                <span className="font-bold text-[14px] text-[#1a2e26]">Payment & billing</span>
              </div>
              <span className="text-[#8aab9a] text-lg">›</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSection("security")}
              className="w-full p-4 flex items-center justify-between hover:bg-[#f9fbf0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eaf5f0] text-[#2e7d5c] flex items-center justify-center">
                  <LockKey size={18} weight="bold" />
                </div>
                <span className="font-bold text-[14px] text-[#1a2e26]">Security & password</span>
              </div>
              <span className="text-[#8aab9a] text-lg">›</span>
            </button>
          </div>
        </div>

        {/* Preferences Section */}
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#8aab9a] mb-2 px-1">
            Preferences
          </div>
          <div className="bg-white border border-[#eaeeed] rounded-2xl overflow-hidden shadow-sm divide-y divide-[#f2f6f4]">
            <button
              type="button"
              onClick={() => handleSelectSection("notifications")}
              className="w-full p-4 flex items-center justify-between hover:bg-[#f9fbf0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eef2fc] text-[#4a6baf] flex items-center justify-center">
                  <Bell size={18} weight="bold" />
                </div>
                <span className="font-bold text-[14px] text-[#1a2e26]">Notifications</span>
              </div>
              <span className="text-[#8aab9a] text-lg">›</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteAccount}
              className="w-full p-4 flex items-center justify-between hover:bg-[#fdf0f0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#fdf0f0] text-[#b03030] flex items-center justify-center">
                  <WarningCircle size={18} weight="bold" />
                </div>
                <span className="font-bold text-[14px] text-[#b03030]">Delete Account</span>
              </div>
              <span className="text-[#b03030]/60 text-lg">›</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─ Mobile Detail View ─ */}
      <div className={`md:hidden p-4 sm:p-6 flex flex-col gap-4 min-h-full ${mobileDetailActive ? "flex" : "hidden"}`}>
        <button
          type="button"
          onClick={() => setMobileDetailActive(false)}
          className="self-start flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#eaeeed] text-xs font-bold text-[#428475]"
        >
          <ArrowLeft size={14} weight="bold" /> Settings
        </button>
        <div className="bg-white border border-[#eaeeed] rounded-2xl p-5 shadow-sm w-full">
          <h2 className="text-xl font-extrabold text-[#1a2e26] mb-1">
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
