"use client";

import type { ComponentType } from "react";
import DeveloperDashboardRaw from "@/features/developer-dashboard/components/developer-dashboard";
import { isDeveloperProfileComplete } from "@/features/developer-dashboard/profile-utils";
import { useDeveloperDashboardStore } from "@/features/developer-dashboard/store";
import { useDeveloperNavigation } from "@/features/developer-dashboard/use-developer-navigation";
import type { DeveloperPageProps } from "@/features/developer-dashboard/types";

const DeveloperDashboardPage = DeveloperDashboardRaw as ComponentType<DeveloperPageProps>;

export default function DevDashboardPage() {
  const { profile } = useDeveloperDashboardStore();
  const nav = useDeveloperNavigation();
  const profileComplete = isDeveloperProfileComplete(profile);

  return (
    <DeveloperDashboardPage
      onNavigate={nav.navigateDeveloper}
      profileComplete={profileComplete}
      onRequireProfile={nav.requireDeveloperProfile}
    />
  );
}
