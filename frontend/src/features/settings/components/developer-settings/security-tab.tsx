"use client";

import { useChangePassword } from "@/features/settings/lib/use-change-password";
import styles from "./developer-settings.module.css";

export function SecurityTab() {
  const {
    fields,
    setField,
    otp,
    setOtp,
    isResetFlow,
    startForgotFlow,
    resendOtp,
    cooldown,
    isResending,
    notice,
    cancelForgotFlow,
    submit,
    error,
    saved,
    isSubmitting,
  } = useChangePassword();

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span>
          <i className="fas fa-lock" /> Security Settings
        </span>
        {!isResetFlow ? (
          <button
            type="button"
            onClick={() => void startForgotFlow()}
            className="text-[11px] font-bold text-[#428475] transition-colors hover:text-[#2e7d5c] bg-transparent border-none p-0 cursor-pointer"
          >
            Forgot Password?
          </button>
        ) : (
          <button
            type="button"
            onClick={cancelForgotFlow}
            className="text-[11px] font-bold text-red-600 transition-colors hover:text-red-800 bg-transparent border-none p-0 cursor-pointer"
          >
            <i className="fas fa-times" /> Cancel Reset
          </button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-600"
        >
          {error}
        </p>
      )}

      {notice && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-700"
        >
          {notice}
        </p>
      )}

      <div className={styles.formGrid}>
        {!isResetFlow ? (
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label>Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={fields.current}
              onChange={(e) => setField({ current: e.target.value })}
            />
          </div>
        ) : (
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <div className="flex justify-between items-center mb-1">
              <label className="mb-0">Verification Code (OTP)</label>
              <button
                type="button"
                onClick={() => void resendOtp()}
                disabled={cooldown > 0 || isResending}
                className="text-[11px] font-bold text-[#428475] hover:text-[#2e7d5c] disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-none p-0 cursor-pointer"
              >
                {isResending
                  ? "Sending..."
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend Code"}
              </button>
            </div>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="text-center font-mono tracking-widest"
            />
          </div>
        )}
        <div className={styles.formGroup}>
          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={fields.next}
            onChange={(e) => setField({ next: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Confirm New Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={fields.confirm}
            onChange={(e) => setField({ confirm: e.target.value })}
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
          className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ""}`}
          onClick={() => void submit()}
          disabled={isSubmitting}
        >
          {saved ? (
            <>
              <i className="fas fa-check" /> Password Updated!
            </>
          ) : isSubmitting ? (
            <>
              <i className="fas fa-save" /> Updating...
            </>
          ) : isResetFlow ? (
            <>
              <i className="fas fa-save" /> Verify & Reset Password
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
