"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Briefcase, CaretDown, CheckCircle, Code, Eye, EyeSlash,
  Lightbulb, Lock, RocketLaunch, UserCircle,
} from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { TextInput } from "./TextInput";
import { TextArea } from "./TextArea";
import { ChoiceGrid } from "./ChoiceGrid";
import { DomainSearch } from "./DomainSearch";
import { SignupProgress } from "./SignupProgress";

const BRAND_DARK = "#1a312c";
const BRAND_INK  = "#0f1c18";
const BRAND_MID  = "#428475";
const BRAND_MINT = "#89d7b7";

type Role = "founder" | "developer";

const SKILLS = ["React", "Next.js", "Node.js", "Python", "FastAPI", "AI/ML", "PostgreSQL", "AWS", "Docker", "Solidity"];
const PRIMARY_GOALS = [
  "Turn my idea into a structured startup blueprint",
  "Find and hire developers to build my product",
  "Get my startup in front of investors",
  "Test and validate my startup concept",
];
const WORK_TYPES = ["Remote", "Hybrid", "Onsite"];
const EDUCATION_LEVELS = [
  "Student",
  "Intermediate / Higher Secondary",
  "Diploma",
  "Undergraduate",
  "Bachelor's",
  "Master's",
  "MBA",
  "MPhil",
  "PhD / Doctorate",
  "Professional Certification",
  "Self-taught / Bootcamp",
  "Prefer not to say",
  "Other",
];
const DEGREE_OPTIONS_BY_LEVEL: Record<string, string[]> = {
  "Student": ["Currently studying", "No formal degree yet", "Other"],
  "Intermediate / Higher Secondary": [
    "High School / Secondary School",
    "Intermediate / FSc",
    "Intermediate / FA",
    "A-Levels",
    "GED / Equivalent",
    "Other",
  ],
  "Diploma": [
    "Diploma in Business",
    "Diploma in Computer Science",
    "Diploma in Information Technology",
    "Diploma in Engineering",
    "Diploma in Design",
    "Associate Degree",
    "Other",
  ],
  "Undergraduate": [
    "Undergraduate - Business",
    "Undergraduate - Computer Science",
    "Undergraduate - Engineering",
    "Undergraduate - Arts",
    "Undergraduate - Medicine",
    "Undergraduate - Law",
    "Other",
  ],
  "Bachelor's": [
    "BA",
    "BSc",
    "BBA",
    "BCom",
    "BS Computer Science",
    "BS Software Engineering",
    "BS Information Technology",
    "BS Data Science",
    "BS Artificial Intelligence",
    "BS Cybersecurity",
    "BS Electrical Engineering",
    "BS Mechanical Engineering",
    "BS Civil Engineering",
    "BS Biomedical Engineering",
    "BEng / BE",
    "BTech",
    "BArch",
    "BFA",
    "LLB",
    "MBBS",
    "BDS",
    "Pharm-D",
    "BEd",
    "Other",
  ],
  "Master's": [
    "MA",
    "MSc",
    "MCom",
    "MEd",
    "MS Computer Science",
    "MS Software Engineering",
    "MS Data Science",
    "MS Artificial Intelligence",
    "MS Cybersecurity",
    "MS Electrical Engineering",
    "MS Mechanical Engineering",
    "MEng / ME",
    "MPH",
    "LLM",
    "Other",
  ],
  "MBA": ["MBA", "Executive MBA", "MBA Finance", "MBA Marketing", "MBA Entrepreneurship", "MBA Technology Management", "Other"],
  "MPhil": ["MPhil", "MPhil Computer Science", "MPhil Business", "MPhil Economics", "MPhil Education", "MPhil Psychology", "Other"],
  "PhD / Doctorate": ["PhD", "DBA", "EdD", "MD", "Doctorate in Engineering", "Doctorate in Computer Science", "Other"],
  "Professional Certification": ["CA", "ACCA", "CFA", "CPA", "PMP", "AWS Certification", "Google Certification", "Microsoft Certification", "Other"],
  "Self-taught / Bootcamp": ["Self-taught", "Coding Bootcamp", "Design Bootcamp", "Founder Fellowship", "Online Certification", "Other"],
  "Prefer not to say": ["Prefer not to say"],
  "Other": ["Other"],
};

const DEFAULT_DEGREE_OPTIONS = ["Select education level first"];

const COUNTRIES_STATES_URL = "https://countriesnow.space/api/v0.1/countries/states";
const COUNTRY_CODES_URL = "https://countriesnow.space/api/v0.1/countries/codes";
const STATE_CITIES_URL = "https://countriesnow.space/api/v0.1/countries/state/cities";
const COUNTRY_CITIES_URL = "https://countriesnow.space/api/v0.1/countries/cities";
const NO_REGION = "Not applicable";

type AccountField =
  | "firstName"
  | "lastName"
  | "email"
  | "confirmEmail"
  | "password"
  | "confirmPassword"
  | "country"
  | "countryCode"
  | "stateProvince"
  | "city"
  | "phone"
  | "dob"
  | "idNumber";
type AccountValidationField = AccountField | "terms";
type AccountErrors = Partial<Record<AccountValidationField, string>>;
type StoredSignupUser = {
  email?: string;
  [key: string]: unknown;
};
type LocationStatus = "loading" | "ready" | "error";
type CityStatus = "idle" | "loading" | "ready" | "error";
type CountryLocation = {
  name: string;
  iso2: string;
  dialCode: string;
  states: string[];
};
type DropdownOption = {
  value: string;
  label?: string;
  meta?: string;
};
type CountriesStatesResponse = {
  error?: boolean;
  data?: Array<{
    name?: string;
    iso2?: string;
    states?: Array<{ name?: string }>;
  }>;
};
type CountryCodesResponse = {
  error?: boolean;
  data?: Array<{
    name?: string;
    code?: string;
    dial_code?: string;
  }>;
};
type CitiesResponse = {
  error?: boolean;
  data?: string[];
};

