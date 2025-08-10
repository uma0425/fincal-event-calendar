'use client'

import { useState, useEffect } from 'react'
import { Event } from '@prisma/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface EventDetailPanelProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
}

export default function EventDetailPanel({ event, isOpen, onClose }: EventDetailPanelProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isIcsLoading, setIsIcsLoading] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // お気に入り状態を取得
  useEffect(() => {
    if (event) {
      const fetchFavoriteStatus = async () => {
        try {
          const response = await fetch('/api/favorites')
          if (response.ok) {
            const data = await response.json()
            const isFavorited = data.favorites.some((fav: any) => fav.eventId === event.id)
            setIsFavorite(isFavorited)
          }
        } catch (error) {
          console.error('お気に入り状態取得エラー:', error)
        }
      }
      fetchFavoriteStatus()
    }
  }, [event])

  const handleFavorite = async () => {
    if (!event) return
    
    try {
      if (isFavorite) {
        const response = await fetch(`/api/favorites?eventId=${event.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setIsFavorite(false)
        }
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventId: event.id })
        })
        if (response.ok) {
          setIsFavorite(true)
        }
      }
    } catch (error) {
      console.error('お気に入り操作エラー:', error)
    }
  }

  const handleIcsDownload = async () => {
    if (!event) return
    
    setIsIcsLoading(true)
    try {
      const icsContent = generateSingleEventIcs(event)
      const blob = new Blob([icsContent], { type: 'text/calendar' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fincal-${event.id}.ics`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      alert('イベントをカレンダーに追加しました。お使いのカレンダーアプリで確認してください。')
    } catch (error) {
      console.error('ICSダウンロードエラー:', error)
      alert('カレンダーへの追加に失敗しました。しばらく時間をおいてから再度お試しください。')
    } finally {
      setIsIcsLoading(false)
    }
  }

  const generateSingleEventIcs = (event: Event) => {
    const startDate = new Date(event.startAt)
    const endDate = new Date(event.endAt)
    
    const formatDate = (date: Date) => {
      return date.getFullYear().toString() +
             (date.getMonth() + 1).toString().padStart(2, '0') +
             date.getDate().toString().padStart(2, '0') +
             'T' +
             date.getHours().toString().padStart(2, '0') +
             date.getMinutes().toString().padStart(2, '0') +
             date.getSeconds().toString().padStart(2, '0') +
             'Z'
    }

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FinCal//Event Calendar//JA
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event.id}@fincal.local
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title.replace(/\n/g, '\\n')}
DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}
LOCATION:${event.place || ''}
URL:${event.registerUrl || ''}
CATEGORIES:${event.type}
STATUS:CONFIRMED
ORGANIZER;CN=${event.organizer}:mailto:noreply@fincal.local
END:VEVENT
END:VCALENDAR`
  }

  const handleShare = () => {
    if (!event) return
    
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: `${window.location.origin}/events/${event.id}`
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`)
      alert('URLをクリップボードにコピーしました')
    }
  }

  const handleCopyLink = () => {
    if (!event) return
    navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`)
    alert('リンクをコピーしました')
  }

  if (!event) return null

  const startDate = new Date(event.startAt)
  const endDate = new Date(event.endAt)

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
                        {/* パネル */}
                  <div 
                    className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out animate-slide-in-right ${
                      isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                  >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              リンクをコピー
            </button>
            <Link
              href={`/events/${event.id}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              target="_blank"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="h-full overflow-y-auto">
          {/* イベント情報 */}
          <div className="p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">🐰</span>
                <span>{event.organizer}</span>
              </div>
            </div>

            {/* イベント画像 */}
            <div className="mb-6">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium">イベント</p>
                  </div>
                </div>
              )}
            </div>

            {/* 日時 */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {startDate.getMonth() + 1}月
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {startDate.getDate()}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold text-gray-900">
                  {startDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'long' })}
                </div>
                <div className="text-gray-600">
                  {startDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  {endDate && (
                    <>
                      {' - '}
                      {endDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 場所 */}
            {event.place && (
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">{event.place}</div>
                    {event.prefecture && (
                      <div className="text-sm text-gray-600">{event.prefecture}</div>
                    )}
                  </div>
                </div>
                {/* Google Maps */}
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&q=${encodeURIComponent(event.place)}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}

            {/* イベント説明 */}
            {event.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">イベントについて</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div 
                    className={`text-gray-700 leading-relaxed prose prose-sm max-w-none ${
                      !isDescriptionExpanded ? 'line-clamp-3' : ''
                    }`}
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                  {event.description.length > 200 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      {isDescriptionExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 参加登録 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">参加登録</h3>
              <p className="text-gray-600 text-sm mb-4">
                ようこそ！イベントに参加するには、以下で参加登録をしてください。
              </p>
              
              <div className="space-y-3">
                {/* 参加費 */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">参加費</span>
                  <span className="font-bold text-lg">
                    {event.fee === 0 ? '無料' : `¥${event.fee.toLocaleString()}`}
                  </span>
                </div>

                {/* 定員 */}
                {event.maxParticipants && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">定員</span>
                    <span className="font-semibold">{event.maxParticipants}名</span>
                  </div>
                )}

                {/* 申し込みボタン */}
                {event.registerUrl && (
                  <a
                    href={event.registerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    申し込みはこちら
                  </a>
                )}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex space-x-3">
              <button
                onClick={handleFavorite}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg border transition-colors ${
                  isFavorite 
                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isFavorite ? 'お気に入り済み' : 'お気に入り'}
              </button>

              <button
                onClick={handleIcsDownload}
                disabled={isIcsLoading}
                className="flex-1 flex items-center justify-center py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isIcsLoading ? (
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                カレンダー追加
              </button>
            </div>

            {/* シェアボタン */}
            <div className="mt-4">
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                シェア
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
