# Hilal Vision → Breezy Weather Style Conversion Guide

**Document type:** Implementation specification (Round 10 design overhaul)
**Prerequisite reading:** `BREEZY_DESIGN_REPORT.md`, `HILAL_VISION_DOCUMENTATION.md`
**Scope:** Visual presentation layer only — no changes to astronomical calculations, routing, or data models.

---

## Table of Contents

1. [Conversion Philosophy](#1-conversion-philosophy)
2. [Phase Overview](#2-phase-overview)
3. [Phase 1 — Global CSS Rewrite](#3-phase-1--global-css-rewrite)
4. [Phase 2 — Navigation and Layout Shell](#4-phase-2--navigation-and-layout-shell)
5. [Phase 3 — New Shared Card Components](#5-phase-3--new-shared-card-components)
6. [Phase 4 — Home Page Restructure](#6-phase-4--home-page-restructure)
7. [Phase 5 — Page-by-Page Card Redesign](#7-phase-5--page-by-page-card-redesign)
8. [Phase 6 — Animation and Motion System](#8-phase-6--animation-and-motion-system)
9. [Phase 7 — Typography Refinement](#9-phase-7--typography-refinement)
10. [Mapping Table: Current → Target](#10-mapping-table-current--target)
11. [What Must Not Change](#11-what-must-not-change)
12. [References](#12-references)

---

## 1. Conversion Philosophy

The goal of this conversion is not to clone Breezy Weather — it is to **apply Breezy Weather's design principles to Hilal Vision's domain**. Breezy Weather is a weather application; Hilal Vision is an Islamic astronomical platform. The two share the same underlying challenge: presenting dense, quantitative scientific data in a way that feels approachable, beautiful, and trustworthy.

The three Breezy principles that translate directly to Hilal Vision are:

**Data as decoration.** Every visual element on a card should encode real data. The arc on Breezy's Sun card is the sunrise-to-sunset path. In Hilal Vision, the arc on a Moon card should be the moon's path across the sky. The dot scale on Breezy's UV card is the UV index. In Hilal Vision, the dot scale on a Visibility card should be the q-value. No purely decorative shapes — every shape carries information.

**Immersive, full-bleed hero sections.** Breezy achieves its most distinctive look by making the weather gradient bleed edge-to-edge, behind the status bar and navigation bar. In a web context, this translates to a full-viewport-height hero section with no visible header boundary — the navigation floats over the gradient rather than sitting above it. Hilal Vision already does this on the Home page; the conversion extends this pattern to every page.

**Half-width detail card grid.** Rather than presenting all data in a single scrolling list, Breezy groups related metrics in a 2-column grid of roughly square cards. Each card is self-contained with a title, a decorative visual, a giant primary value, and a status label. This pattern is the most impactful structural change in the conversion.

The conversion preserves Hilal Vision's existing colour palette (deep navy + gold), its typefaces (Cinzel for headings, Inter for body, Noto Naskh Arabic for Arabic text), and its visibility zone colour scale (A=green, B=yellow, C=orange, D=red, E=grey). What changes is the **card structure, spacing, typography scale, and animation system**.

---

## 2. Phase Overview

The conversion is divided into seven sequential phases. Each phase is independent enough to be reviewed and tested before the next begins, but the phases are designed to be executed in order because later phases depend on the component classes introduced in earlier ones.

| Phase | Scope | Files Changed | Estimated Effort |
|---|---|---|---|
| 1 | Global CSS rewrite | `client/src/index.css` | 2–3 hours |
| 2 | Navigation and layout shell | `client/src/components/Layout.tsx` | 2–3 hours |
| 3 | New shared card components | New files in `client/src/components/` | 4–6 hours |
| 4 | Home page restructure | `client/src/pages/Home.tsx` | 3–4 hours |
| 5 | Page-by-page card redesign | All 8 feature pages | 8–12 hours |
| 6 | Animation and motion | `client/src/index.css` + page components | 2–3 hours |
| 7 | Typography refinement | `client/index.html` + `index.css` | 1–2 hours |

---

## 3. Phase 1 — Global CSS Rewrite

### 3.1 What Changes and Why

The current `index.css` uses a NASA-inspired deep navy palette with gold accents. This palette is correct and should be preserved. What changes is the **card surface colour**, the **border radius system**, and the **component class definitions** for cards.

Breezy Weather's most distinctive card detail is its `#FDF0FF` card background — a barely-perceptible pink-lavender that gives cards a warm, premium quality. In Hilal Vision's dark-mode context, the equivalent is a card surface that has a very subtle warm tint rather than a pure cold navy. The current `--card` value (`oklch(0.09 0.02 265)`) is a cool blue-grey. The target value should shift the hue slightly toward purple-warm (`oklch(0.09 0.025 280)`) — a change so subtle it is nearly invisible in isolation, but which makes the cards feel warmer and more distinctive against the background.

The border radius system needs to adopt Breezy's variable-radius convention. Currently all cards use `--radius: 0.75rem` uniformly. The Breezy system uses 28dp (1.75rem) for pill-like interactive chips, 16dp (1rem) for standard cards, and 12dp (0.75rem) for inner elements within cards. This three-tier system creates a clear visual hierarchy between interactive controls and content containers.

### 3.2 CSS Token Changes

Replace the `:root` block with the following additions and modifications. The existing gold and space tokens remain unchanged; only the card and radius tokens are updated:

```css
:root {
  /* ── Radius system — Breezy three-tier ── */
  --radius: 1rem;           /* Standard card radius (was 0.75rem) */
  --radius-sm: 0.75rem;     /* Inner element radius */
  --radius-md: 1rem;        /* Card radius (same as --radius) */
  --radius-lg: 1.25rem;     /* Large card radius */
  --radius-xl: 1.75rem;     /* Pill/chip radius */

  /* ── Card surface — warm-tinted dark (Breezy #FDF0FF equivalent) ── */
  --card: oklch(0.095 0.025 280);           /* Warm purple-navy tint */
  --card-foreground: oklch(0.94 0.008 80);
  --card-surface-alt: oklch(0.11 0.028 280); /* Slightly lighter variant */

  /* ── All other tokens remain unchanged ── */
}
```

### 3.3 New Component Classes

The `.glass-card` and `.card-elevated` classes should be replaced with three new Breezy-aligned classes. The existing classes can remain as aliases for backward compatibility during the transition, but new code should use the new names.

**`.breezy-card`** — The standard half-width detail card. Solid background (no backdrop blur), 1rem border radius, 16px padding, subtle border. This is the workhorse card for all detail data.

```css
.breezy-card {
  background: var(--card);
  border: 1px solid oklch(0.80 0.14 75 / 0.09);
  border-radius: var(--radius-lg);
  padding: 1rem;
  transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 2px 8px oklch(0 0 0 / 0.25);
}
.breezy-card:hover {
  border-color: oklch(0.80 0.14 75 / 0.20);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px oklch(0 0 0 / 0.35);
}
```

**`.breezy-card-full`** — The full-width content card used for forecast strips, charts, and primary data sections. Slightly more padding, larger radius.

```css
.breezy-card-full {
  background: var(--card);
  border: 1px solid oklch(0.80 0.14 75 / 0.09);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  box-shadow: 0 2px 12px oklch(0 0 0 / 0.25);
}
```

**`.breezy-chip`** — The tab chip used for switching between data views within a card. Pill shape, small padding, filled when selected.

```css
.breezy-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-xl);
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid oklch(0.80 0.14 75 / 0.20);
  color: var(--muted-foreground);
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}
.breezy-chip:hover {
  border-color: oklch(0.80 0.14 75 / 0.35);
  color: var(--foreground);
}
.breezy-chip[data-active="true"],
.breezy-chip.active {
  background: oklch(0.80 0.14 75 / 0.15);
  border-color: oklch(0.80 0.14 75 / 0.40);
  color: var(--gold);
}
```

### 3.4 Spacing System Update

Add the following spacing scale to the utilities layer. These named spacing tokens map directly to Breezy's 8dp grid:

```css
@layer utilities {
  /* Breezy 8dp grid spacing scale */
  .gap-breezy-tight { gap: 0.125rem; }   /* 2dp — between tightly related items */
  .gap-breezy { gap: 1rem; }             /* 16dp — standard card gap */
  .gap-breezy-loose { gap: 1.25rem; }    /* 20dp — section gap */
  .p-breezy { padding: 1rem; }           /* 16dp — standard card padding */
  .p-breezy-lg { padding: 1.25rem; }     /* 20dp — large card padding */
  .mx-breezy { margin-left: 1.25rem; margin-right: 1.25rem; } /* 20dp outer margin */
}
```

---

## 4. Phase 2 — Navigation and Layout Shell

### 4.1 The Breezy Navigation Principle

Breezy Weather has no traditional navigation bar. The entire screen is the content. In a web context, the closest equivalent is a **floating transparent header** that sits over the page content rather than above it. Hilal Vision already implements this on the Home page (the header uses `position: fixed` with a backdrop blur). The conversion extends this to feel more intentional — the header should be nearly invisible when the page is at the top, becoming more opaque only as the user scrolls.

The current `Layout.tsx` already has scroll-aware opacity logic. The changes needed are:

**Remove the bottom border entirely at scroll position 0.** The current code shows a faint gold border even when not scrolled. The Breezy equivalent has no visible boundary between the header and the hero content — they are one continuous surface.

**Reduce the header height.** The current header is `h-14 lg:h-16` (56px / 64px). Breezy's equivalent is approximately 48px. A smaller header gives more vertical space to content and makes the page feel more immersive.

**Remove the logo text on mobile.** On screens narrower than `sm` (640px), show only the crescent icon, not the "Hilal Vision" wordmark. This matches Breezy's minimal mobile header.

### 4.2 Layout.tsx Changes

In `client/src/components/Layout.tsx`, apply the following targeted changes:

```tsx
// Change 1: Header height
// FROM:  className="flex items-center justify-between h-14 lg:h-16"
// TO:    className="flex items-center justify-between h-12 lg:h-14"

// Change 2: Header background — no border at scroll=0
style={{
  background: scrolled
    ? "oklch(0.05 0.02 265 / 0.96)"
    : "oklch(0.05 0.02 265 / 0.0)",  // fully transparent at top
  backdropFilter: scrolled ? "blur(24px) saturate(1.2)" : "none",
  borderBottom: scrolled
    ? "1px solid oklch(0.80 0.14 75 / 0.10)"
    : "none",                         // no border at top
  transition: "all 0.4s ease",
}}

// Change 3: Main content top padding matches new header height
// FROM:  className="flex-1 pt-14 lg:pt-16"
// TO:    className="flex-1 pt-12 lg:pt-14"
```

### 4.3 The Immersive Hero Pattern

Every feature page should adopt the Breezy immersive hero pattern: a full-bleed gradient section that extends behind the header, with the page title and key data displayed in white text over the gradient. The header floats transparently over this section.

The hero section template for feature pages is:

```tsx
<section
  className="relative min-h-[40vh] flex items-end pb-8 overflow-hidden"
  style={{
    background: `
      radial-gradient(ellipse 100% 100% at 60% 0%, oklch(0.14 0.04 265) 0%, transparent 60%),
      var(--space)
    `,
    paddingTop: "var(--header-height, 3.5rem)",  /* clear the floating header */
  }}
>
  <div className="absolute inset-0 star-field opacity-30" />
  <div className="container relative z-10">
    {/* Page title in white, Arabic subtitle, key metric */}
  </div>
</section>
```

---

## 5. Phase 3 — New Shared Card Components

This phase creates the reusable building blocks that all feature pages will use. These components implement the Breezy card pattern: header row, decorative visual, giant primary value, status label.

### 5.1 `BreezyDetailCard` Component

Create `client/src/components/BreezyDetailCard.tsx`. This is the half-width card used for all detail data — the direct equivalent of Breezy's humidity, UV, pressure, and moon cards.

```tsx
// client/src/components/BreezyDetailCard.tsx

interface BreezyDetailCardProps {
  icon: React.ReactNode;
  title: string;
  titleAr?: string;
  decorativeVisual: React.ReactNode;  // SVG or Canvas element encoding the data
  primaryValue: string;               // Giant number or text (e.g. "87%", "Zone A")
  primaryUnit?: string;               // Small unit label next to value
  statusLabel: string;                // Muted description below value
  statusColour?: string;              // Optional colour for status label
  detailsHref?: string;               // Optional "Details →" link
  className?: string;
  accentColour?: string;              // Card's accent colour (for border on hover)
}

export function BreezyDetailCard({
  icon, title, titleAr, decorativeVisual,
  primaryValue, primaryUnit, statusLabel, statusColour,
  detailsHref, className, accentColour = "var(--gold)",
}: BreezyDetailCardProps) {
  return (
    <div
      className={`breezy-card flex flex-col gap-3 ${className ?? ""}`}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor =
          `color-mix(in oklch, ${accentColour} 30%, transparent)`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "";
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span style={{ color: accentColour }} className="w-4 h-4">{icon}</span>
          <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
            {title}
          </span>
          {titleAr && (
            <span className="text-[10px] font-arabic" style={{ color: "var(--gold-mist)" }}>
              {titleAr}
            </span>
          )}
        </div>
        {detailsHref && (
          <a
            href={detailsHref}
            className="text-[10px] flex items-center gap-0.5 transition-colors"
            style={{ color: "var(--gold-dim)" }}
          >
            Details <span>→</span>
          </a>
        )}
      </div>

      {/* Decorative visual — encodes the data */}
      <div className="flex-1 flex items-center justify-center min-h-[80px]">
        {decorativeVisual}
      </div>

      {/* Giant primary value */}
      <div className="flex items-baseline gap-1">
        <span
          className="text-4xl font-light leading-none tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          {primaryValue}
        </span>
        {primaryUnit && (
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {primaryUnit}
          </span>
        )}
      </div>

      {/* Status label */}
      <div
        className="text-xs leading-snug"
        style={{ color: statusColour ?? "var(--muted-foreground)" }}
      >
        {statusLabel}
      </div>
    </div>
  );
}
```

### 5.2 `BreezyFullCard` Component

Create `client/src/components/BreezyFullCard.tsx`. This is the full-width card used for charts, forecast strips, and primary data sections.

```tsx
// client/src/components/BreezyFullCard.tsx

interface BreezyFullCardProps {
  icon?: React.ReactNode;
  title: string;
  titleAr?: string;
  tabs?: Array<{ label: string; labelAr?: string; value: string }>;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function BreezyFullCard({
  icon, title, titleAr, tabs, activeTab, onTabChange, children, className,
}: BreezyFullCardProps) {
  return (
    <div className={`breezy-card-full ${className ?? ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && (
            <span style={{ color: "var(--gold-dim)" }} className="w-4 h-4">{icon}</span>
          )}
          <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            {title}
          </span>
          {titleAr && (
            <span className="text-xs font-arabic" style={{ color: "var(--gold-mist)" }}>
              {titleAr}
            </span>
          )}
        </div>

        {/* Tab chips */}
        {tabs && tabs.length > 0 && (
          <div className="flex items-center gap-1.5">
            {tabs.map(tab => (
              <button
                key={tab.value}
                className="breezy-chip"
                data-active={activeTab === tab.value ? "true" : "false"}
                onClick={() => onTabChange?.(tab.value)}
              >
                {tab.label}
                {tab.labelAr && (
                  <span className="font-arabic text-[9px]">{tab.labelAr}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
```

### 5.3 Decorative Visual Library

Create `client/src/components/BreezyVisuals.tsx` containing all the SVG decorative visuals. Each visual encodes real data from its props.

**`MoonArcVisual`** — A dashed semi-circular arc with the moon icon positioned at the current altitude angle. Used on the Moon Phase card and the Horizon card. The arc represents the moon's path from moonrise to moonset; the icon position represents the current time within that arc.

```tsx
export function MoonArcVisual({
  riseTime, setTime, currentTime, altitude,
}: {
  riseTime: Date | null; setTime: Date | null; currentTime: Date; altitude: number;
}) {
  // Calculate progress (0–1) along the arc based on current time
  const progress = riseTime && setTime
    ? Math.max(0, Math.min(1,
        (currentTime.getTime() - riseTime.getTime()) /
        (setTime.getTime() - riseTime.getTime())
      ))
    : 0.5;

  const cx = 80, cy = 80, r = 55;
  // Arc from 180° (left/rise) to 0° (right/set) going through top
  const startAngle = Math.PI;
  const endAngle = 0;
  const angle = startAngle + progress * (endAngle - startAngle);
  const moonX = cx + r * Math.cos(angle);
  const moonY = cy - r * Math.sin(angle);  // subtract because SVG y is inverted

  return (
    <svg viewBox="0 0 160 100" className="w-full max-w-[160px]">
      {/* Dashed arc path */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="oklch(0.62 0.11 75 / 0.35)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      {/* Horizon line */}
      <line
        x1={cx - r - 8} y1={cy} x2={cx + r + 8} y2={cy}
        stroke="oklch(0.62 0.11 75 / 0.20)"
        strokeWidth="1"
      />
      {/* Moon icon at current position */}
      <text
        x={moonX} y={moonY}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="14"
        fill="oklch(0.80 0.14 75)"
      >
        ☽
      </text>
      {/* Rise/set time labels */}
      <text x={cx - r} y={cy + 14} textAnchor="middle" fontSize="8"
        fill="oklch(0.52 0.008 80)">
        {riseTime ? riseTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
      </text>
      <text x={cx + r} y={cy + 14} textAnchor="middle" fontSize="8"
        fill="oklch(0.52 0.008 80)">
        {setTime ? setTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
      </text>
    </svg>
  );
}
```

**`VisibilityDotScale`** — A row of 6 coloured dots representing the visibility zone scale, with the current zone highlighted and enlarged. Directly analogous to Breezy's UV index dot scale.

```tsx
const ZONE_COLOURS = {
  A: "oklch(0.72 0.20 145)", B: "oklch(0.85 0.18 90)",
  C: "oklch(0.72 0.20 50)",  D: "oklch(0.60 0.22 25)",
  E: "oklch(0.40 0.01 265)", F: "oklch(0.25 0.01 265)",
};

export function VisibilityDotScale({ zone }: { zone: keyof typeof ZONE_COLOURS }) {
  const zones = ["A", "B", "C", "D", "E", "F"] as const;
  return (
    <div className="flex items-center gap-2 justify-center">
      {zones.map(z => {
        const isActive = z === zone;
        return (
          <div
            key={z}
            style={{
              width: isActive ? "2rem" : "0.875rem",
              height: isActive ? "2rem" : "0.875rem",
              borderRadius: "50%",
              background: ZONE_COLOURS[z],
              opacity: isActive ? 1 : 0.25,
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isActive ? "0.625rem" : "0",
              color: "oklch(0.08 0.02 265)",
              fontWeight: 700,
            }}
          >
            {isActive ? z : ""}
          </div>
        );
      })}
    </div>
  );
}
```

**`IlluminationArc`** — A circular gauge arc showing the moon's illumination percentage. The arc fills from 0° to `illumination × 360°` in a gold colour against a dark track.

```tsx
export function IlluminationArc({ illumination }: { illumination: number }) {
  const r = 36, cx = 50, cy = 50;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * (illumination / 100);
  return (
    <svg viewBox="0 0 100 100" className="w-20 h-20">
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="oklch(0.80 0.14 75 / 0.12)" strokeWidth="6" />
      {/* Fill */}
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="oklch(0.80 0.14 75)"
        strokeWidth="6"
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
      {/* Centre value */}
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="14" fontWeight="600" fill="oklch(0.80 0.14 75)">
        {illumination}%
      </text>
    </svg>
  );
}
```

---

## 6. Phase 4 — Home Page Restructure

### 6.1 Current vs. Target Structure

The current Home page has three sections: a hero, four live status cards, and a feature card grid. The target structure replaces the flat feature card grid with a Breezy-style scrollable section of full-width and half-width cards, each containing real data rather than just navigation links.

| Current Section | Target Section |
|---|---|
| Hero (moon SVG + CTA buttons) | Hero — unchanged, but header floats over it |
| 4 live status cards (UTC, phase, Hijri, next new moon) | 4 live status cards — unchanged, use `.breezy-card` |
| Feature card grid (7 navigation cards) | **New: "Tonight's Sky" full-width card** with location-specific data |
| — | **New: Half-width card grid** — Visibility, Moon Phase, Illumination, Next New Moon |
| — | **New: Full-width "Upcoming Events" card** with Islamic event countdown |
| — | Feature navigation grid — smaller, secondary position |

### 6.2 "Tonight's Sky" Full-Width Card

This card is the direct equivalent of Breezy's hero data row (feels-like, wind, UV, humidity). It shows the four most important numbers for tonight's crescent visibility at the selected location:

```tsx
<BreezyFullCard
  icon={<Moon className="w-4 h-4" />}
  title="Tonight's Sky"
  titleAr="سماء الليلة"
>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {/* Sun altitude at sunset */}
    <div className="text-center">
      <div className="text-2xl font-light" style={{ color: "var(--foreground)" }}>
        {sunAlt.toFixed(1)}°
      </div>
      <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Sun Alt.</div>
    </div>
    {/* Moon altitude at sunset */}
    <div className="text-center">
      <div className="text-2xl font-light" style={{ color: "var(--gold)" }}>
        {moonAlt.toFixed(1)}°
      </div>
      <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Moon Alt.</div>
    </div>
    {/* ARCV */}
    <div className="text-center">
      <div className="text-2xl font-light" style={{ color: "var(--foreground)" }}>
        {arcv.toFixed(1)}°
      </div>
      <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>ARCV</div>
    </div>
    {/* Visibility zone */}
    <div className="text-center">
      <div className="text-2xl font-bold" style={{ color: ZONE_COLOURS[zone] }}>
        Zone {zone}
      </div>
      <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
        {VISIBILITY_LABELS[zone]}
      </div>
    </div>
  </div>
</BreezyFullCard>
```

### 6.3 Half-Width Detail Card Grid

Below "Tonight's Sky", add a 2-column grid of `BreezyDetailCard` components:

```tsx
<div className="grid grid-cols-2 gap-breezy">
  {/* Visibility Zone card */}
  <BreezyDetailCard
    icon={<Eye />}
    title="Visibility"
    titleAr="الرؤية"
    decorativeVisual={<VisibilityDotScale zone={zone} />}
    primaryValue={`Zone ${zone}`}
    statusLabel={VISIBILITY_LABELS[zone]}
    statusColour={ZONE_COLOURS[zone]}
    accentColour={ZONE_COLOURS[zone]}
  />

  {/* Moon Illumination card */}
  <BreezyDetailCard
    icon={<Moon />}
    title="Illumination"
    titleAr="الإضاءة"
    decorativeVisual={<IlluminationArc illumination={illumination} />}
    primaryValue={`${illumination}`}
    primaryUnit="%"
    statusLabel={`Age: ${moonAge.toFixed(1)} days`}
  />

  {/* Moon Arc card */}
  <BreezyDetailCard
    icon={<Compass />}
    title="Moon Path"
    titleAr="مسار القمر"
    decorativeVisual={
      <MoonArcVisual
        riseTime={moonrise} setTime={moonset}
        currentTime={now} altitude={moonAlt}
      />
    }
    primaryValue={`${moonAlt.toFixed(1)}°`}
    statusLabel={`Az: ${moonAz.toFixed(1)}°`}
  />

  {/* Next New Moon card */}
  <BreezyDetailCard
    icon={<Sunrise />}
    title="Next New Moon"
    titleAr="المحاق القادم"
    decorativeVisual={
      <div className="text-4xl" style={{ color: "var(--gold-dim)" }}>☽</div>
    }
    primaryValue={`${daysToNewMoon}`}
    primaryUnit="days"
    statusLabel={nextNewMoon.toLocaleDateString([], { month: "short", day: "numeric" })}
  />
</div>
```

---

## 7. Phase 5 — Page-by-Page Card Redesign

### 7.1 Moon Phase Page (`/moon`)

**Current structure:** Hero with large SVG moon, 4 stat cards, 30-day strip, altitude chart.

**Target structure:** Immersive hero with the moon SVG and phase name in white text over the gradient. Below the hero fold: a full-width `BreezyFullCard` containing the altitude chart (with tab chips for "Altitude", "Illumination", "Distance"). Below that: a 2×2 grid of `BreezyDetailCard` components for Moonrise, Moonset, Illumination Arc, and Moon Path Arc.

The altitude chart tab chips should follow the Breezy pattern exactly — pill-shaped, gold-filled when active, outlined when inactive. The chart itself should use a single line (not a filled area) for a cleaner, more precise look.

### 7.2 Globe Page (`/globe`)

**Current structure:** Full-screen globe with a floating side panel.

**Target structure:** The globe remains full-screen. The side panel is redesigned as a set of `BreezyDetailCard` components stacked vertically on the right side. Each card covers one parameter: Visibility Zone (with dot scale), Sun/Moon Altitudes (with a mini dual-arc visual), Elongation (with a gauge arc), and q-Value (with a number line visual showing the q-value position within the A–F range).

The controls (date picker, overlay toggles, opacity slider) move to a compact toolbar at the bottom of the screen, styled as `breezy-chip` buttons.

### 7.3 Visibility Map Page (`/map`)

**Current structure:** Full-screen map with a floating legend and controls.

**Target structure:** The map remains full-screen. The time slider moves to a full-width `breezy-card-full` panel at the bottom of the screen (like a media player scrubber). The legend becomes a horizontal row of `breezy-chip` elements showing each zone's colour and label. The methodology panel (Pro Mode) becomes a `BreezyFullCard` that slides up from the bottom.

### 7.4 Hijri Calendar Page (`/calendar`)

**Current structure:** Year/month navigation, side-by-side calendar grids.

**Target structure:** A `BreezyFullCard` containing the calendar grid with tab chips for "Tabular Hijri" and "Umm al-Qura". A second `BreezyFullCard` below shows the month's Islamic events as a timeline. A half-width `BreezyDetailCard` shows the current Hijri date with a crescent phase visual. A second half-width card shows the days until the next new moon.

### 7.5 Horizon Page (`/horizon`)

**Current structure:** Canvas horizon view with controls below.

**Target structure:** The canvas horizon view becomes the full-width hero section (like Breezy's weather background). Below the canvas: a 2-column grid of `BreezyDetailCard` components for Sun Altitude, Moon Altitude, ARCV, and DAZ. A `BreezyFullCard` below shows the visibility assessment with the dot scale visual.

### 7.6 Archive Page (`/archive`)

**Current structure:** Year/month selector, city grid table.

**Target structure:** A `BreezyFullCard` containing the city grid, with tab chips for each visibility zone (filter by zone). Each city row uses the zone colour as a left border accent. A summary `BreezyDetailCard` shows the count of cities in each zone for the selected month.

### 7.7 Ramadan Page (`/ramadan`)

**Current structure:** Year list with city comparison table.

**Target structure:** A `BreezyFullCard` per year, each containing a horizontal scroll of city cards. Each city card is a mini `BreezyDetailCard` showing the predicted start date and visibility zone. A summary card at the top shows the next Ramadan start date with a countdown.

### 7.8 Dashboard Page (`/dashboard`)

The Dashboard page should be **removed from the navigation** and its content distributed to the individual feature pages. The Dashboard was useful as a temporary overview during development, but the Breezy design philosophy is that each page should be self-contained and information-rich enough that a separate "overview" page is unnecessary. Remove the `/dashboard` route from `App.tsx` and the "Dashboard" item from the `navItems` array in `Layout.tsx`.

---

## 8. Phase 6 — Animation and Motion System

### 8.1 Card Entrance Animations

Breezy Weather uses a staggered fade + slide-up entrance for cards when the page loads. Add the following animation to `index.css` and apply it to all `breezy-card` and `breezy-card-full` elements using the existing stagger delay classes:

```css
@keyframes breezy-card-enter {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.breezy-card-enter {
  animation: breezy-card-enter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

Apply to card grids in JSX:

```tsx
<div className="grid grid-cols-2 gap-breezy">
  <BreezyDetailCard className="breezy-card-enter stagger-1" ... />
  <BreezyDetailCard className="breezy-card-enter stagger-2" ... />
  <BreezyDetailCard className="breezy-card-enter stagger-3" ... />
  <BreezyDetailCard className="breezy-card-enter stagger-4" ... />
</div>
```

### 8.2 Tab Chip Transition

The tab chip active indicator should slide between chips rather than simply toggling. This requires a CSS-only approach using a `position: relative` container and a `position: absolute` background element that transitions with `left` and `width`:

```tsx
function BreezyTabGroup({ tabs, activeTab, onTabChange }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector(`[data-value="${activeTab}"]`) as HTMLElement;
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div ref={containerRef} className="relative flex items-center gap-1 p-1 rounded-full"
      style={{ background: "oklch(0.80 0.14 75 / 0.08)" }}>
      {/* Sliding indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          background: "oklch(0.80 0.14 75 / 0.20)",
          border: "1px solid oklch(0.80 0.14 75 / 0.35)",
        }}
      />
      {tabs.map(tab => (
        <button key={tab.value} data-value={tab.value}
          className="relative z-10 breezy-chip"
          style={{ border: "none", background: "transparent" }}
          onClick={() => onTabChange(tab.value)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

### 8.3 Decorative Visual Animations

The SVG decorative visuals in the `BreezyDetailCard` components should animate in when the card first renders. The `MoonArcVisual` should draw its arc with a `stroke-dashoffset` animation. The `VisibilityDotScale` should scale in each dot with a stagger delay. The `IlluminationArc` should animate its fill from 0 to the target value.

```css
@keyframes arc-draw {
  from { stroke-dashoffset: 200; }
  to { stroke-dashoffset: 0; }
}
.arc-draw {
  animation: arc-draw 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  stroke-dasharray: 200;
}
```

---

## 9. Phase 7 — Typography Refinement

### 9.1 The Giant Primary Value

The most impactful single typographic change from Breezy Weather is the **giant primary value** in each card. Breezy uses 48–80sp (3–5rem) for the main number in detail cards, with a **Thin or Light weight** rather than Bold. This makes the number feel precise and airy rather than heavy.

The current `BreezyDetailCard` spec above uses `text-4xl font-light` (2.25rem, weight 300). For the most important cards (Visibility Zone, Illumination), increase this to `text-5xl` (3rem) to match Breezy's scale more closely.

### 9.2 Card Title Sizing

Breezy uses 20sp (1.25rem) for card titles with a Normal (400) weight. The current Hilal Vision card titles use `text-xs` (0.75rem) with `font-medium` (500). The `BreezyDetailCard` component already uses `text-xs` for the title, which is appropriate for half-width cards on mobile. On desktop (≥1024px), increase to `text-sm` (0.875rem) using a responsive class.

### 9.3 Removing Cinzel from Card Titles

Cinzel is the correct font for page headings, the logo, and section titles. It should **not** be used for card titles, data values, or labels — it is too decorative for dense data display. The current codebase already follows this rule in most places, but audit all card components to ensure card titles use Inter (the default body font) rather than Cinzel.

### 9.4 Arabic Text in Cards

Every card that has an English title should also show the Arabic equivalent in a smaller size below or beside it, using the `font-arabic` utility class and `color: var(--gold-mist)`. This is consistent with Hilal Vision's bilingual identity and is not present in Breezy Weather (which is monolingual), but it is an important differentiator for the target audience.

---

## 10. Mapping Table: Current → Target

The following table provides a complete mapping of every current CSS class, component, and pattern to its Breezy-aligned replacement.

| Current | Target | Notes |
|---|---|---|
| `.glass-card` | `.breezy-card` | Keep `.glass-card` as alias |
| `.card-elevated` | `.breezy-card-full` | Keep `.card-elevated` as alias |
| `--radius: 0.75rem` | `--radius: 1rem` | Slightly larger base radius |
| `--card: oklch(0.09 0.02 265)` | `--card: oklch(0.095 0.025 280)` | Warm purple tint |
| `h-14 lg:h-16` header | `h-12 lg:h-14` header | Smaller, more immersive |
| Opaque header at scroll=0 | Transparent header at scroll=0 | Full bleed hero |
| Feature navigation cards | `BreezyDetailCard` with real data | Data-as-decoration |
| Flat `grid-cols-4` stat row | `BreezyFullCard` "Tonight's Sky" | Full-width context card |
| Individual stat cards | `BreezyDetailCard` 2-column grid | Half-width card grid |
| Recharts area fill | Recharts line chart | Cleaner, more precise |
| `text-2xl font-semibold` values | `text-4xl font-light` values | Giant, airy primary values |
| No tab chips | `BreezyTabGroup` with sliding indicator | Breezy tab pattern |
| No card entrance animation | `.breezy-card-enter` stagger | Cascading reveal |
| No decorative visuals | `MoonArcVisual`, `VisibilityDotScale`, `IlluminationArc` | Data as decoration |
| Dashboard page in nav | Dashboard removed from nav | Breezy: no overview page |

---

## 11. What Must Not Change

The following elements are core to Hilal Vision's identity and must be preserved exactly through the conversion:

**The colour palette.** The deep navy backgrounds, gold accents, and visibility zone colour scale (A=green, B=yellow, C=orange, D=red, E=grey) are correct and should not change. The only colour change is the subtle warm tint on the card surface.

**The typefaces.** Cinzel for headings, Inter for body, Noto Naskh Arabic for Arabic text. These three typefaces together give Hilal Vision its distinctive character — classical, precise, and bilingual.

**The star field.** The CSS star field on the hero sections is a key visual element that connects the application to its astronomical subject matter. It should remain on all hero sections.

**The astronomy engine.** No changes to `astronomy.ts`, `ummalqura.ts`, or any calculation logic. The conversion is purely visual.

**The visibility zone colour scale.** The A–F zone colours are already well-designed and align with Breezy's AQI colour scale philosophy. They must not change.

**The Arabic bilingual identity.** Every page title, card title, and key label should continue to show both English and Arabic text. This is not present in Breezy Weather but is essential to Hilal Vision's identity and audience.

**The Yallop/Odeh attribution in the footer.** The scientific credibility of the application depends on transparent attribution of the calculation methodology. The footer attribution must remain.

---

## 12. References

- [Breezy Weather GitHub Repository](https://github.com/breezy-weather/breezy-weather)
- [Breezy Weather Design System Analysis](./BREEZY_DESIGN_REPORT.md)
- [Hilal Vision Full Documentation](./HILAL_VISION_DOCUMENTATION.md)
- [Material 3 Expressive — Shape System](https://m3.material.io/styles/shape/overview)
- [Material 3 Expressive — Typography Scale](https://m3.material.io/styles/typography/overview)
- [OKLCH Colour Space — CSS Color 4](https://www.w3.org/TR/css-color-4/#ok-lab)
