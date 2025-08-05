import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { initializeDatabase } from '@/lib/init-db'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinCal - フィンランドのイベントカレンダー',
  description: 'フィンランドの最新イベント情報をお届けします',
}

// データベース初期化を実行（サーバーサイドでのみ実行）
if (typeof window === 'undefined') {
  // サーバーサイドでのみ実行
  initializeDatabase().catch(console.error)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 