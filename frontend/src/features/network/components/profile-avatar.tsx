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
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        background: profile.avatarUrl ? undefined : profile.avatarColor,
        backgroundImage: profile.avatarUrl ? `url(${profile.avatarUrl})` : undefined,
        backgroundPosition: "center",
        backgroundSize: "cover",
        fontSize: size > 56 ? 18 : 12,
      }}
    >
      {!profile.avatarUrl && profile.initials}
    </div>
  );
}
