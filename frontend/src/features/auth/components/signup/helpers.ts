// Validation + location helpers for the sign-up wizard, extracted from SignUpForm.tsx.
import {
  ACCOUNT_FIELD_LABELS,
  COUNTRY_CITIES_URL,
  NO_REGION,
  REQUIRED_ACCOUNT_FIELDS,
  STATE_CITIES_URL,
} from "./constants";
import { getPasswordStrengthError } from "@/features/auth/lib/validation";
import type {
  AccountErrors,
  AccountField,
  AccountValidationField,
  CitiesResponse,
  CountriesStatesResponse,
  CountryCodesResponse,
  CountryLocation,
} from "./types";

export function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function formatFieldList(labels: string[]) {
  if (labels.length <= 1) return labels[0] ?? "";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

export async function readJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export function findCountry(countries: CountryLocation[], country: string) {
  return countries.find((option) => normalize(option.name) === normalize(country));
}

export function buildCountries(
  statesResponse: CountriesStatesResponse,
  codesResponse: CountryCodesResponse
): CountryLocation[] {
  const codesByName = new Map<string, string>();
  const codesByIso = new Map<string, string>();

  (codesResponse.data ?? []).forEach((country) => {
    const dialCode = country.dial_code?.trim();
    if (!dialCode) return;
    if (country.name) codesByName.set(normalize(country.name), dialCode);
    if (country.code) codesByIso.set(country.code.trim().toUpperCase(), dialCode);
  });

  return (statesResponse.data ?? [])
    .map((country) => {
      const name = country.name?.trim() ?? "";
      const iso2 = country.iso2?.trim().toUpperCase() ?? "";
      const states = Array.from(
        new Set(
          (country.states ?? []).map((state) => state.name?.trim()).filter(Boolean) as string[]
        )
      ).sort((a, b) => a.localeCompare(b));

      return {
        name,
        iso2,
        dialCode: codesByIso.get(iso2) ?? codesByName.get(normalize(name)) ?? "",
        states: states.length ? states : [NO_REGION],
      };
    })
    .filter((country) => country.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchCities(country: string, stateProvince: string) {
  const stateIsApplicable = stateProvince !== NO_REGION;
  const payload = stateIsApplicable ? { country, state: stateProvince } : { country };
  const endpoint = stateIsApplicable ? STATE_CITIES_URL : COUNTRY_CITIES_URL;
  const json = await readJson<CitiesResponse>(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (json.error) throw new Error("Cities API returned an error.");
  return Array.from(new Set((json.data ?? []).map((city) => city.trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b)
  );
}

export function getAccountErrors(
  account: Record<AccountField, string>,
  agreed: boolean
): AccountErrors {
  const errors: AccountErrors = {};
  const trimmed = Object.fromEntries(
    Object.entries(account).map(([key, value]) => [key, value.trim()])
  ) as Record<AccountField, string>;

  if (!trimmed.firstName) errors.firstName = "First name is required.";
  if (!trimmed.lastName) errors.lastName = "Last name is required.";
  if (!trimmed.email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email))
    errors.email = "Enter a valid email address.";
  if (!trimmed.confirmEmail) errors.confirmEmail = "Confirm email is required.";
  else if (trimmed.email && trimmed.email.toLowerCase() !== trimmed.confirmEmail.toLowerCase())
    errors.confirmEmail = "Confirm email must match email.";
  if (!trimmed.password) errors.password = "Password is required.";
  else {
    const strengthError = getPasswordStrengthError(trimmed.password);
    if (strengthError) errors.password = strengthError;
  }
  if (!trimmed.confirmPassword) errors.confirmPassword = "Confirm password is required.";
  else if (trimmed.password && trimmed.password !== trimmed.confirmPassword)
    errors.confirmPassword = "Confirm password must match password.";
  if (!trimmed.country) errors.country = "Country is required.";
  if (!trimmed.countryCode) errors.countryCode = "Country code is required.";
  else if (!/^\+\d{1,4}$/.test(trimmed.countryCode))
    errors.countryCode = "Use a valid code like +92.";
  if (!trimmed.stateProvince) errors.stateProvince = "State / province is required.";
  if (!trimmed.city) errors.city = "City is required.";
  if (!trimmed.phone) errors.phone = "Phone number is required.";
  else if (!/^\+?[\d\s()-]{7,22}$/.test(trimmed.phone))
    errors.phone = "Enter a valid phone number.";
  if (!trimmed.dob) errors.dob = "Date of birth is required.";
  else {
    const dob = new Date(`${trimmed.dob}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(dob.getTime())) errors.dob = "Enter a valid date of birth.";
    else if (dob > today) errors.dob = "Date of birth cannot be in the future.";
  }
  if (!agreed) errors.terms = "Accept the Terms and Privacy Policy to continue.";

  return errors;
}

export function buildAccountErrorSummary(errors: AccountErrors) {
  const fields = Object.keys(errors) as AccountValidationField[];
  if (!fields.length) return "";

  const missing = fields.filter(
    (field) =>
      REQUIRED_ACCOUNT_FIELDS.has(field) &&
      (errors[field]?.includes("required") || field === "terms")
  );
  const invalid = fields.filter((field) => !missing.includes(field));
  const messages = [];

  if (missing.length)
    messages.push(
      `complete ${formatFieldList(missing.map((field) => ACCOUNT_FIELD_LABELS[field]))}`
    );
  if (invalid.length)
    messages.push(`fix ${formatFieldList(invalid.map((field) => ACCOUNT_FIELD_LABELS[field]))}`);

  return `Please ${messages.join(" and ")} before continuing.`;
}
