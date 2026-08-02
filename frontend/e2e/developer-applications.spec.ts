import { expect, test } from "@playwright/test";

import { discoverBlueprint, discoverList, mockAppApi, signInAs } from "./fixtures";
import { annotate, tags } from "./test-metadata";

const AREA = "applications";

const applied = discoverBlueprint({
  id: "bp-applied",
  name: "Clinic Workflow AI",
  applied: true,
  application_id: "app-1",
  application_status: "applied",
  applied_role: "Full-stack Developer",
  applied_at: "2026-07-30T08:00:00.000Z",
});

const withdrawn = discoverBlueprint({
  id: "bp-withdrawn",
  name: "Fintech Ledger",
  industry: "Fintech",
  applied: true,
  application_id: "app-2",
  application_status: "withdrawn",
  applied_role: "Backend Developer",
  applied_at: "2026-07-29T08:00:00.000Z",
  withdrawn_at: "2026-07-30T09:00:00.000Z",
});

test.describe("Developer — Applications", () => {
  test(
    "TC-APP-001 | Applications page renders stats and the application table",
    { tag: tags(AREA, "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-APP-001",
        priority: "P1",
        type: "Functional",
        area: "Developer Workspace / Applications",
        objective: "Stats and the application pipeline table load for a developer with applications.",
      });

      await test.step("Given the developer has one applied and one withdrawn application", async () => {
        await mockAppApi(page, "developer", {
          "/discover/blueprints": discoverList([applied, withdrawn]),
        });
        await signInAs(page, "developer");
      });

      await test.step("When the Applications page is opened", async () => {
        await page.goto("/developer/applications");
      });

      await test.step("Then the header and both application rows are visible", async () => {
        await expect(page.getByText("My Applications")).toBeVisible();
        await expect(page.getByText("Clinic Workflow AI").first()).toBeVisible();
        await expect(page.getByText("Fintech Ledger").first()).toBeVisible();
      });
    }
  );

  test(
    "TC-APP-002 | Status filters narrow the table to applied or withdrawn",
    { tag: tags(AREA, "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-APP-002",
        priority: "P1",
        type: "Functional",
        area: "Developer Workspace / Applications",
        objective:
          "The All/Applied/Withdrawn tabs filter the table. Note: the API exposes no status parameter, so this filtering is client-side.",
      });

      await test.step("Given the Applications table shows both applications", async () => {
        await mockAppApi(page, "developer", {
          "/discover/blueprints": discoverList([applied, withdrawn]),
        });
        await signInAs(page, "developer");
        await page.goto("/developer/applications");
        await expect(page.getByText("Clinic Workflow AI").first()).toBeVisible();
      });

      await test.step("When the Withdrawn filter is selected", async () => {
        await page.getByRole("button", { name: /^Withdrawn/ }).click();
      });

      await test.step("Then only the withdrawn application remains", async () => {
        await expect(page.getByText("Fintech Ledger").first()).toBeVisible();
        await expect(page.getByText("Clinic Workflow AI")).toHaveCount(0);
      });

      await test.step("When the Applied filter is selected", async () => {
        await page.getByRole("button", { name: /^Applied/ }).click();
      });

      await test.step("Then only the applied application remains", async () => {
        await expect(page.getByText("Clinic Workflow AI").first()).toBeVisible();
        await expect(page.getByText("Fintech Ledger")).toHaveCount(0);
      });
    }
  );

  test(
    "TC-APP-007 | A developer with no applications sees the empty state and a Discover CTA",
    { tag: tags(AREA, "P1", "Negative") },
    async ({ page }) => {
      annotate({
        id: "TC-APP-007",
        priority: "P1",
        type: "Negative",
        area: "Developer Workspace / Applications",
        objective: "A zero-application account is guided to Discover rather than shown a blank table.",
      });

      await test.step("Given the developer has no applications", async () => {
        await mockAppApi(page, "developer", {
          "/discover/blueprints": discoverList([]),
        });
        await signInAs(page, "developer");
      });

      await test.step("When the Applications page is opened", async () => {
        await page.goto("/developer/applications");
      });

      // The zero-application copy differs from the zero-filter-match copy.
      await test.step("Then the onboarding empty state and Open Discover CTA are shown", async () => {
        await expect(
          page.getByText("Apply to a public blueprint from Discover to start your pipeline.")
        ).toBeVisible();
        await expect(page.getByRole("button", { name: "Open Discover" })).toBeVisible();
      });
    }
  );

  test(
    "TC-DDASH-003 | Sidebar navigates across the developer app shell",
    { tag: tags("navigation", "P2", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-DDASH-003",
        priority: "P2",
        type: "Functional",
        area: "Developer Workspace / Dashboard",
        objective: "Every sidebar destination routes correctly and loads its page.",
      });

      await test.step("Given the developer is on the dashboard", async () => {
        await mockAppApi(page, "developer");
        await signInAs(page, "developer");
        await page.goto("/developer/dashboard");
      });

      const nav = page.getByRole("navigation");

      for (const [label, pattern] of [
        ["Discover", /\/developer\/discover$/],
        ["Applications", /\/developer\/applications$/],
        ["Network", /\/developer\/network$/],
        ["Inbox", /\/developer\/inbox$/],
      ] as const) {
        await test.step(`When ${label} is clicked, then the URL updates`, async () => {
          await nav.getByRole("button", { name: label }).click();
          await expect(page).toHaveURL(pattern);
        });
      }
    }
  );
});
