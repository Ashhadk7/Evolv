"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import {
  DARK,
  MINT,
  MID,
  TEXT_BODY,
  TEXT_MUTED,
  TEXT_DIM,
  BORDER,
} from "@/features/settings/lib/settings-theme";
import { SUGGESTED_DOMAINS, ALL_DOMAINS } from "@/features/settings/data/settings-domains-data";

export function DomainSearch({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (d: string) => void;
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
      <p className="mb-2 text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>
        Domains / Interests
      </p>

      {/* Selected chips */}
      <AnimatePresence initial={false}>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex flex-wrap gap-2"
          >
            {selected.map((d) => (
              <motion.span
                key={d}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
                style={{ background: DARK, color: MINT, border: `1px solid rgba(137,215,183,0.2)` }}
              >
                {d}
                <button
                  type="button"
                  onClick={() => onToggle(d)}
                  className="flex items-center justify-center rounded-full transition hover:opacity-60"
                  aria-label={`Remove ${d}`}
                >
                  <X size={10} weight="bold" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search input */}
      <div
        className="mb-3 flex h-10 items-center gap-2.5 rounded-lg border bg-white px-3.5 transition-all"
        style={{
          borderColor: focused ? MID : BORDER,
          boxShadow: focused ? "0 0 0 3px rgba(137,215,183,0.18)" : "none",
        }}
      >
        <MagnifyingGlass
          size={14}
          weight="regular"
          className="shrink-0"
          style={{ color: TEXT_DIM }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search all domains…"
          className="flex-1 bg-transparent text-[13px] outline-none"
          style={{ color: TEXT_BODY }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="shrink-0 rounded-full p-0.5 transition hover:bg-black/5"
          >
            <X size={11} weight="bold" style={{ color: TEXT_DIM }} />
          </button>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 ? (
        <div>
          {!query && (
            <p
              className="mb-2 text-[10px] font-bold tracking-widest uppercase"
              style={{ color: TEXT_DIM }}
            >
              Suggested
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((d) => (
              <motion.button
                key={d}
                type="button"
                onClick={() => onToggle(d)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="cursor-pointer rounded-full border bg-white px-3 py-1.5 text-[12px] font-semibold transition-colors"
                style={{ borderColor: BORDER, color: TEXT_MUTED }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = MID;
                  e.currentTarget.style.color = MID;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.color = TEXT_MUTED;
                }}
              >
                + {d}
              </motion.button>
            ))}
          </div>
        </div>
      ) : query && suggestions.length === 0 ? (
        <p className="text-[12px]" style={{ color: TEXT_DIM }}>
          No domains matched &ldquo;{query}&rdquo;
        </p>
      ) : null}
    </div>
  );
}
