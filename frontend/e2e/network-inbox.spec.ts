import { expect, test } from "@playwright/test";

import {
  completeDeveloperProfile,
  conversation,
  inbox,
  mockAppApi,
  signInAs,
  userSummary,
  usersList,
  verifiedAccount,
} from "./fixtures";
import { annotate, tags } from "./test-metadata";

const casey = userSummary({
  id: "user-casey",
  first_name: "Casey",
  last_name: "Coder",
  role: "developer",
  job_title: "Backend Developer",
});

const fiona = userSummary({
  id: "user-fiona",
  first_name: "Fiona",
  last_name: "Founder",
  role: "founder",
  job_title: "Founder",
  email: "fiona.founder@example.com",
});

test.describe("Network and public profiles", () => {
  test(
    "TC-NET-001 | The directory renders other users and excludes the signed-in user",
    { tag: tags("network", "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-NET-001",
        priority: "P1",
        type: "Functional",
        area: "Network & Profiles / Network",
        objective:
          "The directory lists other users and not the caller. Note: the API does include the caller — the client filters it out (see BUG-2).",
      });

      await test.step("Given the directory contains two other users", async () => {
        await mockAppApi(page, "developer", { "/users": usersList([casey, fiona]) });
        await signInAs(page, "developer");
      });

      await test.step("When the Network page is opened", async () => {
        await page.goto("/developer/network");
      });

      await test.step("Then both other users are shown", async () => {
        await expect(page.getByText("Casey Coder").first()).toBeVisible();
        await expect(page.getByText("Fiona Founder").first()).toBeVisible();
      });

      await test.step("And the signed-in developer does not appear in their own results", async () => {
        await expect(page.getByRole("main").getByText("Devon Developer")).toHaveCount(0);
      });
    }
  );

  test(
    "TC-NET-002 | Searching the directory filters the suggested cards",
    { tag: tags("network", "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-NET-002",
        priority: "P1",
        type: "Functional",
        area: "Network & Profiles / Network",
        objective: "The directory search narrows suggestions to matching people.",
      });

      await test.step("Given the Network page lists two people", async () => {
        await mockAppApi(page, "developer", { "/users": usersList([casey, fiona]) });
        await signInAs(page, "developer");
        await page.goto("/developer/network");
        await expect(page.getByText("Fiona Founder").first()).toBeVisible();
      });

      await test.step('When the developer searches for "Casey"', async () => {
        await page.getByPlaceholder("Search by name, role, company or skills...").fill("Casey");
      });

      await test.step("Then only the matching person remains", async () => {
        await expect(page.getByText("Casey Coder").first()).toBeVisible();
        await expect(page.getByText("Fiona Founder")).toHaveCount(0);
      });
    }
  );

  test(
    "TC-NET-019 | A directory search matching nothing shows the empty state",
    { tag: tags("network", "P2", "Negative") },
    async ({ page }) => {
      annotate({
        id: "TC-NET-019",
        priority: "P2",
        type: "Negative",
        area: "Network & Profiles / Network",
        objective: "A zero-result search shows guidance instead of a blank list.",
      });

      await test.step("Given the Network page is loaded", async () => {
        await mockAppApi(page, "developer", { "/users": usersList([casey, fiona]) });
        await signInAs(page, "developer");
        await page.goto("/developer/network");
      });

      await test.step("When the developer searches for a term nobody matches", async () => {
        await page
          .getByPlaceholder("Search by name, role, company or skills...")
          .fill("nobody matches this text");
      });

      await test.step("Then the empty state is shown", async () => {
        await expect(page.getByText(/No results found/i)).toBeVisible();
      });
    }
  );
});

test.describe("Inbox and messaging", () => {
  test(
    "TC-INBOX-001 | The inbox renders General, Unread, Requests and Pending tabs",
    { tag: tags("inbox", "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-INBOX-001",
        priority: "P1",
        type: "Functional",
        area: "Inbox & Messaging / Inbox",
        objective: "All four inbox tabs render from a single /messages/inbox response.",
      });

      await test.step("Given the inbox has a conversation, a request and a pending thread", async () => {
        await mockAppApi(page, "developer", {
          "/messages/inbox": inbox(
            [conversation({ id: "conv-general" })],
            [conversation({ id: "conv-request", status: "pending" })],
            [conversation({ id: "conv-pending", status: "pending" })]
          ),
        });
        await signInAs(page, "developer");
      });

      await test.step("When the Inbox page is opened", async () => {
        await page.goto("/developer/inbox");
      });

      await test.step("Then all four tabs are visible", async () => {
        await expect(page.getByRole("button", { name: /^General/ })).toBeVisible();
        await expect(page.getByRole("button", { name: /^Unread/ })).toBeVisible();
        await expect(page.getByRole("button", { name: /^Requests/ })).toBeVisible();
        await expect(page.getByRole("button", { name: /^Pending/ })).toBeVisible();
      });
    }
  );

  test(
    "TC-INBOX-011 | Compose opens the new message modal",
    { tag: tags("inbox", "P1", "Functional") },
    async ({ page }) => {
      annotate({
        id: "TC-INBOX-011",
        priority: "P1",
        type: "Functional",
        area: "Inbox & Messaging / Compose",
        objective: "Compose opens a modal with recipient and message fields.",
      });

      // Compose is profile-gated (TC-INBOX-019), so this case needs an account
      // that clears the completion check — otherwise the prompt opens, not the modal.
      await test.step("Given a profile-complete developer with an empty inbox", async () => {
        await mockAppApi(page, "developer", {
          "/messages/inbox": inbox(),
          "/me": verifiedAccount("developer"),
          "/developer-profile": completeDeveloperProfile(),
        });
        await signInAs(page, "developer");
        await page.goto("/developer/inbox");
      });

      await test.step("When Compose is clicked", async () => {
        await page.getByRole("button", { name: "Compose" }).click();
      });

      // Scoped to the heading so the assertion waits for the modal to mount
      // rather than matching the word elsewhere on the page.
      await test.step("Then the New Message modal and its fields are shown", async () => {
        await expect(page.getByRole("heading", { name: "New Message" })).toBeVisible();
        await expect(page.getByPlaceholder("Recipient email...")).toBeVisible();
        await expect(page.getByPlaceholder("Write your message...")).toBeVisible();
      });
    }
  );
});
