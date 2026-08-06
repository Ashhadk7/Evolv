import { Bookmark, BookmarkCheck, CheckCircle2, Eye, Handshake, Users } from "lucide-react";

import styles from "@/features/developer-dashboard/components/discover.module.css";
import { timeAgo } from "@/lib/utils";
import { MatchRing } from "./match-ring";
import type { Opportunity } from "./types";

const MAX_TECH_CHIPS = 4;

export function OpportunityCard({
  opportunity,
  busyAction,
  onView,
  onApply,
  onSave,
}: {
  opportunity: Opportunity;
  busyAction?: "apply" | "save" | "withdraw";
  onView: (opportunity: Opportunity) => void;
  onApply: (opportunity: Opportunity) => void;
  onSave: (opportunity: Opportunity) => void;
}) {
  const saving = busyAction === "save";
  const hasRoles = opportunity.roles.length > 0;
  const extraTech = Math.max(0, opportunity.techStack.length - MAX_TECH_CHIPS);

  return (
    <article className={styles.oppCard}>
      <header className={styles.oppHeader}>
        <div className={styles.oppFounder}>
          <span className={styles.avatarSm}>{opportunity.logo}</span>
          <div>
            <p className={styles.founderNameSm}>{opportunity.founderName}</p>
            <p className={styles.oppPosted}>{timeAgo(opportunity.createdAt)}</p>
          </div>
        </div>
        <MatchRing score={opportunity.matchScore} size="sm" />
      </header>

      <div>
        <div className={styles.oppTitleRow}>
          <h3>{opportunity.name}</h3>
          <span className={styles.pill}>
            {opportunity.industry} · {opportunity.stage}
          </span>
        </div>
        <p className={styles.oppPitch}>{opportunity.summary}</p>
      </div>

      {opportunity.techStack.length > 0 && (
        <ul className={styles.techChips}>
          {opportunity.techStack.slice(0, MAX_TECH_CHIPS).map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
          {extraTech > 0 && <li>+{extraTech} more</li>}
        </ul>
      )}

      {hasRoles && (
        <div className={styles.oppRoles}>
          <span className={styles.oppRolesLabel}>Roles</span>
          <ul
            className={styles.roleChips}
            tabIndex={0}
            aria-label={`${opportunity.roles.length} open roles`}
          >
            {opportunity.roles.map((role) => (
              <li key={role.role} className={styles.roleChip}>
                <b>{role.count}</b> {role.role}
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className={styles.oppFooter}>
        <span className={styles.applicants}>
          <Users size={13} aria-hidden="true" />
          {opportunity.applicantCount} applied
        </span>
        <div className={styles.oppActions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => onSave(opportunity)}
            disabled={saving}
            aria-label={
              opportunity.saved ? `Unsave ${opportunity.name}` : `Save ${opportunity.name}`
            }
          >
            {opportunity.saved ? (
              <BookmarkCheck size={14} aria-hidden="true" />
            ) : (
              <Bookmark size={14} aria-hidden="true" />
            )}
          </button>
          <button type="button" className={styles.btnGhostSm} onClick={() => onView(opportunity)}>
            <Eye size={13} aria-hidden="true" /> View
          </button>
          <button
            type="button"
            className={styles.btnPrimarySm}
            onClick={() => onApply(opportunity)}
            disabled={opportunity.applied}
          >
            {opportunity.applied ? (
              <CheckCircle2 size={13} aria-hidden="true" />
            ) : (
              <Handshake size={13} aria-hidden="true" />
            )}
            {opportunity.applied ? "Applied" : "Apply"}
          </button>
        </div>
      </footer>
    </article>
  );
}
