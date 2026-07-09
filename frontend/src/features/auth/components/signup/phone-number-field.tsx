// Country-code selector + phone input combo for the sign-up wizard.
import { useEffect, useMemo, useRef, useState } from "react";
import { CaretDown, CheckCircle } from "@phosphor-icons/react";
import { BRAND_INK, BRAND_MID } from "./constants";
import { normalize } from "./helpers";
import { RequiredLabel } from "./required-label";
import type { DropdownOption } from "./types";

export function PhoneNumberField({
  countryCode,
  phone,
  codeOptions,
  onCountryCodeChange,
  onPhoneChange,
  onBlur,
  codeError,
  phoneError,
}: {
  countryCode: string;
  phone: string;
  codeOptions: DropdownOption[];
  onCountryCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onBlur: () => void;
  codeError?: string;
  phoneError?: string;
}) {
  const [codeOpen, setCodeOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const error = codeError ?? phoneError;
  const filteredCodes = useMemo(() => {
    const queryText = normalize(query);
    if (!queryText) return codeOptions;
    return codeOptions.filter((option) =>
      normalize(`${option.value} ${option.label ?? ""} ${option.meta ?? ""}`).includes(queryText)
    );
  }, [codeOptions, query]);
  const visibleCodes = filteredCodes.slice(0, 85);

  useEffect(() => {
    if (!codeOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setCodeOpen(false);
      setQuery("");
      onBlur();
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [codeOpen, onBlur]);

  return (
    <div ref={rootRef} className="relative">
      <RequiredLabel label="Phone number" required />
      <div
        className="flex h-11 w-full overflow-hidden rounded-lg border bg-white transition focus-within:border-[#428475] focus-within:ring-4 focus-within:ring-[#89d7b7]/20"
        style={{ borderColor: error ? "#dc2626" : "rgba(15,28,24,0.12)" }}
      >
        <button
          type="button"
          onClick={() => setCodeOpen((current) => !current)}
          className="flex h-full min-w-[92px] items-center justify-between gap-2 border-r bg-[#f7faf8] px-3 text-[13px] font-bold outline-none"
          style={{ borderColor: "rgba(15,28,24,0.09)", color: BRAND_MID }}
          aria-label="Select country code"
        >
          <span>{countryCode || "+Code"}</span>
          <CaretDown
            size={13}
            weight="bold"
            className={`transition ${codeOpen ? "rotate-180" : ""}`}
          />
        </button>
        <input
          type="tel"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          onBlur={onBlur}
          placeholder="300 0000000"
          aria-invalid={error ? true : undefined}
          className="min-w-0 flex-1 px-3.5 pl-6 text-[14px] outline-none placeholder:text-[#0f1c18]/35"
          style={{ color: BRAND_INK }}
        />
      </div>

      {codeOpen && (
        <div
          className="absolute top-[calc(100%+8px)] right-0 left-0 z-50 overflow-hidden rounded-lg border bg-white shadow-[0_18px_42px_rgba(15,28,24,0.16)]"
          style={{ borderColor: "rgba(15,28,24,0.12)" }}
        >
          <div className="border-b px-3 py-2" style={{ borderColor: "rgba(15,28,24,0.08)" }}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search code or country"
              className="h-9 w-full rounded-md border bg-[#f7faf8] px-3 text-[13px] outline-none placeholder:text-[#0f1c18]/35 focus:border-[#428475]"
              style={{ borderColor: "rgba(15,28,24,0.09)", color: BRAND_INK }}
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1.5">
            {visibleCodes.map((option) => {
              const active = option.value === countryCode;
              return (
                <button
                  key={`${option.value}-${option.label ?? ""}`}
                  type="button"
                  onClick={() => {
                    onCountryCodeChange(option.value);
                    setCodeOpen(false);
                    setQuery("");
                    onBlur();
                  }}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-[13px] transition hover:bg-[#eef7f2]"
                  style={{ background: active ? "#f0f8f3" : "#fff", color: BRAND_INK }}
                >
                  <span className="min-w-0">
                    <span className="block font-bold">{option.value}</span>
                    <span
                      className="mt-0.5 block truncate text-[11px]"
                      style={{ color: "rgba(15,28,24,0.48)" }}
                    >
                      {option.label}
                    </span>
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
            {!visibleCodes.length && (
              <div
                className="px-3 py-3 text-[12px] font-medium"
                style={{ color: "rgba(15,28,24,0.48)" }}
              >
                No matching code found.
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
