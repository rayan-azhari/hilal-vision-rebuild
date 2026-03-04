/**
 * Hilal Vision Design Tokens (Breezy Weather inspired)
 * OKLCH color space for dynamic, perceptual lightness scaling.
 */

export const colors = {
    // Brand Core
    primary: {
        50: "oklch(0.97 0.01 240)",
        100: "oklch(0.93 0.03 240)",
        200: "oklch(0.88 0.05 240)",
        300: "oklch(0.81 0.08 240)",
        400: "oklch(0.72 0.12 240)",
        500: "oklch(0.61 0.16 240)", // Main Primary (Deep Blue/Purple)
        600: "oklch(0.51 0.14 240)",
        700: "oklch(0.42 0.11 240)",
        800: "oklch(0.34 0.08 240)",
        900: "oklch(0.28 0.06 240)",
        950: "oklch(0.19 0.04 240)",
    },

    // Application Backgrounds
    background: {
        light: "oklch(0.98 0.01 240)",
        dark: "oklch(0.15 0.03 260)",   // Deep Navy Night Sky
        cardLight: "oklch(1.0 0 0)",
        cardDark: "oklch(0.20 0.04 260)",
    },

    // Visibility Indicators (Odeh/Yallop Zones)
    visibility: {
        a: "oklch(0.88 0.15 140)", // Green
        b: "oklch(0.85 0.16 90)",  // Yellow
        c: "oklch(0.75 0.18 55)",  // Orange
        d: "oklch(0.65 0.20 25)",  // Red
        e: "oklch(0.55 0.02 260)", // Gray
        f: "oklch(0.30 0.05 260)", // Deep Blue (Below Horizon)
    },

    // Celestial Bodies
    celestial: {
        sun: "oklch(0.92 0.18 85)",
        moon: "oklch(0.95 0.02 260)",
        terminator: "oklch(0.4 0.05 260 / 0.5)",
    }
};

export const typography = {
    fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        heading: ["Outfit", "Inter", "sans-serif"],
        arabic: ["Amiri", "Noto Naskh Arabic", "serif"],
    },
    fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
    },
    fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
    }
};

export const spacing = {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
};

export const borderRadius = {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
};

export const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
};
