// Signup profile building + localStorage persistence, extracted from SignUpForm.tsx.
import type {
  DeveloperSignupProfile,
  FounderSignupProfile,
  Role,
  SignupAccount,
  StoredSignupUser,
} from "../components/signup/types";

type PersistSignupAccountInput = {
  role: Role | "";
  account: SignupAccount;
  founder: FounderSignupProfile;
  developer: DeveloperSignupProfile;
  profileComplete: boolean;
};

export function persistSignupAccount({
  role,
  account,
  founder,
  developer,
  profileComplete,
}: PersistSignupAccountInput) {
  const fullPhone = `${account.countryCode} ${account.phone}`.trim();
  const accountLocation = {
    phone: fullPhone,
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
    password: account.password,
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
