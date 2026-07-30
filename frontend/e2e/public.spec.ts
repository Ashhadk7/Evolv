import { expect, test } from "@playwright/test";

test.describe("Public website automation", () => {
  test("TC-PUB-001: home page renders hero and primary CTAs", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("navigation").getByRole("link", { name: /Evolv home/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Get started free/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Sign in/i })).toBeVisible();
  });

  test("TC-PUB-002 and TC-PUB-006: public navigation routes and browser history work", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator('nav a[href="/about"]').first()).toBeVisible();

    await page.goto("/about");
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole("heading", { name: /Turning startup ideas/i })).toBeVisible();

    const publicNav = page.locator("nav").first();
    await publicNav.locator('a[href="/our-team"]').click();
    await expect(page).toHaveURL(/\/our-team$/);
    await expect(page.getByRole("heading", { name: /The people building/i })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/about$/);

    await page.goForward();
    await expect(page).toHaveURL(/\/our-team$/);
  });

  test("TC-PUB-003: about page renders the shared public layout", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByText("About Evolv")).toBeVisible();
    await expect(page.getByRole("link", { name: /Start building/i })).toBeVisible();
  });

  test("TC-PUB-004: team page renders member profiles and images", async ({ page }) => {
    await page.goto("/our-team");

    await expect(page.getByText("Eman Butt")).toBeVisible();
    await expect(page.getByText("M. Ashhad Khan")).toBeVisible();
    await expect(page.getByText("Laiba Kanwal")).toBeVisible();
    await expect(page.getByText("Ammad Qaiser")).toBeVisible();
    await expect(page.getByRole("img", { name: /Eman Butt profile photo/i })).toBeVisible();
  });
});
