"use client";

import { DashboardOverview } from "@/features/founder-dashboard/components/dashboard-overview";
import { isFounderProfileComplete } from "@/features/founder-dashboard/profile-utils";
import { useFounderDashboardStore } from "@/features/founder-dashboard/store";
import { useFounderNavigation } from "@/features/founder-dashboard/use-founder-navigation";

export default function FounderDashboardPage() {
  const { profile, blueprints, setTriggerForge } = useFounderDashboardStore();
  const nav = useFounderNavigation();
  const profileComplete = isFounderProfileComplete(profile);

  return (
    <DashboardOverview
      profile={profile}
      onNavigateWorkspace={(forge) => {
        nav.go("workspace");
        if (forge) setTriggerForge(true);
      }}
      blueprints={blueprints}
      onViewBlueprint={nav.handleViewBlueprint}
      profileComplete={profileComplete}
    />
  );
}
