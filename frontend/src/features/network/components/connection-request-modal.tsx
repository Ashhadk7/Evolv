"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PaperPlaneTilt, X } from "@phosphor-icons/react";
import type { FounderContactProfile } from "@/features/network/types";
import { ProfileAvatar } from "./profile-avatar";

export function ConnectionRequestModal({
  person,
  onClose,
  onWithoutNote,
  onWithNote,
}: {
  person: FounderContactProfile;
  onClose: () => void;
  onWithoutNote: () => void;
  onWithNote: (note: string) => void;
}) {
  const [addingNote, setAddingNote] = useState(false);
  const [note, setNote] = useState("");
  const trimmedNote = note.trim();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-[#0f1c18]/35 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
        className="w-full max-w-[520px] overflow-hidden bg-white shadow-2xl rounded-2xl border border-[#c5ddd0]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-[#1a312c] text-[#e8f5ef]">
          <div className="flex min-w-0 items-center gap-3">
            <ProfileAvatar profile={person} size={42} />
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-extrabold">Connect with {person.name}</h3>
              <p className="truncate text-[11px] text-[#89d7b7]">
                {person.role} at {person.company}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-white/10"
            aria-label="Close connection request"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="px-5 py-5">
          {!addingNote ? (
            <p className="text-[13px] leading-6 text-[#334d42]">
              Send the request now, or add a short note. If you add a note, their pending chat will
              open with your intro attached.
            </p>
          ) : (
            <div>
              <label className="mb-2 block text-[11px] font-extrabold tracking-[0.12em] uppercase text-[#7a9e8e]">
                Add a note
              </label>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Write a short intro..."
                className="h-32 w-full resize-none rounded-2xl px-4 py-3 text-[13px] leading-6 transition outline-none focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20 border border-[#c5ddd0] text-[#1a2e26] bg-[#fbfdfb]"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-end bg-[#f5f7f5] border-t border-[#dce7e1]">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border bg-white px-5 text-[13px] font-semibold transition hover:bg-[#f5f7f5] border-[#ded9d0] text-[#1a2e26]"
          >
            Cancel
          </button>
          {!addingNote ? (
            <>
              <button
                type="button"
                onClick={onWithoutNote}
                className="h-11 rounded-xl border bg-white px-5 text-[13px] font-extrabold transition hover:bg-[#f5f7f5] border-[#c5ddd0] text-[#1a312c]"
              >
                Without note
              </button>
              <motion.button
                type="button"
                onClick={() => setAddingNote(true)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="bp-gradient-btn flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[13px] font-extrabold"
              >
                Add a note
              </motion.button>
            </>
          ) : (
            <motion.button
              type="button"
              onClick={() => onWithNote(trimmedNote)}
              disabled={!trimmedNote}
              whileHover={trimmedNote ? { y: -1 } : {}}
              whileTap={trimmedNote ? { scale: 0.98 } : {}}
              className="bp-gradient-btn flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[13px] font-extrabold disabled:opacity-45"
            >
              <PaperPlaneTilt size={14} weight="fill" />
              Send note
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
