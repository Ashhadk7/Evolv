import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Crown,
  Eye,
  Handshake,
  Users,
} from "lucide-react";

import styles from "@/features/developer-dashboard/components/discover.module.css";
import { timeAgo } from "@/lib/utils";
import { MatchRing } from "./match-ring";
import type { Opportunity } from "./types";

export function FeaturedMatchCard({
  featuredMatch,
  busyAction,
  onSave,
  onView,
  onApply,
}: {
  featuredMatch: Opportunity | null;
  busyAction?: "apply" | "save" | "withdraw";
  onSave: (opportunity: Opportunity) => void;
  onView: (opportunity: Opportunity) => void;
  onApply: (opportunity: Opportunity) => void;
}) {
  if (!featuredMatch) return null;

  const saving = busyAction === "save";
  const hasRoles = featuredMatch.roles.length > 0;

  return (
    <section className={styles.featured} aria-labelledby="featured-heading">
      <p className={styles.featuredKicker}>
        <Crown size={15} aria-hidden="true" /> Your top match
      </p>

      <div className={styles.featuredCard}>
        <div className={styles.featuredMain}>
          <div className={styles.featuredFounder}>
            <span className={styles.avatarSm}>{featuredMatch.logo}</span>
            <span className={styles.founderName}>{featuredMatch.founderName}</span>
            <span className={styles.postedAt}>{timeAgo(featuredMatch.createdAt)}</span>
          </div>

          <div className={styles.featuredTitleRow}>
            <h2 id="featured-heading">{featuredMatch.name}</h2>
            <span className={styles.pillOnDark}>
              {featuredMatch.industry} · {featuredMatch.stage}
            </span>
          </div>

          <p className={styles.featuredPitch}>{featuredMatch.summary}</p>

          <div className={styles.featuredFooter}>
            {hasRoles && (
              <ul
                className={styles.roleChips}
                tabIndex={0}
                aria-label={`${featuredMatch.roles.length} open roles`}
              >
                {featuredMatch.roles.map((role) => (
                  <li key={role.role} className={styles.roleChipBright}>
                    <b>{role.count}</b> {role.role}
                  </li>
                ))}
              </ul>
            )}
            <span className={styles.applicantsOnDark}>
              <Users size={13} aria-hidden="true" />
              {featuredMatch.applicantCount} applied
            </span>
          </div>
        </div>

        <div className={styles.featuredAside}>
          <MatchRing score={featuredMatch.matchScore} size="lg" />
          <div className={styles.featuredActions}>
            <button
              type="button"
              className={styles.btnBright}
              onClick={() => onApply(featuredMatch)}
              disabled={featuredMatch.applied}
            >
              {featuredMatch.applied ? (
                <CheckCircle2 size={15} aria-hidden="true" />
              ) : (
                <Handshake size={15} aria-hidden="true" />
              )}
              {featuredMatch.applied ? "Applied" : "Apply to build"}
            </button>
            <button
              type="button"
              className={styles.btnOnDark}
              onClick={() => onView(featuredMatch)}
            >
              <Eye size={14} aria-hidden="true" /> View blueprint
            </button>
            <button
              type="button"
              className={styles.btnOnDarkGhost}
              onClick={() => onSave(featuredMatch)}
              disabled={saving}
            >
              {featuredMatch.saved ? (
                <BookmarkCheck size={14} aria-hidden="true" />
              ) : (
                <Bookmark size={14} aria-hidden="true" />
              )}
              {featuredMatch.saved ? "Saved" : saving ? "Saving" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
