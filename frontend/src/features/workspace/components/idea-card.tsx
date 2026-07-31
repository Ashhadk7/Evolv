"use client";

import { motion } from "framer-motion";
import {
  ArrowClockwise,
  CircleNotch,
  Eye,
  PencilSimple,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import { blueprintGeneration } from "@/features/blueprints/blueprints-api";
import type { Blueprint } from "@/features/blueprints/types";
import type { FounderContactProfile } from "@/features/network/types";
import {
  blueprintSlug,
  blueprintSubtitle,
  isBlueprintReady,
  viabilityGrade,
} from "@/features/workspace/lib/workspace-metrics";
import { IdeaMetricTile } from "./idea-metric-tile";
import { MatchedDevelopers } from "./matched-developers";
import { StatusBadge } from "./status-badge";

const TRAFFIC_LIGHTS = ["bg-[#ff5f57]", "bg-[#febc2e]", "bg-[#28c840]"];

const ACTION_BASE =
  "flex items-center gap-1.5 rounded-[10px] text-[11.5px] transition-[filter,background-color] duration-[180ms]";

const DARK_ACTION = `${ACTION_BASE} to-bp-forest text-bp-mint bg-gradient-to-b from-[#234840] px-3.5 py-2 font-bold hover:brightness-110`;

export interface IdeaCardProps {
  bp: Blueprint;
  index: number;
  developers: FounderContactProfile[];
  developersLoading: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRetry: () => void;
}

export function IdeaCard({
  bp,
  index,
  developers,
  developersLoading,
  onView,
  onEdit,
  onDelete,
  onRetry,
}: IdeaCardProps) {
  const generation = blueprintGeneration(bp);
  const ready = isBlueprintReady(bp);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 24 }}
      className="list-none"
    >
      <article className="border-bp-border bg-bp-card overflow-hidden rounded-[20px] border shadow-[0_1px_2px_rgba(19,36,29,0.04),0_14px_36px_-26px_rgba(19,36,29,0.22)] transition-[transform,box-shadow] duration-[250ms] ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-26px_rgba(19,36,29,0.28)]">
        <div className="border-bp-border-soft flex items-center border-b bg-[#fbfcfb] px-[18px] py-[13px]">
          <div aria-hidden className="flex gap-[7px]">
            {TRAFFIC_LIGHTS.map((color) => (
              <span key={color} className={`h-[11px] w-[11px] rounded-full ${color}`} />
            ))}
          </div>
          <span className="font-mono-app flex-1 truncate text-center text-[12px] text-[#9ab4a4]">
            {blueprintSlug(bp.name)}
          </span>
          <div aria-hidden className="w-[54px]" />
        </div>

        <div className="px-[22px] pt-5 pb-[18px]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <StatusBadge status={bp.status} project={bp.project} />
              <h3 className="text-bp-ink mt-2.5 text-[19px] leading-[1.1] font-extrabold tracking-[-0.02em]">
                {bp.name}
              </h3>
              <p className="text-bp-label mt-[5px] text-[12px]">{blueprintSubtitle(bp)}</p>
            </div>

            {ready && (
              <div className="shrink-0 text-right">
                <div className="text-bp-label text-[10.5px]">Viability</div>
                <div className="font-mono-app mt-[3px] text-[34px] leading-none font-extrabold text-[#1a4d38]">
                  {bp.viability}
                </div>
                <div className="text-bp-success mt-[5px] text-[10px] font-bold tracking-[0.07em]">
                  {viabilityGrade(bp.viability)} RATING
                </div>
              </div>
            )}
          </div>

          {ready ? (
            <>
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <IdeaMetricTile value={bp.cost.budget} label="Est. build cost" />
                <IdeaMetricTile value={bp.cost.timeline} label="Time to MVP" />
                <IdeaMetricTile value={bp.cost.team || "Not scoped"} label="Roles needed" />
              </div>
              <MatchedDevelopers developers={developers} loading={developersLoading} />
            </>
          ) : generation.status === "failed" ? (
            <div className="border-bp-red-line bg-bp-red-bg mt-4 flex items-start gap-2.5 rounded-[14px] border px-[18px] py-4">
              <WarningCircle size={16} weight="fill" aria-hidden className="text-bp-red shrink-0" />
              <div>
                <p className="text-bp-red text-[13px] font-bold">Generation failed</p>
                <p className="mt-0.5 text-[12px] leading-[1.5] text-[#8a4b45]">
                  {generation.error ?? "Something went wrong while generating this blueprint."}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2.5 rounded-[14px] border border-[#edf3ef] bg-[#f5f8f6] px-[18px] py-4">
              <CircleNotch
                size={16}
                weight="bold"
                aria-hidden
                className="text-bp-teal shrink-0 animate-spin"
              />
              <p className="text-bp-muted text-[12.5px] font-semibold">Generating blueprint…</p>
            </div>
          )}

          <div className="border-bp-border-soft mt-3.5 flex items-center justify-end gap-[7px] border-t pt-[13px]">
            {ready && (
              <>
                <button
                  type="button"
                  onClick={onView}
                  className={`${DARK_ACTION} shadow-[0_4px_14px_-4px_rgba(17,34,27,0.4)]`}
                >
                  <Eye size={13} weight="bold" aria-hidden /> View
                </button>
                <button
                  type="button"
                  onClick={onEdit}
                  className={`${ACTION_BASE} text-bp-teal border border-[#d8e8e0] bg-[#eef4f1] px-[13px] py-2 font-semibold hover:bg-[#e3ede8]`}
                >
                  <PencilSimple size={13} aria-hidden /> Edit
                </button>
              </>
            )}

            {generation.status === "failed" && (
              <button type="button" onClick={onRetry} className={DARK_ACTION}>
                <ArrowClockwise size={13} weight="bold" aria-hidden /> Retry
              </button>
            )}

            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${bp.name}`}
              className="text-bp-red border-bp-red-line bg-bp-red-bg flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border transition-colors duration-[180ms] hover:bg-[#f9dcd8]"
            >
              <Trash size={14} aria-hidden />
            </button>
          </div>
        </div>
      </article>
    </motion.li>
  );
}
