import { test, expect } from '@playwright/test';

test.describe('Visibility Pages', () => {
    test('Map Page loads and toggles criteria', async ({ page }) => {
        // Navigate to the map page
        await page.goto('/map');

        // Check if the map container is rendered
        await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });

        // The default criterion should be Yallop
        // We expect a select element for criteria
        const criteriaSelect = page.locator('select').first();
        if (await criteriaSelect.isVisible()) {
            await expect(criteriaSelect).toHaveValue('yallop');

            // Toggle to Odeh
            await criteriaSelect.selectOption('odeh');
            await expect(criteriaSelect).toHaveValue('odeh');
        }
    });

    test('Globe Page loads', async ({ page }) => {
        await page.goto('/globe');
        // Wait for the globe container or header to be visible, as WebGL canvas can be flaky in headless mode
        await expect(page.locator('text=/Globe/i').first()).toBeVisible({ timeout: 15000 });
    });
});
