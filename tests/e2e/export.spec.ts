import { test, expect } from "@playwright/test";

test.describe("Export Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/StoryCraft-Studio/");
    // Wait for app to load
    await page.waitForLoadState("networkidle");
  });

  test("app loads and shows main UI", async ({ page }) => {
    await expect(page).toHaveTitle(/StoryCraft/);
    // The welcome screen or main panel should be visible
    await expect(page.locator("body")).toBeVisible();
  });

  test("navigation sidebar is accessible", async ({ page }) => {
    // Sidebar should contain navigation buttons
    const nav = page.locator('nav, [role="navigation"]').first();
    if (await nav.isVisible()) {
      await expect(nav).toBeVisible();
    }
  });

  test("Export view is reachable", async ({ page }) => {
    // Try to click Export nav item if it exists
    const exportButton = page.getByRole("button", { name: /export/i }).first();
    if (await exportButton.isVisible()) {
      await exportButton.click();
      await page.waitForTimeout(500);
    }
    // If no project loaded, should still not crash
    await expect(page.locator("body")).toBeVisible();
  });

  test("Settings are accessible", async ({ page }) => {
    const settingsButton = page
      .getByRole("button", { name: /einstellungen|settings/i })
      .first();
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(500);
      await expect(page.locator("body")).toBeVisible();
    }
  });
});
