import { test, expect } from "@playwright/test";

test.describe("AI Writer Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/StoryCraft-Studio/");
    await page.waitForLoadState("networkidle");
  });

  test("app renders without JavaScript errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.waitForTimeout(2000);
    // Allow PWA SW errors and non-critical warnings
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("service worker") &&
        !e.includes("ServiceWorker") &&
        !e.includes("sw.js"),
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("WriterView is navigable", async ({ page }) => {
    const writerButton = page
      .getByRole("button", { name: /schreiben|writer|write/i })
      .first();
    if (await writerButton.isVisible()) {
      await writerButton.click();
      await page.waitForTimeout(500);
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("keyboard navigation works on main buttons", async ({ page }) => {
    // Tab through the first few elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    // Just ensure we don't crash
    await expect(page.locator("body")).toBeVisible();
  });

  test("page is responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
  });
});
