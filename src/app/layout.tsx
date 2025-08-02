import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { FavoriteProvider } from '@/contexts/FavoriteContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://fincal.example.com'), // 本番環境のURLに変更してください
  title: {
    default: 'FinCal - イベントカレンダー',
    template: '%s | FinCal'
  },
  description: 'イベントの検索、投稿、管理ができる総合イベントカレンダーサービス。セミナー、ミートアップ、ワークショップなど様々なイベントを簡単に見つけて参加できます。',
  keywords: ['イベント', 'カレンダー', 'セミナー', 'ミートアップ', 'ワークショップ', 'ウェビナー', 'イベント管理'],
  authors: [{ name: 'FinCal Team' }],
  creator: 'FinCal Team',
  publisher: 'FinCal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://fincal.example.com',
    siteName: 'FinCal',
    title: 'FinCal - イベントカレンダー',
    description: 'イベントの検索、投稿、管理ができる総合イベントカレンダーサービス',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FinCal - イベントカレンダー',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinCal - イベントカレンダー',
    description: 'イベントの検索、投稿、管理ができる総合イベントカレンダーサービス',
    images: ['/og-image.jpg'],
    creator: '@fincal',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Google Search Consoleの検証コード
  },
  alternates: {
    canonical: 'https://fincal.example.com',
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