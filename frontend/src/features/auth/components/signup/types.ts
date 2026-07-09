// Types for the sign-up wizard, extracted from SignUpForm.tsx.

export type Role = "founder" | "developer";

export type AccountField =
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
  | "dob";
export type AccountValidationField = AccountField | "terms";
export type AccountErrors = Partial<Record<AccountValidationField, string>>;
export type SignupAccount = Record<AccountField, string>;
export type FounderSignupProfile = {
  headline: string;
  bio: string;
  domains: string[];
  primaryGoal: string;
  educationLevel: string;
  degreeName: string;
  customDegreeName: string;
  linkedin: string;
};
export type DeveloperSignupProfile = {
  jobTitle: string;
  experience: string;
  skills: string[];
  educationLevel: string;
  degreeName: string;
  customDegreeName: string;
  bio: string;
  github: string;
  linkedIn: string;
};
export type StoredSignupUser = {
  email?: string;
  [key: string]: unknown;
};
export type LocationStatus = "loading" | "ready" | "error";
export type CityStatus = "idle" | "loading" | "ready" | "error";
export type CountryLocation = {
  name: string;
  iso2: string;
  dialCode: string;
  states: string[];
};
export type DropdownOption = {
  value: string;
  label?: string;
  meta?: string;
};
export type CountriesStatesResponse = {
  error?: boolean;
  data?: Array<{
    name?: string;
    iso2?: string;
    states?: Array<{ name?: string }>;
  }>;
};
export type CountryCodesResponse = {
  error?: boolean;
  data?: Array<{
    name?: string;
    code?: string;
    dial_code?: string;
  }>;
};
export type CitiesResponse = {
  error?: boolean;
  data?: string[];
};
