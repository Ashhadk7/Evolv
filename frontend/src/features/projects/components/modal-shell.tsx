"use client";

import { useId, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import { ModalOverlay } from "@/components/shared/modal-overlay";

export function ModalShell({
  icon,
  title,
  subtitle,
  onClose,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();

  return (
    <ModalOverlay onClose={onClose} labelledBy={titleId}>
      <div className="bg-bp-card border-bp-border blueprint-scroll mx-auto w-full max-w-[420px] overflow-y-auto rounded-2xl border p-[26px_26px_22px] shadow-[0_24px_60px_-20px_rgba(9,32,26,0.45)]">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-bp-tint border-bp-border-soft flex h-[34px] w-[34px] items-center justify-center rounded-lg border">
              {icon}
            </div>
            <div>
              <div id={titleId} className="text-bp-ink text-[15px] font-extrabold">
                {title}
              </div>
              {subtitle && <div className="text-bp-muted text-[11px]">{subtitle}</div>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="bg-bp-tint border-bp-border-soft text-bp-muted hover:text-bp-ink hover:border-bp-mint focus-visible:ring-bp-teal flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <X size={13} />
          </button>
        </div>
        {children}
      </div>
    </ModalOverlay>
  );
}
