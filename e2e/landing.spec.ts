import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Vover/);
  });

  test("hero section: Stop scrolling text visible", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /stop scrolling/i })
    ).toBeVisible();
  });

  test("hero section: Start watching text visible", async ({ page }) => {
    await expect(page.getByText(/start watching/i)).toBeVisible();
  });

  test("navbar has logo", async ({ page }) => {
    // The logo link has accessible name "V over" (V div + "over" span)
    await expect(
      page.locator("header").getByRole("link", { name: "V over" })
    ).toBeVisible();
  });

  test("navbar has Discover link", async ({ page }) => {
    await expect(
      page.locator("header nav").getByRole("link", { name: /discover/i })
    ).toBeVisible();
  });

  test("navbar has Feed link", async ({ page }) => {
    await expect(
      page.locator("header nav").getByRole("link", { name: /feed/i })
    ).toBeVisible();
  });

  test("navbar has Stats link", async ({ page }) => {
    await expect(
      page.locator("header nav").getByRole("link", { name: /stats/i })
    ).toBeVisible();
  });

  test("Get Started Free CTA button visible and links to /auth", async ({
    page,
  }) => {
    const cta = page.getByRole("link", { name: /get started free/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/auth");
  });

  test("Sign In button visible and links to /auth", async ({ page }) => {
    // The hero has a "Sign In" outline button next to Get Started Free
    const signIn = page.getByRole("link", { name: /^sign in$/i }).first();
    await expect(signIn).toBeVisible();
    await expect(signIn).toHaveAttribute("href", "/auth");
  });

  test("Trending section shows at least 1 movie card with poster image", async ({
    page,
  }) => {
    // Movie cards are anchor tags linking to /movie/ or /tv/ — allow time for server render
    const cards = page.locator('a[href^="/movie/"], a[href^="/tv/"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    // Each card has a poster img
    const poster = cards.first().locator("img");
    await expect(poster).toBeVisible();
  });

  test("Features section heading visible", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: /everything for better movie nights/i,
      })
    ).toBeVisible();
  });

  test("How Vover works section with 3 steps", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /how vover works/i })
    ).toBeVisible();
    // Three steps are rendered as step items — each has a step number badge
    await expect(page.getByText("Search & Save")).toBeVisible();
    await expect(page.getByText("Connect Friends")).toBeVisible();
    await expect(page.getByText("Get Recommendations")).toBeVisible();
  });

  test("Footer has Explore section", async ({ page }) => {
    await expect(page.getByText(/explore/i).last()).toBeVisible();
  });

  test("Footer has Account section", async ({ page }) => {
    await expect(page.getByText(/account/i).last()).toBeVisible();
  });

  test("Footer has Company section", async ({ page }) => {
    await expect(page.getByText(/company/i)).toBeVisible();
  });

  test("Footer Company links are real links", async ({ page }) => {
    const footer = page.locator("footer");
    const aboutLink = footer.getByRole("link", { name: /about/i });
    const privacyLink = footer.getByRole("link", { name: /privacy/i });
    const termsLink = footer.getByRole("link", { name: /terms/i });

    await expect(aboutLink).toBeVisible();
    await expect(privacyLink).toBeVisible();
    await expect(termsLink).toBeVisible();

    await expect(aboutLink).toHaveAttribute("href", "/about");
    await expect(privacyLink).toHaveAttribute("href", "/privacy");
    await expect(termsLink).toHaveAttribute("href", "/terms");
  });

  test("TMDB attribution visible in footer", async ({ page }) => {
    await expect(
      page.locator("footer").getByText(/tmdb/i)
    ).toBeVisible();
  });

  test("Mobile: hamburger menu appears at mobile viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const hamburger = page.getByRole("button", { name: /open menu/i });
    await expect(hamburger).toBeVisible();
  });
});
