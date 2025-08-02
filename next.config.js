/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  // 静的ページ生成を完全に無効化
  output: 'standalone',
  // 静的ページ生成を無効化
  trailingSlash: false,
  // ビルド時のタイムアウトを延長
  staticPageGenerationTimeout: 120,
  // 静的ページ生成を無効化
  generateStaticParams: false,
}

module.exports = nextConfig 