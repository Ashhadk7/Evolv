"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Users, UserPlus } from "@phosphor-icons/react";
import { RatingStars } from "@/components/shared/rating-stars";
import { TypeBadge } from "@/components/shared/type-badge";
import type { FounderContactProfile } from "@/features/network/types";
import { Avatar } from "./network-avatar";

export function PendingRequestsPanel({
  pendingPeople,
  onSelectPerson,
  onAccept,
  onIgnore,
}: {
  pendingPeople: FounderContactProfile[];
  onSelectPerson: (person: FounderContactProfile) => void;
  onAccept: (id: string) => void;
  onIgnore: (id: string) => void;
}) {
  if (pendingPeople.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-12 px-6 text-center border border-[#e8ede9]">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f5ef] text-[#2e7d5c]">
          <UserPlus size={22} weight="bold" />
        </div>
        <h3 className="text-[14px] font-bold text-[#1a2e26]">No pending invitations</h3>
        <p className="mt-1 max-w-sm text-[11px] text-[#6b8e7e] leading-relaxed">
          When other developers or founders send you a connection request, you&apos;ll see them listed here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 border border-[#e8ede9]">
      <div className="mb-4 flex items-center gap-2">
        <UserPlus size={16} weight="bold" className="text-[#428475]" />
        <span className="text-[13.5px] font-bold text-[#1a2e26]">
          Received Invitations ({pendingPeople.length})
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {pendingPeople.map((person) => (
            <motion.div
              key={person.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{
                backgroundColor: "#eaf5f0",
                borderColor: "#c5ddd0",
                boxShadow: "0 4px 14px rgba(46, 125, 92, 0.04)",
              }}
              onClick={() => onSelectPerson(person)}
              className="flex cursor-pointer flex-col gap-3 rounded-xl border border-transparent px-3.5 py-3 sm:flex-row sm:items-center sm:gap-4 transition-all duration-150"
            >
              {/* Profile Avatar */}
              <div className="flex shrink-0 items-center">
                <Avatar person={person} size={48} />
              </div>

              {/* Sender Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-bold text-[#1a2e26]">
                    {person.name}
                  </span>
                  <TypeBadge type={person.type} />
                  <span className="rounded bg-[#e8f5ef] px-1.5 py-0.5 text-[9px] font-extrabold text-[#2e7d5c] border border-[#c5ddd0]">
                    {person.match}% Match
                  </span>
                </div>

                <div className="mt-1 truncate text-[11px] font-medium text-[#6b8e7e]">
                  {person.role} at {person.company}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#7a9e8e]">
                  <span className="flex items-center gap-0.5">
                    <Users size={11} /> {person.mutual} mutual connections
                  </span>
                  {person.type === "Developer" && (
                    <span className="flex items-center gap-1.5">
                      <RatingStars rating={person.rating ?? 0} size={10} />
                      <span className="font-bold text-[#1a2e26]">{person.rating}/5</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onIgnore(person.id);
                  }}
                  className="rounded-xl border border-[#dde5e0] bg-white px-3.5 py-2 text-[12px] font-bold text-[#7a9e8e] transition hover:bg-[#f5f7f5] hover:text-[#1a2e26]"
                >
                  Ignore
                </button>
                <motion.button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onAccept(person.id);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bp-gradient-btn cursor-pointer rounded-xl px-4 py-2 text-[12px] font-bold"
                >
                  Accept
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
