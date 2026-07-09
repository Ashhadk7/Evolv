"use client";

import { DARK, MID, MINT } from "@/features/messaging/lib/inbox-theme";
import { getInitials } from "@/features/messaging/lib/inbox-helpers";

export function Avatar({
  name,
  initials,
  avatarUrl,
  size = 40,
  dark = false,
}: {
  name: string;
  initials?: string;
  avatarUrl?: string;
  size?: number;
  dark?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold"
      style={{
        width: size,
        height: size,
        backgroundColor: avatarUrl ? undefined : dark ? DARK : "#e8f0eb",
        backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
        backgroundPosition: "center",
        backgroundSize: "cover",
        color: dark ? MINT : MID,
        fontSize: Math.max(10, Math.round(size * 0.28)),
        border: dark ? "1px solid rgba(137,215,183,0.25)" : "1px solid #dce9e2",
      }}
      aria-label={`${name} avatar`}
    >
      {!avatarUrl && (initials || getInitials(name))}
    </div>
  );
}
