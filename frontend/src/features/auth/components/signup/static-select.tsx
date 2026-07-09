// Plain native <select> styled to match the sign-up wizard.
import { CaretDown } from "@phosphor-icons/react";
import { BRAND_INK } from "./constants";
import { RequiredLabel } from "./required-label";

export function StaticSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <RequiredLabel label={label} />
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-11 w-full appearance-none rounded-lg border bg-white px-4 pr-10 text-[14px] transition outline-none focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20 disabled:cursor-not-allowed disabled:bg-[#f5f7f5] disabled:text-[#0f1c18]/35"
          style={{
            borderColor: "rgba(15,28,24,0.12)",
            color: value ? BRAND_INK : "rgba(15,28,24,0.38)",
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <CaretDown
          size={15}
          weight="bold"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
          style={{ color: "rgba(15,28,24,0.45)" }}
        />
      </span>
    </label>
  );
}
