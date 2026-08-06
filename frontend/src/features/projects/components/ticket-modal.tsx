"use client";

import type { ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import { ModalOverlay } from "@/components/shared/modal-overlay";

/**
 * The Jira-style ticket dialog used by both issues and deliverables: a fixed
 * header carrying identity and status, a scrolling detail column, and a fixed
 * sidebar for the fields that stay visible while the body scrolls.
 */
export function TicketModal({
  id,
  eyebrow,
  title,
  chips,
  actions,
  sidebar,
  onClose,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  chips?: ReactNode;
  actions?: ReactNode;
  sidebar?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <ModalOverlay onClose={onClose} labelledBy={id}>
      <div className="bg-bp-card border-bp-border flex max-h-full w-full max-w-[880px] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_60px_-20px_rgba(9,32,26,0.45)]">
        <header className="border-bp-border bg-bp-tint flex shrink-0 items-start justify-between gap-4 border-b p-[16px_20px]">
          <div className="min-w-0">
            <span className="text-bp-label text-[10px] font-semibold tracking-[0.12em] uppercase">
              {eyebrow}
            </span>
            <h2
              id={id}
              className="text-bp-ink mt-1 text-[17px] leading-snug font-extrabold tracking-[-0.01em]"
            >
              {title}
            </h2>
            {chips && <div className="mt-2 flex flex-wrap items-center gap-1.5">{chips}</div>}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {actions}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="bg-bp-card border-bp-border-soft text-bp-muted hover:text-bp-ink hover:border-bp-mint focus-visible:ring-bp-teal flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <X size={14} weight="bold" />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="blueprint-scroll min-h-0 flex-1 overflow-y-auto p-[18px_20px]">
            {children}
          </div>
          {sidebar && (
            <aside className="border-bp-border bg-bp-page/60 blueprint-scroll min-h-0 shrink-0 overflow-y-auto border-t p-[18px_20px] md:w-[248px] md:border-t-0 md:border-l">
              {sidebar}
            </aside>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}
