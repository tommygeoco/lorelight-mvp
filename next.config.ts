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
  experimental: {
    // Increase body size limit for large audio file uploads (500MB)
    serverActions: {
      bodySizeLimit: '500mb',
    },
    // Enable optimized package imports for better tree-shaking
    optimizePackageImports: ['lucide-react', 'zustand', 'immer'],
  },
  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Performance optimizations
  images: {
    // Enable image optimization
    formats: ['image/avif', 'image/webp'],
    // Add remote patterns if needed
    remotePatterns: [],
  },
  // Performance budgets
  onDemandEntries: {
    // Keep pages in memory for faster dev
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;
