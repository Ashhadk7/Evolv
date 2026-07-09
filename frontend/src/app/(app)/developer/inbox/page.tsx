"use client";

import Inbox from "@/features/messaging/components/developer-inbox";
import { isDeveloperProfileComplete } from "@/features/developer-dashboard/profile-utils";
import { useDeveloperDashboardStore } from "@/features/developer-dashboard/store";
import { useDeveloperNavigation } from "@/features/developer-dashboard/use-developer-navigation";

export default function DevInboxPage() {
  const { profile, inboxActiveContactId, networkInboxContacts, setInboxActiveContactId } =
    useDeveloperDashboardStore();
  const nav = useDeveloperNavigation();
  const profileComplete = isDeveloperProfileComplete(profile);

  return (
    <Inbox
      activeContactId={inboxActiveContactId}
      onActiveContactChange={setInboxActiveContactId}
      extraContacts={networkInboxContacts}
      profileComplete={profileComplete}
      onRequireProfile={nav.requireDeveloperProfile}
    />
  );
}
