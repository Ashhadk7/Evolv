"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, Eye, EyeSlash } from "@phosphor-icons/react";
import { getApiErrorMessage } from "@/lib/api";
import { forgotPassword, resetPassword } from "@/features/auth/lib/auth-api";
import { EMAIL_REGEX, getPasswordStrengthError } from "@/features/auth/lib/validation";
import { Logo } from "./logo";
import { InputField } from "./input-field";
import { OtpVerification } from "./otp-verification";

type Phase = "email" | "reset" | "done";

function resolveForgotPasswordError(err: unknown): string {
  return getApiErrorMessage(err, (e) =>
    e.status === 502 ? "We couldn't send the reset email. Please try again shortly." : undefined
  );
}

export function ForgotPasswordForm() {
  const [phase, setPhase] = useState<Phase>("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setPhase("reset");
    } catch (err) {
      setError(resolveForgotPasswordError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (otp: string) => {
    const strengthError = getPasswordStrengthError(newPassword);
    if (strengthError) throw new Error(strengthError);
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }
    await resetPassword(email, otp, newPassword);
    setPhase("done");
  };

  return (
    <div className="flex w-full flex-col overflow-y-auto bg-[#f5f6f4] lg:w-[50%]">
      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 xl:px-16">
        <Link
          href="/sign-in"
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-bold text-[#0f1c18]/60 transition hover:bg-black/5"
        >
          <ArrowLeft size={14} weight="bold" />
          Back to sign in
        </Link>

        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        {phase === "email" && (
          <>
            <div className="mb-8">
              <h1 className="text-[1.75rem] font-bold tracking-tight text-[#0f1c18]">
                Reset your password
              </h1>
              <p className="mt-1.5 text-[13.5px] text-[#0f1c18]/45">
                Enter your account email and we&apos;ll send you a 6-digit reset code.
              </p>
            </div>

            <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-[12.5px] font-medium text-red-600"
                >
                  {error}
                </motion.div>
              )}

              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
              />

              <motion.button
                whileHover={{ scale: 1.012 }}
                whileTap={{ scale: 0.988 }}
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0f1c18] text-[13.5px] font-semibold text-[#89d7b7] shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending code..." : "Send reset code"}
                <ArrowRight size={14} weight="bold" />
              </motion.button>
            </form>
          </>
        )}

        {phase === "reset" && (
          <OtpVerification
            email={email}
            title="Check your email"
            description="If an account exists, we sent a 6-digit reset code to"
            submitLabel="Reset password"
            onVerify={handleReset}
            onResend={() => forgotPassword(email)}
          >
            <InputField
              label="New password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={setNewPassword}
              placeholder="At least 8 characters"
              right={
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#0f1c18]/30 transition-opacity hover:opacity-70"
                >
                  {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <InputField
              label="Confirm new password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat the new password"
            />
          </OtpVerification>
        )}

        {phase === "done" && (
          <div className="flex flex-col gap-5">
            <CheckCircle size={44} weight="fill" className="text-[#428475]" />
            <div>
              <h1 className="text-[1.75rem] font-bold tracking-tight text-[#0f1c18]">
                Password reset
              </h1>
              <p className="mt-1.5 text-[13.5px] text-[#0f1c18]/45">
                Your password has been changed. You can now sign in with your new password.
              </p>
            </div>
            <Link
              href="/sign-in"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0f1c18] text-[13.5px] font-semibold text-[#89d7b7] shadow-lg transition-all hover:opacity-90"
            >
              Go to sign in
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