const ACCOUNT_FIELD_LABELS: Record<AccountValidationField, string> = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  confirmEmail: "Confirm email",
  password: "Password",
  confirmPassword: "Confirm password",
  country: "Country",
  countryCode: "Country code",
  stateProvince: "State / Province",
  city: "City",
  phone: "Phone number",
  dob: "Date of birth",
  idNumber: "National ID / CNIC",
  terms: "Terms and Privacy Policy agreement",
};

const REQUIRED_ACCOUNT_FIELDS = new Set<AccountValidationField>([
  "firstName",
  "lastName",
  "email",
  "confirmEmail",
  "password",
  "confirmPassword",
  "country",
  "countryCode",
  "stateProvince",
  "city",
  "phone",
  "dob",
  "idNumber",
  "terms",
]);

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function formatFieldList(labels: string[]) {
  if (labels.length <= 1) return labels[0] ?? "";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

async function readJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

function findCountry(countries: CountryLocation[], country: string) {
  return countries.find((option) => normalize(option.name) === normalize(country));
}

function buildCountries(statesResponse: CountriesStatesResponse, codesResponse: CountryCodesResponse): CountryLocation[] {
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
        new Set((country.states ?? []).map((state) => state.name?.trim()).filter(Boolean) as string[])
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

async function fetchCities(country: string, stateProvince: string) {
  const stateIsApplicable = stateProvince !== NO_REGION;
  const payload = stateIsApplicable ? { country, state: stateProvince } : { country };
  const endpoint = stateIsApplicable ? STATE_CITIES_URL : COUNTRY_CITIES_URL;
  const json = await readJson<CitiesResponse>(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (json.error) throw new Error("Cities API returned an error.");
  return Array.from(new Set((json.data ?? []).map((city) => city.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function getAccountErrors(account: Record<AccountField, string>, agreed: boolean): AccountErrors {
  const errors: AccountErrors = {};
  const trimmed = Object.fromEntries(
    Object.entries(account).map(([key, value]) => [key, value.trim()])
  ) as Record<AccountField, string>;

  if (!trimmed.firstName) errors.firstName = "First name is required.";
  if (!trimmed.lastName) errors.lastName = "Last name is required.";
  if (!trimmed.email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email)) errors.email = "Enter a valid email address.";
  if (!trimmed.confirmEmail) errors.confirmEmail = "Confirm email is required.";
  else if (trimmed.email && trimmed.email.toLowerCase() !== trimmed.confirmEmail.toLowerCase()) errors.confirmEmail = "Confirm email must match email.";
  if (!trimmed.password) errors.password = "Password is required.";
  else if (trimmed.password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (!trimmed.confirmPassword) errors.confirmPassword = "Confirm password is required.";
  else if (trimmed.password && trimmed.password !== trimmed.confirmPassword) errors.confirmPassword = "Confirm password must match password.";
  if (!trimmed.country) errors.country = "Country is required.";
  if (!trimmed.countryCode) errors.countryCode = "Country code is required.";
  else if (!/^\+\d{1,4}$/.test(trimmed.countryCode)) errors.countryCode = "Use a valid code like +92.";
  if (!trimmed.stateProvince) errors.stateProvince = "State / province is required.";
  if (!trimmed.city) errors.city = "City is required.";
  if (!trimmed.phone) errors.phone = "Phone number is required.";
  else if (!/^\+?[\d\s()-]{7,22}$/.test(trimmed.phone)) errors.phone = "Enter a valid phone number.";
  if (!trimmed.dob) errors.dob = "Date of birth is required.";
  else {
    const dob = new Date(`${trimmed.dob}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(dob.getTime())) errors.dob = "Enter a valid date of birth.";
    else if (dob > today) errors.dob = "Date of birth cannot be in the future.";
  }
  if (!trimmed.idNumber) errors.idNumber = "National ID / CNIC is required.";
  if (!agreed) errors.terms = "Accept the Terms and Privacy Policy to continue.";

  return errors;
}

function buildAccountErrorSummary(errors: AccountErrors) {
  const fields = Object.keys(errors) as AccountValidationField[];
  if (!fields.length) return "";

  const missing = fields.filter((field) => REQUIRED_ACCOUNT_FIELDS.has(field) && (errors[field]?.includes("required") || field === "terms"));
  const invalid = fields.filter((field) => !missing.includes(field));
  const messages = [];

  if (missing.length) messages.push(`complete ${formatFieldList(missing.map((field) => ACCOUNT_FIELD_LABELS[field]))}`);
  if (invalid.length) messages.push(`fix ${formatFieldList(invalid.map((field) => ACCOUNT_FIELD_LABELS[field]))}`);

  return `Please ${messages.join(" and ")} before continuing.`;
}

function RequiredLabel({ label, required = false }: { label: string; required?: boolean }) {
  return (
    <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>
      {label}
      {required && <span className="ml-1 align-super text-[10px] text-red-500">*</span>}
    </span>
  );
}

function ThemedSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  onBlur,
  disabled = false,
  loading = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  error?: string;
  onBlur?: () => void;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const displayValue = value || placeholder;
  const queryText = normalize(query);
  const filteredOptions = useMemo(() => {
    if (!queryText) return options;
    return options.filter((option) =>
      normalize(`${option.label ?? option.value} ${option.meta ?? ""}`).includes(queryText)
    );
  }, [options, queryText]);
  const visibleOptions = filteredOptions.slice(0, 85);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
      setQuery("");
      onBlur?.();
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [onBlur, open]);

  return (
    <div ref={rootRef} className="relative">
      <RequiredLabel label={label} required={required} />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        className="flex h-11 w-full items-center justify-between space-around rounded-lg border bg-white px-3.5  text-left text-[14px] outline-none transition focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20 disabled:cursor-not-allowed disabled:bg-[#f5f7f5] disabled:text-[#0f1c18]/35"
      
        style={{paddingRight:"1rem", borderColor: error ? "#dc2626" : "rgba(15,28,24,0.12)", color: value ? BRAND_INK : "rgba(15,28,24,0.38)" }}
      >
        <span className="truncate pl-6">{loading ? "Loading..." : displayValue}</span>
        <CaretDown size={15} weight="bold" className={`ml-3 shrink-0 transition ${open ? "rotate-180" : ""}`} style={{ color: "rgba(15,28,24,0.45)" }} />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-lg border bg-white shadow-[0_18px_42px_rgba(15,28,24,0.16)]" style={{ borderColor: "rgba(15,28,24,0.12)" }}>
          <div className="border-b px-3 py-2" style={{ borderColor: "rgba(15,28,24,0.08)" }}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              className="h-9 w-full rounded-md border bg-[#f7faf8] px-3 text-[13px] outline-none placeholder:text-[#0f1c18]/35 focus:border-[#428475]"
              style={{ borderColor: "rgba(15,28,24,0.09)", color: BRAND_INK }}
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1.5">
            {loading && <div className="px-3 py-3 text-[12px] font-medium text-[#428475]">Loading options...</div>}
            {!loading && visibleOptions.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={`${option.value}-${option.meta ?? ""}`}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setQuery("");
                    onBlur?.();
                  }}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-[13px] transition hover:bg-[#eef7f2]"
                  style={{ background: active ? "#f0f8f3" : "#fff", color: BRAND_INK }}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{option.label ?? option.value}</span>
                    {option.meta && <span className="mt-0.5 block truncate text-[11px]" style={{ color: "rgba(15,28,24,0.48)" }}>{option.meta}</span>}
                  </span>
                  {active && <CheckCircle size={16} weight="fill" className="ml-3 shrink-0" style={{ color: BRAND_MID }} />}
                </button>
              );
            })}
            {!loading && !visibleOptions.length && (
              <div className="px-3 py-3 text-[12px] font-medium" style={{ color: "rgba(15,28,24,0.48)" }}>No matching option found.</div>
            )}
            {!loading && filteredOptions.length > visibleOptions.length && (
              <div className="px-3 py-2 text-[11px] font-medium" style={{ color: "rgba(15,28,24,0.42)" }}>Keep typing to narrow the list.</div>
            )}
          </div>
        </div>
      )}

      {error && <span className="mt-1.5 block text-[11.5px] font-medium text-red-600">{error}</span>}
    </div>
  );
}

function StaticSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <RequiredLabel label={label} />
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-11 w-full appearance-none rounded-lg border bg-white px-4 pr-10 text-[14px] outline-none transition focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20 disabled:cursor-not-allowed disabled:bg-[#f5f7f5] disabled:text-[#0f1c18]/35"
          style={{ borderColor: "rgba(15,28,24,0.12)", color: value ? BRAND_INK : "rgba(15,28,24,0.38)" }}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <CaretDown size={15} weight="bold" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(15,28,24,0.45)" }} />
      </span>
    </label>
  );
}

function PhoneNumberField({
  countryCode,
  phone,
  codeOptions,
  onCountryCodeChange,
  onPhoneChange,
  onBlur,
  codeError,
  phoneError,
}: {
  countryCode: string;
  phone: string;
  codeOptions: DropdownOption[];
  onCountryCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onBlur: () => void;
  codeError?: string;
  phoneError?: string;
}) {
  const [codeOpen, setCodeOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const error = codeError ?? phoneError;
  const filteredCodes = useMemo(() => {
    const queryText = normalize(query);
    if (!queryText) return codeOptions;
    return codeOptions.filter((option) => normalize(`${option.value} ${option.label ?? ""} ${option.meta ?? ""}`).includes(queryText));
  }, [codeOptions, query]);
  const visibleCodes = filteredCodes.slice(0, 85);

  useEffect(() => {
    if (!codeOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setCodeOpen(false);
      setQuery("");
      onBlur();
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [codeOpen, onBlur]);

  return (
    <div ref={rootRef} className="relative">
      <RequiredLabel label="Phone number" required />
      <div
        className="flex h-11 w-full overflow-hidden rounded-lg border bg-white transition focus-within:border-[#428475] focus-within:ring-4 focus-within:ring-[#89d7b7]/20"
        style={{ borderColor: error ? "#dc2626" : "rgba(15,28,24,0.12)" }}
      >
        <button
          type="button"
          onClick={() => setCodeOpen((current) => !current)}
          className="flex h-full min-w-[92px] items-center justify-between gap-2 border-r bg-[#f7faf8] px-3 text-[13px] font-bold outline-none"
          style={{ borderColor: "rgba(15,28,24,0.09)", color: BRAND_MID }}
          aria-label="Select country code"
        >
          <span>{countryCode || "+Code"}</span>
          <CaretDown size={13} weight="bold" className={`transition ${codeOpen ? "rotate-180" : ""}`} />
        </button>
        <input
          type="tel"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          onBlur={onBlur}
          placeholder="300 0000000"
          aria-invalid={error ? true : undefined}
          className="min-w-0 flex-1 px-3.5 pl-6 text-[14px] outline-none placeholder:text-[#0f1c18]/35"
          style={{ color: BRAND_INK }}
        />
      </div>

      {codeOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-lg border bg-white shadow-[0_18px_42px_rgba(15,28,24,0.16)]" style={{ borderColor: "rgba(15,28,24,0.12)" }}>
          <div className="border-b px-3 py-2" style={{ borderColor: "rgba(15,28,24,0.08)" }}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search code or country"
              className="h-9 w-full rounded-md border bg-[#f7faf8] px-3 text-[13px] outline-none placeholder:text-[#0f1c18]/35 focus:border-[#428475]"
              style={{ borderColor: "rgba(15,28,24,0.09)", color: BRAND_INK }}
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1.5">
            {visibleCodes.map((option) => {
              const active = option.value === countryCode;
              return (
                <button
                  key={`${option.value}-${option.label ?? ""}`}
                  type="button"
                  onClick={() => {
                    onCountryCodeChange(option.value);
                    setCodeOpen(false);
                    setQuery("");
                    onBlur();
                  }}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-[13px] transition hover:bg-[#eef7f2]"
                  style={{ background: active ? "#f0f8f3" : "#fff", color: BRAND_INK }}
                >
                  <span className="min-w-0">
                    <span className="block font-bold">{option.value}</span>
                    <span className="mt-0.5 block truncate text-[11px]" style={{ color: "rgba(15,28,24,0.48)" }}>{option.label}</span>
                  </span>
                  {active && <CheckCircle size={16} weight="fill" className="ml-3 shrink-0" style={{ color: BRAND_MID }} />}
                </button>
              );
            })}
            {!visibleCodes.length && (
              <div className="px-3 py-3 text-[12px] font-medium" style={{ color: "rgba(15,28,24,0.48)" }}>No matching code found.</div>
            )}
          </div>
        </div>
      )}

      {error && <span className="mt-1.5 block text-[11.5px] font-medium text-red-600">{error}</span>}
    </div>
  );
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
  const [accountTouched, setAccountTouched] = useState<Partial<Record<AccountValidationField, boolean>>>({});
  const [accountSubmitted, setAccountSubmitted] = useState(false);
  const [countryOptions, setCountryOptions] = useState<CountryLocation[]>([]);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("loading");
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [cityStatus, setCityStatus] = useState<CityStatus>("idle");

  const [account, setAccount] = useState({
    firstName: "", lastName: "", email: "", confirmEmail: "",
    password: "", confirmPassword: "",
    country: "", countryCode: "", stateProvince: "", city: "",
    phone: "", dob: "", idNumber: "",
  });

  const [founder, setFounder] = useState({
    headline: "", bio: "", domains: [] as string[], primaryGoal: "",
    educationLevel: "", degreeName: "", customDegreeName: "", linkedin: "",
  });

  const [developer, setDeveloper] = useState({
    jobTitle: "", experience: "", location: "", skills: [] as string[],
    workType: "Remote", bio: "", github: "", linkedIn: "",
  });

  const profileCompleteness = useMemo(() => {
    if (role === "founder") {
      const degreeValue = founder.degreeName === "Other" ? founder.customDegreeName : founder.degreeName;
      const filled = [founder.headline, founder.bio, founder.educationLevel, degreeValue, founder.primaryGoal, founder.linkedin].filter(Boolean).length
        + (founder.domains.length ? 1 : 0);
      return Math.round((filled / 7) * 100);
    }
    if (role === "developer") {
      const filled = [developer.jobTitle, developer.experience, developer.location, developer.bio].filter(Boolean).length
        + (developer.skills.length ? 1 : 0);
      return Math.round((filled / 5) * 100);
    }
    return 0;
  }, [developer, founder, role]);

  const accountErrors = useMemo(() => getAccountErrors(account, agreed), [account, agreed]);
  const accountErrorSummary = useMemo(() => buildAccountErrorSummary(accountErrors), [accountErrors]);
  const visibleError = step === 1 && accountSubmitted && accountErrorSummary ? accountErrorSummary : error;
  const selectedCountry = useMemo(() => findCountry(countryOptions, account.country), [account.country, countryOptions]);
  const countryDropdownOptions = useMemo<DropdownOption[]>(
    () => countryOptions.map((country) => ({ value: country.name, meta: country.dialCode || "Code unavailable" })),
    [countryOptions]
  );
  const stateDropdownOptions = useMemo<DropdownOption[]>(
    () => (selectedCountry?.states ?? []).map((state) => ({ value: state })),
    [selectedCountry]
  );
  const cityDropdownOptions = useMemo<DropdownOption[]>(
    () => cityOptions.map((city) => ({ value: city })),
    [cityOptions]
  );
  const countryCodeOptions = useMemo<DropdownOption[]>(
    () => countryOptions
      .filter((country) => country.dialCode)
      .map((country) => ({ value: country.dialCode, label: country.name }))
      .sort((a, b) => a.label!.localeCompare(b.label!)),
    [countryOptions]
  );
  const founderDegreeOptions = useMemo(
    () => founder.educationLevel ? DEGREE_OPTIONS_BY_LEVEL[founder.educationLevel] ?? ["Other"] : DEFAULT_DEGREE_OPTIONS,
    [founder.educationLevel]
  );

  useEffect(() => {
    let active = true;

    async function loadCountries() {
      try {
        const [statesResponse, codesResponse] = await Promise.all([
          readJson<CountriesStatesResponse>(COUNTRIES_STATES_URL),
          readJson<CountryCodesResponse>(COUNTRY_CODES_URL),
        ]);
        if (!active) return;
        const nextCountries = buildCountries(statesResponse, codesResponse);
        if (!nextCountries.length) throw new Error("No country data returned.");
        setCountryOptions(nextCountries);
        setLocationStatus("ready");
      } catch {
        if (!active) return;
        setCountryOptions([]);
        setLocationStatus("error");
      }
    }

    loadCountries();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    if (!account.country || !account.stateProvince) {
      Promise.resolve().then(() => {
        if (!active) return;
        setCityOptions([]);
        setCityStatus("idle");
      });
      return () => { active = false; };
    }

    Promise.resolve().then(async () => {
      try {
        setCityStatus("loading");
        const nextCities = await fetchCities(account.country, account.stateProvince);
        if (!active) return;
        setCityOptions(nextCities.length ? nextCities : [NO_REGION]);
        setCityStatus("ready");
      } catch {
        if (!active) return;
        setCityOptions([]);
        setCityStatus("error");
      }
    });

    return () => { active = false; };
  }, [account.country, account.stateProvince]);

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
  const setFounderField = (k: Exclude<keyof typeof founder, "domains">, v: string) => setFounder((c) => ({ ...c, [k]: v }));
  const setDevField = (k: Exclude<keyof typeof developer, "skills">, v: string) => setDeveloper((c) => ({ ...c, [k]: v }));

  const toggleFounderDomain = (d: string) =>
    setFounder((c) => ({ ...c, domains: c.domains.includes(d) ? c.domains.filter((x) => x !== d) : [...c.domains, d] }));
  const toggleSkill = (s: string) =>
    setDeveloper((c) => ({ ...c, skills: c.skills.includes(s) ? c.skills.filter((x) => x !== s) : [...c.skills, s] }));

  const validateRole = () => {
    if (!role) { setError("Choose whether you are joining as a founder or developer."); scrollToErrorSummary(); return false; }
    setError(""); return true;
  };

  const validateAccount = () => {
    const nextErrors = getAccountErrors(account, agreed);
    const fields = Object.keys(nextErrors) as AccountValidationField[];
    setAccountSubmitted(true);
    if (fields.length) {
      setAccountTouched((current) => fields.reduce(
        (next, field) => ({ ...next, [field]: true }),
        current
      ));
      setError(buildAccountErrorSummary(nextErrors));
      scrollToErrorSummary();
      return false;
    }
    setError("");
    setAccountSubmitted(false);
    return true;
  };

  const persistAccount = (profileComplete: boolean) => {
    const fullPhone = `${account.countryCode} ${account.phone}`.trim();
    const accountLocation = {
      phone: fullPhone,
      phoneLocal: account.phone,
      country: account.country,
      countryCode: account.countryCode,
      stateProvince: account.stateProvince,
      city: account.city,
      dob: account.dob,
      idNumber: account.idNumber,
    };
    const base = { firstName: account.firstName, lastName: account.lastName, email: account.email, password: account.password, role, ...accountLocation };
    const founderDegreeName = founder.degreeName === "Other" ? founder.customDegreeName : founder.degreeName;
    const founderEducation = [founder.educationLevel, founderDegreeName].filter(Boolean).join(" - ");
    const profile = role === "founder"
      ? { firstName: account.firstName, lastName: account.lastName, email: account.email, ...accountLocation, headline: founder.headline, bio: founder.bio, domains: founder.domains, primaryGoal: founder.primaryGoal, education: founderEducation, educationLevel: founder.educationLevel, degreeName: founderDegreeName, degreeSelection: founder.degreeName, customDegreeName: founder.customDegreeName, location: account.city, linkedin: founder.linkedin, profileComplete }
      : { firstName: account.firstName, lastName: account.lastName, email: account.email, ...accountLocation, jobTitle: developer.jobTitle, role: developer.jobTitle, location: developer.location, experience: developer.experience, bio: developer.bio, techStack: developer.skills, workType: developer.workType, github: developer.github, linkedin: developer.linkedIn, availability: true, profileComplete, firstTime: !profileComplete };

    const users = JSON.parse(localStorage.getItem("evolv_users") ?? "[]") as StoredSignupUser[];
    const filtered = users.filter((user) => user.email?.toLowerCase() !== account.email.toLowerCase());
    localStorage.setItem("evolv_users", JSON.stringify([...filtered, { ...base, profile }]));
    if (role === "founder") {
      localStorage.setItem("evolv_founder_profile", JSON.stringify(profile));
      router.push(profileComplete ? "/founder-dashboard" : "/founder-dashboard?setup=true");
    } else {
      localStorage.setItem("evolv_user", JSON.stringify(profile));
      router.push("/developer-dashboard");
    }
    return true;
  };

  const finish = (skip = false) => {
    setError("");
    if (!role) return;
    if (role === "founder") {
      try { persistAccount(!skip); } catch { setError("Something went wrong while creating your account."); }
      return;
    }
    const complete = Boolean(developer.jobTitle && developer.experience && developer.location && developer.bio && developer.skills.length);
    if (!skip && !complete) {
      setError("Add a role, experience, location, bio, and at least one skill.");
      return;
    }
    try { persistAccount(!skip && complete); } catch { setError("Something went wrong while creating your account."); }
  };

  const goNext = () => {
    if (step === 0 && validateRole()) setStep(1);
    if (step === 1 && validateAccount()) setStep(2);
  };

  return (
    <main ref={scrollRef} className="relative flex h-screen flex-1 flex-col overflow-y-auto lg:w-[56%] xl:w-[58%] lg:flex-none">
      <div className="flex shrink-0 items-center justify-between px-8 sm:px-10 xl:px-14" style={{ paddingTop: "52px" }}>
        <Logo />
        <p className="hidden sm:block text-[14px] font-medium" style={{ color: "rgba(15,28,24,0.5)" }}>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-bold underline underline-offset-2 transition-colors hover:opacity-80" style={{ color: BRAND_MID }}>Log in</Link>
        </p>
        <Link href="/sign-in" className="text-[13.5px] font-bold sm:hidden transition-colors hover:opacity-80" style={{ color: BRAND_MID }}>Log in</Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`flex flex-col px-8 sm:px-10 xl:px-14 ${step === 2 ? "pt-10 pb-52" : "flex-1 justify-center"}`}
      >
        <div className="w-full max-w-[560px] mx-auto">
          <div className="mb-8"><SignupProgress step={step} role={role} /></div>

          <div className="mb-10">
            <h1 className="text-[1.85rem] font-bold tracking-tight leading-[1.18]" style={{ color: BRAND_INK }}>
              {step === 0 ? "What kind of account are you creating?"
                : step === 1 ? "Create your login"
                : role === "founder" ? "Shape your founder profile"
                : "Build your developer profile"}
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "rgba(15,28,24,0.5)" }}>
              {step === 0 ? "Evolv personalizes onboarding, permissions, and matching based on your role."
                : step === 1 ? "Use an email you can keep tied to your venture or professional profile."
                : role === "founder" ? "This is what developers see when they discover your project. You can skip and come back."
                : "Complete this now to appear in founder searches and apply to blueprint-backed projects."}
            </p>
          </div>

          <AnimatePresence>
            {visibleError && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                ref={errorSummaryRef}
                role="alert"
                tabIndex={-1}
                className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700 outline-none">
                {visibleError}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="role" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-6 md:grid-cols-2">
                {[
                  { id: "founder" as const, title: "Founder", icon: Lightbulb, desc: "I want to turn an idea into a blueprint, find builders, and publish once ready.", meta: "Blueprints, profile gating, developer matching" },
                  { id: "developer" as const, title: "Developer", icon: Code, desc: "I want founders to discover me and apply to scoped startup opportunities.", meta: "Skills, portfolio signal, applications" },
                ].map(({ id, title, icon: Icon, desc, meta }) => {
                  const active = role === id;
                  return (
                    <button key={id} type="button" onClick={() => setRole(id)}
                      className="rounded-[8px] border bg-white p-5 text-left transition hover:-translate-y-0.5"
                      style={{ borderColor: active ? BRAND_MID : "rgba(15,28,24,0.1)", boxShadow: active ? "0 16px 34px rgba(66,132,117,0.14)" : "0 10px 26px rgba(15,28,24,0.05)" }}>
                      <div className="mb-5 flex items-center justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ background: active ? BRAND_INK : "#f0f5f2", color: active ? BRAND_MINT : BRAND_MID }}>
                          <Icon size={22} weight={active ? "fill" : "regular"} />
                        </span>
                        <span className="h-5 w-5 rounded-full border" style={{ borderColor: active ? BRAND_MID : "rgba(15,28,24,0.18)", background: active ? BRAND_MINT : "#fff" }} />
                      </div>
                      <h2 className="text-[18px] font-bold" style={{ color: BRAND_INK }}>{title}</h2>
                      <p className="mt-2 text-[13px] leading-5" style={{ color: "rgba(15,28,24,0.58)" }}>{desc}</p>
                      <div className="mt-4 text-[11px] font-bold uppercase" style={{ color: BRAND_MID }}>{meta}</div>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="account" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="First name" required value={account.firstName} onChange={(v) => setAccountField("firstName", v)} onBlur={() => markAccountTouched("firstName")} error={accountErrorFor("firstName")} placeholder="Sara" />
                  <TextInput label="Last name" required value={account.lastName} onChange={(v) => setAccountField("lastName", v)} onBlur={() => markAccountTouched("lastName")} error={accountErrorFor("lastName")} placeholder="Ahmed" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="Email" required type="email" value={account.email} onChange={(v) => setAccountField("email", v)} onBlur={() => markAccountTouched("email")} error={accountErrorFor("email")} placeholder="you@example.com" />
                  <TextInput label="Confirm email" required type="email" value={account.confirmEmail} onChange={(v) => setAccountField("confirmEmail", v)} onBlur={() => markAccountTouched("confirmEmail")} error={accountErrorFor("confirmEmail")} placeholder="Confirm email" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="Password" required type={showPassword ? "text" : "password"} value={account.password} onChange={(v) => setAccountField("password", v)} onBlur={() => markAccountTouched("password")} error={accountErrorFor("password")} placeholder="Minimum 8 characters"
                    right={
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#0f1c18]/45 hover:bg-[#f0f5f2]" aria-label={showPassword ? "Hide" : "Show"}>
                        {showPassword ? <EyeSlash size={17} /> : <Eye size={17} />}
                      </button>
                    }
                  />
                  <TextInput label="Confirm password" required type={showPassword ? "text" : "password"} value={account.confirmPassword} onChange={(v) => setAccountField("confirmPassword", v)} onBlur={() => markAccountTouched("confirmPassword")} error={accountErrorFor("confirmPassword")} placeholder="Confirm password" />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="h-px flex-1" style={{ background: "rgba(15,28,24,0.08)" }} />
                  <span className="text-[10.5px] font-bold uppercase tracking-widest" style={{ color: "rgba(15,28,24,0.35)" }}>Identity & contact</span>
                  <div className="h-px flex-1" style={{ background: "rgba(15,28,24,0.08)" }} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ThemedSelect
                    label="Country"
                    required
                    value={account.country}
                    onChange={(value) => setAccountField("country", value)}
                    onBlur={() => markAccountTouched("country")}
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
                    onChange={(value) => setAccountField("stateProvince", value)}
                    onBlur={() => markAccountTouched("stateProvince")}
                    error={accountErrorFor("stateProvince")}
                    placeholder={account.country ? "Select state / province" : "Choose country first"}
                    options={stateDropdownOptions}
                    disabled={!account.country || !selectedCountry}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ThemedSelect
                    label="City"
                    required
                    value={account.city}
                    onChange={(value) => setAccountField("city", value)}
                    onBlur={() => markAccountTouched("city")}
                    error={accountErrorFor("city")}
                    placeholder={account.stateProvince ? (cityStatus === "loading" ? "Loading cities..." : "Select city") : "Choose state first"}
                    options={cityDropdownOptions}
                    loading={cityStatus === "loading"}
                    disabled={!account.stateProvince || cityStatus === "loading"}
                  />
                  <PhoneNumberField
                    countryCode={account.countryCode}
                    phone={account.phone}
                    codeOptions={countryCodeOptions}
                    onCountryCodeChange={(value) => setAccountField("countryCode", value)}
                    onPhoneChange={(value) => setAccountField("phone", value)}
                    onBlur={() => {
                      markAccountTouched("countryCode");
                      markAccountTouched("phone");
                    }}
                    codeError={accountErrorFor("countryCode")}
                    phoneError={accountErrorFor("phone")}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="Date of birth" required type="date" value={account.dob} onChange={(v) => setAccountField("dob", v)} onBlur={() => markAccountTouched("dob")} error={accountErrorFor("dob")} />
                  <TextInput label="National ID / CNIC" required value={account.idNumber} onChange={(v) => setAccountField("idNumber", v)} onBlur={() => markAccountTouched("idNumber")} error={accountErrorFor("idNumber")} placeholder="XXXXX-XXXXXXX-X" />
                </div>

                <div className="flex items-start gap-2.5 rounded-lg px-3.5 py-3" style={{ background: "rgba(15,28,24,0.035)", border: "1px solid rgba(15,28,24,0.07)" }}>
                  <Lock size={13} weight="fill" className="mt-0.5 shrink-0" style={{ color: BRAND_MID }} />
                  <p className="text-[11.5px] leading-[1.6]" style={{ color: "rgba(15,28,24,0.52)" }}>
                    Phone, date of birth, and National ID are stored securely and never shown on your public profile.
                  </p>
                </div>

                <label className="flex cursor-pointer items-start gap-3 text-[12px] leading-5" style={{ color: accountErrorFor("terms") ? "#b91c1c" : "rgba(15,28,24,0.58)" }}>
                  <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); markAccountTouched("terms"); }} className={`mt-0.5 h-4 w-4 rounded border-[#0f1c18]/20 accent-[#1a312c] ${accountErrorFor("terms") ? "ring-2 ring-red-300" : ""}`} />
                  <span>
                    <span className="mr-1 align-super text-[10px] text-red-500">*</span>I agree to the <a href="#" className="font-bold text-[#428475]">Terms</a> and <a href="#" className="font-bold text-[#428475]">Privacy Policy</a>. I confirm my identity information is accurate and legally verifiable.
                  </span>
                </label>
                {accountErrorFor("terms") && (
                  <p className="-mt-3 text-[11.5px] font-medium text-red-600">{accountErrorFor("terms")}</p>
                )}
              </motion.div>
            )}

            {step === 2 && role === "founder" && (
              <motion.div key="founder" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-8">
                <div className="rounded-xl border bg-white px-5 py-4" style={{ borderColor: "rgba(15,28,24,0.1)" }}>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-[12px] font-bold" style={{ color: BRAND_INK }}>Profile completion</span>
                    <span className="text-[12px] font-bold" style={{ color: BRAND_MID }}>{profileCompleteness}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(15,28,24,0.08)" }}>
                    <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${profileCompleteness}%`, background: `linear-gradient(90deg, ${BRAND_MID}, ${BRAND_MINT})` }} />
                  </div>
                </div>

                <div className="grid gap-5">
                  <TextInput label="Founder headline" value={founder.headline} onChange={(v) => setFounderField("headline", v)} placeholder="Building AI diagnostics for rural hospitals" />
                  <TextArea label="Short bio" value={founder.bio} onChange={(v) => setFounderField("bio", v)} placeholder="Tell developers who you are, what problem you're solving, and what kind of collaboration you're looking for." />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <StaticSelect
                    label="Highest education"
                    value={founder.educationLevel}
                    onChange={(value) => {
                      setFounderField("educationLevel", value);
                      setFounderField("degreeName", "");
                      setFounderField("customDegreeName", "");
                    }}
                    placeholder="Select education level"
                    options={EDUCATION_LEVELS}
                  />
                  <StaticSelect
                    label="Degree / program"
                    value={founder.degreeName}
                    onChange={(value) => {
                      setFounderField("degreeName", value);
                      if (value !== "Other") setFounderField("customDegreeName", "");
                    }}
                    placeholder={founder.educationLevel ? "Select degree" : "Select education first"}
                    options={founderDegreeOptions}
                    disabled={!founder.educationLevel}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {founder.degreeName === "Other" && (
                    <TextInput label="Other degree" value={founder.customDegreeName} onChange={(v) => setFounderField("customDegreeName", v)} placeholder="Write your degree name" />
                  )}
                  <TextInput label="LinkedIn" value={founder.linkedin} onChange={(v) => setFounderField("linkedin", v)} placeholder="https://linkedin.com/in/…" />
                </div>

                <div className="rounded-xl border bg-white px-5 py-5" style={{ borderColor: "rgba(15,28,24,0.1)" }}>
                  <DomainSearch selected={founder.domains} onToggle={toggleFounderDomain} />
                </div>

                <div>
                  <p className="mb-1 text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>What&apos;s your primary goal on Evolv?</p>
                  <p className="mb-3 text-[12px]" style={{ color: "rgba(15,28,24,0.4)" }}>Pick one — you can always change this later.</p>
                  <div className="grid gap-2.5">
                    {PRIMARY_GOALS.map((goal) => {
                      const active = founder.primaryGoal === goal;
                      return (
                        <button key={goal} type="button" onClick={() => setFounderField("primaryGoal", active ? "" : goal)}
                          className="flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition"
                          style={{ background: active ? BRAND_DARK : "#fff", borderColor: active ? BRAND_DARK : "rgba(15,28,24,0.1)", boxShadow: active ? "0 4px 16px rgba(26,49,44,0.2)" : "none" }}>
                          <span className="text-[13.5px] font-semibold leading-snug" style={{ color: active ? BRAND_MINT : BRAND_INK }}>{goal}</span>
                          <span className="ml-4 shrink-0">
                            {active ? <CheckCircle size={18} weight="fill" style={{ color: BRAND_MINT }} /> : <span className="block h-[18px] w-[18px] rounded-full border" style={{ borderColor: "rgba(15,28,24,0.2)" }} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && role === "developer" && (
              <motion.div key="developer" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-5">
                <div className="rounded-xl border bg-white px-5 py-4" style={{ borderColor: "rgba(15,28,24,0.1)" }}>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-[12px] font-bold" style={{ color: BRAND_INK }}>Profile strength</span>
                    <span className="text-[12px] font-bold" style={{ color: BRAND_MID }}>{profileCompleteness}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(15,28,24,0.08)" }}>
                    <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${profileCompleteness}%`, background: `linear-gradient(90deg, ${BRAND_MID}, ${BRAND_MINT})` }} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="Professional role" value={developer.jobTitle} onChange={(v) => setDevField("jobTitle", v)} placeholder="Full Stack Developer" />
                  <TextInput label="Location" value={developer.location} onChange={(v) => setDevField("location", v)} placeholder="Islamabad, Pakistan" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>Experience</span>
                    <select value={developer.experience} onChange={(e) => setDevField("experience", e.target.value)} className="h-11 w-full rounded-lg border bg-white px-4 text-[14px] outline-none focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20" style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}>
                      <option value="">Select experience</option>
                      {["< 1 year", "1-2 years", "3-5 years", "5-8 years", "8+ years"].map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>Preferred work type</span>
                    <select value={developer.workType} onChange={(e) => setDevField("workType", e.target.value)} className="h-11 w-full rounded-lg border bg-white px-4 text-[14px] outline-none focus:border-[#428475] focus:ring-4 focus:ring-[#89d7b7]/20" style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_INK }}>
                      {WORK_TYPES.map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </label>
                </div>
                <div>
                  <span className="mb-2 block text-[12px] font-semibold" style={{ color: "rgba(15,28,24,0.68)" }}>Core skills</span>
                  <ChoiceGrid items={SKILLS} selected={developer.skills} onToggle={toggleSkill} />
                </div>
                <TextArea label="Professional summary" value={developer.bio} onChange={(v) => setDevField("bio", v)} placeholder="Summarize the products you build, your strongest stack, and the startup environments you prefer." />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="GitHub (optional)" value={developer.github} onChange={(v) => setDevField("github", v)} placeholder="https://github.com/…" />
                  <TextInput label="LinkedIn (optional)" value={developer.linkedIn} onChange={(v) => setDevField("linkedIn", v)} placeholder="https://linkedin.com/in/…" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="sticky bottom-0 z-20 px-8 sm:px-10 xl:px-14" style={{ background: "#f5f6f4", borderTop: "1px solid rgba(15,28,24,0.07)" }}>
        <div className="w-full max-w-[560px] mx-auto">
          <AnimatePresence>
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2.5 pt-4">
                <UserCircle size={16} weight="fill" className="mt-0.5 shrink-0" style={{ color: BRAND_MID }} />
                <p className="text-[11.5px] leading-[1.55]" style={{ color: "rgba(15,28,24,0.48)" }}>
                  {role === "founder"
                    ? "Skipped profiles can save private blueprints — publishing, developer outreach, and investor sharing stay locked until complete."
                    : "Skipped developer profiles can enter the dashboard, but discovery visibility and applications require completion."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step === 2 && error && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between py-4">
            <button
              type="button"
              onClick={() => step === 0 ? router.push("/") : setStep((s) => s - 1)}
              className="flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition hover:bg-black/5"
              style={{ color: "rgba(15,28,24,0.6)" }}
            >
              <ArrowLeft size={14} weight="bold" />
              {step === 0 ? "Back home" : "Back"}
            </button>

            <div className="flex items-center gap-3">
              {step === 2 && (
                <button type="button" onClick={() => finish(true)}
                  className="h-10 rounded-xl border bg-white px-5 text-[13px] font-bold transition hover:bg-gray-50"
                  style={{ borderColor: "rgba(15,28,24,0.12)", color: BRAND_MID }}>
                  Skip for now
                </button>
              )}
              <motion.button
                whileHover={{ scale: 1.012 }} whileTap={{ scale: 0.988 }}
                type="button"
                onClick={step < 2 ? goNext : () => finish(false)}
                className="flex h-10 items-center gap-2 rounded-xl px-6 text-[13px] font-semibold transition-all"
                style={{ background: BRAND_INK, color: BRAND_MINT, boxShadow: "0 4px 14px rgba(15,28,24,0.18)" }}
              >
                {step < 2 ? "Continue" : "Complete profile"}
                {step < 2 ? <ArrowRight size={14} weight="bold" /> : role === "founder" ? <RocketLaunch size={14} weight="bold" /> : <Briefcase size={14} weight="bold" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
