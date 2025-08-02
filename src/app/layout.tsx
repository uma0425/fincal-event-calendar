import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { FavoriteProvider } from '@/contexts/FavoriteContext'

const inter = Inter({ subsets: ['latin'] })

// 動的レンダリングを強制
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: {
    default: 'FinCal - イベントカレンダー',
    template: '%s | FinCal'
  },
  description: 'イベントの検索、投稿、管理ができる総合イベントカレンダーサービス。',
  keywords: ['イベント', 'カレンダー', 'セミナー', 'ミートアップ', 'ワークショップ'],
  openGraph: {
    title: 'FinCal - イベントカレンダー',
    description: 'イベントの検索、投稿、管理ができる総合イベントカレンダーサービス',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinCal - イベントカレンダー',
    description: 'イベントの検索、投稿、管理ができる総合イベントカレンダーサービス',
  },
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
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main id="main-content" className="container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
            </div>
          </FavoriteProvider>
        </NotificationProvider>
      </body>
    </html>
  )
} 