/**
 * E2E: LoRA Fine-Tuning view + training wizard.
 * QNBS-v3: CI-only. v1.20 Phase 2.2 — the view is routed in App.tsx + sidebar nav behind
 *          `enableLoraAdapters`. The flag is seeded via localStorage (robust) instead of
 *          clicking through Settings. Training uses the web fallback (no Tauri / Python).
 */

import { expect, test } from '@playwright/test';

import { clickNavItem, ensureBlankProject, selectEnglish, waitForSpaReady } from './helpers';

const isCI = process.env['CI'] === 'true';

/** Open the LoRA view and dismiss the first-visit onboarding panel so CTAs are reachable. */
async function openLora(page: import('@playwright/test').Page): Promise<void> {
  await clickNavItem(page, /LoRA|Fine.?Tun/i);
  const getStarted = page.getByRole('button', { name: /Get Started/i });
  if (await getStarted.isVisible({ timeout: 2000 }).catch(() => false)) {
    await getStarted.click();
  }
}

test.describe('LoRA Wizard (CI-only)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isCI, 'CI-only E2E suite');
    // QNBS-v3: seed the feature flag before app scripts run — loadFeatureFlagsState() merges this
    //          partial over defaults, so the LoRA route + sidebar entry are active on first render.
    await page.addInitScript(() => {
      try {
        localStorage.setItem(
          'storycraft-feature-flags',
          JSON.stringify({ enableLoraAdapters: true }),
        );
      } catch {
        /* storage unavailable */
      }
    });
    await page.goto('/');
    await waitForSpaReady(page);
    await selectEnglish(page);
    // Without an open project #sidebar is not rendered, so nav would be unreachable.
    await ensureBlankProject(page);
  });

  test('LoRA entry appears in the sidebar when the flag is enabled', async ({ page }) => {
    const loraNav = page.locator('#sidebar').getByRole('button', { name: /LoRA|Fine.?Tun/i });
    await expect(loraNav).toBeVisible({ timeout: 8000 });
  });

  test('Adapter Library shows the empty state with a Train CTA on first visit', async ({
    page,
  }) => {
    await openLora(page);
    await expect(page.getByRole('heading', { name: /LoRA Fine-Tuning/i })).toBeVisible({
      timeout: 8000,
    });
    await expect(page.getByText(/no adapters yet/i)).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: /Train Your First Adapter/i })).toBeVisible();
  });

  test('Onboarding shows the environment check on first open', async ({ page }) => {
    await clickNavItem(page, /LoRA|Fine.?Tun/i);
    await expect(
      page.getByText(/System Requirements|Train Your Writing Style/i).first(),
    ).toBeVisible({ timeout: 8000 });
  });

  test('Wizard opens and shows the Model step', async ({ page }) => {
    await openLora(page);
    await page.getByRole('button', { name: /Train Your First Adapter|Train New Adapter/i }).click();
    // Step indicator (nav aria-label = "Training steps") + at least one model radio.
    await expect(page.getByRole('navigation', { name: /Training steps/i })).toBeVisible({
      timeout: 8000,
    });
    await expect(page.getByRole('radio').first()).toBeVisible();
  });

  test('Wizard advances model → dataset and back', async ({ page }) => {
    await openLora(page);
    await page.getByRole('button', { name: /Train Your First Adapter|Train New Adapter/i }).click();

    // Model step: pick a base model so Next is enabled.
    await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: /^Next$/i }).click();

    // Dataset step shows the extract instruction.
    await expect(page.getByText(/Extract your manuscript|training data/i)).toBeVisible({
      timeout: 8000,
    });

    // Back returns to the Model step (radios visible again).
    await page.getByRole('button', { name: /^Back$/i }).click();
    await expect(page.getByRole('radio').first()).toBeVisible();
  });

  test('Sub-nav switches to the Dataset Builder', async ({ page }) => {
    await openLora(page);
    await page.getByRole('button', { name: /^Dataset Builder$/i }).click();
    await expect(page.getByRole('button', { name: /Extract|Build Dataset/i })).toBeVisible({
      timeout: 8000,
    });
  });
});
