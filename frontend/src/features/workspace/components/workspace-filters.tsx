"use client";

import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import { WORKSPACE_SORT_OPTIONS, WORKSPACE_STAGES } from "@/features/workspace/data/workspace-data";
import type { WorkspaceSort, WorkspaceStage } from "@/features/workspace/lib/workspace-metrics";

const CONTROL_CLASS =
  "bg-bp-card w-full min-w-[150px] cursor-pointer appearance-none rounded-[14px] border border-[#e0e9e3] py-3 pr-[38px] pl-[15px] font-[inherit] text-[13.5px] font-semibold text-bp-ink shadow-[0_1px_2px_rgba(19,36,29,0.04)] outline-none focus-visible:border-bp-mint";

function SelectControl<T extends string>({
  label,
  value,
  options,
  format,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  format?: (option: T) => string;
  onChange: (value: T) => void;
}) {
  return (
    <div className="relative flex-[0_1_auto]">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={CONTROL_CLASS}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {format ? format(option) : option}
          </option>
        ))}
      </select>
      <CaretDown
        size={14}
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-[14px] -translate-y-1/2 text-[#7a9e8e]"
      />
    </div>
  );
}

export function WorkspaceFilters({
  search,
  stage,
  sort,
  onSearchChange,
  onStageChange,
  onSortChange,
}: {
  search: string;
  stage: WorkspaceStage;
  sort: WorkspaceSort;
  onSearchChange: (value: string) => void;
  onStageChange: (value: WorkspaceStage) => void;
  onSortChange: (value: WorkspaceSort) => void;
}) {
  return (
    <div className="mb-5 flex shrink-0 flex-wrap items-center gap-2.5">
      <div className="bg-bp-card focus-within:border-bp-mint flex min-w-[200px] flex-1 items-center gap-2.5 rounded-[14px] border border-[#e0e9e3] px-[15px] py-[11px] shadow-[0_1px_2px_rgba(19,36,29,0.04)]">
        <MagnifyingGlass size={17} aria-hidden className="shrink-0 text-[#9ab4a4]" />
        <input
          type="text"
          aria-label="Search ideas"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search ideas, industries…"
          className="text-bp-ink min-w-0 flex-1 border-none bg-transparent font-[inherit] text-[13.5px] outline-none placeholder:text-[#9ab4a4]"
        />
      </div>

      <SelectControl
        label="Filter by stage"
        value={stage}
        options={WORKSPACE_STAGES}
        onChange={onStageChange}
      />
      <SelectControl
        label="Sort ideas"
        value={sort}
        options={WORKSPACE_SORT_OPTIONS}
        format={(option) => `Sort: ${option}`}
        onChange={onSortChange}
      />
    </div>
  );
}
