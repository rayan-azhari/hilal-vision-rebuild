// scripts/capture-ui.ts
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function capture() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    console.log("Navigating to Archive...");
    await page.goto('http://localhost:3000/archive', { waitUntil: 'networkidle2' });

    // Click Sha'ban
    await page.waitForSelector('button:has-text("Sha\'ban")');
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes("Sha'ban"));
        if (btn) btn.click();
    });

    await page.waitForTimeout(2000); // wait for load

    const archivePath = path.join(__dirname, '..', 'archive-screenshot.png');
    await page.screenshot({ path: archivePath, fullPage: true });

    console.log("Navigating to Moon Phase...");
    await page.goto('http://localhost:3000/moon', { waitUntil: 'networkidle2' });

    await page.waitForTimeout(1000);

    const moonPath = path.join(__dirname, '..', 'moon-screenshot.png');
    await page.screenshot({ path: moonPath, fullPage: true });

    await browser.close();
    console.log(`Saved:\n- ${archivePath}\n- ${moonPath}`);
}

capture().catch(console.error);
