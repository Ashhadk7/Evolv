"use client";

import { useEffect, useRef } from "react";

const CELL = 44;

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cols = 0;
    let rows = 0;
    let cells: { phase: number; speed: number; maxOpacity: number }[] = [];
    let raf: number;
    const startTime = performance.now();

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      cols = Math.ceil(canvas.width / CELL) + 2;
      rows = Math.ceil(canvas.height / CELL) + 2;
      cells = Array.from({ length: cols * rows }, () => ({
        phase: Math.random() * Math.PI * 2,
        speed: 0.18 + Math.random() * 0.55,
        maxOpacity: Math.random() < 0.22 ? 0.5 + Math.random() * 0.4 : 0.04 + Math.random() * 0.08,
      }));
    };

    const draw = (now: number) => {
      const t = (now - startTime) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(137,215,183,0.055)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL, 0);
        ctx.lineTo(x * CELL, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL);
        ctx.lineTo(canvas.width, y * CELL);
        ctx.stroke();
      }

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const cx = (i % cols) * CELL;
        const cy = Math.floor(i / cols) * CELL;
        const rawOp = (Math.sin(t * cell.speed + cell.phase) + 1) / 2;
        const op = rawOp * cell.maxOpacity;

        if (op > 0.02) {
          ctx.fillStyle = `rgba(137,215,183,${op * 0.22})`;
          ctx.fillRect(cx, cy, CELL, CELL);
        }
        if (op > 0.32) {
          ctx.fillStyle = `rgba(137,215,183,${Math.min(op * 0.85, 0.75)})`;
          ctx.beginPath();
          ctx.arc(cx + CELL, cy + CELL, 1.8, 0, Math.PI * 2);
          ctx.fill();
          const grd = ctx.createRadialGradient(
            cx + CELL / 2,
            cy + CELL / 2,
            0,
            cx + CELL / 2,
            cy + CELL / 2,
            CELL * 0.9
          );
          grd.addColorStop(0, `rgba(137,215,183,${op * 0.18})`);
          grd.addColorStop(1, "transparent");
          ctx.fillStyle = grd;
          ctx.fillRect(cx - CELL / 4, cy - CELL / 4, CELL * 1.5, CELL * 1.5);
        }
      }

      const wavePeriod = 14;
      const wavePos = ((t % wavePeriod) / wavePeriod) * (canvas.width + CELL * 6) - CELL * 3;
      const waveW = CELL * 5;
      const waveGrd = ctx.createLinearGradient(wavePos - waveW, 0, wavePos + waveW, 0);
      waveGrd.addColorStop(0, "transparent");
      waveGrd.addColorStop(0.5, "rgba(137,215,183,0.04)");
      waveGrd.addColorStop(1, "transparent");
      ctx.fillStyle = waveGrd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.88 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(137,215,183,0.1) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 68% 100% at 2% 50%, rgba(10,20,16,0.9) 0%, rgba(10,20,16,0.38) 48%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 115% 100% at 50% 50%, transparent 44%, rgba(8,18,14,0.62) 100%)",
        }}
      />
      <div
        className="absolute right-0 bottom-0 left-0"
        style={{ height: "28%", background: "linear-gradient(to bottom, transparent, #1a312c)" }}
      />
    </div>
  );
}
