import type { FullConfig } from "@playwright/test";

/**
 * Warms the Next dev server before the suite runs.
 *
 * In dev mode Turbopack compiles each route on its first request, which can take
 * several seconds. That cost lands on whichever test visits a route first, and
 * under a full-suite run it pushed navigation assertions past their timeout —
 * producing failures that were compile latency, not defects.
 *
 * Requesting every route once up front moves that cost here, so the tests
 * themselves measure the application rather than the bundler.
 */
const ROUTES = [
  "/",
  "/about",
  "/our-team",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/founder/dashboard",
  "/founder/workspace",
  "/founder/projects",
  "/founder/network",
  "/founder/inbox",
  "/developer/dashboard",
  "/developer/discover",
  "/developer/applications",
  "/developer/projects",
  "/developer/network",
  "/developer/inbox",
];

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL;
  if (!baseURL) return;

  const started = Date.now();
  let compiled = 0;

  for (const route of ROUTES) {
    try {
      const response = await fetch(new URL(route, baseURL), {
        signal: AbortSignal.timeout(60_000),
      });
      // Drain the body so the request completes and the route is fully compiled.
      await response.text();
      compiled += 1;
    } catch {
      // A route that fails to warm is not a setup failure — the test that needs
      // it will report the real problem with far better context.
    }
  }

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`[global-setup] warmed ${compiled}/${ROUTES.length} routes in ${seconds}s`);
}
