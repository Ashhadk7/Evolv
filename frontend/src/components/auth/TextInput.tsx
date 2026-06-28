"use client";

import type React from "react";

const BRAND_INK = "#0f1c18";

export function TextInput({
  label, value, onChange, placeholder, type = "text", right,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  right?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>{label}</span>
      <span className="relative block">
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="h-11 w-full rounded-lg border bg-white px-4 text-[14px] outline-none transition placeholder:text-[#0f1c18]/35 focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
          style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}
        />
        {right}
      </span>
    </label>
  );
}
