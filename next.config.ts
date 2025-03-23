import type { NextConfig } from "next";
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ✅ Skip ESLint during `next build`
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
