"use client";

import type React from "react";

const BRAND_INK = "#0f1c18";

export function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  right,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  right?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span
        className="mb-1.5 block text-[12px] font-semibold"
        style={{ color: "rgba(15,28,24,0.62)" }}
      >
        {label}
      </span>
      <span className="relative block">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          suppressHydrationWarning
          className="h-11 w-full rounded-xl border bg-white px-4 text-[14px] transition outline-none placeholder:text-[#0f1c18]/30 focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/18"
          style={{ borderColor: "rgba(15,28,24,0.11)", color: BRAND_INK }}
        />
        {right}
      </span>
    </label>
  );
}
