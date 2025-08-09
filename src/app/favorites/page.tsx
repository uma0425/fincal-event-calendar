'use client'

import { useState, useEffect } from 'react'
import { Event } from '@prisma/client'
import LazyEventList from '@/components/LazyEventList'
import { LoadingPage } from '@/components/LoadingStates'
import MobileMenu from '@/components/MobileMenu'
import Logo from '@/components/Logo'

interface FavoriteEvent {
  id: string
  eventId: string
  userId: string
  createdAt: string
  event: Event
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites')
        
        if (response.ok) {
          const data = await response.json()
          const processedFavorites = data.favorites.map((fav: any) => ({
            ...fav,
            event: {
              ...fav.event,
              startAt: new Date(fav.event.startAt),
              endAt: new Date(fav.event.endAt),
              createdAt: new Date(fav.event.createdAt),
              updatedAt: new Date(fav.event.updatedAt)
            }
          }))
          setFavorites(processedFavorites)
        } else {
          throw new Error('お気に入りの取得に失敗しました')
        }
      } catch (error) {
        console.error('お気に入り取得エラー:', error)
        setError(error instanceof Error ? error.message : 'お気に入りの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [])

  const handleRemoveFavorite = async (eventId: string) => {
    try {
      const response = await fetch(`/api/favorites?eventId=${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // お気に入りリストから削除
        setFavorites(prev => prev.filter(fav => fav.eventId !== eventId))
      } else {
        throw new Error('お気に入りから削除に失敗しました')
      }
    } catch (error) {
      console.error('お気に入り削除エラー:', error)
      alert('お気に入りから削除に失敗しました')
    }
  }

  const renderEvent = (favorite: FavoriteEvent) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative">
      {/* 削除ボタン */}
      <button
        onClick={() => handleRemoveFavorite(favorite.eventId)}
        className="absolute top-3 right-3 w-8 h-8 bg-red-500 bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200 z-10"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* イベント画像 */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        {favorite.event.imageUrl ? (
          <img
            src={favorite.event.imageUrl}
            alt={favorite.event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium">イベント</p>
            </div>
          </div>
        )}
        
        {/* イベントタイプバッジ */}
        <div className="absolute top-3 left-3">
          <span className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
            {favorite.event.type === 'seminar' && 'セミナー'}
            {favorite.event.type === 'webinar' && 'ウェビナー'}
            {favorite.event.type === 'meetup' && 'ミートアップ'}
            {favorite.event.type === 'workshop' && 'ワークショップ'}
            {favorite.event.type === 'other' && 'その他'}
          </span>
        </div>

        {/* お気に入りバッジ */}
        <div className="absolute top-3 right-12">
          <div className="w-8 h-8 bg-red-500 bg-opacity-90 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* イベント情報 */}
      <div className="p-4">
        {/* タイトル */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {favorite.event.title}
        </h3>

        {/* 日時 */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {new Date(favorite.event.startAt).toLocaleDateString('ja-JP', {
              month: 'short',
              day: 'numeric',
              weekday: 'short'
            })}
            {' '}
            {new Date(favorite.event.startAt).toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {/* 場所 */}
        {favorite.event.place && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{favorite.event.place}</span>
          </div>
        )}

        {/* 主催者 */}
        {favorite.event.organizer && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="line-clamp-1">{favorite.event.organizer}</span>
          </div>
        )}

        {/* 参加費 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-lg font-bold text-gray-900">
              {favorite.event.fee === 0 ? '無料' : `¥${favorite.event.fee.toLocaleString()}`}
            </span>
            {favorite.event.fee > 0 && (
              <span className="text-sm text-gray-500 ml-1">/人</span>
            )}
          </div>
          
          {/* 詳細ボタン */}
          <a
            href={`/events/${favorite.event.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            詳細を見る
          </a>
        </div>

        {/* タグ */}
        {favorite.event.target && (
          <div className="flex flex-wrap gap-1">
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
              {favorite.event.target}
            </span>
          </div>
        )}
      </div>
    </div>
  )

  if (loading) {
    return <LoadingPage message="お気に入りを読み込み中..." showProgress={true} />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">エラー</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Logo size="md" href="/" />
              </div>
              
              {/* デスクトップナビゲーション */}
              <div className="hidden md:flex items-center space-x-4">
                <a
                  href="/submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  イベント投稿
                </a>
                <a
                  href="/admin"
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                >
                  管理画面
                </a>
              </div>

              {/* モバイルメニューボタン */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label="メニューを開く"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タイトルセクション */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">お気に入り</h1>
          <p className="text-lg text-gray-600">保存したイベントを確認できます</p>
        </div>

        {/* お気に入り一覧 */}
        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">お気に入りがありません</h2>
            <p className="text-gray-600 mb-6">イベントをお気に入りに追加すると、ここに表示されます。</p>
            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              イベントを探す
            </a>
          </div>
        ) : (
          <LazyEventList
            events={favorites.map(fav => fav.event)}
            renderEvent={(event) => {
              const favorite = favorites.find(fav => fav.event.id === event.id)
              return favorite ? renderEvent(favorite) : null
            }}
          />
        )}

        {/* モバイルメニュー */}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
      </div>
    </div>
  )
} 