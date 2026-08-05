import { expect, test } from "@playwright/test";

import {
  completeDeveloperProfile,
  discoverBlueprint,
  discoverList,
  mockAppApi,
  searchableDiscoverList,
  signInAs,
  verifiedAccount,
} from "./fixtures";
import { annotate, tags } from "./test-metadata";

const AREA = "discover";
const SEARCH_PLACEHOLDER = "Search ideas, industries, tech";

const clinic = discoverBlueprint({
  id: "bp-clinic",
  name: "Clinic Workflow AI",
  industry: "HealthTech",
  founder_name: "Fiona Founder",
  summary: "Automates intake and follow-up for small clinics.",
  tech_stack: ["Next.js", "FastAPI", "PostgreSQL"],
  viability: 82,
  match_score: 88,
});

const ledger = discoverBlueprint({
  id: "bp-ledger",
  name: "Fintech Ledger",
  industry: "Fintech",
  founder_name: "Farid Founder",
  summary: "Double-entry bookkeeping for small merchants.",
  tech_stack: ["React", "Go"],
  viability: 64,
  match_score: 71,
});

test.describe("Developer — Discover", () => {
  test(
    "TC-DISC-001 | Discover renders the heading, filters and the ranked blueprint list",
    { tag: tags(AREA, "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-DISC-001",
        priority: "P1",
        type: "Functional",
        area: "Developer Workspace / Discover",
        objective: "Heading, filter bar and the ranked list all load on entry.",
      });

      await test.step("Given a signed-in developer and two public blueprints", async () => {
        await mockAppApi(page, "developer", {
          "/discover/blueprints": discoverList([clinic, ledger]),
        });
        await signInAs(page, "developer");
      });

      await test.step("When the developer opens the Discover page", async () => {
        await page.goto("/developer/discover");
      });

      await test.step("Then the heading, search box and view segments are visible", async () => {
        await expect(page.getByRole("heading", { name: "Discover", exact: true })).toBeVisible();
        await expect(page.getByPlaceholder(SEARCH_PLACEHOLDER)).toBeVisible();
        await expect(page.getByRole("tab", { name: "All" })).toBeVisible();
      });

      await test.step("And the top match is featured with the rest below it", async () => {
        await expect(page.getByText("Your top match")).toBeVisible();
        await expect(page.getByRole("heading", { name: "Clinic Workflow AI" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Fintech Ledger" })).toBeVisible();
      });
    }
  );

  test(
    "TC-DISC-002 | Searching narrows the result list to matching blueprints",
    { tag: tags(AREA, "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-DISC-002",
        priority: "P1",
        type: "Functional",
        area: "Developer Workspace / Discover",
        objective: "The search field filters results rather than only re-rendering the list.",
      });

      await test.step("Given Discover is showing two blueprints", async () => {
        await mockAppApi(page, "developer", {
          "/discover/blueprints": searchableDiscoverList([clinic, ledger]),
        });
        await signInAs(page, "developer");
        await page.goto("/developer/discover");
        await expect(page.getByRole("heading", { name: "Fintech Ledger" })).toBeVisible();
      });

      await test.step('When the developer searches for "Clinic"', async () => {
        await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill("Clinic");
      });

      await test.step("Then only the matching blueprint remains", async () => {
        await expect(page.getByRole("heading", { name: "Clinic Workflow AI" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Fintech Ledger" })).toHaveCount(0);
      });
    }
  );

  test(
    "TC-DISC-006 | A search matching nothing shows the empty state",
    { tag: tags(AREA, "P1", "Negative") },
    async ({ page }) => {
      annotate({
        id: "TC-DISC-006",
        priority: "P1",
        type: "Negative",
        area: "Developer Workspace / Discover",
        objective: "A zero-result view shows a guiding empty state, not a blank panel.",
      });

      await test.step("Given Discover is loaded", async () => {
        await mockAppApi(page, "developer", {
          "/discover/blueprints": searchableDiscoverList([clinic, ledger]),
        });
        await signInAs(page, "developer");
        await page.goto("/developer/discover");
      });

      await test.step("When the developer searches for a term no blueprint matches", async () => {
        await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill("no blueprint matches this text");
      });

      await test.step("Then the empty state is shown", async () => {
        await expect(page.getByText("No blueprints match those filters")).toBeVisible();
      });
    }
  );

  test(
    "TC-DISC-010 | The Saved segment loads saved blueprints and shows its own empty state",
    { tag: tags(AREA, "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-DISC-010",
        priority: "P1",
        type: "Functional",
        area: "Developer Workspace / Discover",
        objective: "Switching to Saved queries the saved endpoint and renders its own state.",
      });

      await test.step("Given the developer has no saved blueprints", async () => {
        await mockAppApi(page, "developer", {
          "/discover/blueprints": discoverList([clinic, ledger]),
          "/discover/saved-blueprints": { total: 0, items: [] },
        });
        await signInAs(page, "developer");
        await page.goto("/developer/discover");
      });

      await test.step("When the Saved segment is opened", async () => {
        await page.getByRole("tab", { name: /^Saved/ }).click();
      });

      await test.step("Then the saved-specific empty state is shown", async () => {
        await expect(page.getByText("You have not saved any blueprints yet")).toBeVisible();
      });
    }
  );

  test(
    "TC-DISC-011 | Blueprint detail shows the founder, roles and match rail",
    { tag: tags(AREA, "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-DISC-011",
        priority: "P1",
        type: "Functional",
        area: "Developer Workspace / Discover",
        objective: "The detail view surfaces the founder, open roles and the match breakdown.",
      });

      await test.step("Given Discover is showing a public blueprint", async () => {
        await mockAppApi(page, "developer", {
          "/discover/blueprints": discoverList([clinic]),
        });
        await signInAs(page, "developer");
        await page.goto("/developer/discover");
        await expect(page.getByRole("heading", { name: "Clinic Workflow AI" })).toBeVisible();
      });

      await test.step("When the developer opens the blueprint detail", async () => {
        await page.getByRole("button", { name: "View blueprint" }).first().click();
      });

      await test.step("Then the founder, roles and match reasons are shown", async () => {
        await expect(page.getByRole("heading", { level: 1, name: "Clinic Workflow AI" })).toBeVisible();
        await expect(page.getByText("Fiona Founder").first()).toBeVisible();
        await expect(page.getByText("Roles needed")).toBeVisible();
        await expect(page.getByText("Why you match")).toBeVisible();
      });
    }
  );

  test(
    "TC-DISC-012 | Applying opens the role form and confirms submission",
    { tag: tags(AREA, "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-DISC-012",
        priority: "P1",
        type: "Functional",
        area: "Developer Workspace / Discover",
        objective: "The apply modal collects role, availability and a note, then confirms.",
      });

      await test.step("Given a developer whose profile clears the apply gate", async () => {
        await mockAppApi(page, "developer", {
          "/me": verifiedAccount("developer"),
          "/developer-profile": completeDeveloperProfile(),
          "/discover/blueprints": discoverList([clinic]),
          "/applications": {
            id: "app-e2e-1",
            developer_id: "developer-e2e-user",
            blueprint_id: "bp-clinic",
            connection_id: null,
            role: "Full-stack Developer",
            message: "I have shipped clinic scheduling before.",
            availability: "part_time",
            status: "applied",
            applied_at: new Date().toISOString(),
            withdrawn_at: null,
          },
        });
        await signInAs(page, "developer");
        await page.goto("/developer/discover");
      });

      await test.step("When the developer applies to build", async () => {
        await page.getByRole("button", { name: "Apply to build" }).first().click();
        await page.getByRole("textbox", { name: /Message to founder/i }).fill(
          "I have shipped clinic scheduling before."
        );
        await page.getByRole("button", { name: "Send application" }).click();
      });

      await test.step("Then the submission is confirmed", async () => {
        await expect(page.getByText("Application sent")).toBeVisible();
      });
    }
  );
});
