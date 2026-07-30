import { expect, test } from "@playwright/test";
import { mockAppApi, signInAs } from "./fixtures";

test.describe("Protected route automation", () => {
  test("TC-AUTH-035: signed-out user is redirected from founder and developer routes", async ({
    page,
  }) => {
    await page.goto("/founder/dashboard");
    await expect(page).toHaveURL(/\/sign-in$/);

    await page.goto("/developer/dashboard");
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test("TC-AUTH-036: founder is blocked from developer routes", async ({ page }) => {
    await mockAppApi(page, "founder");
    await signInAs(page, "founder");

    await page.goto("/developer/dashboard");
    await expect(page).toHaveURL(/\/founder\/dashboard$/);
  });

  test("TC-AUTH-037: developer is blocked from founder routes", async ({ page }) => {
    await mockAppApi(page, "developer");
    await signInAs(page, "developer");

    await page.goto("/founder/dashboard");
    await expect(page).toHaveURL(/\/developer\/dashboard$/);
  });
});
