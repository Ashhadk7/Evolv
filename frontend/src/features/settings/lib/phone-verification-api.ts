import { apiFetch } from "@/lib/api";

export interface PhoneStatus {
  phone: string | null;
  phone_verified: boolean;
}

export interface PhoneOtpResponse {
  phone: string;
  phone_verified: boolean;
  message: string;
}

export async function getPhoneStatus(): Promise<PhoneStatus> {
  return apiFetch<PhoneStatus>("/phone/status", { auth: true });
}

export async function sendPhoneOtp(phone: string): Promise<PhoneOtpResponse> {
  return apiFetch<PhoneOtpResponse>("/phone/send-otp", {
    method: "POST",
    auth: true,
    body: { phone },
  });
}

export async function verifyPhoneOtp(phone: string, otp: string): Promise<PhoneOtpResponse> {
  return apiFetch<PhoneOtpResponse>("/phone/verify", {
    method: "POST",
    auth: true,
    body: { phone, otp },
  });
}
