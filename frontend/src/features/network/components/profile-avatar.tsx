import type { FounderContactProfile } from "@/features/network/types";

export function ProfileAvatar({
  profile,
  size = 64,
}: {
  profile: FounderContactProfile;
  size?: number;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        background: profile.avatarColor,
        fontSize: size > 56 ? 18 : 12,
      }}
    >
      {profile.initials}
    </div>
  );
}
