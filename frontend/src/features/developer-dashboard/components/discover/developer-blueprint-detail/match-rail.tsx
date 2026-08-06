import { ArrowUp, CheckCircle2, Handshake, MessageSquare, Star } from "lucide-react";

import styles from "@/features/developer-dashboard/components/discover.module.css";
import { applyButtonLabel, canApply } from "../apply-state";
import { MatchRing } from "../match-ring";
import type { Opportunity } from "../types";

export function MatchCard({
  blueprint,
  onApply,
}: {
  blueprint: Opportunity;
  onApply: () => void;
}) {
  const hasScore = blueprint.matchScore !== null;
  const bestRoleFit = blueprint.roleFits.find((fit) => fit.role === blueprint.bestRole);
  const canSubmitApplication = canApply(blueprint);
  const applyLabel = applyButtonLabel(blueprint, "long");

  return (
    <section className={styles.railCard} aria-labelledby="match-card-heading">
      <div className={styles.railMatchHead}>
        <MatchRing score={blueprint.matchScore} size="md" />
        <div>
          <p id="match-card-heading" className={styles.railMatchLabel}>
            {blueprint.fitLabel ?? "Match unavailable"}
          </p>
          <p className={styles.railMatchHint}>
            {hasScore
              ? "Based on your skills and the open roles"
              : "Add skills to your profile to see your match"}
          </p>
        </div>
      </div>

      {blueprint.matchReasons.length > 0 && (
        <>
          <p className={styles.railLabel}>Why you match</p>
          <ul className={styles.reasonList}>
            {blueprint.matchReasons.map((reason) => (
              <li key={reason}>
                <CheckCircle2 size={14} aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {blueprint.skillsToPickUp.length > 0 && (
        <>
          <p className={styles.railLabel}>Skills to pick up</p>
          <ul className={styles.gapChips}>
            {blueprint.skillsToPickUp.map((skill) => (
              <li key={skill}>
                <ArrowUp size={11} aria-hidden="true" />
                {skill}
              </li>
            ))}
          </ul>
        </>
      )}

      {blueprint.bestRole && (
        <div className={styles.bestRoleBox}>
          <p className={styles.bestRoleLabel}>
            <Star size={14} aria-hidden="true" /> Best-fit role
          </p>
          <p className={styles.bestRoleName}>{blueprint.bestRole}</p>
          {bestRoleFit && (
            <p className={styles.bestRoleHint}>{bestRoleFit.fit}% match · recommended for you</p>
          )}
        </div>
      )}

      <button
        type="button"
        className={styles.btnPrimaryBlock}
        onClick={onApply}
        disabled={!canSubmitApplication}
      >
        {canSubmitApplication ? (
          <Handshake size={15} aria-hidden="true" />
        ) : (
          <CheckCircle2 size={15} aria-hidden="true" />
        )}
        {applyLabel}
      </button>
    </section>
  );
}

export function RolesCard({
  blueprint,
  onApply,
}: {
  blueprint: Opportunity;
  onApply: (role: string) => void;
}) {
  if (blueprint.roles.length === 0) return null;

  const seats = blueprint.roles.reduce((total, role) => total + role.count, 0);
  const fitFor = (role: string) => blueprint.roleFits.find((fit) => fit.role === role)?.fit ?? null;
  const canSubmitApplication = canApply(blueprint);
  const applyLabel = applyButtonLabel(blueprint);

  return (
    <section className={styles.railCard} aria-labelledby="roles-heading">
      <div className={styles.railCardHead}>
        <p id="roles-heading" className={styles.railLabel}>
          Roles needed
        </p>
        <span className={styles.railCount}>
          {seats} {seats === 1 ? "seat" : "seats"}
        </span>
      </div>
      <ul className={styles.railRoleList}>
        {blueprint.roles.map((role) => {
          const fit = fitFor(role.role);
          return (
            <li key={role.role} className={styles.railRoleRow}>
              <div className={styles.railRoleMain}>
                <p className={styles.railRoleTitle}>{role.role}</p>
                <p className={styles.railRoleMeta}>
                  {role.count} open
                  {fit !== null && <span className={styles.railRoleFit}>{fit}% fit</span>}
                </p>
                {role.skills.length > 0 && (
                  <ul className={styles.railRoleSkills}>
                    {role.skills.slice(0, 4).map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                className={styles.btnPrimarySm}
                onClick={() => onApply(role.role)}
                disabled={!canSubmitApplication}
              >
                {applyLabel}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ApplicantsCard({ blueprint }: { blueprint: Opportunity }) {
  return (
    <section className={styles.railCard} aria-labelledby="applicants-heading">
      <p id="applicants-heading" className={styles.railLabel}>
        Who&apos;s applied
      </p>
      <p className={styles.applicantTotal}>
        <strong>{blueprint.applicantCount}</strong>
        <span>{blueprint.applicantCount === 1 ? "developer applied" : "developers applied"}</span>
      </p>
      {blueprint.applicantsByRole.length > 0 && (
        <ul className={styles.applicantRows}>
          {blueprint.applicantsByRole.map((entry) => (
            <li key={entry.role}>
              <span>{entry.role}</span>
              <span>{entry.count}</span>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.railFootnote}>
        Applicant names stay private until the founder shortlists.
      </p>
    </section>
  );
}

export function FounderCard({
  blueprint,
  messagePending,
  onMessage,
}: {
  blueprint: Opportunity;
  messagePending: boolean;
  onMessage: () => void;
}) {
  const blueprintCount = blueprint.founderBlueprintCount;

  return (
    <section className={styles.railCard} aria-labelledby="founder-heading">
      <p id="founder-heading" className={styles.railLabel}>
        Founder
      </p>
      <div className={styles.founderRow}>
        <span className={styles.avatarLg}>{blueprint.logo}</span>
        <div>
          <p className={styles.founderNameLg}>{blueprint.founderName}</p>
          <p className={styles.founderMeta}>
            {blueprintCount} public {blueprintCount === 1 ? "blueprint" : "blueprints"}
          </p>
        </div>
      </div>
      <button
        type="button"
        className={styles.btnGhostBlock}
        onClick={onMessage}
        disabled={messagePending}
      >
        <MessageSquare size={14} aria-hidden="true" />
        {messagePending ? "Request sent" : "Message founder"}
      </button>
    </section>
  );
}
