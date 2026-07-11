"use client";

import { useEffect } from "react";

import { SESSION_CLEARED_EVENT } from "@/features/auth/lib/session";
import { createMessagingSocket } from "@/features/messaging/lib/messaging-api";

export function MessagingPresence({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let socket: WebSocket | null = null;
    let retry: number | undefined;

    const stop = () => {
      stopped = true;
      if (retry) window.clearTimeout(retry);
      socket?.close();
    };

    const connect = () => {
      if (stopped) return;
      try {
        socket = createMessagingSocket();
        socket.onclose = () => {
          if (!stopped) retry = window.setTimeout(connect, 3000);
        };
      } catch {
        if (!stopped) retry = window.setTimeout(connect, 3000);
      }
    };

    connect();
    window.addEventListener(SESSION_CLEARED_EVENT, stop);
    return () => {
      window.removeEventListener(SESSION_CLEARED_EVENT, stop);
      stop();
    };
  }, [enabled]);

  return null;
}
