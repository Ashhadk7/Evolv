// Signup profile building + localStorage persistence, extracted from SignUpForm.tsx.
import type {
  DeveloperSignupProfile,
  FounderSignupProfile,
  Role,
  SignupAccount,
} from "../components/signup/types";
import { saveFounderProfile, saveDeveloperProfile } from "@/features/profiles/profile-api";
import type { FounderProfile } from "@/features/founder-dashboard/types";
import type { DeveloperProfile } from "@/features/developer-dashboard/profile-utils";

type PersistSignupAccountInput = {
  role: Role | "";
  account: SignupAccount;
  founder: FounderSignupProfile;
  developer: DeveloperSignupProfile;
  profileComplete: boolean;
};

export async function persistSignupAccount({
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

  if (role === "founder") {
    await saveFounderProfile({ ...profile, gender: "", description: "" } as FounderProfile);
    return "/founder/dashboard" as const;
  }
  await saveDeveloperProfile(profile as DeveloperProfile);
  return "/developer/dashboard" as const;
}
