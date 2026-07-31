"use client";

import { WorkspaceTab } from "@/features/workspace/components/workspace-tab";
import { isFounderProfileComplete } from "@/features/founder-dashboard/profile-utils";
import { useFounderDashboardStore } from "@/features/founder-dashboard/store";
import { useFounderNavigation } from "@/features/founder-dashboard/use-founder-navigation";

export default function FounderWorkspacePage() {
  const { blueprints, triggerForge, profile, saveBlueprints, setTriggerForge } =
    useFounderDashboardStore();
  const nav = useFounderNavigation();

  return (
    <WorkspaceTab
      blueprints={blueprints}
      onBlueprintsChange={saveBlueprints}
      triggerForge={triggerForge}
      onClearForge={() => setTriggerForge(false)}
      profileComplete={isFounderProfileComplete(profile)}
      onMessage={nav.handleOpenNetworkMessage}
      onRequireProfile={nav.requireFounderProfile}
    />
  );
}
