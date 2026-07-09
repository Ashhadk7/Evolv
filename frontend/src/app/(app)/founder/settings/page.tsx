"use client";

import { SettingsTab } from "@/features/settings/components/founder-settings-tab";
import { useFounderDashboardStore } from "@/features/founder-dashboard/store";

export default function FounderSettingsPage() {
  const { profile, settingsSection, settingsEditSignal, saveProfile, setSettingsSection } =
    useFounderDashboardStore();

  return (
    <SettingsTab
      profile={profile}
      onProfileSave={saveProfile}
      section={settingsSection}
      onSectionChange={setSettingsSection}
      editSignal={settingsEditSignal}
    />
  );
}
