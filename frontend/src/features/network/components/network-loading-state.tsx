import { CircleNotch } from "@phosphor-icons/react";

export function NetworkLoadingState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 px-6 text-center border border-[#e8ede9]"
      aria-live="polite"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f5ef] text-[#2e7d5c]">
        <CircleNotch size={22} className="animate-spin" aria-hidden="true" />
      </div>
      <h3 className="text-[14px] font-bold text-[#1a2e26]">Loading network</h3>
      <p className="mt-1 max-w-sm text-[11px] text-[#6b8e7e] leading-relaxed">
        Sorting requests, connections, and suggested people.
      </p>
    </div>
  );
}
