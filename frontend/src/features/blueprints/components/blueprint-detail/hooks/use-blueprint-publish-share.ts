// Publish toggle + copy-link sharing for the blueprint detail view, extracted from blueprint-detail.tsx.
"use client";

import type { Blueprint } from "@/features/blueprints/types";

export function useBlueprintPublishShare(
  bp: Blueprint,
  onSave: ((updated: Blueprint) => void) | undefined,
  showToast: (message: string) => void
) {
  const published = bp.status === "PUBLISHED";

  const copyLink = () => {
    const url = window.location.href;
    const fallback = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        /* ignore */
      }
    };
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).catch(fallback);
      } else {
        fallback();
      }
    } catch {
      fallback();
    }
    showToast("Link copied to clipboard");
  };

  const togglePublish = () => {
    onSave?.({ ...bp, status: published ? "DRAFT" : "PUBLISHED", isPublic: !published });
    showToast(published ? "Blueprint unpublished" : "Blueprint published");
  };

  return { published, copyLink, togglePublish };
}
