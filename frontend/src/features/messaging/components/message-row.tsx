"use client";

import { motion } from "framer-motion";
import { INK, DARK, TEXT, DIM } from "@/features/messaging/lib/inbox-theme";
import { getInitials } from "@/features/messaging/lib/inbox-helpers";
import { Avatar } from "./inbox-avatar";

interface MessageContact {
  name: string;
  initials?: string;
  avatarUrl?: string;
}

interface InboxMessage {
  from: "me" | "them";
  text: string;
  time: string;
  date: string;
  subject?: string;
}

interface CurrentMessagingUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
}

function getCurrentUserName(currentUser?: CurrentMessagingUser) {
  const fullName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ").trim();
  return fullName || currentUser?.email || "You";
}

export function MessageRow({
  msg,
  contact,
  currentUser,
}: {
  msg: InboxMessage;
  contact: MessageContact;
  currentUser?: CurrentMessagingUser;
}) {
  const mine = msg.from === "me";
  const currentUserName = getCurrentUserName(currentUser);
  const currentUserInitials = getInitials(currentUserName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 ${mine ? "justify-end" : "justify-start"}`}
    >
      {!mine && (
        <Avatar
          name={contact.name}
          initials={contact.initials}
          avatarUrl={contact.avatarUrl}
          size={42}
        />
      )}

      <div className={`flex max-w-[74%] flex-col ${mine ? "items-end" : "items-start"}`}>
        <div
          className={`mb-2 flex flex-wrap items-center gap-2 text-[12px] leading-5 ${mine ? "justify-end" : "justify-start"}`}
          style={{ color: DIM }}
        >
          {!mine && (
            <span className="font-extrabold" style={{ color: INK }}>
              {contact.name}
            </span>
          )}
          <span>
            {msg.date} · {msg.time}
          </span>
          {mine && (
            <span className="font-extrabold" style={{ color: INK }}>
              You
            </span>
          )}
        </div>

        <div
          className="px-4 py-3 text-[13px] leading-6"
          style={
            mine
              ? { background: DARK, color: "#e8f5ef", borderRadius: "18px 18px 4px 18px" }
              : {
                  background: "#fff",
                  color: TEXT,
                  border: "1px solid #e4ebe7",
                  borderRadius: "18px 18px 18px 4px",
                }
          }
        >
          <p className="whitespace-pre-wrap">{msg.text}</p>
        </div>
      </div>

      {mine && (
        <Avatar
          name={currentUserName}
          initials={currentUserInitials}
          avatarUrl={currentUser?.avatarUrl}
          size={42}
          dark
        />
      )}
    </motion.div>
  );
}
