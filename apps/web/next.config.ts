import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hilal/astronomy", "@hilal/types", "@hilal/ui", "@hilal/db"],
};

export default nextConfig;
