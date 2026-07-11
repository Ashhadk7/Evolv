"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Briefcase, RocketLaunch, UserCircle } from "@phosphor-icons/react";
import { Logo } from "./logo";
import { SignupProgress } from "./signup-progress";
import {
  BRAND_INK,
  BRAND_MID,
  BRAND_MINT,
  DEGREE_OPTIONS_BY_LEVEL,
  DEFAULT_DEGREE_OPTIONS,
} from "./signup/constants";
import { findCountry, getAccountErrors, buildAccountErrorSummary } from "./signup/helpers";
import { RoleSelectionStep } from "./signup/role-selection-step";
import { AccountStep } from "./signup/account-step";
import { FounderProfileStep } from "./signup/founder-profile-step";
import { DeveloperProfileStep } from "./signup/developer-profile-step";
import { useSignupLocationOptions } from "../hooks/use-signup-location-options";
import { persistSignupAccount } from "../lib/signup-storage";
import { OtpVerification } from "./otp-verification";
import { getApiErrorMessage } from "@/lib/api";
import { resendSignupOtp, signIn, signUp, verifySignupEmail } from "../lib/auth-api";
import { saveSession } from "../lib/session";
import type { Role, AccountField, AccountValidationField } from "./signup/types";

function resolveSignUpError(err: unknown): string {
  return getApiErrorMessage(err, (e) => {
    if (e.status === 409)
      return "An account with this email already exists. Try logging in instead.";
    if (e.status === 502) return "We couldn't send the verification email. Please try again shortly.";
    return undefined;
  });
}

