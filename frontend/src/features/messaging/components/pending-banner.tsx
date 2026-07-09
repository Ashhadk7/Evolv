"use client";

import { UserPlus } from "@phosphor-icons/react";
import { MID, MUTED, TEXT } from "@/features/messaging/lib/inbox-theme";

export function PendingBanner({ sentOutgoingIntro }: { sentOutgoingIntro: boolean }) {
  return (
    <div
      className="flex shrink-0 items-start gap-3 px-6 py-4"
      style={{ background: "#eef7f2", borderBottom: "1px solid #dcebe3" }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: "#dff1e8", color: MID }}
      >
        <UserPlus size={18} weight="fill" />
      </span>
      <div>
        <div className="text-[13px] font-extrabold" style={{ color: TEXT }}>
          Requested
        </div>
        <p className="mt-0.5 max-w-[680px] text-[12px] leading-5" style={{ color: MUTED }}>
          {sentOutgoingIntro
            ? "Your request and intro message are sent. You cannot message again until they accept."
            : "Your request is pending. You can send one intro message here, then wait for them to accept."}
        </p>
      </div>
    </div>
  );
}
