/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'mykdgmbqdxxrpujdxybw.supabase.co',
      },
    ],
  },
  eslint: {
    // Disable ESLint during build
    ignoreDuringBuilds: true,
  },
};
