// Searchable, custom-styled dropdown used across the sign-up wizard.
import { useEffect, useMemo, useRef, useState } from "react";
import { CaretDown, CheckCircle } from "@phosphor-icons/react";
import { BRAND_INK, BRAND_MID } from "./constants";
import { normalize } from "./helpers";
import { RequiredLabel } from "./required-label";
import type { DropdownOption } from "./types";

export function ThemedSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  onBlur,
  disabled = false,
  loading = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  error?: string;
  onBlur?: () => void;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const displayValue = value || placeholder;
  const queryText = normalize(query);
  const filteredOptions = useMemo(() => {
    if (!queryText) return options;
    return options.filter((option) =>
      normalize(`${option.label ?? option.value} ${option.meta ?? ""}`).includes(queryText)
    );
  }, [options, queryText]);
  const visibleOptions = filteredOptions.slice(0, 85);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
      setQuery("");
      onBlur?.();
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [onBlur, open]);

  return (
    <div ref={rootRef} className="relative">
      <RequiredLabel label={label} required={required} />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        className="space-around flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3.5 text-left text-[14px] transition outline-none focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20 disabled:cursor-not-allowed disabled:bg-[#f5f7f5] disabled:text-[#0f1c18]/35"

        style={{
          paddingRight: "1rem",
          borderColor: error ? "#dc2626" : "rgba(15,28,24,0.12)",
          color: value ? BRAND_INK : "rgba(15,28,24,0.38)",
        }}
      >
        <span className="truncate pl-6">{loading ? "Loading..." : displayValue}</span>
        <CaretDown
          size={15}
          weight="bold"
          className={`ml-3 shrink-0 transition ${open ? "rotate-180" : ""}`}
          style={{ color: "rgba(15,28,24,0.45)" }}
        />
      </button>

      {open && !disabled && (
        <div
          className="absolute top-[calc(100%+8px)] right-0 left-0 z-50 overflow-hidden rounded-lg border bg-white shadow-[0_18px_42px_rgba(15,28,24,0.16)]"
          style={{ borderColor: "rgba(15,28,24,0.12)" }}
        >
          <div className="border-b px-3 py-2" style={{ borderColor: "rgba(15,28,24,0.08)" }}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              className="h-9 w-full rounded-md border bg-[#f7faf8] px-3 text-[13px] outline-none placeholder:text-[#0f1c18]/35 focus:border-[#428475]"
              style={{ borderColor: "rgba(15,28,24,0.09)", color: BRAND_INK }}
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1.5">
            {loading && (
              <div className="px-3 py-3 text-[12px] font-medium text-[#428475]">
                Loading options...
              </div>
            )}
            {!loading &&
              visibleOptions.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={`${option.value}-${option.meta ?? ""}`}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setQuery("");
                      onBlur?.();
                    }}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-[13px] transition hover:bg-[#eef7f2]"
                    style={{ background: active ? "#f0f8f3" : "#fff", color: BRAND_INK }}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {option.label ?? option.value}
                      </span>
                      {option.meta && (
                        <span
                          className="mt-0.5 block truncate text-[11px]"
                          style={{ color: "rgba(15,28,24,0.48)" }}
                        >
                          {option.meta}
                        </span>
                      )}
                    </span>
                    {active && (
                      <CheckCircle
                        size={16}
                        weight="fill"
                        className="ml-3 shrink-0"
                        style={{ color: BRAND_MID }}
                      />
                    )}
                  </button>
                );
              })}
            {!loading && !visibleOptions.length && (
              <div
                className="px-3 py-3 text-[12px] font-medium"
                style={{ color: "rgba(15,28,24,0.48)" }}
              >
                No matching option found.
              </div>
            )}
            {!loading && filteredOptions.length > visibleOptions.length && (
              <div
                className="px-3 py-2 text-[11px] font-medium"
                style={{ color: "rgba(15,28,24,0.42)" }}
              >
                Keep typing to narrow the list.
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <span className="mt-1.5 block text-[11.5px] font-medium text-red-600">{error}</span>
      )}
    </div>
  );
}
