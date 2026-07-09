"use client";

import styles from "./developer-settings.module.css";
import type { SettingsTab } from "./developer-settings-types";
import { Logo } from "@/features/auth/components/logo";
import { useRouter } from "next/navigation";

export function SettingsSidebarNav({
  tabs,
  activeTab,
  onSelectTab,
  onDeleteAccount,
}: {
  tabs: { id: SettingsTab; label: string; icon: string }[];
  activeTab: SettingsTab;
  onSelectTab: (tab: SettingsTab) => void;
  onDeleteAccount: () => void;
}) {
  const router = useRouter();

  return (
    <div className={styles.tabsCol}>
      {/* Brand */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Logo dark={false} compact />
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.push("/developer/dashboard")}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[12.5px] font-semibold text-[#428475] transition-all hover:bg-[#eaf5f0]"
        style={{ border: "none", background: "transparent", marginBottom: "1rem" }}
      >
        <i className="fas fa-arrow-left" style={{ fontSize: "11px" }} /> Back to Dashboard
      </button>

      <div style={{ height: 1, background: "#e0e9e3", marginBottom: "1.25rem" }} />

      <p className={styles.sideTitle}>Settings</p>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ""}`}
          onClick={() => onSelectTab(tab.id)}
        >
          <i className={"fas fa-" + tab.icon} />
          {tab.label}
        </button>
      ))}
      <div className={styles.dangerZone}>
        <div className={styles.dangerTitle}>
          <i className="fas fa-exclamation-triangle" /> Danger Zone
        </div>
        <button className={styles.dangerBtn} onClick={onDeleteAccount}>
          Delete Account
        </button>
      </div>
    </div>
  );
}
