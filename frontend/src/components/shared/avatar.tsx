export function Avatar({ initials, size = 44 }: { initials: string; size?: number }) {
  return (
    <div
      className="text-bp-mint"
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: "linear-gradient(150deg, #1f3a30, #15271f)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.32,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
    >
      {initials}
    </div>
  );
}
