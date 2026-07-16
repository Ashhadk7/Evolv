"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Buildings,
  ChatCircle,
  CheckCircle,
  MapPin,
  UserPlus,
  X,
} from "@phosphor-icons/react";
import { RatingStars } from "@/components/shared/rating-stars";
import { SkillPill } from "@/components/shared/skill-pill";
import { TypeBadge } from "@/components/shared/type-badge";
import type { FounderContactProfile } from "@/features/network/types";
import { Avatar } from "./network-avatar";

export function NetworkPersonCard({
  person,
  isConnected,
  isRequested,
  onSelect,
  onConnect,
  onMessage,
  onIgnore,
}: {
  person: FounderContactProfile;
  isConnected: boolean;
  isRequested: boolean;
  onSelect: () => void;
  onConnect: () => void;
  onMessage: () => void;
  onIgnore?: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{
        y: -3,
        borderColor: "#c5ddd0",
        boxShadow: "0 10px 28px rgba(15,28,24,0.06)",
      }}
      onClick={onSelect}
      className="relative cursor-pointer overflow-hidden rounded-2xl bg-white border border-[#e8ede9] flex flex-col h-full"
    >
      {/* Dismiss Button (Only show if not connected and onIgnore is available) */}
      {!isConnected && !isRequested && onIgnore && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onIgnore();
          }}
          className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#10231d]/20 text-white backdrop-blur-sm transition hover:bg-[#10231d]/35"
        >
          <X size={12} weight="bold" />
        </button>
      )}

      {/* Card Header Banner */}
      <div className="h-16 w-full bg-[linear-gradient(135deg,#1a312c,#428475)]" />

      {/* Avatar Container (Centered, overlapping the banner) */}
      <div className="relative mx-auto mt-[-36px] flex justify-center">
        <div className="rounded-full bg-white p-1 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <Avatar person={person} size={64} />
        </div>
        {person.online && (
          <span className="absolute bottom-0.5 right-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#2e7d5c]" />
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col px-4 pt-2.5 pb-4 text-center">
        {/* Name & Type */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="truncate text-[13.5px] font-bold text-[#1a2e26]">
            {person.name}
          </span>
          <TypeBadge type={person.type} />
        </div>

        {/* Role / Headline */}
        <p className="mt-0.5 truncate text-[11px] font-semibold text-[#6b8e7e]">
          {person.role}
        </p>

        {/* Company */}
        <p className="mt-1 flex items-center justify-center gap-1 truncate text-[10px] text-[#7a9e8e]">
          <Buildings size={11} /> {person.company}
        </p>

        {/* AI Match Badge — appears once the matching engine returns a score */}
        {person.match > 0 && (
          <div className="mt-2.5 flex justify-center">
            <span className="rounded-full px-2 py-0.5 text-[9.5px] font-extrabold tracking-wide uppercase border bg-[rgba(137,215,183,0.08)] text-[#2e7d5c] border-[rgba(137,215,183,0.25)]">
              {person.match}% AI Match
            </span>
          </div>
        )}

        {/* Developer Ratings */}
        {person.type === "Developer" && (
          <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-[#7a9e8e]">
            <RatingStars rating={person.rating ?? 0} size={10} />
            <span className="font-bold text-[#1a2e26]">{person.rating}/5</span>
            <span className="text-[#a0c0b0]">({person.reviews?.length ?? 0})</span>
          </div>
        )}

        {/* Location & Experience details */}
        <div className="mt-3 flex items-center justify-center gap-2.5 text-[10.5px] text-[#7a9e8e]">
          <span className="flex items-center gap-0.5 truncate">
            <MapPin size={11} /> {person.location.split(",")[0]}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#e0e9e3] shrink-0" />
          <span className="flex items-center gap-0.5 truncate">
            <Briefcase size={11} /> {person.experience}
          </span>
        </div>

        {/* Skills List */}
        <div className="mt-3 flex justify-center flex-wrap gap-1">
          {person.skills.slice(0, 2).map((skill) => (
            <SkillPill key={skill} label={skill} />
          ))}
          {person.skills.length > 2 && (
            <span className="rounded-full bg-[#f0f5f2] px-1.5 py-0.5 text-[9px] font-bold text-[#6b8e7e]">
              +{person.skills.length - 2}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="mt-auto pt-4">
          <div className="mb-3.5 h-[1px] w-full bg-[#eaf0eb]" />

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-2">
            {!isConnected ? (
              <motion.button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onConnect();
                }}
                disabled={isRequested}
                whileHover={isRequested ? {} : { scale: 1.02 }}
                whileTap={isRequested ? {} : { scale: 0.98 }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold transition-all ${
                  isRequested
                    ? "bg-[#e8f5ef] text-[#2e7d5c] border border-[#c5ddd0]"
                    : "bp-gradient-btn cursor-pointer"
                }`}
              >
                {isRequested ? (
                  <CheckCircle size={13} weight="fill" />
                ) : (
                  <UserPlus size={13} weight="bold" />
                )}
                {isRequested ? "Requested" : "Connect"}
              </motion.button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMessage();
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#dde5e0] bg-white py-2 text-[12px] font-bold text-[#0f1c18] transition-colors hover:bg-[#e8ede9]"
                >
                  <ChatCircle size={13} /> Message
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
