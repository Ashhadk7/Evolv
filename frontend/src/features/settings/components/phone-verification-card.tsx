"use client";

import { useEffect, useRef, useState } from "react";
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { CheckCircle, DeviceMobile, PaperPlaneTilt, ShieldCheck } from "@phosphor-icons/react";
import { getApiErrorMessage, getPhoneStatus, verifyPhone } from "@/features/auth/lib/auth-api";
import { createPhoneRecaptcha, sendPhoneOtp } from "@/features/auth/lib/firebase-phone";
import {
  savePhoneStatusToLocalProfile,
  toPhoneVerificationStatus,
  type PhoneVerificationStatus,
} from "@/features/auth/lib/phone-verification";

type AuthUser = {
  role?: "founder" | "developer";
};

export function PhoneVerificationCard({
  initialPhone = "",
  initialPhoneVerified = false,
  onStatusChange,
}: {
  initialPhone?: string;
  initialPhoneVerified?: boolean;
  onStatusChange?: (status: PhoneVerificationStatus) => void;
}) {
  const captchaRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<PhoneVerificationStatus>({
    phone: initialPhone || null,
    phoneVerified: initialPhoneVerified,
  });
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) return;
    let active = true;

    getPhoneStatus(session.token)
      .then((response) => {
        if (!active) return;
        const next = toPhoneVerificationStatus(response);
        setStatus(next);
        setPhone(next.phone ?? initialPhone);
        savePhoneStatusToLocalProfile(session.role, next);
        onStatusChange?.(next);
      })
      .catch((statusError) => {
        if (active) setError(getApiErrorMessage(statusError));
      });

    return () => {
      active = false;
      verifierRef.current?.clear();
      verifierRef.current = null;
    };
  }, [initialPhone, onStatusChange]);

  const sendCode = async () => {
    const session = getAuthSession();
    const nextPhone = normalizePhone(phone);
    setError("");
    setMessage("");

    if (!session) {
      setError("Please sign in again before verifying your phone.");
      return;
    }
    if (!/^\+[1-9]\d{7,14}$/.test(nextPhone)) {
      setError("Use international format, for example +923001234567.");
      return;
    }
    if (!captchaRef.current) return;

    setSending(true);
    try {
      verifierRef.current?.clear();
      captchaRef.current.innerHTML = "";
      const verifier = createPhoneRecaptcha(captchaRef.current);
      verifierRef.current = verifier;
      await verifier.render();
      const result = await sendPhoneOtp(nextPhone, verifier);
      setConfirmation(result);
      setPhone(nextPhone);
      setMessage("OTP sent. Check SMS and enter the code below.");
    } catch (sendError) {
      setError(formatPhoneError(sendError));
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    const session = getAuthSession();
    setError("");
    setMessage("");

    if (!session) {
      setError("Please sign in again before verifying your phone.");
      return;
    }
    if (!confirmation) {
      setError("Send an OTP first.");
      return;
    }
    if (!code.trim()) {
      setError("Enter the OTP code.");
      return;
    }

    setVerifying(true);
    try {
      const result = await confirmation.confirm(code.trim());
      const firebaseIdToken = await result.user.getIdToken();
      const response = await verifyPhone(firebaseIdToken, session.token);
      const next = toPhoneVerificationStatus(response);
      setStatus(next);
      setPhone(next.phone ?? phone);
      setCode("");
      setConfirmation(null);
      savePhoneStatusToLocalProfile(session.role, next);
      onStatusChange?.(next);
      setMessage(response.message);
    } catch (verifyError) {
      setError(formatPhoneError(verifyError));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <section className="border-y border-[#edf1ee] py-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8f5ef] text-[#2f8068]">
            <DeviceMobile size={18} weight="bold" />
          </div>
          <div>
            <h5 className="text-[13px] font-extrabold text-[#1a2e26]">Phone verification</h5>
            <p className="mt-1 text-[11.5px] leading-5 text-[#6b8e7e]">
              Required before messaging, connecting, applying, or publishing.
            </p>
          </div>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{
            background: status.phoneVerified ? "#e8f5ef" : "#fff8e5",
            color: status.phoneVerified ? "#1f735d" : "#8a6116",
          }}
        >
          {status.phoneVerified ? <CheckCircle size={13} weight="fill" /> : <ShieldCheck size={13} />}
          {status.phoneVerified ? "Verified" : "Required"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          disabled={status.phoneVerified || sending || verifying}
          placeholder="+923001234567"
          className="h-10 rounded-lg border border-[#d4e4db] bg-[#f8faf8] px-3 text-[13px] text-[#1a2e26] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#89d7b7]/30 disabled:opacity-70"
        />
        <button
          type="button"
          onClick={sendCode}
          disabled={status.phoneVerified || sending || verifying}
          className="bp-gradient-btn flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[12.5px] font-extrabold disabled:opacity-60"
        >
          <PaperPlaneTilt size={14} weight="bold" />
          {sending ? "Sending" : confirmation ? "Resend OTP" : "Send OTP"}
        </button>
      </div>

      {confirmation && !status.phoneVerified && (
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            inputMode="numeric"
            placeholder="Enter OTP"
            className="h-10 rounded-lg border border-[#d4e4db] bg-white px-3 text-[13px] text-[#1a2e26] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#89d7b7]/30"
          />
          <button
            type="button"
            onClick={verifyCode}
            disabled={verifying}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#8fd8be] px-4 text-[12.5px] font-extrabold text-[#0d5c35] disabled:opacity-60"
          >
            <CheckCircle size={14} weight="bold" />
            {verifying ? "Verifying" : "Verify"}
          </button>
        </div>
      )}

      {message && <p className="mt-3 text-[11.5px] font-semibold text-[#1f735d]">{message}</p>}
      {error && <p className="mt-3 text-[11.5px] font-semibold text-[#c62828]">{error}</p>}
      <div ref={captchaRef} />
    </section>
  );
}

function getAuthSession() {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem("evolv_access_token");
  const rawUser = window.localStorage.getItem("evolv_auth_user");
  if (!token || !rawUser) return null;

  try {
    const user = JSON.parse(rawUser) as AuthUser;
    if (user.role !== "founder" && user.role !== "developer") return null;
    return { token, role: user.role };
  } catch {
    return null;
  }
}

function normalizePhone(value: string) {
  return value.trim().replace(/[^\d+]/g, "");
}

function formatPhoneError(error: unknown) {
  const message = error instanceof Error ? error.message : "Phone verification failed.";
  if (message.includes("auth/invalid-phone-number")) return "Enter a valid phone number.";
  if (message.includes("auth/too-many-requests")) return "Too many attempts. Try again later.";
  if (message.includes("auth/invalid-verification-code")) return "That OTP code is not correct.";
  if (message.includes("auth/code-expired")) return "That OTP expired. Send a new one.";
  return message || "Phone verification failed.";
}
