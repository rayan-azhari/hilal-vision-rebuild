/**
 * Hilal Vision — Asset Generator
 * Generates all icons and graphics needed for:
 *   1. @capacitor/assets (Android mipmap generation)
 *   2. Google Play Console uploads
 *
 * Run: node scripts/generate-assets.mjs
 * Outputs to: assets/
 */

import sharp from 'sharp';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '..');
const ASSETS = resolve(ROOT, 'assets');

if (!existsSync(ASSETS)) mkdirSync(ASSETS, { recursive: true });

const SOURCE_ICON = resolve(ROOT, 'client/public/icons/icon-512.png');
const BG = { r: 10, g: 14, b: 26, alpha: 1 }; // #0a0e1a

console.log('Hilal Vision — Generating assets...\n');

// ── 1. icon-only.png  (1024×1024) — @capacitor/assets source ──────────────
async function genIconOnly() {
  const icon = await sharp(SOURCE_ICON).resize(720, 720).toBuffer();
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: BG } })
    .composite([{ input: icon, gravity: 'center' }])
    .png()
    .toFile(resolve(ASSETS, 'icon-only.png'));
  console.log('✔  assets/icon-only.png         (1024×1024)');
}

// ── 2. icon-foreground.png (1024×1024) — adaptive icon foreground ──────────
async function genIconForeground() {
  // Transparent background, icon in the safe zone (center 72%)
  const safeSize = Math.round(1024 * 0.72);
  const icon = await sharp(SOURCE_ICON).resize(safeSize, safeSize).toBuffer();
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: icon, gravity: 'center' }])
    .png()
    .toFile(resolve(ASSETS, 'icon-foreground.png'));
  console.log('✔  assets/icon-foreground.png   (1024×1024, transparent bg)');
}

// ── 3. icon-background.png (1024×1024) — adaptive icon background ──────────
async function genIconBackground() {
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: BG } })
    .png()
    .toFile(resolve(ASSETS, 'icon-background.png'));
  console.log('✔  assets/icon-background.png   (1024×1024, solid #0a0e1a)');
}

// ── 4. splash.png  (2732×2732) — @capacitor/assets source ─────────────────
async function genSplash() {
  const iconSize = 512;
  const icon = await sharp(SOURCE_ICON).resize(iconSize, iconSize).toBuffer();

  // Label SVG (app name below icon)
  const labelSvg = Buffer.from(`
    <svg width="2732" height="2732" xmlns="http://www.w3.org/2000/svg">
      <text x="1366" y="${2732 / 2 + iconSize / 2 + 80}"
        font-family="system-ui, sans-serif" font-size="96" font-weight="bold"
        fill="white" text-anchor="middle" dominant-baseline="hanging">Hilal Vision</text>
      <text x="1366" y="${2732 / 2 + iconSize / 2 + 200}"
        font-family="system-ui, sans-serif" font-size="52"
        fill="rgba(255,255,255,0.55)" text-anchor="middle" dominant-baseline="hanging">Crescent Moon Visibility</text>
    </svg>
  `);

  await sharp({ create: { width: 2732, height: 2732, channels: 4, background: BG } })
    .composite([
      { input: icon, gravity: 'center', top: Math.round(2732 / 2 - iconSize / 2 - 80), left: Math.round(2732 / 2 - iconSize / 2) },
      { input: labelSvg, top: 0, left: 0 },
    ])
    .png()
    .toFile(resolve(ASSETS, 'splash.png'));
  console.log('✔  assets/splash.png            (2732×2732)');
}

// ── 5. playstore-icon.png (512×512) — Play Console app icon ────────────────
async function genPlayStoreIcon() {
  const icon = await sharp(SOURCE_ICON).resize(436, 436).toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: BG } })
    .composite([{ input: icon, gravity: 'center' }])
    .png()
    .toFile(resolve(ASSETS, 'playstore-icon.png'));
  console.log('✔  assets/playstore-icon.png    (512×512)   ← Upload to Play Console');
}

// ── 6. feature-graphic.png (1024×500) — Play Console feature image ─────────
async function genFeatureGraphic() {
  const iconSize = 360;
  // Use transparent-bg foreground so it blends cleanly into the gradient
  const icon = await sharp(resolve(ASSETS, 'icon-foreground.png')).resize(iconSize, iconSize).toBuffer();

  const textSvg = Buffer.from(`
    <svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#0a0e1a"/>
          <stop offset="100%" stop-color="#0f1830"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="500" fill="url(#bg)"/>
      <text x="72" y="165"
        font-family="system-ui, sans-serif" font-size="92" font-weight="bold"
        fill="#f0c040">Hilal</text>
      <text x="72" y="270"
        font-family="system-ui, sans-serif" font-size="92" font-weight="bold"
        fill="#f0c040">Vision</text>
      <line x1="72" y1="302" x2="400" y2="302" stroke="rgba(240,192,64,0.4)" stroke-width="2"/>
      <text x="72" y="338"
        font-family="system-ui, sans-serif" font-size="28"
        fill="rgba(255,255,255,0.6)">Crescent Moon Visibility</text>
    </svg>
  `);

  await sharp(textSvg)
    .composite([
      { input: icon, top: Math.round(500 / 2 - iconSize / 2), left: 1024 - iconSize - 72 },
    ])
    .png()
    .toFile(resolve(ASSETS, 'feature-graphic.png'));
  console.log('✔  assets/feature-graphic.png   (1024×500)  ← Upload to Play Console');
}

// ── Run all ────────────────────────────────────────────────────────────────
(async () => {
  try {
    await genIconOnly();
    await genIconForeground();
    await genIconBackground();
    await genSplash();
    await genPlayStoreIcon();
    await genFeatureGraphic();
    console.log('\nDone! Next steps:');
    console.log('  1. Run: npx @capacitor/assets generate --android');
    console.log('  2. Upload assets/playstore-icon.png  → Play Console > Store listing > App icon');
    console.log('  3. Upload assets/feature-graphic.png → Play Console > Store listing > Feature graphic');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
