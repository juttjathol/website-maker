import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Node/Next route types separate from vinext's generated .next/types.
  distDir: ".next-node",
  reactStrictMode: true,
  devIndicators: false,
};

export default nextConfig;
