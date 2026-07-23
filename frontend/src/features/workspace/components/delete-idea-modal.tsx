"use client";

import { Trash } from "@phosphor-icons/react";
import { ModalShell } from "@/features/projects/components/modal-shell";

// Professional confirm dialog for deleting a blueprint idea. Reuses the shared
// ModalShell so it matches the rest of the workspace/blueprint modals.
export function DeleteIdeaModal({
  ideaName,
  deleting,
  onConfirm,
  onClose,
}: {
  ideaName: string;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell
      icon={<Trash size={16} className="text-[#c0554c]" />}
      title="Delete idea"
      subtitle="This can't be undone"
      onClose={onClose}
    >
      <p className="text-bp-muted text-[13px] leading-relaxed">
        Permanently delete <strong className="text-bp-ink">{ideaName}</strong> and its blueprint?
        This action can&apos;t be undone.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
          className="h-10 rounded-lg border border-bp-border bg-bp-card px-4 text-[13px] font-bold text-bp-muted transition hover:bg-bp-tint disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={deleting}
          className="h-10 rounded-lg bg-[#e02424] px-4 text-[13px] font-bold text-white transition hover:bg-[#c81e1e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Delete idea"}
        </button>
      </div>
    </ModalShell>
  );
}
