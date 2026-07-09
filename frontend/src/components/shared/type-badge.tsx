// Small shared badge showing whether a network contact is a Founder or Developer.
type NetworkType = "Developer" | "Founder";

export function TypeBadge({ type }: { type: NetworkType }) {
  const isFounder = type === "Founder";
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
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
