"use client";

import { useEffect, useState } from "react";
import { TEXT_BODY, TEXT_MUTED, TEXT_DIM, BORDER } from "@/features/settings/lib/settings-theme";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from "@/features/notifications/notifications-api";
import { Toggle } from "./toggle";

type FounderNotificationPrefs = Pick<
  NotificationPreferences,
  | "developerMatch"
  | "applicationReceived"
  | "connectionRequest"
  | "connectionAccepted"
  | "investorView"
  | "messageReceived"
  | "blueprintPublished"
  | "blueprintComment"
  | "billingAlerts"
  | "weeklyDigest"
  | "productUpdates"
  | "sound"
>;

const DEFAULT_FOUNDER_NOTIFICATIONS: FounderNotificationPrefs = {
  developerMatch: true,
  applicationReceived: true,
  connectionRequest: true,
  connectionAccepted: true,
  investorView: true,
  messageReceived: true,
  blueprintPublished: true,
  blueprintComment: false,
  billingAlerts: true,
  weeklyDigest: true,
  productUpdates: false,
  sound: true,
};

function pickFounderPreferences(preferences: NotificationPreferences): FounderNotificationPrefs {
  return {
    developerMatch: preferences.developerMatch,
    applicationReceived: preferences.applicationReceived,
    connectionRequest: preferences.connectionRequest,
    connectionAccepted: preferences.connectionAccepted,
    investorView: preferences.investorView,
    messageReceived: preferences.messageReceived,
    blueprintPublished: preferences.blueprintPublished,
    blueprintComment: preferences.blueprintComment,
    billingAlerts: preferences.billingAlerts,
    weeklyDigest: preferences.weeklyDigest,
    productUpdates: preferences.productUpdates,
    sound: preferences.sound,
  };
}

export function NotificationsSection() {
  const [notifs, setNotifs] = useState<FounderNotificationPrefs>(
    DEFAULT_FOUNDER_NOTIFICATIONS
  );
  const [savingKey, setSavingKey] = useState<keyof FounderNotificationPrefs | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchNotificationPreferences()
      .then((preferences) => {
        if (active) setNotifs(pickFounderPreferences(preferences));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const toggle = (key: keyof FounderNotificationPrefs) => {
    const nextValue = !notifs[key];
    const next = { ...notifs, [key]: nextValue };
    setNotifs(next);
    setSavingKey(key);
    setError("");
    updateNotificationPreferences({ [key]: nextValue })
      .then((preferences) => setNotifs(pickFounderPreferences(preferences)))
      .catch(() => {
        setNotifs(notifs);
        setError("We couldn't save that preference. Please try again.");
      })
      .finally(() => setSavingKey(null));
  };

  const groups = [
    {
      title: "Matches & Connections",
      items: [
        {
          key: "developerMatch" as const,
          label: "New developer match",
          desc: "Get notified when a developer matches your blueprint",
        },
        {
          key: "applicationReceived" as const,
          label: "Developer applied",
          desc: "When a developer applies to one of your public blueprints",
        },
        {
          key: "connectionRequest" as const,
          label: "Connection request",
          desc: "When someone sends you a connection or message request",
        },
        {
          key: "connectionAccepted" as const,
          label: "Connection accepted",
          desc: "When someone accepts your connection request",
        },
        {
          key: "investorView" as const,
          label: "Investor viewed blueprint",
          desc: "When an investor views your public blueprint",
        },
      ],
    },
    {
      title: "Messages & Activity",
      items: [
        {
          key: "messageReceived" as const,
          label: "New message",
          desc: "When someone sends you a message in Inbox",
        },
        {
          key: "blueprintPublished" as const,
          label: "Blueprint published",
          desc: "When one of your blueprints goes live in Discover",
        },
        {
          key: "blueprintComment" as const,
          label: "Blueprint comments",
          desc: "Comments and feedback on your blueprints",
        },
        {
          key: "sound" as const,
          label: "Notification sound",
          desc: "Play a short sound when a new notification arrives",
        },
      ],
    },
    {
      title: "Account & Billing",
      items: [
        {
          key: "billingAlerts" as const,
          label: "Billing alerts",
          desc: "Payment due, invoice ready, subscription changes",
        },
        {
          key: "weeklyDigest" as const,
          label: "Weekly digest",
          desc: "Weekly summary of your portfolio activity",
        },
        {
          key: "productUpdates" as const,
          label: "Product updates",
          desc: "New features and improvements on Evolv",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <p className="rounded-lg border border-[#f1d6ce] bg-[#fff7f4] px-3 py-2 text-[12px] text-[#9b4938]">
          {error}
        </p>
      )}
      {groups.map((group) => (
        <div key={group.title}>
          <p
            className="mb-3 text-[10.5px] font-bold tracking-widest uppercase"
            style={{ color: TEXT_DIM }}
          >
            {group.title}
          </p>
          <div
            className="overflow-hidden rounded-xl bg-white"
            style={{ border: `1px solid ${BORDER}` }}
          >
            {group.items.map(({ key, label, desc }, i) => (
              <div
                key={key}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < group.items.length - 1 ? `1px solid #eaf0eb` : "none" }}
              >
                <div className="flex-1">
                  <p className="text-[13px] font-medium" style={{ color: TEXT_BODY }}>
                    {label}
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: TEXT_MUTED }}>
                    {desc}
                  </p>
                </div>
                <Toggle
                  on={notifs[key]}
                  onChange={() => toggle(key)}
                  disabled={savingKey === key}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
