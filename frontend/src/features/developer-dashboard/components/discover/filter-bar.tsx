import { Filter, Search, X } from "lucide-react";

import styles from "@/features/developer-dashboard/components/discover.module.css";
import type { DiscoverFilterOptions, DiscoverFilters } from "./types";

const VIABILITY_OPTIONS = [
  { label: "Any viability", value: "" },
  { label: "70% and up", value: "70" },
  { label: "80% and up", value: "80" },
  { label: "90% and up", value: "90" },
];

export function FilterBar({
  filterOptions,
  activeFilters,
  onFilterChange,
  onClearFilters,
}: {
  filterOptions: DiscoverFilterOptions;
  activeFilters: DiscoverFilters;
  onFilterChange: (key: keyof DiscoverFilters, value: string) => void;
  onClearFilters: () => void;
}) {
  const hasFilters = Object.values(activeFilters).some(Boolean);
  const hasDynamicOptions =
    filterOptions.industries.length > 0 ||
    filterOptions.stages.length > 0 ||
    filterOptions.techStack.length > 0;

  return (
    <section className={styles.filterBar}>
      <div className={styles.searchBox}>
        <Search size={16} />
        <input
          value={activeFilters.q ?? ""}
          onChange={(event) => onFilterChange("q", event.target.value)}
          placeholder="Search blueprint, role, stack"
        />
      </div>

      <label className={styles.selectFilter}>
        <span>
          <Filter size={14} /> Industry
        </span>
        <select
          value={activeFilters.industry ?? ""}
          onChange={(event) => onFilterChange("industry", event.target.value)}
        >
          <option value="">All industries</option>
          {filterOptions.industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.selectFilter}>
        <span>Stage</span>
        <select
          value={activeFilters.stage ?? ""}
          onChange={(event) => onFilterChange("stage", event.target.value)}
        >
          <option value="">All stages</option>
          {filterOptions.stages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.selectFilter}>
        <span>Tech</span>
        <select
          value={activeFilters.tech ?? ""}
          onChange={(event) => onFilterChange("tech", event.target.value)}
        >
          <option value="">Any stack</option>
          {filterOptions.techStack.map((tech) => (
            <option key={tech} value={tech}>
              {tech}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.selectFilter}>
        <span>Viability</span>
        <select
          value={activeFilters.minViability ?? ""}
          onChange={(event) => onFilterChange("minViability", event.target.value)}
        >
          {VIABILITY_OPTIONS.map((option) => (
            <option key={option.value || "any"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {hasFilters && (
        <button className={styles.clearFiltersBtn} onClick={onClearFilters}>
          <X size={14} /> Clear
        </button>
      )}

      {!hasDynamicOptions && (
        <p className={styles.filterHint}>
          Industry, stage, and tech filters appear after at least one public blueprint is available.
        </p>
      )}
    </section>
  );
}
