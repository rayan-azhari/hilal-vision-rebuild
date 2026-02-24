import { test, expect } from '@playwright/test';

test.describe('Astronomy Engine UI', () => {
    test('Best Time to Observe card renders data', async ({ page }) => {
        await page.goto('/map'); // The Best Time card renders on the Map page side panel

        // Wait for the side panel to load
        const sidePanel = page.locator('.breezy-card').filter({ hasText: /Best Time to Observe/i });
        await expect(sidePanel).toBeVisible({ timeout: 10000 });

        // Check if the optimal time is displayed
        await expect(sidePanel.getByText(/Optimal Time/i)).toBeVisible();
    });
});
