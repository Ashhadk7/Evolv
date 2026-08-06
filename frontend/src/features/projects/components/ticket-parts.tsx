"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/shared/label";
import { ModalOverlay } from "@/components/shared/modal-overlay";

/** A labelled block in the ticket body. */
export function TicketSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="bg-bp-tint border-bp-border-soft rounded-xl border p-[14px_16px]">
      <Label>{label}</Label>
      {children}
    </section>
  );
}

/** A labelled value in the ticket sidebar. */
export function TicketField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

/** Placeholder that keeps the dialog frame while the ticket loads or errors. */
export function TicketLoading({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-bp-card border-bp-border text-bp-muted flex w-full max-w-[880px] items-center justify-center rounded-2xl border p-[56px_20px] text-[13px] shadow-[0_24px_60px_-20px_rgba(9,32,26,0.45)]">
        {message}
      </div>
    </ModalOverlay>
  );
}
