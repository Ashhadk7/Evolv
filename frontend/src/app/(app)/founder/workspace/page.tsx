"use client";

import { WorkspaceTab } from "@/features/workspace/components/workspace-tab";
import { isFounderProfileComplete } from "@/features/founder-dashboard/profile-utils";
import { useFounderDashboardStore } from "@/features/founder-dashboard/store";
import { useFounderNavigation } from "@/features/founder-dashboard/use-founder-navigation";

export default function FounderWorkspacePage() {
  const {
    blueprints,
    openBlueprintId,
    triggerForge,
    profile,
    saveBlueprints,
    setOpenBlueprintId,
    setTriggerForge,
  } = useFounderDashboardStore();
  const nav = useFounderNavigation();
  const profileComplete = isFounderProfileComplete(profile);

  return (
    <WorkspaceTab
      initialBlueprints={blueprints}
      onBlueprintsChange={saveBlueprints}
      openBlueprintId={openBlueprintId}
      onClearOpen={() => setOpenBlueprintId(null)}
      triggerForge={triggerForge}
      onClearForge={() => setTriggerForge(false)}
      profileComplete={profileComplete}
      onCompleteProfile={nav.handleOpenProfile}
      onMessage={nav.handleOpenNetworkMessage}
      onRequireProfile={nav.requireFounderProfile}
    />
  );
}
