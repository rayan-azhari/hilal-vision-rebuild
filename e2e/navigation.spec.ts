import { test, expect } from "@playwright/test";

test.describe("Navigation & Core Pages", () => {
    test("Home page loads with heading", async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveTitle(/Hilal Vision|Moon/i);
    });

    test("Mobile navigation toggle works", async ({ page }) => {
        // Mobile header uses a hamburger menu instead of bottom nav now
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto("/");
        await page.locator('button[aria-label="Open menu"]').click();
        const menuHeader = page.locator("text=/Explore Content/i");
        await expect(menuHeader).toBeVisible({ timeout: 10000 });
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
        page.on("pageerror", err => console.log("PAGE ERROR:", err));
        page.on("console", msg => { if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text()) });
        await page.setViewportSize({ width: 768, height: 1024 }); // iPad
        await page.goto("/map");
        console.log("DEBUG DOM for MAP:", await page.locator("body").innerText());
        await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 25000 });
    });
});

test.describe("Dark Mode", () => {
    test("page renders in dark color scheme", async ({ page }) => {
        await page.emulateMedia({ colorScheme: "dark" });
        await page.goto("/");
        await expect(page.locator("body")).toBeVisible();
    });
});
