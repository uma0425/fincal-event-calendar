/** @type {import('next').NextConfig} */
const nextConfig = {
  // 動的レンダリングを強制
  output: 'standalone',
  
  // 実験的機能
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // 画像最適化
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: false,
  },
  
  // ビルド設定
  poweredByHeader: false,
  compress: true,
  
  // 静的ページ生成を完全に無効化
  generateStaticParams: false,
  
  // ビルド時のタイムアウトを延長
  staticPageGenerationTimeout: 300,
  
  // Webpack設定
  webpack: (config, { isServer }) => {
    // バンドル分析（開発時のみ）
    if (!isServer && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      )
    }
    
    return config
  },
}

module.exports = nextConfig 