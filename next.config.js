/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // APIルートの静的生成を無効にする
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  // 静的生成を無効にするページ
  async generateStaticParams() {
    return []
  },
}

module.exports = nextConfig 