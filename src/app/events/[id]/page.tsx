'use client'

import { useState, useEffect } from 'react'
import { Event } from '@prisma/client'
import { useParams } from 'next/navigation'

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`)
        
        if (response.ok) {
          const data = await response.json()
          const eventData = {
            ...data.event,
            startAt: new Date(data.event.startAt),
            endAt: new Date(data.event.endAt),
            createdAt: new Date(data.event.createdAt),
            updatedAt: new Date(data.event.updatedAt)
          }
          setEvent(eventData)
        } else {
          throw new Error('イベントが見つかりません')
        }
      } catch (error) {
        console.error('イベント取得エラー:', error)
        setError(error instanceof Error ? error.message : 'イベントの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  // お気に入り状態を取得
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const response = await fetch('/api/favorites')
        if (response.ok) {
          const data = await response.json()
          const isFavorited = data.favorites.some((fav: any) => fav.eventId === eventId)
          setIsFavorite(isFavorited)
        }
      } catch (error) {
        console.error('お気に入り状態取得エラー:', error)
      }
    }

    if (eventId) {
      fetchFavoriteStatus()
    }
  }, [eventId])

  const handleFavorite = async () => {
    try {
      if (isFavorite) {
        // お気に入りから削除
        const response = await fetch(`/api/favorites?eventId=${eventId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setIsFavorite(false)
        }
      } else {
        // お気に入りに追加
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventId })
        })
        
        if (response.ok) {
          setIsFavorite(true)
        }
      }
    } catch (error) {
      console.error('お気に入り操作エラー:', error)
      alert('お気に入り操作に失敗しました')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href
      })
    } else {
      // フォールバック: URLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href)
      alert('URLをクリップボードにコピーしました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">イベントを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">エラー</h2>
          <p className="text-gray-600 mb-4">{error || 'イベントが見つかりません'}</p>
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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">FinCal</span>
            </div>
            <a
              href="/"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              ホームに戻る
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* イベント画像 */}
        <div className="relative h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden mb-8">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-center">
                <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xl font-medium">イベント</p>
              </div>
            </div>
          )}
          
          {/* イベントタイプバッジ */}
          <div className="absolute top-6 left-6">
            <span className="bg-white bg-opacity-90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
              {event.type === 'seminar' && 'セミナー'}
              {event.type === 'webinar' && 'ウェビナー'}
              {event.type === 'meetup' && 'ミートアップ'}
              {event.type === 'workshop' && 'ワークショップ'}
              {event.type === 'other' && 'その他'}
            </span>
          </div>

          {/* アクションボタン */}
          <div className="absolute top-6 right-6 flex space-x-3">
            <button
              onClick={handleShare}
              className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            <button
              onClick={handleFavorite}
              className={`w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200 ${
                isFavorite ? 'text-red-500' : 'text-gray-600'
              }`}
            >
              <svg className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            {/* イベントタイトル */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

            {/* イベント説明 */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">イベントについて</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* 詳細情報 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">詳細情報</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 日時 */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">開催日時</h3>
                    <p className="text-gray-600">
                      {new Date(event.startAt).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                      <br />
                      {new Date(event.startAt).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {event.endAt && (
                        <>
                          {' - '}
                          {new Date(event.endAt).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* 場所 */}
                {event.place && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">開催場所</h3>
                      <p className="text-gray-600">{event.place}</p>
                    </div>
                  </div>
                )}

                {/* 主催者 */}
                {event.organizer && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">主催者</h3>
                      <p className="text-gray-600">{event.organizer}</p>
                    </div>
                  </div>
                )}

                {/* 対象者 */}
                {event.target && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">対象者</h3>
                      <p className="text-gray-600">{event.target}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            {/* 参加費・申込 */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    {event.fee === 0 ? '無料' : `¥${event.fee.toLocaleString()}`}
                  </span>
                  {event.fee > 0 && (
                    <span className="text-sm text-gray-500 ml-1">/人</span>
                  )}
                </div>
                {event.maxParticipants && (
                  <div className="text-right">
                    <span className="text-sm text-gray-500">最大</span>
                    <div className="text-lg font-semibold text-gray-900">{event.maxParticipants}名</div>
                  </div>
                )}
              </div>

              {event.registerUrl ? (
                <a
                  href={event.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block"
                >
                  申し込む
                </a>
              ) : (
                <button
                  className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg cursor-not-allowed font-medium"
                  disabled
                >
                  申込URL未設定
                </button>
              )}
            </div>

            {/* イベント情報 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">イベント情報</h3>
              
              <div className="space-y-3">
                {event.prefecture && (
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-gray-600">{event.prefecture}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">
                    投稿日: {new Date(event.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 