import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Node/Next route types separate from vinext's generated .next/types.
  distDir: ".next-node",
  reactStrictMode: true,
  devIndicators: false,
  // Cloudflare Workers has no Node image-optimization runtime (sharp), so
  // /_next/image can only fall back to a redirect. Serve originals directly.
  images: { unoptimized: true },
};

export default nextConfig;
