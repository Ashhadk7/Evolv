import styles from "@/features/developer-dashboard/components/discover.module.css";
import devPrimaryBtn from "@/components/shared/dev-primary-button.module.css";
import type { Opportunity } from "./types";

export function OpportunityCard({
  opportunity,
  selected,
  getViabilityColor,
  onSelect,
  onApply,
}: {
  opportunity: Opportunity;
  selected: boolean;
  getViabilityColor: (score: number) => string;
  onSelect: (opportunity: Opportunity) => void;
  onApply: () => void;
}) {
  return (
    <div
      className={`${styles.oppCard} ${selected ? styles.oppCardSelected : ""}`}
      onClick={() => onSelect(opportunity)}
    >
      <div className={styles.oppTop}>
        <div className={styles.oppLeft}>
          <div className={styles.oppLogo}>{opportunity.logo}</div>
          <div>
            <div className={styles.oppName}>{opportunity.name}</div>
            <div className={styles.oppFounder}>
              <i className="fas fa-user"></i> {opportunity.founder}
            </div>
          </div>
        </div>
        <div className={styles.oppRight}>
          <span className={styles.oppMatch}>{opportunity.matchScore || 80}% match</span>
          <span
            className={styles.oppViability}
            style={{ color: getViabilityColor(opportunity.viability) }}
          >
            {opportunity.viability}% viable
          </span>
        </div>
      </div>
      <div className={styles.oppDesc}>{opportunity.description}</div>
      <div className={styles.oppMeta}>
        <span>
          <i className="fas fa-industry"></i> {opportunity.industry}
        </span>
        <span>
          <i className="fas fa-seedling"></i> {opportunity.stage}
        </span>
        <span>
          <i className="fas fa-dollar-sign"></i> {opportunity.budget}
        </span>
        <span>
          <i className="fas fa-users"></i> {opportunity.teamSize} team
        </span>
      </div>
      <div className={styles.oppTechTags}>
        {opportunity.techStack.slice(0, 4).map((t, i) => (
          <span key={i} className={styles.techTag}>
            {t}
          </span>
        ))}
      </div>
      <div className={styles.oppActions}>
        <button
          className={`${devPrimaryBtn.button} ${styles.applyBtnSm}`}
          onClick={(e) => {
            e.stopPropagation();
            onApply();
          }}
        >
          <i className="fas fa-paper-plane"></i> Apply
        </button>
        <button className={styles.saveBtnSm}>
          <i className="fas fa-bookmark"></i> Save
        </button>
        <button
          className={styles.viewBtnSm}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(opportunity);
          }}
        >
          <i className="fas fa-eye"></i> View Blueprint
        </button>
      </div>
    </div>
  );
}
