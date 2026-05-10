import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // No output: 'export' — Vercel handles static generation automatically.
  // Setting it would break ImageResponse in the OG route.
}

export default nextConfig
