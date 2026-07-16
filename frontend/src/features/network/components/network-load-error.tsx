"use client";

import { WarningCircle } from "@phosphor-icons/react";

// Shared failure state for the network directory. Rendered instead of the
// "No results found" empty state when the people request actually errors, so a
// failure never masquerades as "there are no users".
export function NetworkLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 px-6 text-center border border-[#e8ede9]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fdeceb] text-[#c0392b]">
        <WarningCircle size={22} />
      </div>
      <h3 className="text-[14px] font-bold text-[#1a2e26]">Couldn&apos;t load the network</h3>
      <p className="mt-1 max-w-sm text-[11px] text-[#6b8e7e] leading-relaxed">
        Something went wrong loading people. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="bp-gradient-btn mt-4 rounded-xl px-4 py-2 text-[12px] font-semibold"
      >
        Retry
      </button>
    </div>
  );
}
