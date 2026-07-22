"use client";

import { ArrowLeft, Broadcast, Buildings, DownloadSimple, LinkSimple } from "@phosphor-icons/react";
import {
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_STYLE,
} from "@/features/blueprints/blueprint-content";
import type { Blueprint } from "@/features/blueprints/types";
import { Chip } from "@/components/shared/chip";

import { RefineModal } from "./refine-modal";

export function BlueprintActionBar({
  bp,
  progress,
  published,
  onBack,
  onCopyLink,
  onTogglePublish,
  onRefineQueued,
}: {
  bp: Blueprint;
  progress: number;
  published: boolean;
  onBack: () => void;
  onCopyLink: () => void;
  onTogglePublish: () => void;
  onRefineQueued?: () => void;
}) {
  return (
    <div className="blueprint-no-print border-bp-border relative z-20 border-b bg-[rgba(240,243,241,0.86)] backdrop-blur-[12px]">
      <div className="mx-auto flex max-w-[1180px] items-center gap-3.5 px-0.5 py-3">
        <button
          onClick={onBack}
          className="bp-back-btn text-bp-teal flex cursor-pointer items-center gap-[7px] rounded-[10px] border-none bg-transparent py-2 pr-[13px] pl-[11px] text-[13px] font-semibold"
        >
          <ArrowLeft className="bp-back-arrow" size={15} weight="bold" /> Back
        </button>
        <div className="bg-bp-border h-[22px] w-px" />
        <span className="text-bp-ink overflow-hidden text-[15px] font-bold tracking-[-0.012em] text-ellipsis whitespace-nowrap">
          {bp.name}
        </span>
        {bp.project ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-[11px] py-1 text-[11px] font-bold tracking-[0.03em]"
            style={{
              background: PROJECT_STATUS_STYLE[bp.project.status].bg,
              color: PROJECT_STATUS_STYLE[bp.project.status].color,
            }}
          >
            <Buildings size={12} weight="bold" /> {PROJECT_STATUS_LABEL[bp.project.status]}
          </span>
        ) : (
          <Chip
            tone="mint"
            icon={
              <span
                className={`inline-block h-[5px] w-[5px] rounded-full ${
                  bp.isPublic ? "bg-[#1d6e47]" : "bg-[#9ab4a4]"
                }`}
              />
            }
          >
            {bp.isPublic ? "Public" : "Private"}
          </Chip>
        )}
        <div className="ml-auto flex items-center gap-2">
          <RefineModal blueprintId={bp.id} blueprintName={bp.name} onQueued={onRefineQueued} />
          {!bp.project && (
            <button onClick={onTogglePublish} className="bp-primary-btn">
              <Broadcast size={15} weight="bold" /> {published ? "Unpublish" : "Publish"}
            </button>
          )}
          <button
            onClick={onCopyLink}
            className="bp-icon-btn border-bp-border bg-bp-card flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[11px] border"
            title="Copy link"
          >
            <LinkSimple size={16} weight="bold" className="text-bp-teal" />
          </button>
          <button
            onClick={() => window.print()}
            className="bp-icon-btn border-bp-border bg-bp-card flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[11px] border"
            title="Export PDF"
          >
            <DownloadSimple size={16} weight="bold" className="text-bp-teal" />
          </button>
        </div>
      </div>
      <div
        className="absolute -bottom-px left-0 h-0.5 bg-[linear-gradient(90deg,#428475,#89d7b7)] transition-[width] duration-100 ease-linear"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
