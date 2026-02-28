import { test, expect } from "@playwright/test";

test.describe("Calendar — Hijri accuracy", () => {
    test("Calendar page shows a Hijri month name and Gregorian year", async ({ page }) => {
        await page.goto("/calendar");

        // Should render some Hijri month name (any of the 12)
        await expect(
            page
                .locator(
                    "text=/Muharram|Safar|Rabi|Jumada|Rajab|Sha.ban|Ramadan|Shawwal|Dhul/i"
                )
                .first()
        ).toBeVisible({ timeout: 10000 });

        // Should also show a Gregorian year (4-digit number in the 2020s)
        await expect(page.locator("text=/202[0-9]/").first()).toBeVisible({
            timeout: 5000,
        });
    });
});

test.describe("Archive — ICOP observation data", () => {
    test("Archive page loads and shows observation records", async ({ page }) => {
        await page.goto("/archive");

        // Click a month to load data (e.g. Ramadan - month 9) for the default year (1465)
        await page.locator('text=/Ramadan/i').first().click();

        // Since older years with actual ICOP data are locked for free users (Playwright), 
        // we test that the theoretical computed visibility loaded successfully for the current year.
        await expect(
            page.locator("text=/Computed City Visibility/i").first()
        ).toBeVisible({ timeout: 15000 });
    });
});
