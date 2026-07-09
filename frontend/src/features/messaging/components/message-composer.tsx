"use client";

import type { KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { PaperPlaneTilt, VideoCamera } from "@phosphor-icons/react";
import { MINT, TEXT } from "@/features/messaging/lib/inbox-theme";
import { Avatar } from "./inbox-avatar";

export function MessageComposer({
  senderName,
  senderInitials,
  senderAvatarUrl,
  draft,
  onDraftChange,
  onKeyDown,
  locked,
  placeholder,
  onSend,
  onMeetInvite,
}: {
  senderName: string;
  senderInitials: string;
  senderAvatarUrl?: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  locked: boolean;
  placeholder: string;
  onSend: () => void;
  onMeetInvite: () => void;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-3 bg-white px-4 py-3"
      style={{ borderTop: "1px solid #e8ede9" }}
    >
      <Avatar
        name={senderName}
        initials={senderInitials}
        avatarUrl={senderAvatarUrl}
        size={36}
        dark
      />
      <input
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={onKeyDown}
        disabled={locked}
        placeholder={placeholder}
        className="h-11 flex-1 rounded-xl px-4 text-[13px] outline-none"
        style={{
          background: locked ? "#eef3ef" : "#f5f7f5",
          border: "1px solid #e8ede9",
          color: TEXT,
        }}
      />
      <motion.button
        type="button"
        onClick={onMeetInvite}
        disabled={locked}
        title="Send Google Meet Invitation"
        whileHover={!locked ? { scale: 1.05 } : {}}
        whileTap={!locked ? { scale: 0.95 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#d4e4db] px-3 text-[12.5px] font-bold transition-colors hover:bg-[#f5f7f5]"
        style={{ color: "#1a2e26" }}
      >
        <VideoCamera size={14} weight="bold" /> Meet
      </motion.button>

      <motion.button
        type="button"
        onClick={onSend}
        disabled={!draft.trim() || locked}
        whileHover={draft.trim() && !locked ? { scale: 1.08 } : {}}
        whileTap={draft.trim() && !locked ? { scale: 0.92 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="bp-gradient-icon-btn flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ opacity: draft.trim() && !locked ? 1 : 0.4 }}
        aria-label="Send message"
      >
        <PaperPlaneTilt size={16} style={{ color: MINT }} weight="fill" />
      </motion.button>
    </div>
  );
}
