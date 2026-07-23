import { clearSession, getAccessToken } from "@/features/auth/lib/session";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// A 401 on an authenticated call means the session is dead (expired, revoked,
// or the account no longer exists) — the token can never become valid again by
// retrying. Without this, callers that swallow errors (loadData, background
// fetches) leave the UI showing stale cached/default data with no indication
// the user isn't really signed in. Clearing + redirecting here, once, makes
// that failure mode structurally impossible instead of relying on every
// call site to handle it.
function handleExpiredSession(): void {
  if (typeof window === "undefined") return;
  clearSession();
  if (window.location.pathname !== "/sign-in") {
    window.location.replace("/sign-in");
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
    public readonly code: string | null = null
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

interface ValidationErrorItem {
  msg?: unknown;
}

/**
 * Extracts a message from an error response body. Our custom handlers return a
 * string `detail`; FastAPI/Pydantic 422 responses return an array of validation
 * items, so we surface the actual field messages instead of a generic fallback.
 */
function extractErrorDetail(data: unknown): string {
  const detail = (data as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = (detail as ValidationErrorItem[])
      .map((item) =>
        typeof item?.msg === "string" ? item.msg.replace(/^Value error,\s*/, "") : null
      )
      .filter((message): message is string => Boolean(message));
    if (messages.length) return messages.join(" ");
  }
  return "Something went wrong. Please try again.";
}

const GENERIC_ERROR = "Something went wrong. Please try again.";
const UNREACHABLE_ERROR = "We can't reach the server right now. Please try again shortly.";

/**
 * Maps any thrown error to a user-facing message. Handles the common cases
 * (unreachable server, generic fallback) centrally; callers pass `override`
 * only for status codes that need a flow-specific message.
 */
export function getApiErrorMessage(
  err: unknown,
  override?: (err: ApiError) => string | undefined
): string {
  if (err instanceof ApiError) {
    const specific = override?.(err);
    if (specific) return specific;
    if (err.status === 0 || err.code === "network_error") return UNREACHABLE_ERROR;
    return err.detail;
  }
  if (err instanceof Error && err.message) return err.message;
  return GENERIC_ERROR;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false } = options;

  // FormData (file uploads) must keep the browser-set multipart boundary, so we
  // don't set Content-Type or JSON-stringify it.
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = isFormData ? {} : { "Content-Type": "application/json" };
  if (auth) {
    const token = getAccessToken();
    if (!token) {
      handleExpiredSession();
      throw new ApiError(401, "You are not signed in.", "no_session");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your connection.", "network_error");
  }

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (auth && response.status === 401) handleExpiredSession();
    throw new ApiError(response.status, extractErrorDetail(data), data?.code ?? null);
  }

  return data as T;
}
