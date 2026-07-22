"use client";

import { useEffect, useState } from "react";

/** Number that eases up from 0 → target on mount. */
function useCountUp(target: number, duration = 1200, run = true) {
  const safeTarget = Number.isFinite(target) ? target : 0;
  const [val, setVal] = useState(run ? 0 : safeTarget);

  useEffect(() => {
    if (!run) {
      setVal(safeTarget);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(safeTarget * eased);
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setVal(safeTarget);
      }
    };
    raf = requestAnimationFrame(step);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [safeTarget, duration, run]);

  return run ? val : safeTarget;
}

export function CountNum({
  value,
  suffix = "",
  decimals = 0,
  run = true,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  run?: boolean;
}) {
  const v = useCountUp(value, 1200, run);
  return (
    <>
      {v.toFixed(decimals)}
      {suffix}
    </>
  );
}
