"use client";

import { useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { ALL_DOMAINS, SUGGESTED_DOMAINS } from "@/features/onboarding/data/onboarding-data";
import { FieldLabel } from "./onboarding-helpers";

export function DomainPicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (domain: string) => void;
}) {
  const [query, setQuery] = useState("");
  const queryText = query.trim().toLowerCase();
  const suggestions = (
    queryText
      ? ALL_DOMAINS.filter((domain) => domain.toLowerCase().includes(queryText))
      : SUGGESTED_DOMAINS
  ).filter((domain) => !selected.includes(domain));

  return (
    <div>
      <FieldLabel>Domains of interest</FieldLabel>

      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selected.map((domain) => (
            <span
              key={domain}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold bg-[#1a312c] text-[#89d7b7] border border-[#89d7b7]/22"
            >
              {domain}
              <button
                type="button"
                onClick={() => onToggle(domain)}
                aria-label={`Remove ${domain}`}
              >
                <X size={10} weight="bold" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mb-3 flex h-10 items-center gap-2.5 rounded-lg border bg-white px-3.5 border-[#dce8e1]">
        <MagnifyingGlass size={14} className="text-[#8aa99b]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search domains"
          className="min-w-0 flex-1 bg-transparent text-[13px] outline-none text-[#1a2e26]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="rounded-full p-0.5 hover:bg-black/5"
          >
            <X size={11} weight="bold" className="text-[#8aa99b]" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.slice(0, 12).map((domain) => (
          <button
            key={domain}
            type="button"
            onClick={() => onToggle(domain)}
            className="rounded-full border bg-white px-3 py-1.5 text-[12px] font-semibold transition hover:bg-[#eef7f2] border-[#dde5e0] text-[#428475]"
          >
            + {domain}
          </button>
        ))}
        {suggestions.length === 0 && (
          <span className="text-[12px] text-[#9bb0a7]">
            No domains matched.
          </span>
        )}
      </div>
    </div>
  );
}
