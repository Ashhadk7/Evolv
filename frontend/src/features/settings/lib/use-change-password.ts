"use client";

import { useState, useEffect } from "react";
import { getApiErrorMessage } from "@/lib/api";
import { getPasswordStrengthError } from "@/features/auth/lib/validation";
import { changePassword } from "./account-api";
import { forgotPassword, resetPassword } from "@/features/auth/lib/auth-api";
import { getSession, clearAllUserData } from "@/features/auth/lib/session";

export interface PasswordFields {
  current: string;
  next: string;
  confirm: string;
}

const EMPTY_FIELDS: PasswordFields = { current: "", next: "", confirm: "" };
const SAVED_RESET_DELAY_MS = 2500;
const RESEND_COOLDOWN_SECONDS = 30;

export function useChangePassword() {
  const [fields, setFields] = useState<PasswordFields>(EMPTY_FIELDS);
  const [otp, setOtp] = useState("");
  const [isResetFlow, setIsResetFlow] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const setField = (patch: Partial<PasswordFields>) => {
    setFields((current) => ({ ...current, ...patch }));
    setSaved(false);
  };

  const startForgotFlow = async () => {
    setError("");
    setNotice("");
    const session = getSession();
    const email = session?.user?.email;
    if (!email) {
      setError("User session not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setIsResetFlow(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setNotice("A verification code has been sent to your email.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0 || isResending) return;
    setError("");
    setNotice("");
    const session = getSession();
    const email = session?.user?.email;
    if (!email) {
      setError("User session not found. Please log in again.");
      return;
    }

    setIsResending(true);
    try {
      await forgotPassword(email);
      setNotice("A new code has been sent to your email.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  const cancelForgotFlow = () => {
    setIsResetFlow(false);
    setOtp("");
    setError("");
    setNotice("");
    setFields(EMPTY_FIELDS);
  };

  const submit = async () => {
    setError("");
    setNotice("");

    // Validation for new passwords
    if (!fields.next || !fields.confirm) {
      setError("Please fill in the new password and confirmation.");
      return;
    }
    const strengthError = getPasswordStrengthError(fields.next);
    if (strengthError) {
      setError(strengthError);
      return;
    }
    if (fields.next !== fields.confirm) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (isResetFlow) {
      if (!otp || otp.length !== 6) {
        setError("Please enter the 6-digit verification code.");
        return;
      }
      const session = getSession();
      const email = session?.user?.email;
      if (!email) {
        setError("User session not found. Please log in again.");
        return;
      }

      setIsSubmitting(true);
      try {
        await resetPassword(email, otp, fields.next);
        setFields(EMPTY_FIELDS);
        setOtp("");
        setIsResetFlow(false);
        setSaved(true);
        setNotice("Password reset successfully! Logging out...");
        clearAllUserData();
        window.setTimeout(() => {
          window.location.href = "/sign-in";
        }, SAVED_RESET_DELAY_MS);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!fields.current) {
        setError("Please enter your current password.");
        return;
      }
      setIsSubmitting(true);
      try {
        await changePassword(fields.current, fields.next);
        setFields(EMPTY_FIELDS);
        setSaved(true);
        setNotice("Password updated successfully! Logging out...");
        clearAllUserData();
        window.setTimeout(() => {
          window.location.href = "/sign-in";
        }, SAVED_RESET_DELAY_MS);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return {
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
    setNotice,
    cancelForgotFlow,
    submit,
    error,
    setError,
    saved,
    isSubmitting,
  };
}
