import { RefreshCcw, Search, TriangleAlert } from "lucide-react";

import styles from "@/features/developer-dashboard/components/discover.module.css";
import { OpportunityCard } from "./opportunity-card";
import type { Opportunity } from "./types";

export function OpportunitiesGrid({
  opportunities,
  heading,
  loading,
  error,
  busyBlueprintId,
  busyAction,
  emptyTitle,
  emptyHint,
  emptyAction,
  onView,
  onApply,
  onSave,
  onRetry,
}: {
  opportunities: Opportunity[];
  heading: string;
  loading: boolean;
  error: string | null;
  busyBlueprintId: string | null;
  busyAction: "apply" | "save" | "withdraw" | null;
  emptyTitle: string;
  emptyHint: string;
  emptyAction?: { label: string; onClick: () => void };
  onView: (opportunity: Opportunity) => void;
  onApply: (opportunity: Opportunity) => void;
  onSave: (opportunity: Opportunity) => void;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div className={styles.statePanel} aria-live="polite">
        <RefreshCcw size={22} className={styles.spinIcon} aria-hidden="true" />
        <h4>Loading blueprints</h4>
        <p>Ranking projects against your skills and profile.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.statePanel} role="alert">
        <TriangleAlert size={24} aria-hidden="true" />
        <h4>Could not load Discover</h4>
        <p>{error}</p>
        <button type="button" className={styles.btnPrimary} onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className={styles.statePanel}>
        <Search size={24} aria-hidden="true" />
        <h4>{emptyTitle}</h4>
        <p>{emptyHint}</p>
        {emptyAction && (
          <button type="button" className={styles.btnPrimary} onClick={emptyAction.onClick}>
            {emptyAction.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={styles.gridHeader}>
        <h2>{heading}</h2>
      </div>
      <div className={styles.oppGrid}>
        {opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            busyAction={busyBlueprintId === opportunity.id ? (busyAction ?? undefined) : undefined}
            onView={onView}
            onApply={onApply}
            onSave={onSave}
          />
        ))}
      </div>
    </>
  );
}
