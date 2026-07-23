import { Bookmark, BookmarkCheck, CheckCircle2, Eye, Layers3, UserRound } from "lucide-react";

import styles from "@/features/developer-dashboard/components/discover.module.css";
import devPrimaryBtn from "@/components/shared/dev-primary-button.module.css";
import type { Opportunity } from "./types";

export function OpportunityCard({
  opportunity,
  selected,
  getViabilityColor,
  onSelect,
  onView,
  onSave,
  busyAction,
}: {
  opportunity: Opportunity;
  selected: boolean;
  getViabilityColor: (score: number) => string;
  onSelect: (opportunity: Opportunity) => void;
  onView: (opportunity: Opportunity) => void;
  onSave: (opportunity: Opportunity) => void;
  busyAction?: "apply" | "save" | "withdraw";
}) {
  const roleLabel =
    opportunity.roles.length === 1
      ? opportunity.roles[0].role
      : `${opportunity.roles.length || "Open"} roles`;
  const hasRoles = opportunity.roles.length > 0;
  const saving = busyAction === "save";

  return (
    <article
      className={`${styles.oppCard} ${selected ? styles.oppCardSelected : ""}`}
      onClick={() => onSelect(opportunity)}
    >
      <div className={styles.oppTop}>
        <div className={styles.oppLeft}>
          <div className={styles.oppLogo}>{opportunity.logo}</div>
          <div>
            <div className={styles.oppName}>{opportunity.name}</div>
            <div className={styles.oppFounder}>
              <UserRound size={13} /> {opportunity.founderName}
            </div>
          </div>
        </div>
        <div className={styles.oppRight}>
          <span className={styles.oppMatch}>{opportunity.matchScore}% match</span>
          <span
            className={styles.oppViability}
            style={{ color: getViabilityColor(opportunity.viability) }}
          >
            {opportunity.viability}% viable
          </span>
        </div>
      </div>

      <p className={styles.oppDesc}>{opportunity.summary}</p>

      <div className={styles.oppMeta}>
        <span>{opportunity.industry}</span>
        <span>{opportunity.stage}</span>
        <span>{roleLabel}</span>
        <span>{opportunity.timeline}</span>
      </div>

      {opportunity.matchedSkills.length > 0 && (
        <div className={styles.matchStrip}>
          <CheckCircle2 size={14} />
          <span>{opportunity.matchedSkills.slice(0, 4).join(", ")}</span>
        </div>
      )}

      <div className={styles.oppTechTags}>
        {opportunity.techStack.slice(0, 5).map((tech) => (
          <span key={tech} className={styles.techTag}>
            {tech}
          </span>
        ))}
      </div>

      <div className={styles.oppActions}>
        <button
          className={`${devPrimaryBtn.button} ${styles.applyBtnSm}`}
          onClick={(event) => {
            event.stopPropagation();
            onView(opportunity);
          }}
          disabled={!hasRoles || opportunity.applied}
        >
          {opportunity.applied ? <CheckCircle2 size={14} /> : <Layers3 size={14} />}
          {opportunity.applied ? "Applied" : hasRoles ? "Choose Role" : "No roles yet"}
        </button>
        <button
          className={`${styles.saveBtnSm} ${opportunity.saved ? styles.savedButton : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            onSave(opportunity);
          }}
          disabled={saving}
        >
          {opportunity.saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          {opportunity.saved ? "Saved" : saving ? "Saving" : "Save"}
        </button>
        <button
          className={styles.viewBtnSm}
          onClick={(event) => {
            event.stopPropagation();
            onView(opportunity);
          }}
        >
          <Eye size={14} /> View Blueprint
        </button>
      </div>

      {opportunity.roles.length > 0 && (
        <div className={styles.roleHint}>
          <Layers3 size={14} />
          <span>{opportunity.roles[0].role}</span>
          {opportunity.roles[0].skills.slice(0, 3).map((skill) => (
            <span key={skill} className={styles.roleSkill}>
              {skill}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
