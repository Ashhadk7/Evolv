// URL deep-link + browser-back sync for the blueprint detail view, extracted from blueprint-detail.tsx.
"use client";

import { useEffect } from "react";

export function useBlueprintUrlSync(blueprintId: string, onBack: () => void) {
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "workspace");
    url.searchParams.set("blueprint", blueprintId);
    window.history.pushState({}, "", url.toString());
    const handlePop = () => {
      const p = new URLSearchParams(window.location.search);
      if (!p.get("blueprint")) onBack();
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blueprintId]);

  const handleBack = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("blueprint");
    window.history.pushState({}, "", url.toString());
    onBack();
  };

  return { handleBack };
}
