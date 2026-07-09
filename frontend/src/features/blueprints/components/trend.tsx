import { TrendDown, TrendUp } from "@phosphor-icons/react";
import { NUM } from "@/components/shared/card-style";

// Feature-local: only used inside BlueprintDetail's AI insight cards.
export function Trend({ value, positive }: { value: string; positive: boolean }) {
  return (
    <span
      className={
        positive
          ? "bg-bp-success-bg text-bp-success"
          : "bg-bp-red-bg text-bp-red"
      }
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 999,
        ...NUM,
      }}
    >
      {positive ? <TrendUp size={11} weight="bold" /> : <TrendDown size={11} weight="bold" />}{" "}
      {value}
    </span>
  );
}
