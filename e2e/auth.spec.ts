import { test, expect } from "@playwright/test";

test.describe("Auth Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
  });

  test("auth page loads at /auth", async ({ page }) => {
    await expect(page).toHaveURL(/\/auth/);
  });

  test("shows Sign in to Vover heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /sign in to vover/i })
    ).toBeVisible();
  });

  test("email input with placeholder visible", async ({ page }) => {
    const emailInput = page.getByRole("textbox", { name: /email/i });
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("placeholder", "your@email.com");
  });

  test("Send Magic Link button visible and disabled when email empty", async ({
    page,
  }) => {
    const btn = page.getByRole("button", { name: /send magic link/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
  });

  test("Send Magic Link button enabled when email entered", async ({
    page,
  }) => {
    await page.getByRole("textbox", { name: /email/i }).fill("test@example.com");
    const btn = page.getByRole("button", { name: /send magic link/i });
    await expect(btn).toBeEnabled();
  });

  test("shows perks list: Friend recommendations", async ({ page }) => {
    await expect(page.getByText(/friend recommendations/i)).toBeVisible();
  });

  test("shows perks list: Personal watchlist", async ({ page }) => {
    await expect(page.getByText(/personal watchlist/i)).toBeVisible();
  });

  test("shows perks list: See what friends watch", async ({ page }) => {
    await expect(page.getByText(/see what friends watch/i)).toBeVisible();
  });

  test("Terms of service link present and links to /terms", async ({
    page,
  }) => {
    const termsLink = page.getByRole("link", { name: /terms of service/i });
    await expect(termsLink).toBeVisible();
    await expect(termsLink).toHaveAttribute("href", "/terms");
  });

  test("New here text visible", async ({ page }) => {
    await expect(page.getByText(/new here/i)).toBeVisible();
  });

  test("loading spinner appears on submit (mocked API)", async ({ page }) => {
    // Mock the NextAuth signIn endpoint to delay so we can catch loading state
    await page.route("**/api/auth/signin/resend", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({ status: 200, body: JSON.stringify({ url: "/" }) });
    });

    await page.getByRole("textbox", { name: /email/i }).fill("test@example.com");
    await page.getByRole("button", { name: /send magic link/i }).click();

    // Spinner appears while loading
    await expect(page.locator(".animate-spin")).toBeVisible({ timeout: 3000 });
  });

  test("no Sign In nav button shown on auth page", async ({ page }) => {
    // The navbar hides the Sign In button when on /auth
    const header = page.locator("header");
    await expect(
      header.getByRole("link", { name: /^sign in$/i })
    ).not.toBeVisible();
  });

  test("accessibility: email input has associated label (sr-only)", async ({
    page,
  }) => {
    const label = page.locator("label[for='email']");
    await expect(label).toBeAttached();
    const emailInput = page.locator("#email");
    await expect(emailInput).toBeVisible();
  });
});
