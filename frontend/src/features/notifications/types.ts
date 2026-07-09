// Unified notification model shared by both dashboards.
// `blueprint` (founder) and `application` (developer) coexist as a superset so a
// single NotificationPanel can render either role's feed.
export type NotifType = "match" | "message" | "blueprint" | "application" | "network" | "system";

export interface AppNotif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  /** Tab/route id to navigate to when the notification is clicked. */
  tab: string;
  actionLabel: string;
}
