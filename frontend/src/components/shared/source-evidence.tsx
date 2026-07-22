"use client";

import type { ResearchSourceRef } from "@/features/blueprints/blueprint-content";

/* Superscript citation chips: [1][3] → clickable links into the section's
   source list. Indexes are 1-based, matching the backend's sourceIndexes. */
export function SourceChips({
  indexes,
  sources,
}: {
  indexes: number[];
  sources: ResearchSourceRef[];
}) {
  const valid = indexes.filter((n) => n >= 1 && n <= sources.length);
  if (!valid.length) return null;
  return (
    <sup className="ml-1 inline-flex gap-0.5 align-super">
      {valid.map((n) => {
        const source = sources[n - 1];
        const isInternal = !source?.url || source.url.includes("evolv.internal");
        return (
          <a
            key={n}
            href={isInternal ? "#" : source.url}
            onClick={isInternal ? (e) => e.preventDefault() : undefined}
            target={isInternal ? undefined : "_blank"}
            rel={isInternal ? undefined : "noopener noreferrer"}
            title={source ? `${source.title} — ${isInternal ? "Internal AI Research Signal" : source.domain}` : `Source ${n}`}
            className="text-bp-teal border-bp-border-soft bg-bp-tint hover:bg-bp-forest hover:text-white rounded border px-1 text-[9px] leading-[14px] font-bold no-underline cursor-pointer"
          >
            {n}
          </a>
        );
      })}
    </sup>
  );
}

/* "Based on N sources · retrieved DATE · Medium confidence" footer for
   research-backed sections, with the assumptions the agent declared. */
export function ResearchFooter({
  sources,
  retrievedAt,
  confidence,
  assumptions,
}: {
  sources: ResearchSourceRef[];
  retrievedAt: string;
  confidence: string;
  assumptions: string[];
}) {
  if (!sources.length && !assumptions.length) return null;
  return (
    <div className="border-bp-border-soft mt-[18px] border-t pt-3">
      {sources.length > 0 && (
        <div className="font-mono-app text-bp-label text-[10px] tracking-[0.06em] uppercase">
          Based on {sources.length} source{sources.length === 1 ? "" : "s"}
          {retrievedAt ? ` · retrieved ${retrievedAt}` : ""}
          {confidence ? ` · ${confidence} confidence` : ""}
        </div>
      )}
      {sources.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          {sources.map((source, i) => {
            const isInternal = !source?.url || source.url.includes("evolv.internal");
            return (
              <a
                key={(source.url || "") + i}
                href={isInternal ? "#" : source.url}
                onClick={isInternal ? (e) => e.preventDefault() : undefined}
                target={isInternal ? undefined : "_blank"}
                rel={isInternal ? undefined : "noopener noreferrer"}
                title={`${source.title}${isInternal ? " — (Internal AI Research Signal)" : ""}`}
                className="text-bp-muted hover:text-bp-teal text-[10.5px] no-underline cursor-pointer"
              >
                [{i + 1}] {source.domain || source.title}
              </a>
            );
          })}
        </div>
      )}
      {assumptions.length > 0 && (
        <div className="text-bp-muted mt-2 text-[11px] leading-[1.5]">
          <span className="font-semibold">Assumptions:</span> {assumptions.join(" · ")}
        </div>
      )}
    </div>
  );
}
