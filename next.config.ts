import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // eslint-config-next uses @rushstack/eslint-patch, which can error with ESLint 9 + flat config during `next build`.
  // TypeScript is still checked; run `npm run lint` locally or in CI.
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
