import { expect, test } from "@playwright/test";
import {
  mockAppApi,
  mockInvalidCredentials,
  mockLocationApis,
  mockSignupStart,
  signInAs,
} from "./fixtures";

async function submitSignIn(page: import("@playwright/test").Page) {
  await page
    .locator("form button[type='submit']")
    .evaluate((button) => (button as HTMLButtonElement).click());
}

async function openHydratedSignIn(page: import("@playwright/test").Page) {
  await page.goto("/sign-in");
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  await page.waitForTimeout(500);
}

async function chooseSignupRole(page: import("@playwright/test").Page, role: "Founder" | "Developer") {
  await page.goto("/sign-up");
  await page.getByRole("button", { name: new RegExp(`^${role} I want`, "i") }).click();
  await page.getByRole("button", { name: /^Continue$/i }).click();
}

function accountField(page: import("@playwright/test").Page, placeholder: string | RegExp) {
  return page.getByPlaceholder(placeholder);
}

function accountDropdown(page: import("@playwright/test").Page, name: string | RegExp) {
  return page.getByRole("button", { name, exact: typeof name === "string" });
}

async function fillValidFounderAccount(page: import("@playwright/test").Page) {
  await page.getByLabel("First name").fill("Fiona");
  await page.getByLabel("Last name").fill("Founder");
  await accountField(page, "you@example.com").fill("founder.e2e@example.com");
  await accountField(page, "Confirm email").fill("founder.e2e@example.com");
  await accountField(page, "Minimum 8 characters").fill("StrongPass123");
  await accountField(page, "Confirm password").fill("StrongPass123");

  await accountDropdown(page, "Select country").click();
  await page.getByPlaceholder("Search country").fill("Pakistan");
  await page.getByRole("button", { name: /^Pakistan/i }).click();

  await accountDropdown(page, "Select state / province").click();
  await page.getByPlaceholder("Search state / province").fill("Sindh");
  await page.getByRole("button", { name: /^Sindh$/i }).click();

  await accountDropdown(page, "Select city").click();
  await page.getByPlaceholder("Search city").fill("Karachi");
  await page.getByRole("button", { name: /^Karachi$/i }).click();

  await page.getByPlaceholder("300 0000000").fill("3001234567");
  await page.getByLabel("Date of birth").fill("2000-01-01");
  await page.getByRole("checkbox").check();
}

