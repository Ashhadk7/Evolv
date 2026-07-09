"use client";

import {
  TEXT_BODY,
  TEXT_MUTED,
  TEXT_DIM,
  BORDER,
  FIELD_BG,
} from "@/features/settings/lib/settings-theme";

export function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  optional,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
}) {
  const base =
    "w-full rounded-lg px-4 py-2.5 text-[13px] outline-none transition focus:ring-2 focus:ring-[#89d7b7]/30 focus:border-[#428475]";
  const style = { background: FIELD_BG, border: `1px solid ${BORDER}`, color: TEXT_BODY };

  return (
    <div>
      <label
        className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold"
        style={{ color: TEXT_MUTED }}
      >
        {label}
        {optional && (
          <span className="text-[10px] font-normal" style={{ color: TEXT_DIM }}>
            (optional)
          </span>
        )}
      </label>
      {type === "textarea" ? (
        <textarea
          className={base}
          style={{ ...style, minHeight: 76, resize: "none" }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : type === "select" ? (
        <select
          className={base}
          style={style}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          <option>Male</option>
          <option>Female</option>
          <option>Non-binary</option>
          <option>Prefer not to say</option>
        </select>
      ) : (
        <input
          type={type}
          className={base}
          style={style}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
