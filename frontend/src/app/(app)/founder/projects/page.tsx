"use client";

import { ProjectsTab } from "@/features/projects/components/projects-tab";
import { useFounderDashboardStore } from "@/features/founder-dashboard/store";
import { useFounderNavigation } from "@/features/founder-dashboard/use-founder-navigation";

export default function FounderProjectsPage() {
  const { blueprints, profile, saveBlueprints } = useFounderDashboardStore();
  const nav = useFounderNavigation();

  return (
    <ProjectsTab
      blueprints={blueprints}
      onBlueprintsChange={saveBlueprints}
      onViewBlueprint={nav.handleViewBlueprint}
      onNavigateNetwork={() => nav.go("network")}
      onMessage={nav.handleOpenNetworkMessage}
      stripeConnected={Boolean(profile.stripeConnected)}
      onNavigateSettingsPayment={nav.handleOpenPaymentSettings}
    />
  );
}
