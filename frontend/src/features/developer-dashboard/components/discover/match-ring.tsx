import styles from "@/features/developer-dashboard/components/discover.module.css";

const SIZE_CLASS = {
  sm: styles.ringSm,
  md: styles.ringMd,
  lg: styles.ringLg,
} as const;

export type MatchRingSize = keyof typeof SIZE_CLASS;

export function MatchRing({
  score,
  size = "md",
  label = "match",
}: {
  score: number | null;
  size?: MatchRingSize;
  label?: string;
}) {
  const hasScore = score !== null;
  const sweep = hasScore ? `${score * 3.6}deg` : "0deg";

  return (
    <div
      className={`${styles.matchRing} ${SIZE_CLASS[size]}`}
      style={{ "--ring-sweep": sweep } as React.CSSProperties}
      role="img"
      aria-label={hasScore ? `${score} percent ${label}` : `${label} unavailable`}
    >
      <span className={styles.matchRingInner}>
        <strong>{hasScore ? score : "—"}</strong>
        <small>{label}</small>
      </span>
    </div>
  );
}
