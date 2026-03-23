import { test, expect } from "@playwright/test";

test.describe("Visual / Theme", () => {
  test("CSS loads properly — muted-foreground color is not browser default", async ({
    page,
  }) => {
    await page.goto("/");

    // Check that muted text has custom color (not default browser black)
    const mutedEl = page.locator(".text-muted-foreground").first();
    await expect(mutedEl).toBeVisible({ timeout: 8000 });

    const color = await mutedEl.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Default browser text color is rgb(0, 0, 0). A styled element should differ.
    expect(color).not.toBe("rgb(0, 0, 0)");
    // Ensure color is not empty
    expect(color).not.toBe("");
  });

  test("Dark theme applied — background color is dark", async ({ page }) => {
    await page.goto("/");

    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).backgroundColor;
    });

    // Parse RGB values — background should be dark (low brightness)
    const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      const brightness = (r + g + b) / 3;
      // Dark theme: brightness should be below 50 (out of 255)
      expect(brightness).toBeLessThan(50);
    } else {
      // Fallback: if rgba or transparent, just check the body
      const bodyBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      expect(bodyBg).not.toBe("rgba(0, 0, 0, 0)");
    }
  });

  test("Primary accent color is teal/green", async ({ page }) => {
    await page.goto("/");

    // Primary color elements (button with bg-primary class)
    const primaryEl = page.locator(".bg-primary").first();
    await expect(primaryEl).toBeVisible({ timeout: 8000 });

    const color = await primaryEl.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Vover primary is hsl(164 84% 40%) ≈ rgb(18, 184, 120) — a teal-green
    // Check that green channel is dominant over red
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [, r, g] = match.map(Number);
      // Teal-green: green channel should be significantly higher than red
      expect(g).toBeGreaterThan(r);
      // Green value should be substantial (not zero)
      expect(g).toBeGreaterThan(80);
    }
  });
});
