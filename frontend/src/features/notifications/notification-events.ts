import type { AppNotif } from "./types";

export const NOTIFICATION_CREATED_EVENT = "evolv:notification-created";
export const NOTIFICATION_REFRESH_EVENT = "evolv:notifications-refresh";

export type NotificationCreatedEvent = CustomEvent<AppNotif>;
