"use client";

const BRAND_INK = "#0f1c18";
const BRAND_MINT = "#89d7b7";

export function ChoiceGrid({
  items,
  selected,
  onToggle,
}: {
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className="rounded-full border px-3 py-1.5 text-[12px] font-semibold transition"
            style={{
              background: active ? BRAND_INK : "#fff",
              borderColor: active ? BRAND_INK : "rgba(15,28,24,0.12)",
              color: active ? BRAND_MINT : "rgba(15,28,24,0.62)",
            }}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
