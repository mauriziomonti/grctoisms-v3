/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output as standalone for Cloudflare Pages deployment
  output: 'standalone',

  // Base path if serving under /grc subdirectory
  // basePath: '/grc',

  experimental: {
    serverComponentsExternalPackages: [],
  },
}

module.exports = nextConfig
