"use client";

import { ArrowsClockwise } from "@phosphor-icons/react";

/** A page or panel is fetching — same visual language across the app: a
 * spinning icon in a bordered panel, not a blank screen or a false empty state. */
export function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="border-bp-border-soft bg-bp-card flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-14 text-center">
      <ArrowsClockwise size={22} weight="bold" className="text-bp-muted animate-spin" />
      <span className="text-bp-muted text-[13px] font-medium">{label}</span>
    </div>
  );
}
