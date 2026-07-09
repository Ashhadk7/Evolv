export function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5 bg-[#f5f7f5] border border-[#e8ede9]">
      <div className="mb-1 text-[10px] font-semibold tracking-wide uppercase text-[#7a9e8e]">
        {label}
      </div>
      <div className="text-[12px] font-bold text-[#1a2e26]">
        {value}
      </div>
    </div>
  );
}

export function EmptyProfileValue({ children }: { children: string }) {
  return (
    <div className="rounded-xl px-3 py-3 text-[12px] bg-[#f8faf8] text-[#7a9e8e] border border-dashed border-[#d7e5dd]">
      {children}
    </div>
  );
}
