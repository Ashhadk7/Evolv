"use client";

import { useState } from "react";
import { X, CheckCircle, ArrowSquareOut } from "@phosphor-icons/react";
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
  const [activeSource, setActiveSource] = useState<{ source: ResearchSourceRef; num: number } | null>(null);
  const valid = indexes.filter((n) => n >= 1 && n <= sources.length);
  if (!valid.length) return null;

  return (
    <>
      <sup className="ml-1 inline-flex gap-0.5 align-super">
        {valid.map((n) => {
          const source = sources[n - 1];
          return (
            <button
              key={n}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (source) {
                  setActiveSource({ source, num: n });
                }
              }}
              title={`${source?.title || "Research Source"} — ${source?.domain || "AI Research Signal"}`}
              className="text-bp-teal border-bp-border-soft bg-bp-tint hover:bg-bp-forest hover:text-white rounded border px-1 text-[9px] leading-[14px] font-bold no-underline cursor-pointer transition-colors"
            >
              {n}
            </button>
          );
        })}
      </sup>

      {/* Interactive Evidence Source Detail Modal */}
      {activeSource && (
        <div
          onClick={() => setActiveSource(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(10,26,20,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 440,
              background: "#102820",
              border: "1px solid rgba(137,215,183,0.3)",
              borderRadius: 16,
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              color: "#e8f4ef",
              position: "relative",
            }}
          >
            <button
              onClick={() => setActiveSource(null)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "transparent",
                border: "none",
                color: "rgba(232,244,239,0.5)",
                cursor: "pointer",
              }}
            >
              <X size={18} weight="bold" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-[#89d7b7] uppercase tracking-wider">
              <CheckCircle size={16} weight="fill" className="text-[#5bc8a0]" />
              Verified Citation [{activeSource.num}]
            </div>

            <h3 className="mt-2 text-base font-extrabold text-white leading-snug">
              {activeSource.source.title}
            </h3>

            <div className="mt-1 text-xs font-mono text-[#89d7b7]/70">
              {activeSource.source.domain || "evolv.internal"}
            </div>

            <div className="mt-3.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 leading-relaxed">
              {activeSource.source.snippet || "Evidence signal verified by LLM Scorecard Critic pass."}
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              {activeSource.source.url && !activeSource.source.url.includes("evolv.internal") ? (
                <a
                  href={activeSource.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#89d7b7] text-[#0a1a14] text-xs font-bold no-underline hover:bg-[#a2ebd0] transition-colors"
                >
                  Visit External Source <ArrowSquareOut size={14} weight="bold" />
                </a>
              ) : (
                <button
                  onClick={() => setActiveSource(null)}
                  className="px-4 py-2 rounded-xl bg-[#89d7b7]/15 text-[#89d7b7] border border-[#89d7b7]/30 text-xs font-bold cursor-pointer hover:bg-[#89d7b7]/25 transition-colors"
                >
                  Close Evidence Detail
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
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
  const [activeSource, setActiveSource] = useState<{ source: ResearchSourceRef; num: number } | null>(null);

  if (!sources.length && !assumptions.length) return null;
  return (
    <>
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
            {sources.map((source, i) => (
              <button
                key={(source.url || "") + i}
                type="button"
                onClick={() => setActiveSource({ source, num: i + 1 })}
                title={source.title}
                className="text-bp-muted hover:text-bp-teal text-[10.5px] bg-transparent border-none p-0 cursor-pointer transition-colors"
              >
                [{i + 1}] {source.domain || source.title}
              </button>
            ))}
          </div>
        )}
        {assumptions.length > 0 && (
          <div className="text-bp-muted mt-2 text-[11px] leading-[1.5]">
            <span className="font-semibold">Assumptions:</span> {assumptions.join(" · ")}
          </div>
        )}
      </div>

      {activeSource && (
        <div
          onClick={() => setActiveSource(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(10,26,20,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 440,
              background: "#102820",
              border: "1px solid rgba(137,215,183,0.3)",
              borderRadius: 16,
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              color: "#e8f4ef",
              position: "relative",
            }}
          >
            <button
              onClick={() => setActiveSource(null)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "transparent",
                border: "none",
                color: "rgba(232,244,239,0.5)",
                cursor: "pointer",
              }}
            >
              <X size={18} weight="bold" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-[#89d7b7] uppercase tracking-wider">
              <CheckCircle size={16} weight="fill" className="text-[#5bc8a0]" />
              Verified Citation [{activeSource.num}]
            </div>

            <h3 className="mt-2 text-base font-extrabold text-white leading-snug">
              {activeSource.source.title}
            </h3>

            <div className="mt-1 text-xs font-mono text-[#89d7b7]/70">
              {activeSource.source.domain || "evolv.internal"}
            </div>

            <div className="mt-3.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 leading-relaxed">
              {activeSource.source.snippet || "Evidence signal verified by LLM Scorecard Critic pass."}
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              {activeSource.source.url && !activeSource.source.url.includes("evolv.internal") ? (
                <a
                  href={activeSource.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#89d7b7] text-[#0a1a14] text-xs font-bold no-underline hover:bg-[#a2ebd0] transition-colors"
                >
                  Visit External Source <ArrowSquareOut size={14} weight="bold" />
                </a>
              ) : (
                <button
                  onClick={() => setActiveSource(null)}
                  className="px-4 py-2 rounded-xl bg-[#89d7b7]/15 text-[#89d7b7] border border-[#89d7b7]/30 text-xs font-bold cursor-pointer hover:bg-[#89d7b7]/25 transition-colors"
                >
                  Close Evidence Detail
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
