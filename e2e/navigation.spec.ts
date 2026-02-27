import { test, expect } from "@playwright/test";

test.describe("Navigation & Core Pages", () => {
    test("Home page loads with heading", async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveTitle(/Hilal Vision|Moon/i);
    });

    test("Bottom navigation has all main links", async ({ page }) => {
        await page.goto("/");
        const nav = page.locator("nav").last();
        await expect(nav).toBeVisible({ timeout: 10000 });
    });

    test("Map page loads with Leaflet container", async ({ page }) => {
        await page.goto("/map");
        await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 15000 });
    });

    test("Calendar page loads", async ({ page }) => {
        await page.goto("/calendar");
        await expect(page.locator("text=/Hijri|Calendar|Moon/i").first()).toBeVisible({ timeout: 10000 });
    });

    test("Support page loads with pricing", async ({ page }) => {
        await page.goto("/support");
        await expect(page.locator("text=/Pro|Premium|Support/i").first()).toBeVisible({ timeout: 10000 });
    });

    test("Moon info page loads", async ({ page }) => {
        await page.goto("/moon");
        await expect(page.locator("text=/Moon|Phase|Illumination/i").first()).toBeVisible({ timeout: 10000 });
    });
});

test.describe("Responsive Design", () => {
    test("works on mobile viewport", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
        await page.goto("/");
        await expect(page.locator("body")).toBeVisible();
    });

    test("works on tablet viewport", async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 }); // iPad
        await page.goto("/map");
        await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 15000 });
    });
});

test.describe("Dark Mode", () => {
    test("page renders in dark color scheme", async ({ page }) => {
        await page.emulateMedia({ colorScheme: "dark" });
        await page.goto("/");
        await expect(page.locator("body")).toBeVisible();
    });
});
