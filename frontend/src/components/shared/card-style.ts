import type { CSSProperties } from "react";

// Layout/motion helpers for the blueprint/project card UI (workspace + projects
// features). Colors live as --color-bp-* utilities in globals.css (bg-bp-card,
// text-bp-ink, etc.) and are applied via className, not through this file.
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const MONO = "var(--font-mono-app)";
export const NUM: CSSProperties = {
  fontVariantNumeric: "tabular-nums",
  fontFeatureSettings: '"tnum" 1, "ss01" 1',
};

export const cardStyle = (extra?: CSSProperties): CSSProperties => ({
  background: "var(--color-bp-card)",
  border: "1px solid var(--color-bp-border)",
  borderRadius: "var(--radius-card)",
  boxShadow:
    "0 1px 1px rgba(19,36,29,0.03), 0 2px 6px rgba(19,36,29,0.03), 0 16px 40px -18px rgba(19,36,29,0.14)",
  ...extra,
});
