"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getApiErrorMessage } from "@/lib/api";

const RESEND_COOLDOWN_SECONDS = 30;
const OTP_PATTERN = /^\d{6}$/;

interface OtpVerificationProps {
  email: string;
  title: string;
  description: string;
  submitLabel: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  children?: React.ReactNode;
}

export function OtpVerification({
  email,
  title,
  description,
  submitLabel,
  onVerify,
  onResend,
  children,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  // A code was just sent when this screen mounts, so start locked.
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!OTP_PATTERN.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onVerify(otp);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setError("");
    setNotice("");
    setIsResending(true);
    try {
      await onResend();
      setNotice("A new code has been sent to your email.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#0f1c18]">{title}</h2>
        <p className="mt-1.5 text-[13px] text-[#0f1c18]/50">
          {description} <span className="font-semibold text-[#0f1c18]/70">{email}</span>
        </p>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-600"
        >
          {error}
        </motion.p>
      )}
      {notice && (
        <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-700">
          {notice}
        </p>
      )}

      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        placeholder="000000"
        aria-label="6-digit verification code"
        className="h-14 w-full rounded-xl border border-[#0f1c18]/10 bg-white text-center text-2xl font-bold tracking-[0.5em] text-[#0f1c18] outline-none focus:border-[#428475] focus:ring-2 focus:ring-[#89d7b7]/40"
      />

      {children}

      <button
        type="submit"
        disabled={isSubmitting || otp.length !== 6}
        className="flex h-11 w-full items-center justify-center rounded-xl bg-[#0f1c18] text-[13.5px] font-semibold text-[#89d7b7] shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Verifying..." : submitLabel}
      </button>

      <p className="text-center text-[12.5px] text-[#0f1c18]/45">
        Didn&apos;t receive a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="font-semibold text-[#428475] transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </p>
    </form>
  );
}
