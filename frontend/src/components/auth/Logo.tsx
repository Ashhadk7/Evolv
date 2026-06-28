"use client";

import Link from "next/link";

const BRAND_INK  = "#0f1c18";
const BRAND_MID  = "#428475";
const BRAND_MINT = "#89d7b7";
const BRAND_CREAM = "#fff4e1";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="inline-flex w-fit items-center gap-2.5">
      <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M2 15 L6 10.5 L10 13 L14 7 L18 3.5" stroke={dark ? BRAND_MINT : BRAND_MID} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="3.5" r="2.1" fill={dark ? BRAND_MINT : BRAND_MID} />
      </svg>
      <span className="text-[20px] font-bold tracking-tight" style={{ color: dark ? BRAND_CREAM : BRAND_INK }}>
        Ev<span style={{ color: dark ? BRAND_MINT : BRAND_MID }}>olv</span>
      </span>
    </Link>
  );
}
