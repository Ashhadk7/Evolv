import type { Contact } from "@/features/messaging/types/developer-inbox-types";
import type { DeveloperContactProfile } from "@/features/developer-dashboard/data/developer-network-data";

export function profileToContact(profile: DeveloperContactProfile): Contact {
  return {
    id: profile.id,
    name: profile.name,
    role: `${profile.role} - ${profile.company}`,
    personType: profile.type,
    match: profile.match,
    lastMsg: "New conversation",
    lastTime: "Now",
    unread: 0,
    initials: profile.initials,
    online: Boolean(profile.online),
  };
}
