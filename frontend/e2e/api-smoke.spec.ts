import { expect, test } from "@playwright/test";

const apiBaseURL = process.env.E2E_API_BASE_URL;

test.describe("Backend API smoke automation", () => {
  test.skip(!apiBaseURL, "Set E2E_API_BASE_URL to run backend API smoke tests.");

  test("TC-API-001: GET /health returns healthy status", async ({ request }) => {
    const response = await request.get(`${apiBaseURL}/health`);
    expect(response.ok()).toBeTruthy();

    const body = (await response.json()) as { status?: string; service?: string };
    expect(body.status).toBe("ok");
    expect(body.service).toBeTruthy();
  });

  test("TC-API-007: protected /me rejects requests without a token", async ({ request }) => {
    const response = await request.get(`${apiBaseURL}/me`);
    expect([401, 403]).toContain(response.status());
  });
});
