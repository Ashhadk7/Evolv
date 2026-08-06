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

const URL_PATTERN = /(https?:\/\/[^\s<>"']+)/gi;
const TRAILING_PUNCTUATION_PATTERN = /[.,!?;:)]+$/;

function getCurrentUserName(currentUser?: CurrentMessagingUser) {
  const fullName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ").trim();
  return fullName || currentUser?.email || "You";
}

function LinkifiedMessage({ text, mine }: { text: string; mine: boolean }) {
  const parts = text.split(URL_PATTERN);

  return (
    <>
      {parts.map((part, index) => {
        if (!part.match(URL_PATTERN)) {
          return part;
        }

        const trailingPunctuation = part.match(TRAILING_PUNCTUATION_PATTERN)?.[0] ?? "";
        const href = trailingPunctuation ? part.slice(0, -trailingPunctuation.length) : part;

        return (
          <span key={`${href}-${index}`}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`break-all font-bold underline underline-offset-2 ${
                mine ? "text-[#b9f5d4] hover:text-white" : "text-[#2f6f62] hover:text-[#1a2e26]"
              }`}
            >
              {href}
            </a>
            {trailingPunctuation}
          </span>
        );
      })}
    </>
  );
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-2.5 sm:gap-3 w-full max-w-full overflow-hidden ${mine ? "justify-end" : "justify-start"}`}
    >
      {!mine && (
        <div className="shrink-0 mt-1">
          <Avatar
            name={contact.name}
            initials={contact.initials}
            avatarUrl={contact.avatarUrl}
            size={34}
          />
        </div>
      )}

      <div className={`flex max-w-[calc(100%-44px)] sm:max-w-[78%] flex-col min-w-0 ${mine ? "items-end" : "items-start"}`}>
        <div
          className={`mb-1 flex flex-wrap items-center gap-1.5 text-[11px] leading-4 ${mine ? "justify-end text-right" : "justify-start"}`}
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
          className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-[13px] leading-relaxed max-w-full overflow-hidden shadow-sm"
          style={
            mine
              ? {
                  background: "linear-gradient(135deg, #1a312c 0%, #122420 100%)",
                  color: "#e8f5ef",
                  borderRadius: "18px 18px 4px 18px",
                  border: "1px solid rgba(137,215,183,0.18)",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }
              : {
                  background: "#ffffff",
                  color: TEXT,
                  border: "1px solid #e4ebe7",
                  borderRadius: "18px 18px 18px 4px",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }
          }
        >
          <p className="whitespace-pre-wrap break-words min-w-0 max-w-full overflow-hidden m-0">
            <LinkifiedMessage text={msg.text} mine={mine} />
          </p>
        </div>
      </div>

      {mine && (
        <div className="shrink-0 mt-1">
          <Avatar
            name={currentUserName}
            initials={currentUserInitials}
            avatarUrl={currentUser?.avatarUrl}
            size={34}
            dark
          />
        </div>
      )}
    </motion.div>
  );
}
