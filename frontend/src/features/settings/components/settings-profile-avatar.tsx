"use client";

import { INK, MINT } from "@/features/settings/lib/settings-theme";

export function ProfileAvatar({
  avatarUrl,
  fullName,
  initials,
  size = 112,
}: {
  avatarUrl?: string;
  fullName: string;
  initials: string;
  size?: number;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full font-extrabold"
      style={{
        width: size,
        height: size,
        fontSize: size > 80 ? 34 : 14,
        background: `linear-gradient(135deg, #4cb896, ${MINT})`,
        color: INK,
        border: "4px solid #ffffff",
        boxShadow: "0 12px 34px rgba(15,28,24,0.16)",
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={`${fullName} profile`} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
