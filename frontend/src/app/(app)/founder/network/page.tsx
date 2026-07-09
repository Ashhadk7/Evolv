"use client";

import { NetworkTab } from "@/features/network/components/founder-network-tab";
import { isFounderProfileComplete } from "@/features/founder-dashboard/profile-utils";
import { useFounderDashboardStore } from "@/features/founder-dashboard/store";
import { useFounderNavigation } from "@/features/founder-dashboard/use-founder-navigation";

export default function FounderNetworkPage() {
  const { profile, setNetworkRequestCount } = useFounderDashboardStore();
  const nav = useFounderNavigation();
  const profileComplete = isFounderProfileComplete(profile);

  return (
    <NetworkTab
      onMessage={nav.handleOpenNetworkMessage}
      onPendingCountChange={setNetworkRequestCount}
      profileComplete={profileComplete}
      onRequireProfile={nav.requireFounderProfile}
    />
  );
}
