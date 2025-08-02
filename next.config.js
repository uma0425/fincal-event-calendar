/** @type {import('next').NextConfig} */
const nextConfig = {
  // 画像最適化設定
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // 実験的機能
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // 圧縮設定
  compress: true,
  
  // パフォーマンス設定
  poweredByHeader: false,
  
  // バンドル分析
  webpack: (config, { dev, isServer }) => {
    // 本番環境でのみバンドル分析を有効化
    if (!dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-report.html',
        })
      )
    }
    
    return config
  },
}

module.exports = nextConfig 