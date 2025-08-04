import './globals.css'

export const metadata = {
  title: 'FinCal - イベントカレンダー',
  description: 'イベントの検索、投稿、管理ができる総合イベントカレンダーサービス。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen bg-gray-50">
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 