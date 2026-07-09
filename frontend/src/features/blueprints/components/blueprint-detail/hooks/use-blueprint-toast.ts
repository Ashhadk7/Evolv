// Toast notification state for the blueprint detail view, extracted from blueprint-detail.tsx.
"use client";

import { useState } from "react";

export function useBlueprintToast() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2000);
  };

  return { toast, showToast };
}
