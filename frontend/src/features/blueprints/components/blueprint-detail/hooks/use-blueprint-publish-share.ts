// Publish toggle + copy-link sharing for the blueprint detail view, extracted from blueprint-detail.tsx.
"use client";

import { apiFetch } from "@/lib/api";
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

  const togglePublish = async () => {
    const newVisibility = published ? "private" : "public";
    // Optimistically update UI immediately
    const updated: Blueprint = {
      ...bp,
      status: published ? "DRAFT" : "PUBLISHED",
      isPublic: !published,
    };
    onSave?.(updated);
    showToast(published ? "Blueprint unpublished" : "Blueprint published");

    // Persist to the backend so it actually shows up in Discover
    try {
      await apiFetch(`/blueprints/${bp.id}`, {
        method: "PATCH",
        auth: true,
        body: { visibility: newVisibility },
      });
    } catch (err) {
      console.error("[publish] Failed to update blueprint visibility:", err);
      // Revert optimistic update on failure
      onSave?.(bp);
      showToast("Failed to update visibility. Please try again.");
    }
  };

  return { published, copyLink, togglePublish };
}
