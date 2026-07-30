"use client";

import {
  RATE_CURRENCIES,
  RATE_PERIODS,
  formatRate,
  parseRateForm,
} from "@/features/profiles/developer-rate";
import styles from "./developer-settings.module.css";
import { SaveButton } from "./save-button";

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
  rateAmount,
  ratePeriod,
  rateCurrency,
  experienceYears,
  onChangeRateAmount,
  onChangeRatePeriod,
  onChangeRateCurrency,
  onChangeExperienceYears,
  onSave,
}: {
  rateAmount: string;
  ratePeriod: string;
  rateCurrency: string;
  experienceYears: string;
  onChangeRateAmount: (value: string) => void;
  onChangeRatePeriod: (value: string) => void;
  onChangeRateCurrency: (value: string) => void;
  onChangeExperienceYears: (value: string) => void;
  onSave: () => void | Promise<void>;
}) {
  const preview = formatRate(parseRateForm(rateAmount, ratePeriod, rateCurrency));

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span>
          <i className="fas fa-sliders-h" /> Preferences
        </span>
      </div>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Your Rate</label>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={rateAmount}
            onChange={(e) => onChangeRateAmount(e.target.value)}
            placeholder="80000"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Currency</label>
          <select value={rateCurrency} onChange={(e) => onChangeRateCurrency(e.target.value)}>
            {RATE_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Per</label>
          <select value={ratePeriod} onChange={(e) => onChangeRatePeriod(e.target.value)}>
            {RATE_PERIODS.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
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
      <div className={styles.prefNote}>
        <i className="fas fa-tag" />{" "}
        {preview
          ? `Founders see ${preview}. This is what build estimates are priced from.`
          : "Set your rate so founders see accurate build estimates for your work."}
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
        <SaveButton label="Save Preferences" onSave={onSave} />
      </div>
    </div>
  );
}
