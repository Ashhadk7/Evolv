import type { ReactNode } from "react";
import { MONO } from "./card-style";

// Section heading — icon chip · kicker · title · description.
export function SectionHead({
  icon,
  kicker,
  title,
  desc,
  right,
}: {
  icon: ReactNode;
  kicker?: string;
  title: string;
  desc?: string;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 18,
        marginBottom: 20,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            className="bg-bp-tint"
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              border: "1px solid var(--color-bp-border-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div>
            {kicker && (
              <div
                className="text-bp-label"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  marginBottom: 2,
                  fontFamily: MONO,
                }}
              >
                {kicker}
              </div>
            )}
            <h2
              className="text-bp-ink"
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-0.022em",
                lineHeight: 1.1,
              }}
            >
              {title}
            </h2>
          </div>
        </div>
        {desc && (
          <p
            className="text-bp-muted"
            style={{
              fontSize: 13.5,
              lineHeight: 1.65,
              marginTop: 12,
              maxWidth: 640,
            }}
          >
            {desc}
          </p>
        )}
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}
