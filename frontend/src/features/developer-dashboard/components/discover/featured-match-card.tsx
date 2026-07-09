import styles from "@/features/developer-dashboard/components/discover.module.css";
import devPrimaryBtn from "@/components/shared/dev-primary-button.module.css";
import type { featuredMatch as featuredMatchData } from "@/features/developer-dashboard/data/developer-data";

export function FeaturedMatchCard({
  featuredMatch,
  getViabilityColor,
  onApply,
}: {
  featuredMatch: typeof featuredMatchData;
  getViabilityColor: (score: number) => string;
  onApply: () => void;
}) {
  return (
    <div className={styles.featuredCard}>
      <div className={styles.featuredBadge}>
        <i className="fas fa-fire"></i> Featured AI Match
      </div>
      <div className={styles.featuredBody}>
        <div className={styles.featuredLeft}>
          <div className={styles.featuredLogo}>{featuredMatch.logo}</div>
          <div>
            <div className={styles.featuredName}>{featuredMatch.name}</div>
            <div className={styles.featuredMeta}>
              <span className={styles.metaTag}>
                <i className="fas fa-industry"></i> {featuredMatch.industry}
              </span>
              <span className={styles.metaTag}>
                <i className="fas fa-seedling"></i> {featuredMatch.stage}
              </span>
              <span className={styles.metaTag}>
                <i className="fas fa-users"></i> {featuredMatch.teamSize} team
              </span>
              <span className={styles.metaTag}>
                <i className="fas fa-dollar-sign"></i> {featuredMatch.budget}
              </span>
            </div>
            <div className={styles.featuredDesc}>{featuredMatch.description}</div>
            <div className={styles.techTags}>
              {featuredMatch.techStack.map((tech, i) => (
                <span key={i} className={styles.techTag}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.featuredRight}>
          <div className={styles.matchScore}>
            <div className={styles.matchNum}>{featuredMatch.matchScore}%</div>
            <div className={styles.matchLabel}>Match Score</div>
          </div>
          <div className={styles.viabilityScore}>
            <div
              className={styles.viabilityNum}
              style={{ color: getViabilityColor(featuredMatch.viability) }}
            >
              {featuredMatch.viability}%
            </div>
            <div className={styles.viabilityLabel}>Viability</div>
          </div>
          <div className={styles.featuredActions}>
            <button className={`${devPrimaryBtn.button} ${styles.applyBtn}`} onClick={onApply}>
              <i className="fas fa-paper-plane"></i> Apply Now
            </button>
            <button className={styles.saveBtn}>
              <i className="fas fa-bookmark"></i>
            </button>
            <button className={styles.saveBtn}>
              <i className="fas fa-eye"></i>
            </button>
          </div>
        </div>
      </div>
      <div className={styles.whyMatched}>
        <span className={styles.whyLabel}>Why you matched:</span>
        {featuredMatch.whyMatched.slice(0, 3).map((why, i) => (
          <span key={i} className={styles.whyItem}>
            <i className="fas fa-check-circle"></i> {why}
          </span>
        ))}
      </div>
    </div>
  );
}
