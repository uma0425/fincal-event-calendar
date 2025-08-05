'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Event } from '@prisma/client'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchEvent()
    }
  }, [params.id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/events/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.data)
      } else {
        setError('イベントが見つかりません')
      }
    } catch (err) {
      console.error('イベント取得エラー:', err)
      setError('イベントの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventTypeLabel = (type: string) => {
    const labels = {
      'seminar': 'セミナー',
      'webinar': 'ウェビナー',
      'meetup': 'ミートアップ',
      'workshop': 'ワークショップ',
      'other': 'その他',
    }
    return labels[type as keyof typeof labels] || 'その他'
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      'seminar': 'bg-blue-100 text-blue-800',
      'webinar': 'bg-green-100 text-green-800',
      'meetup': 'bg-purple-100 text-purple-800',
      'workshop': 'bg-orange-100 text-orange-800',
      'other': 'bg-gray-100 text-gray-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">イベントを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error || 'イベントが見つかりません'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-2xl font-bold text-blue-600">FinCal</div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors">ホーム</a>
              <a href="/submit" className="text-gray-700 hover:text-blue-600 transition-colors">イベント投稿</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* イベント詳細 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* 画像セクション */}
          <div className="relative h-64 md:h-96">
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <svg className="w-24 h-24 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* カテゴリバッジ */}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getEventTypeColor(event.type)}`}>
                {getEventTypeLabel(event.type)}
              </span>
            </div>
          </div>

          {/* コンテンツセクション */}
          <div className="p-6">
            {/* タイトル */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">開催日時</p>
                    <p className="font-medium">{formatDate(event.startAt.toString())}</p>
                  </div>
                </div>

                {event.place && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">開催場所</p>
                      <p className="font-medium">{event.place}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">主催者</p>
                    <p className="font-medium">{event.organizer}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">参加費</p>
                    <p className="font-medium">{event.fee === 0 ? '無料' : `¥${event.fee?.toLocaleString()}`}</p>
                  </div>
                </div>

                {event.target && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">対象者</p>
                      <p className="font-medium">{event.target}</p>
                    </div>
                  </div>
                )}

                {event.maxParticipants && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">定員</p>
                      <p className="font-medium">{event.maxParticipants}名</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 説明 */}
            {event.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">イベント詳細</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-4">
              {event.registerUrl && (
                <a
                  href={event.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
                >
                  参加申し込み
                </a>
              )}
              <button className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                お気に入りに追加
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 