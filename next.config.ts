import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ✅ headers block removed — handled by middleware.ts now
};

export default nextConfig;