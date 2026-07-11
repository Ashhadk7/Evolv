"use client";

import { ChatCircleDots } from "@phosphor-icons/react";
import type { Contact, InboxFilter } from "@/features/messaging/types/shared-inbox-types";
import { BORDER, DARK, MID, MINT, MUTED, TEXT } from "@/features/messaging/lib/inbox-theme";
import { ConversationListItem } from "./conversation-list-item";

export function ConversationListPanel({
  inboxTabs,
  inboxFilter,
  onFilterChange,
  visibleContacts,
  activeId,
  onSelectContact,
  loading = false,
}: {
  inboxTabs: { id: InboxFilter; label: string; count: number }[];
  inboxFilter: InboxFilter;
  onFilterChange: (filter: InboxFilter) => void;
  visibleContacts: Contact[];
  activeId: string;
  onSelectContact: (id: string) => void;
  loading?: boolean;
}) {
  return (
    <section
      className="flex min-h-0 flex-col overflow-hidden bg-white"
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        boxShadow: "0 16px 38px rgba(15,28,24,0.06)",
      }}
    >
      <div
        className="shrink-0 px-5 py-4"
        style={{ borderBottom: "1px solid #eaf0eb", background: "#fbfdfb" }}
      >
        <div className="flex items-center gap-2 text-[13px] font-extrabold" style={{ color: TEXT }}>
          <ChatCircleDots size={16} weight="fill" style={{ color: MID }} />
          Conversations
        </div>
        <div
          className="mt-3 grid grid-cols-[1fr_1fr_1.25fr_1.15fr] rounded-xl p-1"
          style={{ background: "#eef4f0", border: "1px solid #e2ebe5" }}
        >
          {inboxTabs.map((tab) => {
            const isActive = inboxFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className="flex min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-[10px] font-extrabold transition-all"
                style={{
                  background: isActive ? DARK : "transparent",
                  color: isActive ? MINT : MUTED,
                }}
              >
                <span className="whitespace-nowrap">{tab.label}</span>
                {(tab.id !== "general" || tab.count > 0) && (
                  <span
                    className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px]"
                    style={{
                      background: isActive ? "rgba(137,215,183,0.14)" : "#fff",
                      color: isActive ? MINT : MID,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 px-6 text-center text-[12px]" style={{ color: MUTED }}>
            <span>Please wait while we load your chats</span>
            <span className="h-1.5 w-36 animate-pulse rounded-full" style={{ background: MID }} />
          </div>
        )}
        {!loading && visibleContacts.length === 0 && (
          <div
            className="flex h-full min-h-[220px] items-center justify-center px-6 text-center text-[12px]"
            style={{ color: MUTED }}
          >
            {inboxFilter === "unread"
              ? "No unread chats right now."
              : inboxFilter === "requests"
                ? "No message requests waiting."
                : inboxFilter === "pending"
                  ? "No pending requests from your side."
                  : "No conversations yet."}
          </div>
        )}
        {!loading && visibleContacts.map((item) => (
          <ConversationListItem
            key={item.id}
            item={item}
            isActive={item.id === activeId}
            onSelect={() => onSelectContact(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
