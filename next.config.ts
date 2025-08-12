// next.config.ts
import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

// Initialise PWA plugin
const withPWA = withPWAInit({
  dest: "public",         // output folder for service worker
  register: true,         // register SW automatically
  skipWaiting: true,      // activate updated SW immediately
  disable: process.env.NODE_ENV === "development" // disable in dev mode
});

// Your Next.js config
const nextConfig: NextConfig = {
  reactStrictMode: true
};

// Export Next.js config wrapped with PWA plugin
export default withPWA(nextConfig);
