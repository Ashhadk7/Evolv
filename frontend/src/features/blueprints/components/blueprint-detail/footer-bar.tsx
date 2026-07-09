"use client";

import { Lock } from "@phosphor-icons/react";

export function FooterBar({ bpName, updatedAt }: { bpName: string; updatedAt: string }) {
  return (
    <div className="border-bp-border mt-1 flex items-center justify-between border-t px-1 pt-2 pb-1">
      <span className="font-mono-app text-bp-label text-xs">
        {bpName} · Venture Blueprint · Rev. {updatedAt}
      </span>
      <span className="text-bp-label flex items-center gap-[7px] text-xs">
        <Lock size={12} weight="duotone" className="text-bp-teal" /> Confidential — shared with
        matched developers only
      </span>
    </div>
  );
}
