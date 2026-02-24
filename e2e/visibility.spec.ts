import { test, expect } from '@playwright/test';

test.describe('Visibility Pages', () => {
    test('Map Page loads and toggles criteria', async ({ page }) => {
        // Navigate to the map page
        await page.goto('/map');

        // Check if the map container is rendered
        await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });

        // The default criterion should be Yallop
        // We expect some text or a toggle button related to criteria
        const criteriaToggle = page.locator('button', { hasText: /Yallop|Odeh/i }).first();
        if (await criteriaToggle.isVisible()) {
            await expect(criteriaToggle).toContainText(/Yallop/i);

            // Toggle to Odeh
            await criteriaToggle.click();
            await expect(criteriaToggle).toContainText(/Odeh/i);
        }
    });

    test('Globe Page loads', async ({ page }) => {
        await page.goto('/globe');
        // Wait for the globe container
        await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15000 });
    });
});
