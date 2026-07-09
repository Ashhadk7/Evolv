"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  EnvelopeSimple,
  ShieldCheck,
} from "@phosphor-icons/react";
import { Logo } from "./logo";
import {
  getApiErrorMessage,
  resendSignupOtp,
  signin,
  verifySignupEmail,
} from "../lib/auth-api";
import {
  authSessionFromSignin,
  clearPendingEmailAuth,
  getPendingEmailAuth,
  persistSignedInUserLocally,
  storeAuthSession,
} from "../lib/auth-session";
import { saveSignupProfileToBackend } from "../lib/signup-completion";
import {
  clearPendingSignup,
  getPendingSignup,
  persistSignupAccount,
  savePendingSignup,
} from "../lib/signup-storage";

const BRAND_INK = "#0f1c18";
const BRAND_MID = "#428475";
const BRAND_MINT = "#89d7b7";

export function VerifyEmailForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const pending = getPendingSignup(initialEmail);
    if (pending) {
      const timer = window.setTimeout(() => {
        setEmail(pending.account.email);
        setDebugOtp(pending.debugOtp ?? null);
        setExpiresAt(pending.expiresAt ?? null);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    if (initialEmail) return;

    const savedPending = getPendingSignup();
    if (!savedPending) return;

    const timer = window.setTimeout(() => {
      setEmail(savedPending.account.email);
      setDebugOtp(savedPending.debugOtp ?? null);
      setExpiresAt(savedPending.expiresAt ?? null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialEmail]);

  const expiryLabel = useMemo(() => {
    if (!expiresAt) return "";
    const expiryDate = new Date(expiresAt);
    if (Number.isNaN(expiryDate.getTime())) return "";
    return expiryDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [expiresAt]);

  const normalizedEmail = email.trim().toLowerCase();

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!normalizedEmail) {
      setError("Enter the email you used for signup.");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setVerifying(true);
    try {
      await verifySignupEmail({ email: normalizedEmail, otp });

      const pendingSignup = getPendingSignup(normalizedEmail);
      const pendingEmailAuth = getPendingEmailAuth(normalizedEmail);
      const password = pendingSignup?.account.password ?? pendingEmailAuth?.password;

      if (!password) {
        clearPendingSignup();
        clearPendingEmailAuth();
        router.replace(`/sign-in?verified=${encodeURIComponent(normalizedEmail)}`);
        return;
      }

      const signinResponse = await signin({ email: normalizedEmail, password });
      const session = authSessionFromSignin(signinResponse);
      storeAuthSession(session, { remember: false });

      if (pendingSignup) {
        try {
          await saveSignupProfileToBackend(pendingSignup, session.accessToken);
        } catch (profileError) {
          localStorage.setItem(
            "evolv_signup_profile_sync_error",
            getApiErrorMessage(profileError)
          );
        }
      }

      const redirectPath = pendingSignup
        ? persistSignupAccount(pendingSignup)
        : persistSignedInUserLocally(session);

      clearPendingSignup();
      clearPendingEmailAuth();
      router.replace(redirectPath);
    } catch (verificationError) {
      setError(getApiErrorMessage(verificationError));
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setNotice("");

    if (!normalizedEmail) {
      setError("Enter your email first so we can resend the code.");
      return;
    }

    setResending(true);
    try {
      const response = await resendSignupOtp({ email: normalizedEmail });
      setNotice("A new code has been sent. Check your inbox and spam folder.");
      setDebugOtp(response.debug_otp ?? null);
      setExpiresAt(response.expires_at);

      const pending = getPendingSignup(normalizedEmail);
      if (pending) {
        savePendingSignup({
          role: pending.role,
          account: pending.account,
          founder: pending.founder,
          developer: pending.developer,
          profileComplete: pending.profileComplete,
          expiresAt: response.expires_at,
          debugOtp: response.debug_otp,
        });
      }
    } catch (resendError) {
      setError(getApiErrorMessage(resendError));
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="flex h-screen flex-1 flex-col overflow-y-auto lg:w-[56%] lg:flex-none xl:w-[58%]">
      <div
        className="flex shrink-0 items-center justify-between px-8 sm:px-10 xl:px-14"
        style={{ paddingTop: "52px" }}
      >
        <Logo />
        <Link
          href="/sign-in"
          className="text-[13.5px] font-bold transition-colors hover:opacity-80"
          style={{ color: BRAND_MID }}
        >
          Log in
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-10 xl:px-14">
        <motion.form
          onSubmit={handleVerify}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[520px]"
        >
          <Link
            href="/sign-up"
            className="mb-6 inline-flex w-fit items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-bold transition hover:bg-black/5"
            style={{ color: "rgba(15,28,24,0.6)" }}
          >
            <ArrowLeft size={14} weight="bold" />
            Back to signup
          </Link>

          <div
            className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(137,215,183,0.18)",
              color: BRAND_MID,
            }}
          >
            <EnvelopeSimple size={22} weight="fill" />
          </div>

          <h1 className="text-[1.85rem] leading-[1.18] font-bold" style={{ color: BRAND_INK }}>
            Verify your email
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "rgba(15,28,24,0.5)" }}>
            We sent a 6-digit code to your email. If it is not in your inbox, check spam or junk,
            then enter the code below.
          </p>

          <div className="mt-7 grid gap-4">
            <label className="block">
              <span
                className="mb-1.5 block text-[12px] font-semibold"
                style={{ color: "rgba(15,28,24,0.68)" }}
              >
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full rounded-lg border bg-white px-4 text-[14px] transition outline-none placeholder:text-[#0f1c18]/35 focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
                style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}
              />
            </label>

            <label className="block">
              <span
                className="mb-1.5 block text-[12px] font-semibold"
                style={{ color: "rgba(15,28,24,0.68)" }}
              >
                Verification code
              </span>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="h-[52px] w-full rounded-xl border bg-white px-4 text-center text-[24px] font-bold tracking-[0.28em] transition outline-none placeholder:text-[#0f1c18]/20 focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20"
                style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}
              />
            </label>

            {expiryLabel && (
              <p className="text-[12px]" style={{ color: "rgba(15,28,24,0.45)" }}>
                This code expires around {expiryLabel}.
              </p>
            )}

            {debugOtp && (
              <div
                className="rounded-lg border px-3.5 py-2.5 text-[12.5px] font-semibold"
                style={{
                  borderColor: "rgba(66,132,117,0.18)",
                  background: "rgba(137,215,183,0.13)",
                  color: BRAND_INK,
                }}
              >
                Local debug code: {debugOtp}
              </div>
            )}

            {notice && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3.5 py-3 text-[12.5px] font-medium text-emerald-700"
              >
                <ShieldCheck size={15} weight="fill" className="mt-0.5 shrink-0" />
                {notice}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-100 bg-red-50 px-3.5 py-3 text-[12.5px] font-medium text-red-700"
                role="alert"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.012 }}
              whileTap={{ scale: 0.988 }}
              type="submit"
              disabled={verifying}
              aria-busy={verifying}
              className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13.5px] font-semibold transition-all"
              style={{
                background: BRAND_INK,
                color: BRAND_MINT,
                opacity: verifying ? 0.72 : 1,
                boxShadow: "0 4px 14px rgba(15,28,24,0.18)",
              }}
            >
              {verifying ? "Verifying..." : "Verify and continue"}
              {!verifying && <ArrowRight size={14} weight="bold" />}
            </motion.button>

            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={resending}
              className="flex h-10 items-center justify-center gap-2 rounded-xl text-[13px] font-bold transition hover:bg-black/5 disabled:opacity-60"
              style={{ color: BRAND_MID }}
            >
              <ArrowClockwise size={14} weight="bold" />
              {resending ? "Sending..." : "Resend code"}
            </button>
          </div>
        </motion.form>
      </div>
    </main>
  );
}
