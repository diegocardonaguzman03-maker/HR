import type { NextConfig } from 'next';

// Static export: the MVP runs fully in the browser (MockAgentProvider).
// Remove `output: 'export'` once you add Next.js API routes or server actions.
const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
