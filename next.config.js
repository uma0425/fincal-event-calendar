/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  // 静的エクスポートを無効化
  output: 'standalone',
  // ビルド時のタイムアウトを延長
  staticPageGenerationTimeout: 120,
}

module.exports = nextConfig 