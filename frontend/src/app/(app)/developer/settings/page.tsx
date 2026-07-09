"use client";

import type { ComponentType } from "react";
import SettingsRaw from "@/features/settings/components/developer-settings";
import { isDeveloperProfileComplete } from "@/features/developer-dashboard/profile-utils";
import { useDeveloperDashboardStore } from "@/features/developer-dashboard/store";
import { useDeveloperNavigation } from "@/features/developer-dashboard/use-developer-navigation";
import type { DeveloperPageProps } from "@/features/developer-dashboard/types";

const Settings = SettingsRaw as ComponentType<DeveloperPageProps>;

export default function DevSettingsPage() {
  const { profile } = useDeveloperDashboardStore();
  const nav = useDeveloperNavigation();
  const profileComplete = isDeveloperProfileComplete(profile);

  return (
    <Settings
      onNavigate={nav.navigateDeveloper}
      profileComplete={profileComplete}
      onRequireProfile={nav.requireDeveloperProfile}
    />
  );
}
