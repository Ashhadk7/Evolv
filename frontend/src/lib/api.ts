import { getAccessToken } from "@/features/auth/lib/session";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

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
  method?: "GET" | "POST" | "PATCH" | "DELETE";
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

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAccessToken();
    if (!token) throw new ApiError(401, "You are not signed in.", "no_session");
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your connection.", "network_error");
  }

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, extractErrorDetail(data), data?.code ?? null);
  }

  return data as T;
}
