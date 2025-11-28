/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export in production builds, not in dev
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    basePath: '/perfect-circle',
    assetPrefix: '/perfect-circle/',
  }),
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

export default nextConfig