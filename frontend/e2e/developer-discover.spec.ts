import { expect, test } from "@playwright/test";

import {
  discoverBlueprint,
  discoverList,
  mockAppApi,
  searchableDiscoverList,
  signInAs,
} from "./fixtures";
import { annotate, tags } from "./test-metadata";

const AREA = "discover";

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
    "TC-DISC-001 | Discover renders stats, filters and the ranked blueprint list",
    { tag: tags(AREA, "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-DISC-001",
        priority: "P1",
        type: "Functional",
        area: "Developer Workspace / Discover",
        objective: "Public blueprint stats, filters and the ranked list all load on entry.",
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

      await test.step("Then the heading, search box and view tabs are visible", async () => {
        await expect(page.getByRole("heading", { name: "Discover Opportunities" })).toBeVisible();
        await expect(page.getByPlaceholder("Search blueprint, role, stack")).toBeVisible();
        await expect(page.getByRole("button", { name: "All Public" })).toBeVisible();
      });

      await test.step("And both public blueprints appear in the ranked list", async () => {
        await expect(page.getByText("Clinic Workflow AI").first()).toBeVisible();
        await expect(page.getByText("Fintech Ledger").first()).toBeVisible();
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
        await expect(page.getByText("Fintech Ledger").first()).toBeVisible();
      });

      await test.step('When the developer searches for "Clinic"', async () => {
        await page.getByPlaceholder("Search blueprint, role, stack").fill("Clinic");
      });

      await test.step("Then only the matching blueprint remains", async () => {
        await expect(page.getByText("Clinic Workflow AI").first()).toBeVisible();
        await expect(page.getByText("Fintech Ledger")).toHaveCount(0);
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
        await page
          .getByPlaceholder("Search blueprint, role, stack")
          .fill("no blueprint matches this text");
      });

      await test.step("Then the empty state is shown", async () => {
        await expect(page.getByText("No public blueprints match this view.")).toBeVisible();
      });
    }
  );

  test(
    "TC-DISC-010 | The Saved tab loads saved blueprints and shows its own empty state",
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

      await test.step("When the Saved tab is opened", async () => {
        await page.getByRole("button", { name: /^Saved/ }).click();
      });

      await test.step("Then the saved-specific empty state is shown", async () => {
        await expect(page.getByText("No saved blueprints yet.")).toBeVisible();
      });
    }
  );

  test(
    "TC-DISC-011 | Blueprint detail shows the founder, tech stack and actions",
    { tag: tags(AREA, "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-DISC-011",
        priority: "P1",
        type: "Functional",
        area: "Developer Workspace / Discover",
        objective: "The detail panel surfaces owner, stack and the save/apply actions.",
      });

      await test.step("Given Discover is showing a public blueprint", async () => {
        await mockAppApi(page, "developer", {
          "/discover/blueprints": discoverList([clinic]),
        });
        await signInAs(page, "developer");
        await page.goto("/developer/discover");
        await expect(page.getByText("Clinic Workflow AI").first()).toBeVisible();
      });

      // The card body only selects; "View Blueprint" is the control that opens
      // the detail panel.
      await test.step("When the developer opens the blueprint detail", async () => {
        await page.getByRole("button", { name: "View Blueprint" }).first().click();
      });

      await test.step("Then the founder and tech stack are shown", async () => {
        await expect(page.getByText("Blueprint owner")).toBeVisible();
        await expect(page.getByText("Fiona Founder").first()).toBeVisible();
        await expect(page.getByText("FastAPI").first()).toBeVisible();
      });
    }
  );
});
