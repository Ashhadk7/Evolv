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
  wrap = false,
}: {
  children: ReactNode;
  tone?: "neutral" | "mint" | "amber" | "red" | "dark";
  icon?: ReactNode;
  /**
   * Opt in for chips holding agent-written text of unpredictable length (a
   * marketing channel can run to a full sentence). Those stayed on one
   * unbreakable line, burst out of their card and widened the grid column,
   * which is what put a horizontal scrollbar on the blueprint page.
   *
   * Off by default: every other chip is a short fixed label ("High",
   * "Market Leader") that must never split across lines.
   */
  wrap?: boolean;
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
        // `break-word`, never `anywhere`: only `anywhere` shrinks the intrinsic
        // min-content width to one character, which lets a flex parent squeeze
        // even a single word into a vertical stack.
        ...(wrap
          ? { whiteSpace: "normal", overflowWrap: "break-word", maxWidth: "100%" }
          : { whiteSpace: "nowrap" }),
      }}
    >
      {icon}
      {children}
    </span>
  );
}
