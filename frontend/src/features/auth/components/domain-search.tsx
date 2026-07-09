"use client";

import { useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

const BRAND_DARK = "#1a312c";
const BRAND_INK = "#0f1c18";
const BRAND_MID = "#428475";
const BRAND_MINT = "#89d7b7";

const SUGGESTED_DOMAINS = [
  "AI",
  "SaaS",
  "FinTech",
  "MedTech",
  "CleanTech",
  "EdTech",
  "Web3",
  "E-commerce",
];
const ALL_DOMAINS = [
  "AI",
  "SaaS",
  "FinTech",
  "MedTech",
  "CleanTech",
  "EdTech",
  "Web3",
  "E-commerce",
  "HealthTech",
  "AgriTech",
  "LegalTech",
  "PropTech",
  "InsurTech",
  "RetailTech",
  "CyberSecurity",
  "IoT",
  "Blockchain",
  "Gaming",
  "Social Media",
  "DeepTech",
  "SpaceTech",
  "FoodTech",
  "TravelTech",
  "HRTech",
  "MarketingTech",
];

export function DomainSearch({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (v: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const suggestions = query.trim()
    ? ALL_DOMAINS.filter(
        (d) => d.toLowerCase().includes(query.toLowerCase()) && !selected.includes(d)
      )
    : SUGGESTED_DOMAINS.filter((d) => !selected.includes(d));

  return (
    <div>
      <span
        className="mb-2 block text-[12px] font-semibold"
        style={{ color: "rgba(15,28,24,0.68)" }}
      >
        Domains of interest
      </span>

      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selected.map((domain) => (
            <span
              key={domain}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
              style={{ background: BRAND_DARK, color: BRAND_MINT }}
            >
              {domain}
              <button
                type="button"
                onClick={() => onToggle(domain)}
                className="flex items-center justify-center rounded-full transition hover:opacity-70"
                aria-label={`Remove ${domain}`}
              >
                <X size={11} weight="bold" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        className="mb-3 flex h-11 items-center gap-2.5 rounded-lg border bg-white px-3.5 transition-all"
        style={{
          borderColor: focused ? BRAND_MID : "rgba(15,28,24,0.12)",
          boxShadow: focused ? "0 0 0 4px rgba(137,215,183,0.18)" : "none",
        }}
      >
        <MagnifyingGlass
          size={15}
          weight="regular"
          className="shrink-0"
          style={{ color: "rgba(15,28,24,0.36)" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search all domains…"
          className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#0f1c18]/32"
          style={{ color: BRAND_INK }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="shrink-0 rounded-full p-0.5 transition hover:bg-black/6"
          >
            <X size={12} weight="bold" style={{ color: "rgba(15,28,24,0.4)" }} />
          </button>
        )}
      </div>

      {suggestions.length > 0 ? (
        <div>
          {!query && (
            <p
              className="mb-2 text-[10.5px] font-bold tracking-widest uppercase"
              style={{ color: "rgba(15,28,24,0.35)" }}
            >
              Suggested
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => onToggle(domain)}
                className="rounded-full border bg-white px-3 py-1.5 text-[12px] font-semibold transition hover:border-[#428475] hover:text-[#428475]"
                style={{ borderColor: "rgba(15,28,24,0.12)", color: "rgba(15,28,24,0.62)" }}
              >
                + {domain}
              </button>
            ))}
          </div>
        </div>
      ) : query && suggestions.length === 0 ? (
        <p className="text-[12px]" style={{ color: "rgba(15,28,24,0.4)" }}>
          No domains matched &ldquo;{query}&rdquo;
        </p>
      ) : null}
    </div>
  );
}
