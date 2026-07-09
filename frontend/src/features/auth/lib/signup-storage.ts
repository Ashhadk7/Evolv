// Signup profile building + local/session storage persistence, extracted from SignUpForm.tsx.
import type {
  DeveloperSignupProfile,
  FounderSignupProfile,
  Role,
  SignupAccount,
  StoredSignupUser,
} from "../components/signup/types";

const PENDING_SIGNUP_KEY = "evolv_pending_signup";

export type PersistSignupAccountInput = {
  role: Role;
  account: SignupAccount;
  founder: FounderSignupProfile;
  developer: DeveloperSignupProfile;
  profileComplete: boolean;
};

export type PendingSignupData = PersistSignupAccountInput & {
  expiresAt?: string;
  debugOtp?: string | null;
  startedAt: number;
};

export function formatSignupPhone(account: SignupAccount) {
  const localPhone = account.phone.trim();
  if (!localPhone) return "";
  if (localPhone.startsWith("+")) return localPhone;
  return `${account.countryCode} ${localPhone}`.trim();
}

export function savePendingSignup({
  expiresAt,
  debugOtp,
  ...input
}: PersistSignupAccountInput & { expiresAt?: string; debugOtp?: string | null }) {
  sessionStorage.setItem(
    PENDING_SIGNUP_KEY,
    JSON.stringify({
      ...input,
      expiresAt,
      debugOtp,
      startedAt: Date.now(),
    } satisfies PendingSignupData)
  );
}

export function getPendingSignup(email?: string | null) {
  const raw = sessionStorage.getItem(PENDING_SIGNUP_KEY);
  if (!raw) return null;

  try {
    const pending = JSON.parse(raw) as PendingSignupData;
    if (email && pending.account.email.toLowerCase() !== email.toLowerCase()) return null;
    return pending;
  } catch {
    sessionStorage.removeItem(PENDING_SIGNUP_KEY);
    return null;
  }
}

export function clearPendingSignup() {
  sessionStorage.removeItem(PENDING_SIGNUP_KEY);
}

export function persistSignupAccount({
  role,
  account,
  founder,
  developer,
  profileComplete,
}: PersistSignupAccountInput) {
  const fullPhone = formatSignupPhone(account);
  const accountLocation = {
    phone: fullPhone,
    phoneVerified: false,
    phoneLocal: account.phone,
    country: account.country,
    countryCode: account.countryCode,
    stateProvince: account.stateProvince,
    city: account.city,
    dob: account.dob,
  };
  const base = {
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    role,
    ...accountLocation,
  };
  const founderDegreeName =
    founder.degreeName === "Other" ? founder.customDegreeName : founder.degreeName;
  const founderEducation = [founder.educationLevel, founderDegreeName].filter(Boolean).join(" - ");
  const founderEducations = founderEducation
    ? [
        {
          id: "signup_education",
          level: founder.educationLevel,
          degree: founderDegreeName,
          customDegree: founder.degreeName === "Other" ? founder.customDegreeName : "",
          school: "",
        },
      ]
    : [];
  const developerDegreeName =
    developer.degreeName === "Other" ? developer.customDegreeName : developer.degreeName;
  const developerEducation = [developer.educationLevel, developerDegreeName]
    .filter(Boolean)
    .join(" - ");
  const profile =
    role === "founder"
      ? {
          firstName: account.firstName,
          lastName: account.lastName,
          email: account.email,
          ...accountLocation,
          headline: founder.headline,
          bio: founder.bio,
          domains: founder.domains,
          primaryGoal: founder.primaryGoal,
          education: founderEducation,
          educationLevel: founder.educationLevel,
          degreeName: founderDegreeName,
          degreeSelection: founder.degreeName,
          customDegreeName: founder.customDegreeName,
          educations: founderEducations,
          location: account.city,
          linkedin: founder.linkedin,
          profileComplete,
        }
      : {
          firstName: account.firstName,
          lastName: account.lastName,
          email: account.email,
          ...accountLocation,
          jobTitle: developer.jobTitle,
          role: developer.jobTitle,
          location: account.city,
          experience: developer.experience,
          education: developerEducation,
          educationLevel: developer.educationLevel,
          degreeName: developerDegreeName,
          degreeSelection: developer.degreeName,
          customDegreeName: developer.customDegreeName,
          bio: developer.bio,
          techStack: developer.skills,
          github: developer.github,
          linkedin: developer.linkedIn,
          availability: true,
          profileComplete,
          firstTime: !profileComplete,
        };

  const users = JSON.parse(localStorage.getItem("evolv_users") ?? "[]") as StoredSignupUser[];
  const filtered = users.filter(
    (user) => user.email?.toLowerCase() !== account.email.toLowerCase()
  );
  localStorage.setItem("evolv_users", JSON.stringify([...filtered, { ...base, profile }]));

  if (role === "founder") {
    localStorage.setItem("evolv_founder_profile", JSON.stringify(profile));
    return "/founder/dashboard" as const;
  }
  localStorage.setItem("evolv_user", JSON.stringify(profile));
  return "/developer/dashboard" as const;
}
