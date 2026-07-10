import { apiFetch } from "@/lib/api";
import type { Session } from "./session";

interface SigninWireResponse {
  id: string;
  email: string;
  role: "founder" | "developer";
  first_name: string;
  last_name: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

export async function signIn(email: string, password: string): Promise<Session> {
  const data = await apiFetch<SigninWireResponse>("/auth/signin", {
    method: "POST",
    body: { email, password },
  });

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: {
      id: data.id,
      email: data.email,
      role: data.role,
      firstName: data.first_name,
      lastName: data.last_name,
    },
  };
}

export interface SignUpInput {
  role: "founder" | "developer";
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  countryCode: string;
  stateProvince: string;
  city: string;
  dob: string;
  termsAccepted: boolean;
}

interface SignupStartWireResponse {
  email: string;
  expires_at: string;
  message: string;
  debug_otp?: string | null;
}

export interface SignupStartResult {
  email: string;
  expiresAt: string;
  message: string;
}

export async function signUp(input: SignUpInput): Promise<SignupStartResult> {
  const data = await apiFetch<SignupStartWireResponse>("/auth/signup", {
    method: "POST",
    body: {
      role: input.role,
      email: input.email,
      password: input.password,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: `${input.countryCode} ${input.phone}`.trim(),
      country: input.country,
      country_code: input.countryCode,
      state_province: input.stateProvince,
      city: input.city,
      dob: input.dob || undefined,
      terms_accepted: input.termsAccepted,
    },
  });

  return { email: data.email, expiresAt: data.expires_at, message: data.message };
}

export async function verifySignupEmail(email: string, otp: string): Promise<void> {
  await apiFetch("/auth/signup/verify-email", { method: "POST", body: { email, otp } });
}

export async function resendSignupOtp(email: string): Promise<void> {
  await apiFetch("/auth/signup/resend-otp", { method: "POST", body: { email } });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiFetch("/auth/forgot-password", { method: "POST", body: { email } });
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<void> {
  await apiFetch("/auth/reset-password", {
    method: "POST",
    body: { email, otp, new_password: newPassword },
  });
}
