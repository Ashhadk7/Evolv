import styles from "@/features/developer-dashboard/components/discover.module.css";
import devPrimaryBtn from "@/components/shared/dev-primary-button.module.css";
import { OpportunityCard } from "./opportunity-card";
import type { Opportunity } from "./types";

export function OpportunitiesList({
  opportunities,
  selectedStartup,
  getViabilityColor,
  onSelectStartup,
  onApply,
  onResetFilters,
}: {
  opportunities: Opportunity[];
  selectedStartup: Opportunity | null;
  getViabilityColor: (score: number) => string;
  onSelectStartup: (opportunity: Opportunity) => void;
  onApply: () => void;
  onResetFilters: () => void;
}) {
  return (
    <div className={styles.leftCol}>
      <div className={styles.sectionHeader}>
        <h3>
          <i className="fas fa-list-ul"></i> All Opportunities
        </h3>
        <span className={styles.resultCount}>{opportunities.length} results</span>
      </div>
      <div className={styles.opportunitiesList}>
        {opportunities.length > 0 ? (
          opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              selected={selectedStartup?.id === opp.id}
              getViabilityColor={getViabilityColor}
              onSelect={onSelectStartup}
              onApply={onApply}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h4>No opportunities match your filters.</h4>
            <p>Try adjusting your filters to see more options.</p>
            <button
              className={`${devPrimaryBtn.button} ${styles.resetBtn}`}
              onClick={onResetFilters}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
