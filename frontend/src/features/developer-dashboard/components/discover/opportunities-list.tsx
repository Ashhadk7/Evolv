import { ListFilter, RefreshCcw, Search } from "lucide-react";

import styles from "@/features/developer-dashboard/components/discover.module.css";
import devPrimaryBtn from "@/components/shared/dev-primary-button.module.css";
import { OpportunityCard } from "./opportunity-card";
import type { Opportunity } from "./types";

export function OpportunitiesList({
  opportunities,
  selectedStartup,
  loading,
  error,
  getViabilityColor,
  busyBlueprintId,
  busyAction,
  onSelectStartup,
  onViewBlueprint,
  onSave,
  onResetFilters,
  onRetry,
}: {
  opportunities: Opportunity[];
  selectedStartup: Opportunity | null;
  loading: boolean;
  error: string | null;
  getViabilityColor: (score: number) => string;
  busyBlueprintId: string | null;
  busyAction: "apply" | "save" | "withdraw" | null;
  onSelectStartup: (opportunity: Opportunity) => void;
  onViewBlueprint: (opportunity: Opportunity) => void;
  onSave: (opportunity: Opportunity) => void;
  onResetFilters: () => void;
  onRetry: () => void;
}) {
  return (
    <section className={styles.leftCol}>
      <div className={styles.sectionHeader}>
        <h3>
          <ListFilter size={16} /> Ranked Public Blueprints
        </h3>
        <span className={styles.resultCount}>{opportunities.length} visible</span>
      </div>

      <div className={styles.opportunitiesList}>
        {loading && (
          <div className={styles.statePanel}>
            <RefreshCcw size={22} className={styles.spinIcon} />
            <h4>Loading public blueprints</h4>
            <p>Ranking projects against your skills and profile.</p>
          </div>
        )}

        {!loading && error && (
          <div className={styles.statePanel}>
            <Search size={24} />
            <h4>Could not load Discover</h4>
            <p>{error}</p>
            <button className={`${devPrimaryBtn.button} ${styles.resetBtn}`} onClick={onRetry}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && opportunities.length > 0
          ? opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                selected={selectedStartup?.id === opportunity.id}
                getViabilityColor={getViabilityColor}
                onSelect={onSelectStartup}
                onView={onViewBlueprint}
                onSave={onSave}
                busyAction={
                  busyBlueprintId === opportunity.id ? (busyAction ?? undefined) : undefined
                }
              />
            ))
          : null}

        {!loading && !error && opportunities.length === 0 && (
          <div className={styles.statePanel}>
            <Search size={24} />
            <h4>No public blueprints match this view.</h4>
            <p>Clear one filter or try a broader tech stack.</p>
            <button
              className={`${devPrimaryBtn.button} ${styles.resetBtn}`}
              onClick={onResetFilters}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
