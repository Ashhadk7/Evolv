"use client";

import type { Role } from "@/features/auth/components/signup/types";
import type { SigninResponse } from "./auth-api";

const AUTH_SESSION_KEY = "evolv_auth_session";
const PENDING_EMAIL_AUTH_KEY = "evolv_pending_email_auth";

export type AuthSession = {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number;
};

type PendingEmailAuth = {
  email: string;
  password: string;
  savedAt: number;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function readSessionFrom(storage: Storage) {
  const raw = storage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    storage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

function isExpired(session: AuthSession) {
  const expiryMs = session.expiresAt * 1000;
  return Number.isFinite(expiryMs) && expiryMs <= Date.now();
}

export function authSessionFromSignin(response: SigninResponse): AuthSession {
  return {
    id: response.id,
    email: response.email,
    role: response.role,
    firstName: response.first_name,
    lastName: response.last_name,
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    tokenType: response.token_type,
    expiresIn: response.expires_in,
    expiresAt: response.expires_at,
  };
}

export function storeAuthSession(session: AuthSession, options: { remember: boolean }) {
  if (!canUseStorage()) return;

  const targetStorage = options.remember ? window.localStorage : window.sessionStorage;
  const otherStorage = options.remember ? window.sessionStorage : window.localStorage;

  targetStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  otherStorage.removeItem(AUTH_SESSION_KEY);
}

export function getStoredAuthSession() {
  if (!canUseStorage()) return null;

  const session =
    readSessionFrom(window.localStorage) ?? readSessionFrom(window.sessionStorage);

  if (!session) return null;
  if (isExpired(session)) {
    clearAuthSession();
    return null;
  }

  return session;
}

export function clearAuthSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export function getDashboardPath(role: Role) {
  return role === "founder" ? "/founder/dashboard" : "/developer/dashboard";
}

export function getRoleSafeRedirect(role: Role, nextPath?: string | null) {
  if (nextPath?.startsWith(`/${role}/`) || nextPath === `/${role}`) return nextPath;
  return getDashboardPath(role);
}

export function persistSignedInUserLocally(session: AuthSession) {
  if (!canUseStorage()) return getDashboardPath(session.role);

  const baseProfile = {
    firstName: session.firstName,
    lastName: session.lastName,
    email: session.email,
    profileComplete: false,
  };

  if (session.role === "founder") {
    const existing = readJsonRecord("evolv_founder_profile");
    const profile = {
      bio: "",
      domains: [],
      linkedin: "",
      dob: "",
      gender: "",
      phone: "",
      phoneVerified: false,
      education: "",
      description: "",
      ...existing,
      ...baseProfile,
    };
    window.localStorage.setItem("evolv_founder_profile", JSON.stringify(profile));
    upsertStoredUser(session, profile);
  } else {
    const existing = readJsonRecord("evolv_user");
    const profile = {
      phone: "",
      phoneVerified: false,
      ...existing,
      ...baseProfile,
      firstTime: false,
    };
    window.localStorage.setItem("evolv_user", JSON.stringify(profile));
    upsertStoredUser(session, profile);
  }

  return getDashboardPath(session.role);
}

export function savePendingEmailAuth(email: string, password: string) {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(
    PENDING_EMAIL_AUTH_KEY,
    JSON.stringify({ email: email.toLowerCase(), password, savedAt: Date.now() })
  );
}

export function getPendingEmailAuth(email: string) {
  if (!canUseStorage()) return null;
  const raw = window.sessionStorage.getItem(PENDING_EMAIL_AUTH_KEY);
  if (!raw) return null;

  try {
    const pending = JSON.parse(raw) as PendingEmailAuth;
    if (pending.email.toLowerCase() !== email.toLowerCase()) return null;
    return pending;
  } catch {
    window.sessionStorage.removeItem(PENDING_EMAIL_AUTH_KEY);
    return null;
  }
}

export function clearPendingEmailAuth() {
  if (!canUseStorage()) return;
  window.sessionStorage.removeItem(PENDING_EMAIL_AUTH_KEY);
}

function readJsonRecord(key: string) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function upsertStoredUser(session: AuthSession, profile: Record<string, unknown>) {
  const users = readStoredUsers();
  const filtered = users.filter(
    (user) => user.email?.toLowerCase() !== session.email.toLowerCase()
  );

  window.localStorage.setItem(
    "evolv_users",
    JSON.stringify([
      ...filtered,
      {
        firstName: session.firstName,
        lastName: session.lastName,
        email: session.email,
        role: session.role,
        profile,
      },
    ])
  );
}

function readStoredUsers() {
  try {
    return JSON.parse(window.localStorage.getItem("evolv_users") ?? "[]") as Array<{
      email?: string;
      [key: string]: unknown;
    }>;
  } catch {
    return [];
  }
}
