"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

interface CounterProps {
  from?: number;
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  from,
  to,
  suffix = "",
  prefix = "",
  duration = 2,
  className = "",
}: CounterProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(spanRef, { once: true });

  useEffect(() => {
    if (!isInView || !spanRef.current) return;
    const start = from ?? to;
    const controls = animate(start, to, {
      duration,
      ease: "easeOut",
      onUpdate(value) {
        if (spanRef.current) {
          spanRef.current.textContent = prefix + Math.round(value).toLocaleString() + suffix;
        }
      },
    });
    return () => controls.stop();
  }, [isInView, from, to, duration, prefix, suffix]);

  return (
    <span ref={spanRef} className={className}>
      {prefix}
      {to.toLocaleString()}
      {suffix}
    </span>
  );
}
