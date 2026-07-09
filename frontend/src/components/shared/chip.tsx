import type { ReactNode } from "react";

const TONE_CLASSES = {
  neutral: "bg-bp-tint text-bp-teal border-bp-border-soft",
  mint: "bg-bp-success-bg text-[#1d6e47] border-[#cfeadd]",
  amber: "bg-bp-amber-bg text-bp-amber border-bp-amber-line",
  red: "bg-bp-red-bg text-bp-red border-bp-red-line",
  dark: "bg-bp-forest text-bp-mint border-transparent",
};

export function Chip({
  children,
  tone = "neutral",
  icon,
}: {
  children: ReactNode;
  tone?: "neutral" | "mint" | "amber" | "red" | "dark";
  icon?: ReactNode;
}) {
  return (
    <span
      className={`${TONE_CLASSES[tone]} border`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {children}
    </span>
  );
}
