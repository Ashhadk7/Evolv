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
export const SESSION_CLEARED_EVENT = "evolv:session-cleared";

function notifySessionCleared(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_CLEARED_EVENT));
  }
}

function storage(remember: boolean): Storage {
  return remember ? localStorage : sessionStorage;
}

// The role is mirrored into a cookie so Next middleware can gate /founder and
// /developer routes server-side. This cookie is a routing hint only — the real
// security boundary is the API's bearer-token check. Its lifetime matches the
// session store: persistent for "remember me", session-only otherwise.
const ROLE_COOKIE = "evolv_role";

function setRoleCookie(role: string, remember: boolean): void {
  if (typeof document === "undefined") return;
  const maxAge = remember ? "; Max-Age=2592000" : "";
  document.cookie = `${ROLE_COOKIE}=${role}; path=/; SameSite=Lax${maxAge}`;
}

function clearRoleCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${ROLE_COOKIE}=; path=/; Max-Age=0; SameSite=Lax`;
}

export function saveSession(session: Session, remember: boolean): void {
  clearSession();
  storage(remember).setItem(SESSION_KEY, JSON.stringify(session));
  setRoleCookie(session.user.role, remember);
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
  clearRoleCookie();
  notifySessionCleared();
}

const LEGACY_PROFILE_KEYS = [
  "evolv_user",
  "evolv_users",
  "evolv_developer_profile",
  "evolv_developer_network_state",
  "evolv_founder_network_state",
  "evolv_founder_network_reviews",
  "evolv_founder_profile",
  "evolv_founder_blueprints",
];

export function clearAllUserData(): void {
  clearSession();
  for (const key of LEGACY_PROFILE_KEYS) {
    localStorage.removeItem(key);
  }
}
