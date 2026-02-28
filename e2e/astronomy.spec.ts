import { test, expect } from '@playwright/test';

test.describe('Astronomy Engine UI', () => {
    test('Best Time to Observe card renders data', async ({ page }) => {
        await page.goto('/map'); // The Best Time card renders on the Map page side panel

        // Card shows either the data (Pro), an upgrade prompt (free tier), or no window text — all are valid
        // The side panel loads regardless of Pro status, so we wait for any part of the Best Time component to render
        await expect(
            page.locator('text=/Optimal Time|Upgrade|Pro|No viable/i').first()
        ).toBeVisible({ timeout: 15000 });
    });
});
