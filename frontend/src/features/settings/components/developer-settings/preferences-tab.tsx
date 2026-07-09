"use client";

import styles from "./developer-settings.module.css";

const MATCH_TOGGLES = [
  {
    key: "ai_match",
    label: "Enable AI Matching",
    sub: "Allow the AI agent to proactively find and suggest startup matches",
  },
  {
    key: "notify_match",
    label: "Instant Match Alerts",
    sub: "Get notified immediately when a high-compatibility match is found",
  },
];

export function PreferencesTab({
  preferredBudget,
  experienceYears,
  onChangeBudget,
  onChangeExperienceYears,
  saved,
  onSave,
}: {
  preferredBudget: string;
  experienceYears: string;
  onChangeBudget: (value: string) => void;
  onChangeExperienceYears: (value: string) => void;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span>
          <i className="fas fa-sliders-h" /> Preferences
        </span>
      </div>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Preferred Budget Range</label>
          <select value={preferredBudget} onChange={(e) => onChangeBudget(e.target.value)}>
            <option>Under $100K</option>
            <option>$100K – $150K</option>
            <option>$150K – $200K</option>
            <option>$180K – $250K</option>
            <option>$250K+</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Years of Experience</label>
          <select value={experienceYears} onChange={(e) => onChangeExperienceYears(e.target.value)}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.sectionDivider}>Match Preferences</div>
      <div className={styles.prefNote}>
        <i className="fas fa-robot" /> These settings help our AI find better startup matches for
        you.
      </div>
      {MATCH_TOGGLES.map(({ key, label, sub }) => (
        <div key={key} className={styles.toggleRow}>
          <div>
            <div className={styles.toggleLabel}>{label}</div>
            <div className={styles.toggleSub}>{sub}</div>
          </div>
          <div className={`${styles.toggle} ${styles.toggleOn}`}>
            <div className={styles.toggleKnob} />
          </div>
        </div>
      ))}
      <div className={styles.cardFooter}>
        <button
          className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ""}`}
          onClick={onSave}
        >
          {saved ? (
            <>
              <i className="fas fa-check" /> Saved!
            </>
          ) : (
            <>
              <i className="fas fa-save" /> Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}
