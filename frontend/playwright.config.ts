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
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: Number(process.env.PLAYWRIGHT_WORKERS ?? 1),
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    ...channelUse,
    screenshot: "only-on-failure",
    trace: "off",
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
