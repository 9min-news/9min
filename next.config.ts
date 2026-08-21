import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // No output: 'export' — Vercel handles static generation automatically.
  // Setting it would break ImageResponse in the OG route.
  webpack(config) {
    // Allow importing .md files as raw strings (used for prompt files)
    config.module.rules.push({ test: /\.md$/, type: 'asset/source' })
    return config
  },
}

export default nextConfig