test.describe("Authentication and signup automation", () => {
  test("TC-AUTH-001: sign-in form renders required controls", async ({ page }) => {
    await openHydratedSignIn(page);

    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByText("Keep me signed in")).toBeVisible();
    await expect(page.getByRole("link", { name: /Forgot password/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Create an account/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Continue with Google/i })).toBeVisible();
  });

  test("TC-AUTH-002 and TC-AUTH-003: sign-in validation blocks empty and invalid input", async ({
    page,
  }) => {
    await openHydratedSignIn(page);

    await submitSignIn(page);
    await expect(page.getByText("Please fill in all fields.")).toBeVisible();

    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("StrongPass123");
    await submitSignIn(page);

    const emailValidity = await page
      .getByLabel("Email")
      .evaluate((input) => (input as HTMLInputElement).validity.valid);
    expect(emailValidity).toBe(false);
  });

  test("TC-AUTH-004: invalid credentials keep the user on sign-in", async ({ page }) => {
    await mockInvalidCredentials(page);
    await openHydratedSignIn(page);

    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("WrongPass123");
    await submitSignIn(page);

    await expect(page.getByText("Invalid email or password.")).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test("TC-AUTH-005: founder session opens founder dashboard", async ({ page }) => {
    await mockAppApi(page, "founder");
    await signInAs(page, "founder");
    await page.goto("/founder/dashboard");

    await expect(page).toHaveURL(/\/founder\/dashboard$/);
    await expect(page.getByRole("button", { name: "Dashboard" })).toBeVisible();
  });

  test("TC-AUTH-006: developer session opens developer dashboard", async ({ page }) => {
    await mockAppApi(page, "developer");
    await signInAs(page, "developer");
    await page.goto("/developer/dashboard");

    await expect(page).toHaveURL(/\/developer\/dashboard$/);
    await expect(page.getByRole("button", { name: "Discover" })).toBeVisible();
  });

  test("TC-AUTH-009 and TC-AUTH-010: sign-in links route to signup and forgot password", async ({
    page,
  }) => {
    await page.goto("/sign-in");

    await page.locator('a[href="/sign-up"]').last().click();
    await expect(page).toHaveURL(/\/sign-up$/);

    await page.goto("/sign-in");
    await page.locator('a[href="/forgot-password"]').click();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test("TC-AUTH-012 to TC-AUTH-014: signup role validation and role preservation", async ({
    page,
  }) => {
    await mockLocationApis(page);
    await page.goto("/sign-up");

    await page.getByRole("button", { name: /^Continue$/i }).click();
    await expect(
      page.getByText("Choose whether you are joining as a founder or developer.")
    ).toBeVisible();

    await page.getByRole("button", { name: /^Founder I want/i }).click();
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await expect(page.getByRole("heading", { name: /Create your login/i })).toBeVisible();

    await page.getByRole("button", { name: /^Back$/i }).click();
    await page.getByRole("button", { name: /^Developer I want/i }).click();
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await expect(page.getByRole("heading", { name: /Create your login/i })).toBeVisible();
  });

  test("TC-AUTH-015 to TC-AUTH-018 and TC-AUTH-020: signup account validation", async ({
    page,
  }) => {
    await mockLocationApis(page);
    await chooseSignupRole(page, "Founder");

    await page.getByRole("button", { name: /^Continue$/i }).click();
    await expect(page.getByText(/Please complete First name/i)).toBeVisible();

    await page.getByLabel("First name").fill("Fiona");
    await page.getByLabel("Last name").fill("Founder");
    await accountField(page, "you@example.com").fill("founder@example.com");
    await accountField(page, "Confirm email").fill("other@example.com");
    await accountField(page, "Minimum 8 characters").fill("weak");
    await accountField(page, "Confirm password").fill("different");
    await page.getByRole("button", { name: /^Continue$/i }).click();

    await expect(page.getByText(/fix Confirm email, Password, and Confirm password/i)).toBeVisible();
    await expect(page.getByText("Confirm email must match email.")).toBeVisible();
    await expect(page.getByText("Password must be at least 8 characters.")).toBeVisible();
    await expect(page.getByText("Confirm password must match password.")).toBeVisible();
  });

  test("TC-AUTH-019: country changes reset dependent state and city dropdowns", async ({ page }) => {
    await mockLocationApis(page);
    await chooseSignupRole(page, "Founder");

    await accountDropdown(page, "Select country").click();
    await page.getByPlaceholder("Search country").fill("Pakistan");
    await page.getByRole("button", { name: /^Pakistan/i }).click();

    await accountDropdown(page, "Select state / province").click();
    await page.getByPlaceholder("Search state / province").fill("Sindh");
    await page.getByRole("button", { name: /^Sindh$/i }).click();

    await accountDropdown(page, "Select city").click();
    await page.getByPlaceholder("Search city").fill("Karachi");
    await page.getByRole("button", { name: /^Karachi$/i }).click();

    await accountDropdown(page, "Pakistan").click();
    await page.getByPlaceholder("Search country").fill("United States");
    await page.getByRole("button", { name: /^United States/i }).click();

    await expect(accountDropdown(page, "Select state / province")).toBeVisible();
    await expect(accountDropdown(page, "Choose state first")).toBeDisabled();
    await expect(accountDropdown(page, "Select country code")).toContainText("+1");
  });

  test("TC-AUTH-022 to TC-AUTH-024: valid signup opens OTP and enforces numeric 6-digit input", async ({
    page,
  }) => {
    await mockLocationApis(page);
    await mockSignupStart(page);
    await chooseSignupRole(page, "Founder");
    await fillValidFounderAccount(page);

    await page.getByRole("button", { name: /^Continue$/i }).click();
    await expect(page.getByRole("heading", { name: /Verify your email/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Resend in/i })).toBeDisabled();

    const otp = page.getByLabel("6-digit verification code");
    await otp.fill("12ab34!5678");
    await expect(otp).toHaveValue("1234");

    await otp.fill("1234567890");
    await expect(otp).toHaveValue("123456");

    await otp.fill("12345");
    await expect(page.getByRole("button", { name: /Verify & create account/i })).toBeDisabled();
  });

  test("TC-AUTH-031: forgot password validates empty and invalid email", async ({ page }) => {
    await page.goto("/forgot-password");

    await page.getByRole("button", { name: /Send reset code/i }).click();
    await expect(page.getByText("Please enter your email address.")).toBeVisible();

    await page.getByLabel("Email").fill("bad-email");
    await page.getByRole("button", { name: /Send reset code/i }).click();

    const emailValidity = await page
      .getByLabel("Email")
      .evaluate((input) => (input as HTMLInputElement).validity.valid);
    expect(emailValidity).toBe(false);
  });
});
