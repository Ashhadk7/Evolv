"use client";

import type { PhoneStatusResponse, PhoneVerifyResponse } from "./auth-api";

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
  role: "founder" | "developer",
  status: PhoneVerificationStatus
) {
  if (typeof window === "undefined") return;

  const key = role === "founder" ? "evolv_founder_profile" : "evolv_user";
  const profile = readObject(key);
  window.localStorage.setItem(
    key,
    JSON.stringify({
      ...profile,
      phone: status.phone ?? profile.phone ?? "",
      phoneVerified: status.phoneVerified,
      phone_verified: status.phoneVerified,
    })
  );
}

function readObject(key: string): Record<string, unknown> {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
