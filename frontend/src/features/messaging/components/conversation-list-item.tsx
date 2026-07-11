"use client";

import type { Contact } from "@/features/messaging/types/shared-inbox-types";
import { DIM, INK, MINT, MUTED, TEXT } from "@/features/messaging/lib/inbox-theme";
import { isIncomingRequest, isOutgoingPending } from "@/features/messaging/lib/inbox-shared-helpers";
import { Avatar } from "./inbox-avatar";

export function ConversationListItem({
  item,
  isActive,
  onSelect,
}: {
  item: Contact;
  isActive: boolean;
  onSelect: () => void;
}) {
  const requestLabel = isIncomingRequest(item)
    ? item.requestStatus === "rejected"
      ? "Rejected"
      : "Request"
    : isOutgoingPending(item)
      ? "Pending"
      : item.personType;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full px-4 py-4 text-left transition-all"
      style={{
        background: isActive ? "#f0f5f2" : "#fff",
        borderBottom: "1px solid #edf3ef",
        boxShadow: isActive ? "inset 3px 0 0 #428475" : "none",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar
            name={item.name}
            initials={item.initials}
            avatarUrl={item.avatarUrl}
            size={40}
            dark={isActive}
          />
          {item.online && (
            <span
              className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full"
              style={{ background: "#2e7d5c", border: "2px solid #fff" }}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[12px] font-extrabold" style={{ color: TEXT }}>
              {item.name}
            </span>
            <span className="shrink-0 text-[10px]" style={{ color: DIM }}>
              {item.lastTime}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase"
              style={{
                background:
                  item.requestDirection === "incoming"
                    ? "#fff7ed"
                    : item.personType === "Founder"
                      ? "#eef2ff"
                      : "#e8f5ef",
                color:
                  item.requestDirection === "incoming"
                    ? "#b45309"
                    : item.personType === "Founder"
                      ? "#4f46e5"
                      : "#2e7d5c",
              }}
            >
              {requestLabel}
            </span>
            <span className="truncate text-[10px]" style={{ color: MUTED }}>
              {item.role}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="truncate text-[11px]" style={{ color: MUTED }}>
              {item.lastMsg}
            </span>
            {item.unread > 0 && (
              <span
                className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold"
                style={{ background: MINT, color: INK }}
              >
                {item.unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
