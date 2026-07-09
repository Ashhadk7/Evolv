import type { AppNotif, NotifType } from "./types";

// Icon + accent colour per notification type. Superset of the founder and
// developer maps (blueprint/application share the document style).
export const NOTIF_ICONS: Record<NotifType, string> = {
  match: "solar:user-check-rounded-bold-duotone",
  message: "solar:chat-round-dots-bold-duotone",
  blueprint: "solar:document-text-bold-duotone",
  application: "solar:document-text-bold-duotone",
  network: "solar:handshake-bold-duotone",
  system: "solar:bolt-circle-bold-duotone",
};

export const NOTIF_COLORS: Record<NotifType, string> = {
  match: "#89d7b7",
  message: "#7db8f7",
  blueprint: "#f0a96e",
  application: "#f0a96e",
  network: "#c4a8f5",
  system: "#89d7b7",
};

export const founderNotifs: AppNotif[] = [
  {
    id: "n1",
    type: "match",
    title: "New developer match",
    body: "Sarah Mitchell (94%) is interested in Nexus Health",
    time: "2m ago",
    read: false,
    tab: "network",
    actionLabel: "View in Network",
  },
  {
    id: "n2",
    type: "message",
    title: "Message from James Okafor",
    body: "Hey, I've pushed the backend API updates you requested",
    time: "15m ago",
    read: false,
    tab: "inbox",
    actionLabel: "Open in Inbox",
  },
  {
    id: "n3",
    type: "blueprint",
    title: "Blueprint viewed",
    body: "An investor opened your Nexus Health blueprint",
    time: "1h ago",
    read: true,
    tab: "workspace",
    actionLabel: "View Blueprint",
  },
  {
    id: "n4",
    type: "network",
    title: "New connection request",
    body: "Priya Mehta wants to connect with you",
    time: "3h ago",
    read: true,
    tab: "network",
    actionLabel: "View in Network",
  },
  {
    id: "n5",
    type: "system",
    title: "Milestone ready for review",
    body: "Aura Logistics — Phase 2 deliverables are marked complete",
    time: "1d ago",
    read: true,
    tab: "projects",
    actionLabel: "View Project",
  },
];

export const developerNotifs: AppNotif[] = [
  {
    id: "dn1",
    type: "match",
    title: "New startup match",
    body: "Nexus Health (94%) matches your AI & Python skillset",
    time: "3m ago",
    read: false,
    tab: "discover",
    actionLabel: "View in Discover",
  },
  {
    id: "dn2",
    type: "message",
    title: "Message from Asad Ahmed",
    body: "Hi, we'd love to discuss your application for the AI Engineer role",
    time: "18m ago",
    read: false,
    tab: "inbox",
    actionLabel: "Open in Inbox",
  },
  {
    id: "dn3",
    type: "application",
    title: "Application update",
    body: "FinFlow AI has moved your application to the Interview stage",
    time: "2h ago",
    read: true,
    tab: "applications",
    actionLabel: "View Applications",
  },
  {
    id: "dn4",
    type: "network",
    title: "Connection request",
    body: "Priya Sharma from Aura Logistics wants to connect with you",
    time: "5h ago",
    read: true,
    tab: "network",
    actionLabel: "View in Network",
  },
  {
    id: "dn5",
    type: "system",
    title: "Profile strength update",
    body: "Adding your GitHub will increase your match rate by 12%",
    time: "1d ago",
    read: true,
    tab: "settings",
    actionLabel: "Update Profile",
  },
];
