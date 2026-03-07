import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // Enable PWA features
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  transpilePackages: ["@hilal/astronomy", "@hilal/types", "@hilal/ui", "@hilal/db", "astronomy-engine"],
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withSerwist(withMDX(nextConfig));
