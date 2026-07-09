// Architecture diagram — SVG boxes+arrows fed by structured node/edge data. No
// diagram library, no image-gen model: the labels come straight from the
// (editable) tech stack, so the diagram can never show a box that doesn't match
// the stack. Feature-local: only used inside BlueprintDetail.
const DIAGRAM_LAYOUT: Record<string, { x: number; y: number }> = {
  client: { x: 0, y: 0 },
  api: { x: 220, y: 0 },
  ai: { x: 440, y: 0 },
  vector: { x: 440, y: 96 },
  db: { x: 220, y: 96 },
  payments: { x: 0, y: 96 },
  hosting: { x: 110, y: 192 },
};

export function ArchitectureDiagram({
  nodes,
  edges,
}: {
  nodes: { id: string; label: string }[];
  edges: { from: string; to: string }[];
}) {
  const boxW = 196,
    boxH = 46,
    W = 656,
    H = 250;
  const pos = (id: string) => DIAGRAM_LAYOUT[id] || { x: 0, y: 0 };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block" }}>
      {edges.map((e, i) => {
        const a = pos(e.from),
          b = pos(e.to);
        const x1 = a.x + boxW / 2,
          y1 = a.y + boxH / 2,
          x2 = b.x + boxW / 2,
          y2 = b.y + boxH / 2;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--color-bp-border-soft)"
            strokeWidth={2}
          />
        );
      })}
      {nodes.map((n) => {
        const p = pos(n.id);
        return (
          <g key={n.id}>
            <rect
              x={p.x}
              y={p.y}
              width={boxW}
              height={boxH}
              rx={10}
              fill="var(--color-bp-card)"
              stroke="var(--color-bp-border)"
              strokeWidth={1.5}
            />
            <text
              x={p.x + boxW / 2}
              y={p.y + boxH / 2 + 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill="var(--color-bp-ink)"
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