export function SignUpForm() {
  const router = useRouter();
  const scrollRef = useRef<HTMLElement | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | "">("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [accountTouched, setAccountTouched] = useState<
    Partial<Record<AccountValidationField, boolean>>
  >({});
  const [accountSubmitted, setAccountSubmitted] = useState(false);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [account, setAccount] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    country: "",
    countryCode: "",
    stateProvince: "",
    city: "",
    phone: "",
    dob: "",
  });

  const [founder, setFounder] = useState({
    headline: "",
    bio: "",
    domains: [] as string[],
    primaryGoal: "",
    educationLevel: "",
    degreeName: "",
    customDegreeName: "",
    linkedin: "",
  });

  const [developer, setDeveloper] = useState({
    jobTitle: "",
    experience: "",
    skills: [] as string[],
    educationLevel: "",
    degreeName: "",
    customDegreeName: "",
    bio: "",
    github: "",
    linkedIn: "",
  });

  const profileCompleteness = useMemo(() => {
    if (role === "founder") {
      const degreeValue =
        founder.degreeName === "Other" ? founder.customDegreeName : founder.degreeName;
      const filled =
        [
          founder.headline,
          founder.bio,
          founder.educationLevel,
          degreeValue,
          founder.primaryGoal,
          founder.linkedin,
        ].filter(Boolean).length + (founder.domains.length ? 1 : 0);
      return Math.round((filled / 7) * 100);
    }
    if (role === "developer") {
      const degreeValue =
        developer.degreeName === "Other" ? developer.customDegreeName : developer.degreeName;
      const filled =
        [
          developer.jobTitle,
          developer.experience,
          developer.educationLevel,
          degreeValue,
          developer.bio,
          developer.github,
          developer.linkedIn,
        ].filter(Boolean).length + (developer.skills.length ? 1 : 0);
      return Math.round((filled / 8) * 100);
    }
    return 0;
  }, [developer, founder, role]);

  const accountErrors = useMemo(() => getAccountErrors(account, agreed), [account, agreed]);
  const accountErrorSummary = useMemo(
    () => buildAccountErrorSummary(accountErrors),
    [accountErrors]
  );
  const visibleError =
    step === 1 && accountSubmitted && accountErrorSummary ? accountErrorSummary : error;
  const {
    countryOptions,
    locationStatus,
    cityStatus,
    selectedCountry,
    countryDropdownOptions,
    stateDropdownOptions,
    cityDropdownOptions,
    countryCodeOptions,
  } = useSignupLocationOptions(account.country, account.stateProvince);
  const founderDegreeOptions = useMemo(
    () =>
      founder.educationLevel
        ? (DEGREE_OPTIONS_BY_LEVEL[founder.educationLevel] ?? ["Other"])
        : DEFAULT_DEGREE_OPTIONS,
    [founder.educationLevel]
  );
  const developerDegreeOptions = useMemo(
    () =>
      developer.educationLevel
        ? (DEGREE_OPTIONS_BY_LEVEL[developer.educationLevel] ?? ["Other"])
        : DEFAULT_DEGREE_OPTIONS,
    [developer.educationLevel]
  );

  const markAccountTouched = (field: AccountValidationField) =>
    setAccountTouched((current) => ({ ...current, [field]: true }));
  const accountErrorFor = (field: AccountValidationField) =>
    accountTouched[field] || accountSubmitted ? accountErrors[field] : undefined;
  const scrollToErrorSummary = () => {
    requestAnimationFrame(() => {
      errorSummaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      errorSummaryRef.current?.focus({ preventScroll: true });
      if (!errorSummaryRef.current) scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const setAccountField = (k: AccountField, v: string) => {
    setAccount((current) => {
      const next = { ...current, [k]: v };
      if (k === "country") {
        const nextCountry = findCountry(countryOptions, v);
        next.countryCode = nextCountry?.dialCode ?? "";
        next.stateProvince = "";
        next.city = "";
      }
      if (k === "stateProvince") next.city = "";
      return next;
    });
  };
  const setFounderField = (k: Exclude<keyof typeof founder, "domains">, v: string) =>
    setFounder((c) => ({ ...c, [k]: v }));
  const setDevField = (k: Exclude<keyof typeof developer, "skills">, v: string) =>
    setDeveloper((c) => ({ ...c, [k]: v }));

  const toggleFounderDomain = (d: string) =>
    setFounder((c) => ({
      ...c,
      domains: c.domains.includes(d) ? c.domains.filter((x) => x !== d) : [...c.domains, d],
    }));
  const toggleSkill = (s: string) =>
    setDeveloper((c) => ({
      ...c,
      skills: c.skills.includes(s) ? c.skills.filter((x) => x !== s) : [...c.skills, s],
    }));

  const validateRole = () => {
    if (!role) {
      setError("Choose whether you are joining as a founder or developer.");
      scrollToErrorSummary();
      return false;
    }
    setError("");
    return true;
  };

  const validateAccount = () => {
    const nextErrors = getAccountErrors(account, agreed);
    const fields = Object.keys(nextErrors) as AccountValidationField[];
    setAccountSubmitted(true);
    if (fields.length) {
      setAccountTouched((current) =>
        fields.reduce((next, field) => ({ ...next, [field]: true }), current)
      );
      setError(buildAccountErrorSummary(nextErrors));
      scrollToErrorSummary();
      return false;
    }
    setError("");
    setAccountSubmitted(false);
    return true;
  };

  // Step 1 (account) submit: creates the auth user and sends the email OTP.
  // Profile fields are not part of signup — they are collected after login.
  const submitSignup = async () => {
    if (!role) return;
    setIsSubmitting(true);
    setError("");
    try {
      await signUp({
        role,
        email: account.email,
        password: account.password,
        firstName: account.firstName,
        lastName: account.lastName,
        phone: account.phone,
        country: account.country,
        countryCode: account.countryCode,
        stateProvince: account.stateProvince,
        city: account.city,
        dob: account.dob,
        termsAccepted: agreed,
      });
      setAwaitingOtp(true);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(resolveSignUpError(err));
      scrollToErrorSummary();
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP verified: mark email verified, auto-sign-in, then move to the profile step.
  const completeVerifiedSignup = async (otp: string) => {
    await verifySignupEmail(account.email, otp);

    try {
      const session = await signIn(account.email, account.password);
      saveSession(session, true);
    } catch {
      router.push("/sign-in");
      return;
    }

    setAwaitingOtp(false);
    setError("");
    setStep(2);
  };

  const isProfileComplete = () => {
    if (role === "founder") {
      const founderDegreeName =
        founder.degreeName === "Other" ? founder.customDegreeName : founder.degreeName;
      return Boolean(
        founder.headline &&
        founder.bio &&
        founder.domains.length &&
        founder.educationLevel &&
        founderDegreeName &&
        founder.linkedin
      );
    }
    const developerDegreeName =
      developer.degreeName === "Other" ? developer.customDegreeName : developer.degreeName;
    return Boolean(
      developer.jobTitle &&
      developer.bio &&
      developer.educationLevel &&
      developerDegreeName &&
      developer.skills.length &&
      developer.github &&
      developer.linkedIn
    );
  };

  // Step 2 (profile) finish: the user is already signed in — persist the profile
  // details and redirect to their dashboard.
  const finish = async (skip = false) => {
    setError("");
    if (!role) return;
    try {
      setIsSubmitting(true);
      const redirectPath = await persistSignupAccount({
        role,
        account,
        founder,
        developer,
        profileComplete: !skip && isProfileComplete(),
      });
      router.push(redirectPath);
    } catch {
      setError("Something went wrong while saving your profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    if (step === 0 && validateRole()) setStep(1);
    if (step === 1 && validateAccount()) void submitSignup();
  };

  return (
    <main
      ref={scrollRef}
      className="relative flex h-screen flex-1 flex-col overflow-y-auto lg:w-[56%] lg:flex-none xl:w-[58%]"
    >
      <div
        className="flex shrink-0 items-center justify-between px-8 sm:px-10 xl:px-14"
        style={{ paddingTop: "52px" }}
      >
        <Logo />
        <p
          className="hidden text-[14px] font-medium sm:block"
          style={{ color: "rgba(15,28,24,0.5)" }}
        >
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-bold underline underline-offset-2 transition-colors hover:opacity-80"
            style={{ color: BRAND_MID }}
          >
            Log in
          </Link>
        </p>
        <Link
          href="/sign-in"
          className="text-[13.5px] font-bold transition-colors hover:opacity-80 sm:hidden"
          style={{ color: BRAND_MID }}
        >
          Log in
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`flex flex-col px-8 sm:px-10 xl:px-14 ${step === 2 ? "pt-10 pb-52" : "flex-1 justify-center"}`}
      >
        <div className="mx-auto w-full max-w-[560px]">
          {awaitingOtp ? (
            <OtpVerification
              email={account.email}
              title="Verify your email"
              description="We sent a 6-digit code to"
              submitLabel="Verify & create account"
              onVerify={completeVerifiedSignup}
              onResend={() => resendSignupOtp(account.email)}
            />
          ) : (
            <>
          <div className="mb-8">
            <SignupProgress step={step} role={role} />
          </div>

          <div className="mb-10">
            <h1
              className="text-[1.85rem] leading-[1.18] font-bold tracking-tight"
              style={{ color: BRAND_INK }}
            >
              {step === 0
                ? "What kind of account are you creating?"
                : step === 1
                  ? "Create your login"
                  : role === "founder"
                    ? "Shape your founder profile"
                    : "Build your developer profile"}
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "rgba(15,28,24,0.5)" }}>
              {step === 0
                ? "Evolv personalizes onboarding, permissions, and matching based on your role."
                : step === 1
                  ? "Use an email you can keep tied to your venture or professional profile."
                  : role === "founder"
                    ? "This is what developers see when they discover your project. You can skip and come back."
                    : "Complete this now to appear in founder searches and apply to blueprint-backed projects."}
            </p>
          </div>

          <AnimatePresence>
            {visibleError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                ref={errorSummaryRef}
                role="alert"
                tabIndex={-1}
                className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700 outline-none"
              >
                {visibleError}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 0 && <RoleSelectionStep role={role} onRoleChange={setRole} />}
            {step === 1 && (
              <AccountStep
                account={account}
                agreed={agreed}
                showPassword={showPassword}
                locationStatus={locationStatus}
                cityStatus={cityStatus}
                countryDropdownOptions={countryDropdownOptions}
                stateDropdownOptions={stateDropdownOptions}
                cityDropdownOptions={cityDropdownOptions}
                countryCodeOptions={countryCodeOptions}
                hasSelectedCountry={Boolean(selectedCountry)}
                onAccountFieldChange={setAccountField}
                onAccountTouched={markAccountTouched}
                onAgreedChange={setAgreed}
                onTogglePassword={() => setShowPassword((value) => !value)}
                accountErrorFor={accountErrorFor}
              />
            )}
            {step === 2 && role === "founder" && (
              <FounderProfileStep
                founder={founder}
                degreeOptions={founderDegreeOptions}
                profileCompleteness={profileCompleteness}
                onFieldChange={setFounderField}
                onDomainToggle={toggleFounderDomain}
              />
            )}
            {step === 2 && role === "developer" && (
              <DeveloperProfileStep
                developer={developer}
                degreeOptions={developerDegreeOptions}
                profileCompleteness={profileCompleteness}
                onFieldChange={setDevField}
                onSkillToggle={toggleSkill}
              />
            )}
          </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>

      {!awaitingOtp && (
      <div
        className="sticky bottom-0 z-20 px-8 sm:px-10 xl:px-14"
        style={{ background: "#f5f6f4", borderTop: "1px solid rgba(15,28,24,0.07)" }}
      >
        <div className="mx-auto w-full max-w-[560px]">
          <AnimatePresence>
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 pt-4"
              >
                <UserCircle
                  size={16}
                  weight="fill"
                  className="mt-0.5 shrink-0"
                  style={{ color: BRAND_MID }}
                />
                <p
                  className="text-[11.5px] leading-[1.55]"
                  style={{ color: "rgba(15,28,24,0.48)" }}
                >
                  {role === "founder"
                    ? "Skipped profiles can save private blueprints â€” publishing, developer outreach, and investor sharing stay locked until complete."
                    : "Skipped developer profiles can enter the dashboard, but discovery visibility and applications require completion."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step === 2 && error && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between py-4">
            {step < 2 ? (
              <button
                type="button"
                onClick={() => (step === 0 ? router.push("/") : setStep((s) => s - 1))}
                className="flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition hover:bg-black/5"
                style={{ color: "rgba(15,28,24,0.6)" }}
              >
                <ArrowLeft size={14} weight="bold" />
                {step === 0 ? "Back home" : "Back"}
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => void finish(true)}
                  disabled={isSubmitting}
                  className="h-10 rounded-xl border bg-white px-5 text-[13px] font-bold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_MID }}
                >
                  Skip for now
                </button>
              )}
              <motion.button
                whileHover={{ scale: 1.012 }}
                whileTap={{ scale: 0.988 }}
                type="button"
                onClick={step < 2 ? goNext : () => void finish(false)}
                disabled={isSubmitting}
                className="flex h-10 items-center gap-2 rounded-xl px-6 text-[13px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: BRAND_INK,
                  color: BRAND_MINT,
                  boxShadow: "0 4px 14px rgba(15,28,24,0.18)",
                }}
              >
                {step < 2 ? (isSubmitting ? "Creating account..." : "Continue") : "Complete profile"}
                {step < 2 ? (
                  <ArrowRight size={14} weight="bold" />
                ) : role === "founder" ? (
                  <RocketLaunch size={14} weight="bold" />
                ) : (
                  <Briefcase size={14} weight="bold" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      )}
    </main>
  );
}
