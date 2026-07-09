// Scroll-progress tracking + scroll-position restore for the blueprint detail view,
// extracted from blueprint-detail.tsx.
"use client";

import { useEffect, useRef, useState } from "react";
import type { FounderContactProfile } from "@/features/network/types";

export function useBlueprintScrollProgress(selectedDeveloper: FounderContactProfile | null) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const restoreBlueprintScrollRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
  };

  useEffect(() => {
    if (selectedDeveloper || restoreBlueprintScrollRef.current === null) return;
    const top = restoreBlueprintScrollRef.current;
    restoreBlueprintScrollRef.current = null;
    const raf = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTop = top;
      onScroll();
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedDeveloper]);

  return { scrollRef, progress, onScroll, restoreBlueprintScrollRef };
}
