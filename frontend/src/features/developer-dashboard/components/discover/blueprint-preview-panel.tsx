import styles from "@/features/developer-dashboard/components/discover.module.css";
import devPrimaryBtn from "@/components/shared/dev-primary-button.module.css";
import type { Opportunity } from "./types";

export function BlueprintPreviewPanel({
  selectedStartup,
  getViabilityColor,
  onClose,
  onApply,
}: {
  selectedStartup: Opportunity | null;
  getViabilityColor: (score: number) => string;
  onClose: () => void;
  onApply: () => void;
}) {
  if (!selectedStartup) {
    return (
      <div className={styles.previewPlaceholder}>
        <div className={styles.placeholderIcon}>📋</div>
        <h4>Select a Startup</h4>
        <p>Click any startup card to preview its full blueprint here.</p>
      </div>
    );
  }

  return (
    <div className={styles.blueprintPanel}>
      <div className={styles.bpHeader}>
        <div className={styles.bpTitle}>
          <span className={styles.bpLogo}>{selectedStartup.logo}</span>
          <div>
            <div className={styles.bpName}>{selectedStartup.name}</div>
            <div className={styles.bpStage}>
              {selectedStartup.industry} · {selectedStartup.stage}
            </div>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className={styles.bpMetrics}>
        <div className={styles.bpMetric}>
          <div
            className={styles.bpMetricVal}
            style={{ color: getViabilityColor(selectedStartup.viability) }}
          >
            {selectedStartup.viability}%
          </div>
          <div className={styles.bpMetricLabel}>Viability</div>
        </div>
        <div className={styles.bpMetric}>
          <div className={styles.bpMetricVal}>
            {selectedStartup.metrics?.developerDemand || 75}%
          </div>
          <div className={styles.bpMetricLabel}>Dev Demand</div>
        </div>
        <div className={styles.bpMetric}>
          <div className={styles.bpMetricVal}>{selectedStartup.metrics?.growthPotential || 80}%</div>
          <div className={styles.bpMetricLabel}>Growth</div>
        </div>
      </div>

      <div className={styles.bpSection}>
        <div className={styles.bpSectionTitle}>
          <i className="fas fa-align-left"></i> Description
        </div>
        <p className={styles.bpDesc}>{selectedStartup.description}</p>
      </div>

      <div className={styles.bpSection}>
        <div className={styles.bpSectionTitle}>
          <i className="fas fa-code"></i> Tech Stack
        </div>
        <div className={styles.bpTechTags}>
          {selectedStartup.techStack.map((t, i) => (
            <span key={i} className={styles.techTag}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.bpSection}>
        <div className={styles.bpSectionTitle}>
          <i className="fas fa-briefcase"></i> Open Roles
        </div>
        <div className={styles.bpRoles}>
          {selectedStartup.roles?.map((r, i) => (
            <div key={i} className={styles.bpRole}>
              <i className="fas fa-chevron-right"></i> {r}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bpSection}>
        <div className={styles.bpSectionTitle}>
          <i className="fas fa-robot"></i> Why You Matched
        </div>
        <div className={styles.bpWhy}>{selectedStartup.matchExplanation}</div>
      </div>

      <div className={styles.bpInfo}>
        <div className={styles.bpInfoItem}>
          <i className="fas fa-users"></i> {selectedStartup.teamSize} members
        </div>
        <div className={styles.bpInfoItem}>
          <i className="fas fa-dollar-sign"></i> {selectedStartup.budget}
        </div>
        <div className={styles.bpInfoItem}>
          <i className="fas fa-user"></i> {selectedStartup.founder}
        </div>
      </div>

      <div className={styles.bpActions}>
        <button className={`${devPrimaryBtn.button} ${styles.applyBtn}`} onClick={onApply}>
          <i className="fas fa-paper-plane"></i> Apply Now
        </button>
        <button className={styles.saveBtn}>
          <i className="fas fa-bookmark"></i> Save
        </button>
      </div>
    </div>
  );
}
