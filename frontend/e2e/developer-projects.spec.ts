import { expect, test } from "@playwright/test";

import { developerInvite, developerProject, mockAppApi, signInAs } from "./fixtures";
import { annotate, tags } from "./test-metadata";

const AREA = "Developer Workspace / Projects";

const noInvites = { total: 0, items: [] };
const noProjects = { total: 0, items: [] };

test.describe("Developer — Projects", () => {
  test(
    "TC-PROJ-001 | An empty workspace explains how projects arrive",
    { tag: tags("projects", "P2", "UI") },
    async ({ page }) => {
      annotate({
        id: "TC-PROJ-001",
        priority: "P2",
        type: "UI",
        area: AREA,
        objective: "A developer with no engagements sees guidance, not a blank page.",
      });

      await test.step("Given a signed-in developer with no projects or invitations", async () => {
        await mockAppApi(page, "developer", {
          "/developer/projects/invites": noInvites,
          "/developer/projects": noProjects,
        });
        await signInAs(page, "developer");
      });

      await test.step("When they open Projects", async () => {
        await page.goto("/developer/projects");
      });

      await test.step("Then the empty state explains the invitation flow", async () => {
        await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
        await expect(page.getByText("No projects yet")).toBeVisible();
        await expect(
          page.getByText(/When a founder invites you to a phase/i)
        ).toBeVisible();
      });
    }
  );

  test(
    "TC-PROJ-002 | A joined project shows the developer's own earnings",
    { tag: tags("projects", "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-PROJ-002",
        priority: "P1",
        type: "Functional",
        area: AREA,
        objective: "An accepted engagement lists the project with the developer's own figures.",
      });

      await test.step("Given a developer accepted onto one project", async () => {
        await mockAppApi(page, "developer", {
          "/developer/projects/invites": noInvites,
          "/developer/projects": { total: 1, items: [developerProject()] },
        });
        await signInAs(page, "developer");
      });

      await test.step("When they open Projects", async () => {
        await page.goto("/developer/projects");
      });

      await test.step("Then the project and their received earnings are shown", async () => {
        await expect(page.getByText("Nexus Health")).toBeVisible();
        await expect(page.getByText("Earnings Received")).toBeVisible();
        await expect(page.getByText("$1,000").first()).toBeVisible();
      });
    }
  );

  test(
    "TC-PROJ-003 | The project budget and other developers' pay are never exposed",
    { tag: tags("projects", "P0", "Negative") },
    async ({ page }) => {
      annotate({
        id: "TC-PROJ-003",
        priority: "P0",
        type: "Negative",
        area: AREA,
        objective:
          "Founder-only financials stay out of the developer workspace entirely.",
      });

      await test.step("Given a developer accepted onto one project", async () => {
        await mockAppApi(page, "developer", {
          "/developer/projects/invites": noInvites,
          "/developer/projects": { total: 1, items: [developerProject()] },
        });
        await signInAs(page, "developer");
      });

      await test.step("When they open Projects", async () => {
        await page.goto("/developer/projects");
        await expect(page.getByText("Nexus Health")).toBeVisible();
      });

      await test.step("Then no budget, spend or payroll wording appears", async () => {
        await expect(page.getByText(/budget deployed/i)).toHaveCount(0);
        await expect(page.getByText(/total budget/i)).toHaveCount(0);
        await expect(page.getByText(/spend history/i)).toHaveCount(0);
      });
    }
  );

  test(
    "TC-PROJ-004 | A pending invitation shows its offer and both responses",
    { tag: tags("projects", "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-PROJ-004",
        priority: "P1",
        type: "Functional",
        area: AREA,
        objective: "The invite tray shows project, phase, inviter and the agreed amount.",
      });

      await test.step("Given a developer with one pending invitation", async () => {
        await mockAppApi(page, "developer", {
          "/developer/projects/invites": { total: 1, items: [developerInvite()] },
          "/developer/projects": noProjects,
        });
        await signInAs(page, "developer");
      });

      await test.step("When they open Projects", async () => {
        await page.goto("/developer/projects");
      });

      await test.step("Then the invitation and its offer are shown", async () => {
        await expect(page.getByText("1 pending invitation")).toBeVisible();
        await expect(page.getByText("Aura Logistics")).toBeVisible();
        await expect(page.getByText("Phase 2 · invited by Fiona Founder")).toBeVisible();
        await expect(page.getByText("$3,200")).toBeVisible();
        await expect(page.getByRole("button", { name: /Accept/ })).toBeVisible();
        await expect(page.getByRole("button", { name: /Decline/ })).toBeVisible();
      });
    }
  );

  test(
    "TC-PROJ-005 | A pending invitation does not join the project",
    { tag: tags("projects", "P0", "Negative") },
    async ({ page }) => {
      annotate({
        id: "TC-PROJ-005",
        priority: "P0",
        type: "Negative",
        area: AREA,
        objective:
          "Being invited grants nothing until accepted — the workspace stays empty.",
      });

      await test.step("Given a developer with one pending invitation", async () => {
        await mockAppApi(page, "developer", {
          "/developer/projects/invites": { total: 1, items: [developerInvite()] },
          "/developer/projects": noProjects,
        });
        await signInAs(page, "developer");
      });

      await test.step("When they open Projects", async () => {
        await page.goto("/developer/projects");
      });

      await test.step("Then the invite is listed but no project is joined", async () => {
        await expect(page.getByText("1 pending invitation")).toBeVisible();
        await expect(page.getByText("No projects yet")).toBeVisible();
      });
    }
  );

  test(
    "TC-PROJ-006 | Accepting an invitation calls the accept endpoint",
    { tag: tags("projects", "P1", "Integration") },
    async ({ page }) => {
      annotate({
        id: "TC-PROJ-006",
        priority: "P1",
        type: "Integration",
        area: AREA,
        objective: "Accept posts to the invitation's accept route with its member id.",
      });

      let acceptedId: string | null = null;

      await test.step("Given a developer with one pending invitation", async () => {
        await page.route(
          "**/api/v1/developer/projects/invites/*/accept",
          async (route) => {
            acceptedId =
              new URL(route.request().url()).pathname.split("/").at(-2) ?? null;
            await route.fulfill({
              status: 200,
              contentType: "application/json",
              headers: { "access-control-allow-origin": "*" },
              body: "{}",
            });
          }
        );
        await mockAppApi(page, "developer", {
          "/developer/projects/invites": { total: 1, items: [developerInvite()] },
          "/developer/projects": noProjects,
        });
        await signInAs(page, "developer");
        await page.goto("/developer/projects");
      });

      await test.step("When they accept it", async () => {
        await page.getByRole("button", { name: /Accept/ }).click();
      });

      await test.step("Then the accept endpoint is called for that invitation", async () => {
        await expect.poll(() => acceptedId).toBe("member-1");
      });
    }
  );
});
