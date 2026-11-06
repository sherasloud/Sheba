/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep server routes available on Vercel; static export is opt-in for Capacitor builds.
  ...(process.env.CAPACITOR_BUILD === 'true' ? { output: 'export' } : {}),
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

export default nextConfig
