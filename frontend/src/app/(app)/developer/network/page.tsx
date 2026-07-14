"use client";

import Network from "@/features/network/components/developer-network";
import { isDeveloperProfileComplete } from "@/features/developer-dashboard/profile-utils";
import { useDeveloperDashboardStore } from "@/features/developer-dashboard/store";
import { useDeveloperNavigation } from "@/features/developer-dashboard/use-developer-navigation";

export default function DevNetworkPage() {
  const { profile, setNetworkRequestCount } = useDeveloperDashboardStore();
  const nav = useDeveloperNavigation();
  const profileComplete = isDeveloperProfileComplete(profile);

  return (
    <Network
      onNavigate={nav.navigateDeveloper}
      onMessage={nav.handleOpenNetworkMessage}
      onPendingCountChange={setNetworkRequestCount}
      profileComplete={profileComplete}
      onRequireProfile={nav.requireDeveloperProfile}
    />
  );
}
