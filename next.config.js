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
  
  // ビルド時のタイムアウトを延長
  staticPageGenerationTimeout: 300,
  
  // 本番環境での安定性向上
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
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
    
    // 本番環境での最適化
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      }
    }
    
    return config
  },
}

module.exports = nextConfig 