import { apiFetch } from "@/lib/api";
import type { AppNotif, NotifType } from "./types";

interface NotifWire {
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

function fromWire(n: NotifWire): AppNotif {
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
  return data.items.map(fromWire);
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiFetch(`/notifications/${id}`, { method: "PATCH", auth: true });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch("/notifications/mark-all-read", { method: "POST", auth: true });
}
