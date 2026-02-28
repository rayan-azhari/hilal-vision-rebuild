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

        // The archive page renders ICOP historical sighting data.
        // "Seen" and "Not Seen" are the only two result values in the ICOP dataset.
        await expect(
            page.locator("text=/Seen|Not Seen/i").first()
        ).toBeVisible({ timeout: 15000 });
    });
});
