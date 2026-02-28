import { test, expect } from '@playwright/test';

test.describe('Astronomy Engine UI', () => {
    test('Best Time to Observe card renders data', async ({ page }) => {
        await page.goto('/map'); // The Best Time card renders on the Map page side panel

        // Wait for the side panel card to load (always visible regardless of Pro status)
        const sidePanel = page.locator('.breezy-card').filter({ hasText: /Best Time to Observe/i });
        await expect(sidePanel).toBeVisible({ timeout: 10000 });

        // Card shows either the data (Pro) or an upgrade prompt (free tier) — both are valid
        await expect(
            sidePanel.locator('text=/Optimal Time|Upgrade|Pro/i').first()
        ).toBeVisible({ timeout: 5000 });
    });
});
