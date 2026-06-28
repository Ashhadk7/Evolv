import type { NetworkType } from "../founderData";

export function TypeBadge({ type }: { type: NetworkType }) {
  const isFounder = type === "Founder";
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={{
        background: isFounder ? "rgba(196,151,58,0.1)" : "#e8f5ef",
        color: isFounder ? "#a87316" : "#2e7d5c",
        border: `1px solid ${isFounder ? "rgba(196,151,58,0.22)" : "#c5ddd0"}`,
      }}
    >
      {type}
    </span>
  );
}
