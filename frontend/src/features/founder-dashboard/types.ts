import type { FounderEducation } from "@/features/founder-dashboard/profile-utils";

// The founder's profile/user model. Extracted from OnboardingWizard so the type
// can be shared without importing the (large) wizard component.
export interface FounderProfile {
  firstName: string;
  lastName: string;
  bio: string;
  domains: string[];
  linkedin: string;
  dob: string;
  gender: string;
  phone: string;
  phoneVerified?: boolean;
  education: string;
  educationLevel?: string;
  degreeName?: string;
  degreeSelection?: string;
  customDegreeName?: string;
  educations?: FounderEducation[];
  description: string;
  email: string;
  avatarUrl?: string;
  profileComplete?: boolean;
  ventureStage?: string;
  headline?: string;
  location?: string;
  country?: string;
  countryCode?: string;
  stateProvince?: string;
  city?: string;
  primaryGoal?: string;
  stripeConnected?: boolean;
}
