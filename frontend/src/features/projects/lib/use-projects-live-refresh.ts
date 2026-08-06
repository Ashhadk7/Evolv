import { useEffect } from "react";
import {
  NOTIFICATION_CREATED_EVENT,
  NOTIFICATION_REFRESH_EVENT,
  type NotificationCreatedEvent,
} from "@/features/notifications/notification-events";

/**
 * Re-runs `onLiveUpdate` whenever a project notification arrives over the
 * socket the app already keeps open (invite sent, invite answered, issue or
 * deliverable moved, comment left) — the same signal the bell already reacts
 * to, so a founder or developer sees the other side's action without a
 * reload. A bare refresh event (no id) always triggers a re-run, matching
 * how the bell itself treats it.
 */
export function useProjectsLiveRefresh(onLiveUpdate: () => void): void {
  useEffect(() => {
    const handleCreated = (event: Event) => {
      const notification = (event as NotificationCreatedEvent).detail;
      if (!notification || notification.tab === "projects") onLiveUpdate();
    };
    const handleRefresh = () => onLiveUpdate();

    window.addEventListener(NOTIFICATION_CREATED_EVENT, handleCreated);
    window.addEventListener(NOTIFICATION_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(NOTIFICATION_CREATED_EVENT, handleCreated);
      window.removeEventListener(NOTIFICATION_REFRESH_EVENT, handleRefresh);
    };
  }, [onLiveUpdate]);
}
