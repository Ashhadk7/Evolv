import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Bare (unprefixed) app-section names, mirrored from the real route folders in
// src/app/(app)/{founder,developer}/*. A signed-out user typing one of these
// (e.g. /settings instead of /founder/settings) is clearly trying to reach the
// app, not a random URL — professional apps (Slack, Notion, Linear) route that
// to sign-in instead of a raw 404. Segments not listed here (typos, garbage
// paths) fall through to Next's normal not-found page, unaffected.
const FOUNDER_SEGMENTS = new Set(["dashboard", "inbox", "network", "projects", "settings", "workspace"]);
const DEVELOPER_SEGMENTS = new Set(["dashboard", "inbox", "network", "projects", "settings", "applications", "discover"]);
const KNOWN_SEGMENTS = new Set([...FOUNDER_SEGMENTS, ...DEVELOPER_SEGMENTS]);

// Server-side gate for the authenticated app shells (Next 16 "proxy" convention,
// formerly "middleware"). The `evolv_role` cookie is a routing hint written by the
// client on sign-in (see features/auth/lib/session.ts); the real security boundary
// is the API's bearer-token check on every request. `no-store` disqualifies
// protected pages from the browser's back/forward cache, so pressing Back after
// sign-out re-runs this proxy instead of restoring a stale logged-in page.
export function proxy(request: NextRequest) {
  const role = request.cookies.get("evolv_role")?.value;
  const { pathname } = request.nextUrl;
  const needsFounder = pathname.startsWith("/founder");
  const needsDeveloper = pathname.startsWith("/developer");
  const bareSegment = pathname.length > 1 && KNOWN_SEGMENTS.has(pathname.slice(1)) ? pathname.slice(1) : null;

  if ((needsFounder || needsDeveloper || bareSegment) && !role) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  if (needsFounder && role !== "founder") {
    return NextResponse.redirect(new URL("/developer/dashboard", request.url));
  }
  if (needsDeveloper && role !== "developer") {
    return NextResponse.redirect(new URL("/founder/dashboard", request.url));
  }
  if (bareSegment) {
    const segments = role === "founder" ? FOUNDER_SEGMENTS : DEVELOPER_SEGMENTS;
    const target = segments.has(bareSegment) ? `/${role}/${bareSegment}` : `/${role}/dashboard`;
    return NextResponse.redirect(new URL(target, request.url));
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: [
    "/founder/:path*",
    "/developer/:path*",
    "/dashboard",
    "/inbox",
    "/network",
    "/projects",
    "/settings",
    "/workspace",
    "/applications",
    "/discover",
  ],
};
