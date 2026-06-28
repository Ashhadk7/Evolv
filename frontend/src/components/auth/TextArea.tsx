"use client";

const BRAND_INK = "#0f1c18";

export function TextArea({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>{label}</span>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="min-h-[88px] w-full resize-none rounded-lg border bg-white px-4 py-3 text-[14px] outline-none transition placeholder:text-[#0f1c18]/35 focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
        style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}
      />
    </label>
  );
}
