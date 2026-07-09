"use client";

import { useState } from "react";
import { TEXT_BODY, TEXT_MUTED, TEXT_DIM, BORDER } from "@/features/settings/lib/settings-theme";
import { Toggle } from "./toggle";

export function NotificationsSection() {
  const [notifs, setNotifs] = useState({
    developerMatch: true,
    investorView: true,
    blueprintComment: false,
    weeklyDigest: true,
    billingAlerts: true,
    interestRequest: true,
    messageReceived: true,
    productUpdates: false,
  });

  const toggle = (key: keyof typeof notifs) => setNotifs((n) => ({ ...n, [key]: !n[key] }));

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
          key: "interestRequest" as const,
          label: "Interest request",
          desc: "When a developer sends an interest request",
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
          key: "blueprintComment" as const,
          label: "Blueprint comments",
          desc: "Comments and feedback on your blueprints",
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
                <Toggle on={notifs[key]} onChange={() => toggle(key)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
