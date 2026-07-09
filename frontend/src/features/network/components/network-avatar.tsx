import type { FounderContactProfile } from "@/features/network/types";

export function Avatar({ person, size = 44 }: { person: FounderContactProfile; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        background: person.avatarColor,
        fontSize: size > 50 ? 18 : 12,
      }}
    >
      {person.initials}
    </div>
  );
}
