"use client";

import { useId } from "react";

export function AreaSparkline({
  data,
  color = "#428475",
  height = 36,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const gradId = `sg-${uid}`;
  const W = 100;
  const H = height;
  const PAD = 4;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - PAD - ((v - min) / range) * (H - PAD * 2),
  }));
  const lineParts = pts.map((p, i) => {
    if (i === 0) return `M ${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    const prev = pts[i - 1];
    const cpx = ((prev.x + p.x) / 2).toFixed(2);
    return `C ${cpx},${prev.y.toFixed(2)} ${cpx},${p.y.toFixed(2)} ${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  });
  const linePath = lineParts.join(" ");
  const last = pts[pts.length - 1];
  const first = pts[0];
  const areaPath = `${linePath} L ${last.x.toFixed(2)},${H} L ${first.x.toFixed(2)},${H} Z`;
  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="2.2" fill={color} />
    </svg>
  );
}
