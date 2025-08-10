import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { initializeDatabase } from '@/lib/init-db'
import { FavoriteProvider } from '@/contexts/FavoriteContext'
import { NotificationProvider } from '@/components/NotificationSystem'
import PWAInstaller from '@/components/PWAInstaller'
import { setupGlobalErrorHandler } from '@/lib/errorHandling'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinCal - イベントカレンダー',
  description: 'イベントの投稿・管理・共有ができるカレンダーアプリケーション',
  manifest: '/manifest.json',
  formatDetection: {
    telephone: false
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb'
}

// サーバーサイドでのみデータベース初期化を実行
if (typeof window === 'undefined') {
  initializeDatabase()
}

// クライアントサイドでのみグローバルエラーハンドラーを設定
if (typeof window !== 'undefined') {
  setupGlobalErrorHandler()
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <NotificationProvider>
          <FavoriteProvider>
            {children}
            <PWAInstaller />
          </FavoriteProvider>
        </NotificationProvider>
      </body>
    </html>
  )
} 