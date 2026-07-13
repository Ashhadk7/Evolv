"use client";

import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import type { ApiError } from "@/lib/api";
import { getPhoneStatus, sendPhoneOtp, verifyPhoneOtp } from "./phone-verification-api";

const RESEND_COOLDOWN_SECONDS = 30;
const OTP_EXPIRES_SECONDS = 10 * 60;

interface UsePhoneVerificationOptions {
  onSynced?: () => Promise<void> | void;
}

function getPhoneVerificationError(err: unknown) {
  return getApiErrorMessage(err, (apiError: ApiError) => {
    if (apiError.status === 502) return apiError.detail;
    return undefined;
  });
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function usePhoneVerification(options: UsePhoneVerificationOptions = {}) {
  const [phone, setPhoneState] = useState("");
  const [savedPhone, setSavedPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [sentPhone, setSentPhone] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const status = await getPhoneStatus();
        if (!active) return;
        const currentPhone = status.phone ?? "";
        setPhoneState(currentPhone);
        setSavedPhone(currentPhone);
        setPhoneVerified(status.phone_verified);
      } catch (err) {
        if (active) setError(getPhoneVerificationError(err));
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!otpSent || otpExpiresAt <= 0) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [otpExpiresAt, otpSent]);

  const isVerifiedForCurrentPhone =
    Boolean(phone.trim()) && phoneVerified && phone.trim() === savedPhone.trim();
  const phoneNeedsVerification = Boolean(phone.trim()) && !isVerifiedForCurrentPhone;
  const otpExpiresIn = otpSent ? Math.max(0, Math.ceil((otpExpiresAt - now) / 1000)) : 0;
  const otpExpired = otpSent && otpExpiresIn <= 0;
  const otpExpiresLabel = otpSent
    ? otpExpired
      ? "Code expired"
      : `Code expires in ${formatCountdown(otpExpiresIn)}`
    : "";

  const setPhone = (value: string) => {
    setPhoneState(value);
    setNotice("");
    setError("");
    if (value.trim() !== sentPhone.trim()) {
      setOtp("");
      setOtpSent(false);
      setOtpExpiresAt(0);
    }
  };

  const sendOtp = async () => {
    const targetPhone = phone.trim();
    if (!targetPhone) {
      setError("Enter your phone number first.");
      return;
    }
    if (cooldown > 0 || isSending) return;

    setIsSending(true);
    setNotice("");
    setError("");
    try {
      const response = await sendPhoneOtp(targetPhone);
      setPhoneState(response.phone);
      setSavedPhone(response.phone);
      setPhoneVerified(response.phone_verified);
      setSentPhone(response.phone);
      setOtp("");
      setOtpSent(true);
      setNow(Date.now());
      setOtpExpiresAt(Date.now() + OTP_EXPIRES_SECONDS * 1000);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setNotice("A 6-digit code has been sent to your phone.");
      await options.onSynced?.();
    } catch (err) {
      setError(getPhoneVerificationError(err));
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    if (phone.trim() !== sentPhone.trim()) {
      setError("Send a new code before verifying this phone number.");
      return;
    }
    if (otpExpired) {
      setError("This code has expired. Send a new OTP and try again.");
      return;
    }

    setIsVerifying(true);
    setNotice("");
    setError("");
    try {
      const response = await verifyPhoneOtp(phone.trim(), otp);
      setPhoneState(response.phone);
      setSavedPhone(response.phone);
      setPhoneVerified(response.phone_verified);
      setOtp("");
      setOtpSent(false);
      setOtpExpiresAt(0);
      setSentPhone("");
      setNotice(response.message);
      await options.onSynced?.();
    } catch (err) {
      setError(getPhoneVerificationError(err));
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    phone,
    setPhone,
    savedPhone,
    phoneVerified,
    isVerifiedForCurrentPhone,
    phoneNeedsVerification,
    otp,
    setOtp: (value: string) => setOtp(value.replace(/\D/g, "").slice(0, 6)),
    otpSent,
    otpExpired,
    otpExpiresIn,
    otpExpiresLabel,
    cooldown,
    isLoading,
    isSending,
    isVerifying,
    notice,
    error,
    sendOtp,
    verifyOtp,
  };
}
