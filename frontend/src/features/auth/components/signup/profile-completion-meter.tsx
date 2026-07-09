import { BRAND_INK, BRAND_MID, BRAND_MINT } from "./constants";

export function ProfileCompletionMeter({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-xl border bg-white px-5 py-4"
      style={{ borderColor: "rgba(15,28,24,0.1)" }}
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[12px] font-bold" style={{ color: BRAND_INK }}>
          {label}
        </span>
        <span className="text-[12px] font-bold" style={{ color: BRAND_MID }}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "rgba(15,28,24,0.08)" }}>
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${BRAND_MID}, ${BRAND_MINT})`,
          }}
        />
      </div>
    </div>
  );
}
