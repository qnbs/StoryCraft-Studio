/**
 * E2E: Global AI Copilot — smoke tests with enableGlobalCopilot flag explicitly seeded.
 *
 * QNBS-v3: Flag is on by default, but seeding it here makes intent explicit and guards against
 * future default changes (feature-flag coverage illusion). Tests only the UI scaffold (launcher
 * visible, panel opens/focus-traps, empty state, off-state hidden); no AI calls are made.
 */
import { expect, test } from '@playwright/test';

import { selectEnglish, setFeatureFlags, waitForSpaReady } from './helpers';

const isCI = process.env['CI'] === 'true';

test.describe('Global AI Copilot (feature-flag explicit)', () => {
  test('launcher visible and panel opens when enabled', async ({ page }) => {
    test.skip(!isCI, 'CI-only E2E suite');
    await setFeatureFlags(page, { enableGlobalCopilot: true });
    await page.goto('/');
    await waitForSpaReady(page);
    await selectEnglish(page);

    const launcher = page.getByRole('button', { name: /Open AI Copilot/i });
    await expect(launcher).toBeVisible({ timeout: 10000 });
    await expect(launcher).toHaveAttribute('aria-expanded', 'false');

    await launcher.click();

    const dialog = page.getByRole('dialog', { name: /AI Copilot/i });
    await expect(dialog).toBeVisible();
    // Empty-state greeting + composer present.
    await expect(dialog.getByText(/I'm your Copilot/i)).toBeVisible();
    await expect(dialog.getByRole('button', { name: /^Send$/i })).toBeVisible();

    // Close restores the launcher.
    await dialog.getByRole('button', { name: /Close AI Copilot/i }).click();
    await expect(launcher).toBeVisible();
  });

  test('launcher hidden when disabled', async ({ page }) => {
    test.skip(!isCI, 'CI-only E2E suite');
    await setFeatureFlags(page, { enableGlobalCopilot: false });
    await page.goto('/');
    await waitForSpaReady(page);
    await selectEnglish(page);

    await expect(page.getByRole('button', { name: /Open AI Copilot/i })).toHaveCount(0);
  });
});
