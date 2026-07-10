export interface SessionUser {
  id: string;
  email: string;
  role: "founder" | "developer";
  firstName: string;
  lastName: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

const SESSION_KEY = "evolv_session";

function storage(remember: boolean): Storage {
  return remember ? localStorage : sessionStorage;
}

export function saveSession(session: Session, remember: boolean): void {
  clearSession();
  storage(remember).setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return getSession()?.accessToken ?? null;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

const LEGACY_PROFILE_KEYS = [
  "evolv_user",
  "evolv_users",
  "evolv_founder_profile",
  "evolv_founder_blueprints",
];

export function clearAllUserData(): void {
  clearSession();
  for (const key of LEGACY_PROFILE_KEYS) {
    localStorage.removeItem(key);
  }
}
