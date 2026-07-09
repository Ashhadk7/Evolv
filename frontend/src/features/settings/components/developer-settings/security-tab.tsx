"use client";

import type { PasswordData } from "./developer-settings-types";
import styles from "./developer-settings.module.css";

export function SecurityTab({
  passwordData,
  onChangePasswordData,
  pwSaved,
  onSave,
}: {
  passwordData: PasswordData;
  onChangePasswordData: (patch: Partial<PasswordData>) => void;
  pwSaved: boolean;
  onSave: () => void;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span>
          <i className="fas fa-lock" /> Security Settings
        </span>
      </div>
      <div className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
          <label>Current Password</label>
          <input
            type="password"
            placeholder="Enter current password"
            value={passwordData.current}
            onChange={(e) => onChangePasswordData({ current: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={passwordData.newPass}
            onChange={(e) => onChangePasswordData({ newPass: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Confirm New Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={passwordData.confirm}
            onChange={(e) => onChangePasswordData({ confirm: e.target.value })}
          />
        </div>
      </div>
      <div className={styles.securityInfo}>
        <i className="fas fa-shield-alt" style={{ color: "#5BC8A0" }} />
        <span>
          Use at least 8 characters, including uppercase, lowercase, numbers, and symbols.
        </span>
      </div>
      <div className={styles.sectionDivider}>Two-Factor Authentication</div>
      <div className={styles.twoFARow}>
        <div>
          <div className={styles.twoFALabel}>
            <i className="fas fa-mobile-alt" style={{ color: "#5BC8A0" }} /> Authenticator App
          </div>
          <div className={styles.twoFASub}>
            Use Google Authenticator or Authy to generate one-time codes
          </div>
        </div>
        <button className={styles.enableBtn}>
          <i className="fas fa-plus" /> Enable
        </button>
      </div>
      <div className={styles.cardFooter}>
        <button
          className={`${styles.saveBtn} ${pwSaved ? styles.saveBtnSaved : ""}`}
          onClick={onSave}
        >
          {pwSaved ? (
            <>
              <i className="fas fa-check" /> Password Updated!
            </>
          ) : (
            <>
              <i className="fas fa-save" /> Update Password
            </>
          )}
        </button>
      </div>
    </div>
  );
}
