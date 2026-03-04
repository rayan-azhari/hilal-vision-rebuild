import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import Sitemap from "vite-plugin-sitemap";
import path from "node:path";
import fs from "node:fs";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // Inject VITE_FIREBASE_* env vars into the FCM service worker at build time.
    // Vite doesn't process files in publicDir through its module graph, so we
    // replace the __VITE_*__ placeholders as a post-build step.
    {
      name: "firebase-sw-env",
      closeBundle() {
        const swPath = path.resolve(import.meta.dirname, "dist/public/firebase-messaging-sw.js");
        if (fs.existsSync(swPath)) {
          let content = fs.readFileSync(swPath, "utf-8");
          content = content
            .replace(/__VITE_FIREBASE_API_KEY__/g, process.env.VITE_FIREBASE_API_KEY ?? "")
            .replace(/__VITE_FIREBASE_APP_ID__/g, process.env.VITE_FIREBASE_APP_ID ?? "");
          fs.writeFileSync(swPath, content);
        }
      },
    },
    react(),
    tailwindcss(),
    Sitemap({
      hostname: "https://moonsighting.live",
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      dynamicRoutes: [
        "/",
        "/globe",
        "/map",
        "/moon",
        "/calendar",
        "/horizon",
        "/archive",
        "/about",
        "/methodology",
        "/privacy",
        "/terms"
      ]
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
  },
  server: {
    host: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
