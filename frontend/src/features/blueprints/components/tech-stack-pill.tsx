"use client";

import { useState, type CSSProperties } from "react";
import { MONO } from "@/components/shared/card-style";

// Editable tech-stack layer pill — curated options + "Custom…". Read-only chip
// when not in edit mode, matching the existing pill style used across the
// hero/architecture rows. Feature-local: only used inside BlueprintDetail.
export function TechStackPill({
  label,
  layer,
  editing,
  onChange,
}: {
  label: string;
  layer: { chosen: string; options: string[] };
  editing: boolean;
  onChange: (v: string) => void;
}) {
  const [custom, setCustom] = useState(false);
  const pillBase: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontSize: 12.5,
    fontWeight: 600,
    padding: "8px 12px",
    borderRadius: 10,
  };
  if (!editing) {
    return (
      <span className="text-bp-ink bg-bp-tint border border-bp-border-soft" style={pillBase}>
        <span
          className="text-bp-label"
          style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase" }}
        >
          {label}
        </span>
        {layer.chosen}
      </span>
    );
  }
  return (
    <span
      className="bg-bp-card border border-bp-forest"
      style={{
        ...pillBase,
        flexDirection: "column",
        alignItems: "stretch",
        gap: 5,
        padding: "7px 10px",
      }}
    >
      <span
        className="text-bp-label"
        style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase" }}
      >
        {label}
      </span>
      <select
        value={custom ? "__custom" : layer.chosen}
        onChange={(e) => {
          if (e.target.value === "__custom") {
            setCustom(true);
            return;
          }
          setCustom(false);
          onChange(e.target.value);
        }}
        className="text-bp-ink bg-bp-card"
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          border: "1px solid var(--color-bp-border)",
          borderRadius: 7,
          padding: "4px 6px",
          outline: "none",
          fontFamily: "inherit",
        }}
      >
        {!layer.options.includes(layer.chosen) && (
          <option value={layer.chosen}>{layer.chosen}</option>
        )}
        {layer.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value="__custom">Custom…</option>
      </select>
      {custom && (
        <input
          autoFocus
          placeholder="Type your own choice"
          onBlur={(e) => {
            if (e.target.value.trim()) onChange(e.target.value.trim());
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="text-bp-ink"
          style={{
            fontSize: 12,
            border: "1px solid var(--color-bp-border)",
            borderRadius: 7,
            padding: "5px 7px",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
      )}
    </span>
  );
}
