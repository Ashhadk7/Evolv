import type { FounderContactProfile } from "@/features/network/types";

/** Chips shown inline on the card; the rest collapse into "+N more". */
const VISIBLE_CHIPS = 3;

export function MatchedDevelopers({
  developers,
  loading,
}: {
  developers: FounderContactProfile[];
  loading: boolean;
}) {
  const visible = developers.slice(0, VISIBLE_CHIPS);
  const extra = developers.length - visible.length;

  return (
    <div className="border-bp-border-soft mt-4 border-t pt-3.5">
      <div className="text-[10px] font-semibold tracking-[0.08em] text-[#9ab4a4] uppercase">
        Matched developers
      </div>

      {loading ? (
        <p className="mt-[11px] text-[12.5px] text-[#9ab4a4]">Loading matches…</p>
      ) : developers.length === 0 ? (
        <p className="mt-[11px] text-[12.5px] text-[#9ab4a4]">No developer matches yet</p>
      ) : (
        <ul className="mt-[11px] flex list-none flex-wrap items-center gap-2">
          {visible.map((developer) => (
            <li
              key={developer.id}
              title={`${developer.name} · ${developer.match}% match`}
              className="flex items-center gap-1.5 rounded-full border border-[#e2ede7] bg-[#f2f7f4] py-[3px] pr-[11px] pl-[3px]"
            >
              <span
                aria-hidden
                className="text-bp-success flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#dcefe6] text-[9.5px] font-bold"
              >
                {developer.initials}
              </span>
              <span className="font-mono-app text-bp-ink text-[12px] font-bold">
                {developer.match}%
              </span>
              <span className="sr-only">{developer.name}</span>
            </li>
          ))}
          {extra > 0 && <li className="text-[12.5px] text-[#9ab4a4]">+{extra} more</li>}
        </ul>
      )}
    </div>
  );
}
