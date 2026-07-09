"use client";

import type { Role } from "@/features/auth/components/signup/types";
import type { PhoneStatusResponse, PhoneVerifyResponse } from "./auth-api";

export const PHONE_VERIFICATION_LABEL = "verified phone number";

export type PhoneVerificationStatus = {
  phone: string | null;
  phoneVerified: boolean;
};

export function toPhoneVerificationStatus(
  response: PhoneStatusResponse | PhoneVerifyResponse
): PhoneVerificationStatus {
  return {
    phone: response.phone,
    phoneVerified: response.phone_verified,
  };
}

export function savePhoneStatusToLocalProfile(
  role: Role,
  status: PhoneVerificationStatus,
  email?: string
) {
  if (typeof window === "undefined") return;

  const key = role === "founder" ? "evolv_founder_profile" : "evolv_user";
  const profile = readObject(key);
  const nextProfile = {
    ...profile,
    phone: status.phone ?? profile.phone ?? "",
    phoneVerified: status.phoneVerified,
  };

  window.localStorage.setItem(key, JSON.stringify(nextProfile));
  updateStoredUsers(role, nextProfile, email);
}

function updateStoredUsers(role: Role, profile: Record<string, unknown>, email?: string) {
  const users = readArray("evolv_users");
  if (!users.length) return;

  const nextUsers = users.map((user) => {
    const sameRole = user.role === role;
    const sameEmail = !email || String(user.email ?? "").toLowerCase() === email.toLowerCase();
    if (!sameRole || !sameEmail) return user;

    return {
      ...user,
      profile: { ...(isObject(user.profile) ? user.profile : {}), ...profile },
    };
  });

  window.localStorage.setItem("evolv_users", JSON.stringify(nextUsers));
}

function readObject(key: string): Record<string, unknown> {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return isObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function readArray(key: string): Array<Record<string, unknown>> {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isObject) : [];
  } catch {
    return [];
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
