import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const apiBaseURL = `${baseURL}/api/v1`;
const webServerEnv = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined)
);
const configuredChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL;
const browserChannel =
  configuredChannel === "bundled"
    ? undefined
    : configuredChannel || (process.platform === "win32" ? "msedge" : "chrome");
const channelUse = browserChannel ? { channel: browserChannel } : {};

export default defineConfig({
  testDir: "./e2e",
  // Pre-compiles every route so Turbopack's first-request latency is paid once
  // here, not inside whichever test happens to visit a route first.
  globalSetup: "./e2e/global-setup.ts",
  // Turbopack dev-mode compile latency on this hardware runs to several seconds
  // per route. These budgets are sized for that, so a slow navigation is not
  // reported as a defect. A production build would allow much tighter values.
  timeout: 120_000,
  expect: {
    timeout: 30_000,
  },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  // One local retry distinguishes a genuine failure from dev-server latency:
  // a test that passes on retry is reported as flaky rather than failed.
  retries: process.env.CI ? 2 : 1,
  workers: Number(process.env.PLAYWRIGHT_WORKERS ?? 1),
  // Shown in the HTML report header, so the run records what was tested,
  // where, and against which build — rather than leaving it to memory.
  metadata: {
    Project: "Evolv",
    Suite: "QA week — end-to-end regression",
    Environment: process.env.PLAYWRIGHT_ENV ?? "Local (stubbed API)",
    "App under test": baseURL,
    "API base URL": apiBaseURL,
    Build: process.env.BUILD_SHA ?? "main @ local working tree",
    Browser: browserChannel ?? "Chromium (Playwright bundled)",
    "Playwright version": "1.62.0",
    "Node version": process.version,
    "Executed by": process.env.QA_OWNER ?? "QA — Person 3 slice",
  },
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    // Machine-readable outputs for CI and for evidence in the test report.
    ["junit", { outputFile: "test-results/junit-results.xml" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  use: {
    baseURL,
    ...channelUse,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], ...channelUse },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `node node_modules/next/dist/bin/next dev --turbopack --hostname 127.0.0.1 --port ${port}`,
        env: {
          ...webServerEnv,
          NEXT_PUBLIC_API_BASE_URL: apiBaseURL,
          NEXT_PUBLIC_API_URL: apiBaseURL,
        },
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
        gracefulShutdown: { signal: "SIGTERM", timeout: 1_000 },
      },
});
