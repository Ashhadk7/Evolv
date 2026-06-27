"use client";

import { Bell } from "@phosphor-icons/react";
import type { FounderProfile } from "./OnboardingWizard";

interface FounderTopActionsProps {
  profile: FounderProfile;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
}

export function FounderTopActions({ profile, onOpenProfile, onOpenNotifications }: FounderTopActionsProps) {
  const initials =
    `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() || "F";

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={onOpenNotifications}
        className="relative h-9 w-9 rounded-full flex items-center justify-center bg-white transition-all hover:bg-[#f5f7f5]"
        style={{ border: "1px solid #dde5e0", color: "#0f1c18" }}
        title="Notifications"
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
      <button
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

