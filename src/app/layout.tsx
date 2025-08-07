import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { initializeDatabase } from '@/lib/init-db'
import { FavoriteProvider } from '@/contexts/FavoriteContext'
import PWAInstaller from '@/components/PWAInstaller'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinCal - イベントカレンダー',
  description: 'イベントの投稿・管理・共有ができるカレンダーアプリケーション',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FinCal'
  },
  formatDetection: {
    telephone: false
  }
}

// サーバーサイドでのみデータベース初期化を実行
if (typeof window === 'undefined') {
  initializeDatabase()
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <FavoriteProvider>
          {children}
          <PWAInstaller />
        </FavoriteProvider>
      </body>
    </html>
  )
} 