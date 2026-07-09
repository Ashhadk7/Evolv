import styles from "@/features/developer-dashboard/components/discover.module.css";
import type { filterOptions as filterOptionsData } from "@/features/developer-dashboard/data/developer-data";
import type { DiscoverFilters } from "./types";

const VIABILITY_LABELS: Record<string, string> = {
  "0-50": "<50%",
  "50-70": "50-70%",
  "70-85": "70-85%",
  "85-100": "85%+",
};

export function FilterBar({
  filterOptions,
  allTechStacks,
  activeFilters,
  onFilterChange,
  onClearFilters,
}: {
  filterOptions: typeof filterOptionsData;
  allTechStacks: string[];
  activeFilters: DiscoverFilters;
  onFilterChange: (key: keyof DiscoverFilters, value: string) => void;
  onClearFilters: () => void;
}) {
  return (
    <div className={styles.filterBar}>
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>
          <i className="fas fa-filter"></i> Industry:
        </span>
        {filterOptions.industries.map((ind) => (
          <button
            key={ind}
            className={`${styles.filterChip} ${activeFilters.industry === ind ? styles.filterActive : ""}`}
            onClick={() => onFilterChange("industry", ind)}
          >
            {ind}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>
          <i className="fas fa-seedling"></i> Stage:
        </span>
        {filterOptions.fundingStages.map((s) => (
          <button
            key={s}
            className={`${styles.filterChip} ${activeFilters.fundingStage === s ? styles.filterActive : ""}`}
            onClick={() => onFilterChange("fundingStage", s)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>
          <i className="fas fa-chart-bar"></i> Viability:
        </span>
        {filterOptions.viabilityRanges.map((range) => (
          <button
            key={range}
            className={`${styles.filterChip} ${activeFilters.viability === range ? styles.filterActive : ""}`}
            onClick={() => onFilterChange("viability", range)}
          >
            {VIABILITY_LABELS[range] || range}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>
          <i className="fas fa-code"></i> Tech Stack:
        </span>
        {allTechStacks.map((tech) => (
          <button
            key={tech}
            className={`${styles.filterChip} ${activeFilters.techStack === tech ? styles.filterActive : ""}`}
            onClick={() => onFilterChange("techStack", tech)}
          >
            {tech}
          </button>
        ))}
      </div>
      {Object.values(activeFilters).some(Boolean) && (
        <div className={styles.filterGroup}>
          <button
            className={styles.filterChip}
            style={{ borderColor: "#FF6B6B", color: "#FF6B6B" }}
            onClick={onClearFilters}
          >
            <i className="fas fa-times"></i> Clear All
          </button>
        </div>
      )}
    </div>
  );
}
