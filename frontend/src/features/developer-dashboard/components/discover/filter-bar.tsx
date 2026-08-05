import { ChevronDown, Search, X } from "lucide-react";

import styles from "@/features/developer-dashboard/components/discover.module.css";
import type { DiscoverSort } from "@/features/developer-dashboard/lib/discover-api";
import type { DiscoverFilterOptions, DiscoverFilters } from "./types";

const SORT_OPTIONS: { value: DiscoverSort; label: string }[] = [
  { value: "match", label: "Sort: Best match" },
  { value: "newest", label: "Sort: Newest" },
  { value: "applicants", label: "Sort: Fewest applicants" },
];

export type DiscoverView = "all" | "saved";

export function FilterBar({
  filterOptions,
  activeFilters,
  sort,
  view,
  savedCount,
  onFilterChange,
  onSortChange,
  onClearFilters,
  onViewChange,
}: {
  filterOptions: DiscoverFilterOptions;
  activeFilters: DiscoverFilters;
  sort: DiscoverSort;
  view: DiscoverView;
  savedCount: number;
  onFilterChange: (key: keyof DiscoverFilters, value: string) => void;
  onSortChange: (sort: DiscoverSort) => void;
  onClearFilters: () => void;
  onViewChange: (view: DiscoverView) => void;
}) {
  const hasFilters = Object.values(activeFilters).some(Boolean);

  return (
    <section className={styles.filterBar}>
      <div className={styles.segmented} role="tablist" aria-label="Blueprint list">
        <button
          type="button"
          role="tab"
          aria-selected={view === "all"}
          className={view === "all" ? styles.segmentActive : styles.segment}
          onClick={() => onViewChange("all")}
        >
          All
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "saved"}
          className={view === "saved" ? styles.segmentActive : styles.segment}
          onClick={() => onViewChange("saved")}
        >
          Saved ({savedCount})
        </button>
      </div>

      <div className={styles.searchBox}>
        <Search size={17} aria-hidden="true" />
        <input
          type="search"
          value={activeFilters.q ?? ""}
          onChange={(event) => onFilterChange("q", event.target.value)}
          placeholder="Search ideas, industries, tech"
          aria-label="Search blueprints"
        />
      </div>

      <FilterSelect
        label="Industry"
        placeholder="All industries"
        value={activeFilters.industry ?? ""}
        options={filterOptions.industries}
        onChange={(value) => onFilterChange("industry", value)}
      />
      <FilterSelect
        label="Role"
        placeholder="All roles"
        value={activeFilters.role ?? ""}
        options={filterOptions.roles}
        onChange={(value) => onFilterChange("role", value)}
      />
      <FilterSelect
        label="Tech"
        placeholder="All tech"
        value={activeFilters.tech ?? ""}
        options={filterOptions.techStack}
        onChange={(value) => onFilterChange("tech", value)}
      />

      <div className={styles.selectWrap}>
        <select
          className={styles.filterSelect}
          aria-label="Sort blueprints"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as DiscoverSort)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} aria-hidden="true" />
      </div>

      {hasFilters && (
        <button type="button" className={styles.clearFiltersBtn} onClick={onClearFilters}>
          <X size={14} aria-hidden="true" /> Clear
        </button>
      )}
    </section>
  );
}

function FilterSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.selectWrap}>
      <select
        className={styles.filterSelect}
        aria-label={label}
        value={value}
        disabled={options.length === 0}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={14} aria-hidden="true" />
    </div>
  );
}
