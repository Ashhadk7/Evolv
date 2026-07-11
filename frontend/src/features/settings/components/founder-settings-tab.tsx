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
  editSignal?: number;
}

export function SettingsTab({
  profile,
  onProfileSave,
  section,
  onSectionChange,
  editSignal = 0,
}: Props) {
  const [localSection, setLocalSection] = useState<SettingsSection>("profile");
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const activeSection = section ?? localSection;
  const setSection = onSectionChange ?? setLocalSection;
  const router = useRouter();

  const NAV: { id: SettingsSection; label: string; Icon: ElementType }[] = [
    { id: "profile", label: "Profile", Icon: User },
    { id: "payment", label: "Payment", Icon: CreditCard },
    { id: "notifications", label: "Notifications", Icon: Bell },
    { id: "security", label: "Security", Icon: LockKey },
  ];

  const handleDeleteAccount = () => {
    setDeleteAccountOpen(true);
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "#f5f6f4" }}>
      {/* ─ Left settings nav ─ */}
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

      {/* ─ Right content ─ */}
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
                <ProfileSection
                  profile={profile}
                  onSave={onProfileSave}
                  startEditingSignal={editSignal}
                />
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

      <DeleteAccountModal open={deleteAccountOpen} onClose={() => setDeleteAccountOpen(false)} />
    </div>
  );
}
