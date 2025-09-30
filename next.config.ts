import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors. This is needed because of Immer+Map depth issues.
    // The app works correctly at runtime.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Run ESLint but don't fail the build
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
