/** One of the three estimate tiles inside an idea card. */
export function IdeaMetricTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-[#edf3ef] bg-[#f5f8f6] px-3 py-[11px]">
      {/* Wraps rather than clips: an un-scoped blueprint renders a phrase
          ("To be estimated") here instead of a short figure. */}
      <div className="font-mono-app text-[18px] leading-[1.15] font-extrabold break-words text-[#2e6e52]">
        {value}
      </div>
      <div className="text-bp-label mt-1.5 text-[10px] leading-[1.25]">{label}</div>
    </div>
  );
}
