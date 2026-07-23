import { apiFetch } from "@/lib/api";
import type { AppNotif, NotifType } from "./types";

export type NotificationPreferenceKey =
  | "newMatch"
  | "developerMatch"
  | "applicationReceived"
  | "applicationUpdate"
  | "messageReceived"
  | "connectionRequest"
  | "connectionAccepted"
  | "blueprintPublished"
  | "weeklyDigest"
  | "founderViewed"
  | "investorView"
  | "blueprintComment"
  | "billingAlerts"
  | "marketingEmails"
  | "productUpdates"
  | "sound";

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  newMatch: true,
  developerMatch: true,
  applicationReceived: true,
  applicationUpdate: true,
  messageReceived: true,
  connectionRequest: true,
  connectionAccepted: true,
  blueprintPublished: true,
  weeklyDigest: true,
  founderViewed: false,
  investorView: true,
  blueprintComment: false,
  billingAlerts: true,
  marketingEmails: false,
  productUpdates: false,
  sound: true,
};

export interface NotifWire {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  tab: string;
  action_label: string;
  read: boolean;
  created_at: string;
}

interface NotifListWire {
  total: number;
  limit: number;
  offset: number;
  items: NotifWire[];
}

interface NotificationPreferencesWire {
  preferences: Partial<Record<NotificationPreferenceKey, boolean>>;
}

export function normalizeNotificationPreferences(
  preferences: Partial<Record<NotificationPreferenceKey, boolean>> | null | undefined
): NotificationPreferences {
  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(preferences ?? {}),
  };
}

export function notificationFromWire(n: NotifWire): AppNotif {
  const created = new Date(n.created_at);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let time: string;
  if (diffMins < 1) time = "just now";
  else if (diffMins < 60) time = `${diffMins}m ago`;
  else if (diffHours < 24) time = `${diffHours}h ago`;
  else if (diffDays === 1) time = "1d ago";
  else time = `${diffDays}d ago`;

  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    tab: n.tab,
    actionLabel: n.action_label,
    read: n.read,
    time,
  };
}

export async function fetchNotifications(
  limit = 50,
  offset = 0
): Promise<AppNotif[]> {
  const data = await apiFetch<NotifListWire>(
    `/notifications?limit=${limit}&offset=${offset}`,
    { auth: true }
  );
  return data.items.map(notificationFromWire);
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const data = await apiFetch<NotificationPreferencesWire>("/notifications/preferences", {
    auth: true,
  });
  return normalizeNotificationPreferences(data.preferences);
}

export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const data = await apiFetch<NotificationPreferencesWire>("/notifications/preferences", {
    method: "PATCH",
    auth: true,
    body: { preferences },
  });
  return normalizeNotificationPreferences(data.preferences);
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiFetch(`/notifications/${id}`, { method: "PATCH", auth: true });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch("/notifications/mark-all-read", { method: "POST", auth: true });
}
