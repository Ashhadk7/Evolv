"use client";

import { useEffect } from "react";

import { SESSION_CLEARED_EVENT } from "@/features/auth/lib/session";
import { createMessagingSocket } from "@/features/messaging/lib/messaging-api";
import {
  NOTIFICATION_CREATED_EVENT,
  NOTIFICATION_REFRESH_EVENT,
} from "@/features/notifications/notification-events";
import {
  notificationFromWire,
  type NotifWire,
} from "@/features/notifications/notifications-api";

// A rejected handshake (e.g. 403) surfaces as a generic close, so we can't tell
// "permanent" from "transient" by code. Exponential backoff + a cap keeps a
// persistent rejection from turning into a reconnect storm.
const MAX_ATTEMPTS = 6;

export function MessagingPresence({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let socket: WebSocket | null = null;
    let retry: number | undefined;
    let attempts = 0;

    const stop = () => {
      stopped = true;
      if (retry) window.clearTimeout(retry);
      socket?.close();
    };

    const scheduleRetry = () => {
      if (stopped || attempts >= MAX_ATTEMPTS) return;
      attempts += 1;
      retry = window.setTimeout(connect, Math.min(30_000, 1000 * 2 ** attempts));
    };

    function connect() {
      if (stopped) return;
      try {
        socket = createMessagingSocket();
        socket.onopen = () => { attempts = 0; };
        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data) as {
              event?: string;
              notification?: NotifWire;
            };
            if (payload.event === "notification.created" && payload.notification) {
              window.dispatchEvent(
                new CustomEvent(NOTIFICATION_CREATED_EVENT, {
                  detail: notificationFromWire(payload.notification),
                })
              );
            }
            if (payload.event === "message.created") {
              window.dispatchEvent(new Event(NOTIFICATION_REFRESH_EVENT));
            }
          } catch {
            /* ignore non-notification socket payloads */
          }
        };
        socket.onclose = scheduleRetry;
      } catch {
        scheduleRetry();
      }
    }

    connect();
    window.addEventListener(SESSION_CLEARED_EVENT, stop);
    return () => {
      window.removeEventListener(SESSION_CLEARED_EVENT, stop);
      stop();
    };
  }, [enabled]);

  return null;
}
