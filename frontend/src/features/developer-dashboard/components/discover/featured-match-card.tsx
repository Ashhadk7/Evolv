import { Bookmark, BookmarkCheck, CheckCircle2, Eye, Flame, Layers3 } from "lucide-react";

import styles from "@/features/developer-dashboard/components/discover.module.css";
import devPrimaryBtn from "@/components/shared/dev-primary-button.module.css";
import type { Opportunity } from "./types";

export function FeaturedMatchCard({
  featuredMatch,
  getViabilityColor,
  busyAction,
  onSave,
  onView,
}: {
  featuredMatch: Opportunity | null;
  getViabilityColor: (score: number) => string;
  busyAction?: "apply" | "save" | "withdraw";
  onSave: (opportunity: Opportunity) => void;
  onView: (opportunity: Opportunity) => void;
}) {
  if (!featuredMatch) return null;

  const saving = busyAction === "save";
  const hasRoles = featuredMatch.roles.length > 0;

  return (
    <section className={styles.featuredCard}>
      <div className={styles.featuredBadge}>
        <Flame size={13} /> Best Relevance Match
      </div>
      <div className={styles.featuredBody}>
        <div className={styles.featuredLeft}>
          <div className={styles.featuredLogo}>{featuredMatch.logo}</div>
          <div>
            <div className={styles.featuredName}>{featuredMatch.name}</div>
            <div className={styles.featuredMeta}>
              <span className={styles.metaTag}>{featuredMatch.industry}</span>
              <span className={styles.metaTag}>{featuredMatch.stage}</span>
              <span className={styles.metaTag}>{featuredMatch.roles.length || 0} roles</span>
              <span className={styles.metaTag}>{featuredMatch.timeline}</span>
            </div>
            <p className={styles.featuredDesc}>{featuredMatch.summary}</p>
            <div className={styles.techTags}>
              {featuredMatch.techStack.slice(0, 6).map((tech) => (
                <span key={tech} className={styles.techTag}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.featuredRight}>
          <div className={styles.matchScore}>
            <div className={styles.matchNum}>{featuredMatch.matchScore}%</div>
            <div className={styles.matchLabel}>Match</div>
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
            <button
              className={`${devPrimaryBtn.button} ${styles.applyBtn}`}
              onClick={() => onView(featuredMatch)}
              disabled={!hasRoles || featuredMatch.applied}
            >
              {featuredMatch.applied ? <CheckCircle2 size={15} /> : <Layers3 size={15} />}
              {featuredMatch.applied ? "Applied" : hasRoles ? "Choose Role" : "No roles yet"}
            </button>
            <button
              className={`${styles.saveBtn} ${featuredMatch.saved ? styles.savedButton : ""}`}
              onClick={() => onSave(featuredMatch)}
              disabled={saving}
              aria-label={featuredMatch.saved ? "Unsave blueprint" : "Save blueprint"}
              title={featuredMatch.saved ? "Unsave blueprint" : "Save blueprint"}
            >
              {featuredMatch.saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
            <button
              className={styles.saveBtn}
              onClick={() => onView(featuredMatch)}
              aria-label="View developer blueprint"
              title="View developer blueprint"
            >
              <Eye size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className={styles.whyMatched}>
        <span className={styles.whyLabel}>Why this is first:</span>
        {featuredMatch.matchReasons.slice(0, 3).map((reason) => (
          <span key={reason} className={styles.whyItem}>
            <CheckCircle2 size={13} /> {reason}
          </span>
        ))}
      </div>
    </section>
  );
}
