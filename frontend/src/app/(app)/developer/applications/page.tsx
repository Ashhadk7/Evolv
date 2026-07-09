"use client";

import type { ComponentType } from "react";
import ApplicationsRaw from "@/features/developer-dashboard/components/applications";
import { isDeveloperProfileComplete } from "@/features/developer-dashboard/profile-utils";
import { useDeveloperDashboardStore } from "@/features/developer-dashboard/store";
import { useDeveloperNavigation } from "@/features/developer-dashboard/use-developer-navigation";
import type { DeveloperPageProps } from "@/features/developer-dashboard/types";

const Applications = ApplicationsRaw as ComponentType<DeveloperPageProps>;

export default function DevApplicationsPage() {
  const { profile } = useDeveloperDashboardStore();
  const nav = useDeveloperNavigation();
  const profileComplete = isDeveloperProfileComplete(profile);

  return (
    <Applications
      onNavigate={nav.navigateDeveloper}
      profileComplete={profileComplete}
      onRequireProfile={nav.requireDeveloperProfile}
    />
  );
}
