type UserRole = "founder" | "developer";

type ApiErrorBody = {
  detail?: string | Array<{ msg?: string }>;
  message?: string;
};

export type SignupPayload = {
  role: UserRole;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
  country_code?: string;
  state_province?: string;
  city?: string;
  dob?: string;
  terms_accepted: boolean;
};

export type SignupStartResponse = {
  email: string;
  expires_at: string;
  message: string;
  debug_otp?: string;
};

export type SigninResponse = {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
};

type RequestOptions = {
  method: "POST" | "PATCH";
  body: unknown;
  token?: string;
};

function apiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  return baseUrl.replace(/\/+$/, "");
}

async function request<T>(path: string, options: RequestOptions): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method: options.method,
    headers,
    body: JSON.stringify(options.body),
  });

  if (!response.ok) throw new Error(await errorMessage(response));
  return response.json() as Promise<T>;
}

async function errorMessage(response: Response) {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((item) => item.msg).filter(Boolean).join(", ");
    }
    if (body.message) return body.message;
  } catch {
    return "Request failed. Please try again.";
  }
  return "Request failed. Please try again.";
}

export function signup(payload: SignupPayload) {
  return request<SignupStartResponse>("/auth/signup", { method: "POST", body: payload });
}

export function verifySignupEmail(email: string, otp: string) {
  return request("/auth/signup/verify-email", { method: "POST", body: { email, otp } });
}

export function signin(email: string, password: string) {
  return request<SigninResponse>("/auth/signin", { method: "POST", body: { email, password } });
}

export function saveAuthSession(session: SigninResponse) {
  const baseUser = {
    id: session.id,
    userId: session.id,
    firstName: session.first_name,
    lastName: session.last_name,
    email: session.email,
    role: session.role,
  };

  localStorage.setItem("evolv_access_token", session.access_token);
  localStorage.setItem("evolv_refresh_token", session.refresh_token);
  localStorage.setItem("evolv_auth_user", JSON.stringify(baseUser));

  const profileKey = session.role === "founder" ? "evolv_founder_profile" : "evolv_user";
  const existing = readStoredObject(profileKey);
  localStorage.setItem(profileKey, JSON.stringify({ ...existing, ...baseUser }));
}

export function saveLocalSignupProfile(role: UserRole, profile: Record<string, unknown>) {
  const profileKey = role === "founder" ? "evolv_founder_profile" : "evolv_user";
  localStorage.setItem(profileKey, JSON.stringify(profile));
}

export function createFounderProfile(payload: Record<string, unknown>, token: string) {
  return request("/founder-profile", { method: "POST", body: payload, token });
}

export function createDeveloperProfile(payload: Record<string, unknown>, token: string) {
  return request("/developer-profile", { method: "POST", body: payload, token });
}

function readStoredObject(key: string) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
