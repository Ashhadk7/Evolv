"use client";

import { useEffect, useState } from "react";

/** Number that eases up from 0 → target on mount. */
function useCountUp(target: number, duration = 1200, run = true) {
  const [val, setVal] = useState(run ? 0 : target);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else setVal(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, run]);
  return run ? val : target;
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
