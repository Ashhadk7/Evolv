"use client";

import { CaretLeft, DotsThree } from "@phosphor-icons/react";
import type { Contact } from "@/features/messaging/types/shared-inbox-types";
import { DIM, MUTED, TEXT } from "@/features/messaging/lib/inbox-theme";
import { Avatar } from "./inbox-avatar";

export function ChatHeader({
  contact,
  onViewProfile,
  onBack,
}: {
  contact: Contact;
  onViewProfile: () => void;
  onBack?: () => void;
}) {
  return (
    <div
      className="flex shrink-0 items-center px-4 py-3 md:px-5 md:py-4"
      style={{ borderBottom: "1px solid #e8ede9", background: "#fbfdfb" }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mr-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f4f2] text-[#1a312c] hover:bg-[#e0e8e4] md:hidden shrink-0"
          aria-label="Back to conversations"
        >
          <CaretLeft size={20} weight="bold" />
        </button>
      )}

      <button
        type="button"
        onClick={onViewProfile}
        className="-ml-1 flex flex-1 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-all hover:bg-[#f5f7f5] min-w-0"
      >
        <Avatar
          name={contact.name}
          initials={contact.initials}
          avatarUrl={contact.avatarUrl}
          size={44}
          dark
        />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-extrabold" style={{ color: TEXT }}>
            {contact.name}
          </div>
          <div
            className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]"
            style={{ color: MUTED }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: contact.online ? "#2e7d5c" : DIM }}
            />
            {contact.online ? "Online" : "Offline"}
            <span>- {contact.role}</span>
            <span
              className="ml-1 rounded-full px-1.5 py-0.5 font-bold"
              style={{ background: "#e8f5ef", color: "#2e7d5c" }}
            >
              {contact.match}% Match
            </span>
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2">
        <button type="button" className="rounded-lg p-1.5 transition-all hover:bg-[#e8ede9]">
          <DotsThree size={16} style={{ color: MUTED }} />
        </button>
      </div>
    </div>
  );
}
