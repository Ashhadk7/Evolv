"use client";

import { useId } from "react";
import type React from "react";

const BRAND_INK = "#0f1c18";
const ERROR_RED = "#dc2626";

type TextInputOption = string | { value: string; label?: string };

export function TextInput({
  label, value, onChange, placeholder, type = "text", right, error, onBlur, listId, options, required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  right?: React.ReactNode;
  error?: string;
  onBlur?: () => void;
  listId?: string;
  options?: readonly TextInputOption[];
  required?: boolean;
}) {
  const generatedId = useId();
  const describedBy = error ? `${generatedId}-error` : undefined;

  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>
        {label}
        {required && <span className="ml-1 align-super text-[10px] text-red-500">*</span>}
      </span>
      <span className="relative block">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          list={listId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-11 w-full rounded-lg border bg-white px-4 text-[14px] outline-none transition placeholder:text-[#0f1c18]/35 focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
          style={{ borderColor: error ? ERROR_RED : "rgba(15,28,24,0.12)", color: BRAND_INK }}
        />
        {right}
      </span>
      {options && listId && (
        <datalist id={listId}>
          {options.map((option) => {
            const item = typeof option === "string" ? { value: option } : option;
            return <option key={`${item.value}-${item.label ?? item.value}`} value={item.value} label={item.label} />;
          })}
        </datalist>
      )}
      {error && (
        <span id={describedBy} className="mt-1.5 block text-[11.5px] font-medium text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}
