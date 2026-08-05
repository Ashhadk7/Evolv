import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, Info, Send, Star, X } from "lucide-react";

import styles from "@/features/developer-dashboard/components/discover.module.css";
import type {
  ApplicantAvailability,
  ApplyInput,
} from "@/features/developer-dashboard/lib/discover-api";
import type { Opportunity } from "./types";

const AVAILABILITY_OPTIONS: { value: ApplicantAvailability; label: string }[] = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "weekends", label: "Weekends" },
];

const MAX_MESSAGE_LENGTH = 2000;

export function ApplyModal({
  blueprint,
  submitting,
  error,
  submitted,
  onSubmit,
  onClose,
}: {
  blueprint: Opportunity;
  submitting: boolean;
  error: string | null;
  submitted: boolean;
  onSubmit: (input: ApplyInput) => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState(() => blueprint.bestRole ?? blueprint.roles[0]?.role ?? "");
  const [availability, setAvailability] = useState<ApplicantAvailability>("part_time");
  const [message, setMessage] = useState("");
  const [showRoleError, setShowRoleError] = useState(false);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const fitFor = (roleTitle: string) =>
    blueprint.roleFits.find((fit) => fit.role === roleTitle)?.fit ?? null;

  const submit = () => {
    if (blueprint.roles.length > 0 && !role) {
      setShowRoleError(true);
      return;
    }
    onSubmit({ role, message, availability });
  };

  return (
    <div className={styles.modalOverlay} onMouseDown={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={styles.modal}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {submitted ? (
          <div className={styles.modalSuccess}>
            <span className={styles.successIcon}>
              <CheckCircle2 size={38} aria-hidden="true" />
            </span>
            <h3 id={titleId}>Application sent</h3>
            <p>
              {blueprint.founderName} will review your application for{" "}
              <strong>{blueprint.name}</strong> and reach out through Inbox. Track it under My
              Applications.
            </p>
            {role && (
              <div className={styles.appliedFor}>
                <span className={styles.modalLabel}>You applied for</span>
                <span className={styles.roleChipBright}>
                  <Star size={11} aria-hidden="true" /> {role}
                </span>
              </div>
            )}
            <button type="button" className={styles.btnPrimary} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <header className={styles.modalHeader}>
              <div>
                <p className={styles.modalKicker}>Apply to build</p>
                <h3 id={titleId}>{blueprint.name}</h3>
                <p className={styles.modalSubtitle}>
                  Pick the role you want and tell {blueprint.founderName} why you are a fit.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={onClose}
                aria-label="Close apply form"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div className={styles.modalBody}>
              {blueprint.roles.length > 0 ? (
                <fieldset className={styles.fieldset}>
                  <legend className={styles.modalLabel}>Select a role</legend>
                  <div className={styles.roleOptions}>
                    {blueprint.roles.map((option) => {
                      const fit = fitFor(option.role);
                      return (
                        <label
                          key={option.role}
                          className={
                            role === option.role ? styles.roleOptionActive : styles.roleOption
                          }
                        >
                          <input
                            type="radio"
                            name="apply-role"
                            value={option.role}
                            checked={role === option.role}
                            onChange={() => {
                              setRole(option.role);
                              setShowRoleError(false);
                            }}
                          />
                          <span className={styles.roleOptionBody}>
                            <span className={styles.roleOptionTitle}>
                              {option.role}
                              <span className={styles.roleOpenCount}>
                                {option.count} open
                              </span>
                              {fit !== null && (
                                <span className={styles.roleFitChip}>{fit}% fit</span>
                              )}
                            </span>
                            {option.skills.length > 0 && (
                              <span className={styles.roleOptionSkills}>
                                {option.skills.slice(0, 4).map((skill) => (
                                  <span key={skill}>{skill}</span>
                                ))}
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ) : (
                <p className={styles.modalNote}>
                  The founder has not defined roles yet, so this will be sent as a general
                  application.
                </p>
              )}

              <fieldset className={styles.fieldset}>
                <legend className={styles.modalLabel}>Your availability</legend>
                <div className={styles.availabilityOptions}>
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={
                        availability === option.value
                          ? styles.availabilityChipActive
                          : styles.availabilityChip
                      }
                    >
                      <input
                        type="radio"
                        name="apply-availability"
                        value={option.value}
                        checked={availability === option.value}
                        onChange={() => setAvailability(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className={styles.field}>
                <span className={styles.modalLabel}>Message to founder</span>
                <textarea
                  value={message}
                  maxLength={MAX_MESSAGE_LENGTH}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Briefly: relevant experience, why this project, and what you would tackle first."
                  rows={4}
                />
                <span className={styles.fieldHint}>
                  Optional, but applications with a note get shortlisted more often.
                </span>
              </label>

              {showRoleError && (
                <p className={styles.modalError} role="alert">
                  <Info size={13} aria-hidden="true" /> Select a role to apply.
                </p>
              )}
              {error && (
                <p className={styles.modalError} role="alert">
                  <Info size={13} aria-hidden="true" /> {error}
                </p>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnGhost} onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={submit}
                  disabled={submitting}
                >
                  <Send size={15} aria-hidden="true" />
                  {submitting ? "Sending" : "Send application"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
