"use client";

import { Check, LockKey, ShieldCheck, X } from "@phosphor-icons/react";
import { MID, TEXT_BODY, TEXT_MUTED } from "@/features/settings/lib/settings-theme";
import { useChangePassword } from "@/features/settings/lib/use-change-password";
import { Field } from "./field";

export function SecuritySection() {
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
    <div className="flex flex-col gap-6">
      <section
        className="max-w-2xl bg-white p-6 sm:p-8"
        style={{
          border: "1.5px solid #d4e4db",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(26,49,44,0.04)",
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LockKey size={18} weight="bold" style={{ color: MID }} />
            <h4 className="text-[14px] font-extrabold" style={{ color: TEXT_BODY }}>
              Security Settings
            </h4>
          </div>
          {isResetFlow && (
            <button
              type="button"
              onClick={cancelForgotFlow}
              className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-800 transition bg-transparent border-none p-0 cursor-pointer"
            >
              <X size={12} weight="bold" /> Cancel Reset
            </button>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-600"
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-700"
          >
            {notice}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {!isResetFlow ? (
            <div className="sm:col-span-2">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[11px] font-bold" style={{ color: TEXT_MUTED }}>
                    Current Password
                  </label>
                  <button
                    type="button"
                    onClick={() => void startForgotFlow()}
                    className="cursor-pointer text-[11px] font-bold text-[#428475] transition-colors hover:text-[#2e7d5c] bg-transparent border-none p-0"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  value={fields.current}
                  onChange={(e) => setField({ current: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full rounded-lg px-4 py-2.5 text-[13px] transition outline-none focus:border-[#428475] focus:ring-2 focus:ring-[#89d7b7]/30"
                  style={{ background: "#f8faf8", border: "1px solid #d4e4db", color: "#1a2e26" }}
                />
              </div>
            </div>
          ) : (
            <div className="sm:col-span-2">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[11px] font-bold" style={{ color: TEXT_MUTED }}>
                    Verification Code (OTP)
                  </label>
                  <button
                    type="button"
                    onClick={() => void resendOtp()}
                    disabled={cooldown > 0 || isResending}
                    className="cursor-pointer text-[11px] font-bold text-[#428475] transition-colors hover:text-[#2e7d5c] disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-none p-0"
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
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full rounded-lg px-4 py-2.5 text-[13px] transition outline-none focus:border-[#428475] focus:ring-2 focus:ring-[#89d7b7]/30 font-mono tracking-widest text-center"
                  style={{ background: "#f8faf8", border: "1px solid #d4e4db", color: "#1a2e26" }}
                />
              </div>
            </div>
          )}

          <Field
            label="New Password"
            type="password"
            value={fields.next}
            onChange={(value) => setField({ next: value })}
            placeholder="Enter new password"
          />

          <Field
            label="Confirm New Password"
            type="password"
            value={fields.confirm}
            onChange={(value) => setField({ confirm: value })}
            placeholder="Confirm new password"
          />
        </div>

        <div
          className="flex items-start gap-3 rounded-lg px-4 py-3.5"
          style={{ background: "#f8faf8", border: "1px solid #edf1ee", marginTop: 24 }}
        >
          <ShieldCheck size={16} weight="bold" style={{ color: MID, marginTop: 1 }} />
          <p className="text-[11.5px] leading-5" style={{ color: TEXT_MUTED }}>
            Use at least 8 characters including uppercase, lowercase, and numbers. Protect your
            founder workspace, saved blueprints, activity logs, and team conversations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={isSubmitting}
          className="bp-gradient-btn flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-6 text-[13px] font-extrabold transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ marginTop: 24 }}
        >
          <Check size={15} weight="bold" />
          {saved
            ? "Password Updated"
            : isSubmitting
            ? "Updating..."
            : isResetFlow
            ? "Verify & Reset Password"
            : "Update Password"}
        </button>
      </section>
    </div>
  );
}
