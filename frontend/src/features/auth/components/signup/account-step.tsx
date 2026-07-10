"use client";

import { motion } from "framer-motion";
import { Eye, EyeSlash, Lock } from "@phosphor-icons/react";
import { TextInput } from "@/features/auth/components/text-input";
import { PhoneNumberField } from "./phone-number-field";
import { ThemedSelect } from "./themed-select";
import { BRAND_MID } from "./constants";
import type {
  AccountValidationField,
  CityStatus,
  DropdownOption,
  LocationStatus,
  SignupAccount,
} from "./types";

export function AccountStep({
  account,
  agreed,
  showPassword,
  locationStatus,
  cityStatus,
  countryDropdownOptions,
  stateDropdownOptions,
  cityDropdownOptions,
  countryCodeOptions,
  hasSelectedCountry,
  onAccountFieldChange,
  onAccountTouched,
  onAgreedChange,
  onTogglePassword,
  accountErrorFor,
}: {
  account: SignupAccount;
  agreed: boolean;
  showPassword: boolean;
  locationStatus: LocationStatus;
  cityStatus: CityStatus;
  countryDropdownOptions: DropdownOption[];
  stateDropdownOptions: DropdownOption[];
  cityDropdownOptions: DropdownOption[];
  countryCodeOptions: DropdownOption[];
  hasSelectedCountry: boolean;
  onAccountFieldChange: (field: keyof SignupAccount, value: string) => void;
  onAccountTouched: (field: AccountValidationField) => void;
  onAgreedChange: (agreed: boolean) => void;
  onTogglePassword: () => void;
  accountErrorFor: (field: AccountValidationField) => string | undefined;
}) {
  return (
    <motion.div
      key="account"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="grid gap-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="First name"
          required
          value={account.firstName}
          onChange={(value) => onAccountFieldChange("firstName", value)}
          onBlur={() => onAccountTouched("firstName")}
          error={accountErrorFor("firstName")}
          placeholder="Sara"
        />
        <TextInput
          label="Last name"
          required
          value={account.lastName}
          onChange={(value) => onAccountFieldChange("lastName", value)}
          onBlur={() => onAccountTouched("lastName")}
          error={accountErrorFor("lastName")}
          placeholder="Ahmed"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Email"
          required
          type="email"
          value={account.email}
          onChange={(value) => onAccountFieldChange("email", value)}
          onBlur={() => onAccountTouched("email")}
          error={accountErrorFor("email")}
          placeholder="you@example.com"
        />
        <TextInput
          label="Confirm email"
          required
          type="email"
          value={account.confirmEmail}
          onChange={(value) => onAccountFieldChange("confirmEmail", value)}
          onBlur={() => onAccountTouched("confirmEmail")}
          error={accountErrorFor("confirmEmail")}
          placeholder="Confirm email"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <TextInput
            label="Password"
            required
            type={showPassword ? "text" : "password"}
            value={account.password}
            onChange={(value) => onAccountFieldChange("password", value)}
            onBlur={() => onAccountTouched("password")}
            error={accountErrorFor("password")}
            placeholder="Minimum 8 characters"
            right={
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-[#0f1c18]/45 hover:bg-[#f0f5f2]"
                aria-label={showPassword ? "Hide" : "Show"}
              >
                {showPassword ? <EyeSlash size={17} /> : <Eye size={17} />}
              </button>
            }
          />
          <p className="mt-1.5 text-[11.5px] leading-5 text-[#0f1c18]/45">
            Use at least 8 characters with uppercase, lowercase, and a number.
          </p>
        </div>
        <TextInput
          label="Confirm password"
          required
          type={showPassword ? "text" : "password"}
          value={account.confirmPassword}
          onChange={(value) => onAccountFieldChange("confirmPassword", value)}
          onBlur={() => onAccountTouched("confirmPassword")}
          error={accountErrorFor("confirmPassword")}
          placeholder="Confirm password"
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <div className="h-px flex-1" style={{ background: "rgba(15,28,24,0.08)" }} />
        <span
          className="text-[10.5px] font-bold tracking-widest uppercase"
          style={{ color: "rgba(15,28,24,0.35)" }}
        >
          Identity & contact
        </span>
        <div className="h-px flex-1" style={{ background: "rgba(15,28,24,0.08)" }} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ThemedSelect
          label="Country"
          required
          value={account.country}
          onChange={(value) => onAccountFieldChange("country", value)}
          onBlur={() => onAccountTouched("country")}
          error={accountErrorFor("country")}
          placeholder={locationStatus === "loading" ? "Loading countries..." : "Select country"}
          options={countryDropdownOptions}
          loading={locationStatus === "loading"}
          disabled={locationStatus === "loading"}
        />
        <ThemedSelect
          label="State / Province"
          required
          value={account.stateProvince}
          onChange={(value) => onAccountFieldChange("stateProvince", value)}
          onBlur={() => onAccountTouched("stateProvince")}
          error={accountErrorFor("stateProvince")}
          placeholder={account.country ? "Select state / province" : "Choose country first"}
          options={stateDropdownOptions}
          disabled={!account.country || !hasSelectedCountry}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ThemedSelect
          label="City"
          required
          value={account.city}
          onChange={(value) => onAccountFieldChange("city", value)}
          onBlur={() => onAccountTouched("city")}
          error={accountErrorFor("city")}
          placeholder={
            account.stateProvince
              ? cityStatus === "loading"
                ? "Loading cities..."
                : "Select city"
              : "Choose state first"
          }
          options={cityDropdownOptions}
          loading={cityStatus === "loading"}
          disabled={!account.stateProvince || cityStatus === "loading"}
        />
        <PhoneNumberField
          countryCode={account.countryCode}
          phone={account.phone}
          codeOptions={countryCodeOptions}
          onCountryCodeChange={(value) => onAccountFieldChange("countryCode", value)}
          onPhoneChange={(value) => onAccountFieldChange("phone", value)}
          onBlur={() => {
            onAccountTouched("countryCode");
            onAccountTouched("phone");
          }}
          codeError={accountErrorFor("countryCode")}
          phoneError={accountErrorFor("phone")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Date of birth"
          required
          type="date"
          value={account.dob}
          onChange={(value) => onAccountFieldChange("dob", value)}
          onBlur={() => onAccountTouched("dob")}
          error={accountErrorFor("dob")}
        />
      </div>

      <div
        className="flex items-start gap-2.5 rounded-lg px-3.5 py-3"
        style={{
          background: "rgba(15,28,24,0.035)",
          border: "1px solid rgba(15,28,24,0.07)",
        }}
      >
        <Lock size={13} weight="fill" className="mt-0.5 shrink-0" style={{ color: BRAND_MID }} />
        <p className="text-[11.5px] leading-[1.6]" style={{ color: "rgba(15,28,24,0.52)" }}>
          Phone and date of birth are stored securely and never shown on your public profile.
        </p>
      </div>

      <label
        className="flex cursor-pointer items-start gap-3 text-[12px] leading-5"
        style={{ color: accountErrorFor("terms") ? "#b91c1c" : "rgba(15,28,24,0.58)" }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => {
            onAgreedChange(event.target.checked);
            onAccountTouched("terms");
          }}
          className={`mt-0.5 h-4 w-4 rounded border-[#0f1c18]/20 accent-[#1a312c] ${accountErrorFor("terms") ? "ring-2 ring-red-300" : ""}`}
        />
        <span>
          <span className="mr-1 align-super text-[10px] text-red-500">*</span>I agree to the{" "}
          <a href="#" className="font-bold text-[#428475]">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="font-bold text-[#428475]">
            Privacy Policy
          </a>
          . I confirm my account information is accurate.
        </span>
      </label>
      {accountErrorFor("terms") && (
        <p className="-mt-3 text-[11.5px] font-medium text-red-600">{accountErrorFor("terms")}</p>
      )}
    </motion.div>
  );
}
