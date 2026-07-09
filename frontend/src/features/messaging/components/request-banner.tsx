"use client";

import { motion } from "framer-motion";
import { CheckCircle, UserPlus, XCircle } from "@phosphor-icons/react";
import type { Contact } from "@/features/messaging/types/shared-inbox-types";
import { MUTED, TEXT } from "@/features/messaging/lib/inbox-theme";

export function RequestBanner({
  contact,
  onAccept,
  onReject,
}: {
  contact: Contact;
  onAccept: () => void;
  onReject: () => void;
}) {
  const rejected = contact.requestStatus === "rejected";

  return (
    <div
      className="flex shrink-0 flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
      style={{
        background: rejected ? "#fff7f4" : "#fffaf0",
        borderBottom: "1px solid #f1e4d0",
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{
            background: rejected ? "#ffe7df" : "#fff1d6",
            color: rejected ? "#b42318" : "#b45309",
          }}
        >
          {rejected ? <XCircle size={18} weight="fill" /> : <UserPlus size={18} weight="fill" />}
        </span>
        <div>
          <div className="text-[13px] font-extrabold" style={{ color: TEXT }}>
            {rejected ? "Rejected message request" : "Message request"}
          </div>
          <p className="mt-0.5 max-w-[620px] text-[12px] leading-5" style={{ color: MUTED }}>
            {rejected
              ? "This request is still kept here. Accept it if you want to move it into General and reply."
              : "Accept this request to move the chat into General, or reject it to keep it in Requests."}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onReject}
          disabled={rejected}
          className="rounded-lg border px-3 py-2 text-[12px] font-bold transition hover:bg-white disabled:opacity-45"
          style={{ borderColor: "#ead7c4", color: "#9a5b1e" }}
        >
          Reject
        </button>
        <motion.button
          type="button"
          onClick={onAccept}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="bp-gradient-btn flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-extrabold"
        >
          <CheckCircle size={14} weight="fill" />
          Accept
        </motion.button>
      </div>
    </div>
  );
}
