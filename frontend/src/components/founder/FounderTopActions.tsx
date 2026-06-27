"use client";

import { useState, type ElementType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChatCircle, Sparkle, TrendUp, UserPlus, X } from "@phosphor-icons/react";
import type { FounderProfile } from "./OnboardingWizard";

interface FounderTopActionsProps {
  profile: FounderProfile;
  onOpenProfile: () => void;
}

const NOTIFICATIONS: {
  title: string;
  description: string;
  time: string;
  Icon: ElementType;
  tone: string;
}[] = [
  {
    title: "Connection request",
    description: "Maya Chen wants to connect about your Nexus Health build.",
    time: "4m",
    Icon: UserPlus,
    tone: "#2e7d5c",
  },
  {
    title: "New message",
    description: "Sarah Mitchell replied in your active Inbox conversation.",
    time: "18m",
    Icon: ChatCircle,
    tone: "#428475",
  },
  {
    title: "Blueprint update",
    description: "Nexus Health gained 3 new developer suggestions today.",
    time: "1h",
    Icon: TrendUp,
    tone: "#C4973A",
  },
  {
    title: "Founder match",
    description: "Hamza Ali viewed your public profile and saved your venture.",
    time: "Today",
    Icon: Sparkle,
    tone: "#7C5CBF",
  },
];

export function FounderTopActions({ profile, onOpenProfile }: FounderTopActionsProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const initials =
    `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() || "F";

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={() => setNotificationsOpen((open) => !open)}
        className="relative h-9 w-9 rounded-full flex items-center justify-center bg-white transition-all hover:bg-[#f5f7f5]"
        style={{ border: "1px solid #dde5e0", color: "#0f1c18" }}
        title="Notifications"
        aria-expanded={notificationsOpen}
      >
        <Bell size={17} weight="bold" />
        <span
          className="absolute rounded-full"
          style={{
            top: 7,
            right: 8,
            width: 7,
            height: 7,
            background: "#e05c5c",
            border: "1.5px solid #fff",
          }}
        />
      </button>
      {notificationsOpen && (
        <button
          type="button"
          aria-label="Close notifications"
          className="fixed inset-0 z-40 cursor-default"
          style={{ background: "transparent", border: "none" }}
          onClick={() => setNotificationsOpen(false)}
        />
      )}
      <AnimatePresence>
        {notificationsOpen && (
          <motion.div
            key="founder-notifications"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="fixed top-[70px] right-7 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid #e1e8e4", boxShadow: "0 18px 48px rgba(15,28,24,0.16)" }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #edf2ef" }}>
              <div>
                <div className="text-[13px] font-bold" style={{ color: "#1a2e26" }}>Notifications</div>
                <div className="text-[10px]" style={{ color: "#7a9e8e" }}>{NOTIFICATIONS.length} new updates</div>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="h-7 w-7 rounded-full flex items-center justify-center transition-colors hover:bg-[#f5f7f5]"
                style={{ color: "#7a9e8e", border: "1px solid #e8ede9" }}
                aria-label="Close notifications"
              >
                <X size={13} weight="bold" />
              </button>
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {NOTIFICATIONS.map(({ title, description, time, Icon, tone }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-start gap-3 px-4 py-3"
                  style={{ borderBottom: index < NOTIFICATIONS.length - 1 ? "1px solid #f0f5f2" : "none" }}
                >
                  <span
                    className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${tone}18`, color: tone }}
                  >
                    <Icon size={15} weight="bold" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-bold" style={{ color: "#1a2e26" }}>{title}</span>
                      <span className="text-[10px] shrink-0" style={{ color: "#9aaea5" }}>{time}</span>
                    </span>
                    <span className="block text-[11px] leading-5 mt-0.5" style={{ color: "#6b8e7e" }}>
                      {description}
                    </span>
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="px-4 py-3" style={{ background: "#f8faf8", borderTop: "1px solid #edf2ef" }}>
              <div className="text-[11px] font-semibold" style={{ color: "#428475" }}>
                Messages, connection requests, and venture updates will appear here.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={onOpenProfile}
        className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-white transition-all hover:opacity-90"
        style={{ border: "2px solid #c5ddd0", color: "#0f1c18" }}
        title="Open profile"
      >
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={`${profile.firstName || "Founder"} profile`} className="h-full w-full object-cover" />
        ) : (
          <span
            className="h-full w-full flex items-center justify-center text-[12px] font-bold"
            style={{ background: "#89d7b7", color: "#0f1c18" }}
          >
            {initials}
          </span>
        )}
      </button>
    </div>
  );
}
