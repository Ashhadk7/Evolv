import { expect, test } from "@playwright/test";
import { mockAppApi, signInAs } from "./fixtures";

test.describe("Dashboard and app-shell automation", () => {
  test("TC-FDASH-001 and TC-FDASH-005: founder dashboard renders and sidebar navigation works", async ({
    page,
  }) => {
    await mockAppApi(page, "founder");
    await signInAs(page, "founder");

    await page.goto("/founder/dashboard");
    await expect(page.getByRole("button", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Active Ideas")).toBeVisible();

    await page.getByRole("navigation").getByRole("button", { name: "Workspace" }).click();
    await expect(page).toHaveURL(/\/founder\/workspace$/);
    await expect(page.getByRole("heading", { name: /Founder Workspace/i })).toBeVisible();

    await page.getByRole("navigation").getByRole("button", { name: "Projects" }).click();
    await expect(page).toHaveURL(/\/founder\/projects$/);
  });

  test("TC-WORK-001, TC-WORK-005, TC-WORK-006, and TC-WORK-007: workspace renders, filters, and opens forge modal", async ({
    page,
  }) => {
    await mockAppApi(page, "founder");
    await signInAs(page, "founder");

    await page.goto("/founder/workspace");
    await expect(page.getByRole("heading", { name: /Founder Workspace/i })).toBeVisible();
    await expect(page.getByText("Clinic Workflow AI")).toBeVisible();

    await page.getByPlaceholder(/Search ideas/i).fill("no matching idea");
    await expect(page.getByText("No ideas found")).toBeVisible();

    await page.getByPlaceholder(/Search ideas/i).fill("");
    await page.getByRole("button", { name: /New idea/i }).click();
    await expect(page.getByText(/Forge New Blueprint/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Generate Blueprint/i })).toBeDisabled();
  });

  test("TC-DSET-001 and developer app shell: developer dashboard renders with mocked data", async ({
    page,
  }) => {
    await mockAppApi(page, "developer");
    await signInAs(page, "developer");

    await page.goto("/developer/dashboard");
    await expect(page.getByRole("button", { name: "Discover" })).toBeVisible();
    await expect(page.getByText("Top Blueprint Matches")).toBeVisible();
    await expect(page.getByText("Clinic Workflow AI")).toBeVisible();

    await page.goto("/developer/discover");
    await expect(page).toHaveURL(/\/developer\/discover$/);
    await expect(page.getByRole("heading", { name: "Discover Opportunities" })).toBeVisible();
  });
});
