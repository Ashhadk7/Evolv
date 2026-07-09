"use client";

import { InboxTab } from "@/features/messaging/components/founder-inbox-tab";
import { isFounderProfileComplete } from "@/features/founder-dashboard/profile-utils";
import { useFounderDashboardStore } from "@/features/founder-dashboard/store";
import { useFounderNavigation } from "@/features/founder-dashboard/use-founder-navigation";

export default function FounderInboxPage() {
  const { profile, inboxActiveContactId, networkInboxContacts, setInboxActiveContactId } =
    useFounderDashboardStore();
  const nav = useFounderNavigation();
  const profileComplete = isFounderProfileComplete(profile);

  return (
    <InboxTab
      activeContactId={inboxActiveContactId}
      onActiveContactChange={setInboxActiveContactId}
      extraContacts={networkInboxContacts}
      currentUser={profile}
      profileComplete={profileComplete}
      onRequireProfile={nav.requireFounderProfile}
    />
  );
}
