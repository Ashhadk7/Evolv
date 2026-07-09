"use client";

import type { Role } from "@/features/auth/components/signup/types";

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

function getApiBaseUrl() {
  if (!configuredApiBaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is missing. Add it to frontend/.env and restart the frontend server."
    );
  }

  try {
    return new URL(configuredApiBaseUrl).toString().replace(/\/+$/, "");
  } catch {
    throw new Error(
      `NEXT_PUBLIC_API_BASE_URL is invalid: ${configuredApiBaseUrl}. Use http://127.0.0.1:8000/api/v1.`
    );
  }
}

export const API_BASE_URL = getApiBaseUrl();

type ApiValidationDetail = {
  msg?: string;
  loc?: Array<string | number>;
};

type ApiErrorBody = {
  detail?: string | ApiValidationDetail[];
  message?: string;
};

export class ApiRequestError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.payload = payload;
  }
}

export type SignupRequestBody = {
  role: Role;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  country_code: string;
  state_province: string;
  city: string;
  dob: string;
  terms_accepted: boolean;
};

export type SignupStartResponse = {
  email: string;
  expires_at: string;
  message: string;
  debug_otp?: string | null;
};

export type SignupVerifyResponse = {
  id: string;
  email: string;
  role: Role;
  first_name: string;
  last_name: string;
  email_confirmed: boolean;
  message: string;
};

export type SigninResponse = {
  id: string;
  email: string;
  role: Role;
  first_name: string;
  last_name: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
};

export type EducationPayload = {
  level: string;
  degree?: string | null;
  custom_degree?: string | null;
  school: string;
};

export type FounderProfilePayload = {
  headline?: string | null;
  bio?: string | null;
  description?: string | null;
  linkedin?: string | null;
  venture_stage?: string | null;
  primary_goal?: string | null;
  profile_complete: boolean;
  educations?: EducationPayload[];
};

export type DeveloperProfilePayload = {
  job_title?: string | null;
  bio?: string | null;
  experience_years?: number | null;
  availability: boolean;
  open_to_remote: boolean;
  preferred_budget?: string | null;
  github?: string | null;
  linkedin?: string | null;
  portfolio_link?: string | null;
  profile_complete: boolean;
  educations?: EducationPayload[];
};

export type CatalogItem = {
  id: number;
  name: string;
};

export type PhoneStatusResponse = {
  phone: string | null;
  phone_verified: boolean;
};

export type PhoneVerifyResponse = {
  phone: string;
  phone_verified: boolean;
  message: string;
};

type RequestOptions = RequestInit & {
  accessToken?: string;
};

function formatApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;

  const body = payload as ApiErrorBody;
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail) && body.detail.length) {
    return body.detail
      .map((detail) => detail.msg)
      .filter(Boolean)
      .join(" ");
  }
  if (typeof body.message === "string") return body.message;

  return fallback;
}

async function requestJson<T>(path: string, options: RequestOptions = {}) {
  const { accessToken, headers, ...init } = options;
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Content-Type")) requestHeaders.set("Content-Type", "application/json");
  if (accessToken) requestHeaders.set("Authorization", `Bearer ${accessToken}`);

  const url = `${API_BASE_URL}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: requestHeaders,
    });
  } catch {
    throw new Error(
      `Could not reach the backend at ${url}. Make sure the API is running and restart the frontend after changing .env.`
    );
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiRequestError(
      formatApiError(payload, "The request could not be completed."),
      response.status,
      payload
    );
  }

  return payload as T;
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function startSignup(payload: SignupRequestBody) {
  return requestJson<SignupStartResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifySignupEmail(payload: { email: string; otp: string }) {
  return requestJson<SignupVerifyResponse>("/auth/signup/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resendSignupOtp(payload: { email: string }) {
  return requestJson<SignupStartResponse>("/auth/signup/resend-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function signin(payload: { email: string; password: string }) {
  return requestJson<SigninResponse>("/auth/signin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getPhoneStatus(accessToken: string) {
  return requestJson<PhoneStatusResponse>("/phone/status", { method: "GET", accessToken });
}

export function verifyPhone(payload: { firebase_id_token: string }, accessToken: string) {
  return requestJson<PhoneVerifyResponse>("/phone/verify", {
    method: "POST",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export function createFounderProfile(payload: FounderProfilePayload, accessToken: string) {
  return requestJson<unknown>("/founder-profile", {
    method: "POST",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export function createDeveloperProfile(payload: DeveloperProfilePayload, accessToken: string) {
  return requestJson<unknown>("/developer-profile", {
    method: "POST",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export function listSkills(accessToken: string) {
  return requestJson<CatalogItem[]>("/skills", { method: "GET", accessToken });
}

export function createSkill(name: string, accessToken: string) {
  return requestJson<CatalogItem>("/skills", {
    method: "POST",
    body: JSON.stringify({ name }),
    accessToken,
  });
}

export function addMySkill(
  payload: { skill_id: number; kind: "Skill"; experience_level: string },
  accessToken: string
) {
  return requestJson<unknown>("/me/skills", {
    method: "POST",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export function listDomains(accessToken: string) {
  return requestJson<CatalogItem[]>("/domains", { method: "GET", accessToken });
}

export function createDomain(name: string, accessToken: string) {
  return requestJson<CatalogItem>("/domains", {
    method: "POST",
    body: JSON.stringify({ name }),
    accessToken,
  });
}

export function addMyDomain(payload: { domain_id: number }, accessToken: string) {
  return requestJson<unknown>("/me/domains", {
    method: "POST",
    body: JSON.stringify(payload),
    accessToken,
  });
}
