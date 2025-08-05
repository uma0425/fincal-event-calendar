'use client'

import { useState, useEffect } from 'react'
import { Event, EventStatus } from '@prisma/client'

export default function AdminDashboard() {
  const [pendingEvents, setPendingEvents] = useState<Event[]>([])
  const [publishedEvents, setPublishedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // イベントデータを取得
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      // 承認待ちイベントを取得
      const pendingResponse = await fetch('/api/admin/events?status=pending')
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        setPendingEvents(pendingData.data || [])
      }

      // 公開済みイベントを取得
      const publishedResponse = await fetch('/api/admin/events?status=published')
      if (publishedResponse.ok) {
        const publishedData = await publishedResponse.json()
        setPublishedEvents(publishedData.data || [])
      }
    } catch (err) {
      console.error('イベント取得エラー:', err)
      setError('イベントの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // イベントの承認
  const approveEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'published' })
      })

      if (response.ok) {
        // 成功したらイベントリストを更新
        fetchEvents()
      } else {
        const errorData = await response.json()
        alert(`承認に失敗しました: ${errorData.error}`)
      }
    } catch (err) {
      console.error('承認エラー:', err)
      alert('承認に失敗しました')
    }
  }

  // イベントの拒否
  const rejectEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' })
      })

      if (response.ok) {
        // 成功したらイベントリストを更新
        fetchEvents()
      } else {
        const errorData = await response.json()
        alert(`拒否に失敗しました: ${errorData.error}`)
      }
    } catch (err) {
      console.error('拒否エラー:', err)
      alert('拒否に失敗しました')
    }
  }

  // ログアウト
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST'
      })

      if (response.ok) {
        // ログアウト成功
        window.location.href = '/admin/login'
      }
    } catch (err) {
      console.error('ログアウトエラー:', err)
    }
  }

  // イベントの削除
  const deleteEvent = async (eventId: string) => {
    if (!confirm('このイベントを削除しますか？この操作は取り消せません。')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // 成功したらイベントリストを更新
        fetchEvents()
        alert('イベントを削除しました')
      } else {
        const errorData = await response.json()
        alert(`削除に失敗しました: ${errorData.error}`)
      }
    } catch (err) {
      console.error('削除エラー:', err)
      alert('削除に失敗しました')
    }
  }

  // イベントの編集ページに遷移
  const editEvent = (eventId: string) => {
    window.location.href = `/admin/events/${eventId}/edit`
  }

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            再試行
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
              <div className="text-2xl font-bold text-blue-600">FinCal 管理者</div>
              <nav className="hidden md:flex space-x-8">
                <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors">ホーム</a>
                <a href="/admin" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">管理者</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchEvents}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                更新
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">承認待ち</p>
                <p className="text-2xl font-bold text-gray-900">{pendingEvents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">公開済み</p>
                <p className="text-2xl font-bold text-gray-900">{publishedEvents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総イベント数</p>
                <p className="text-2xl font-bold text-gray-900">{pendingEvents.length + publishedEvents.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 承認待ちイベント */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">承認待ちイベント</h2>
            <p className="text-sm text-gray-600">公開の承認が必要なイベント</p>
          </div>
          
          {pendingEvents.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">承認待ちのイベントはありません</h3>
              <p className="mt-1 text-sm text-gray-500">新しいイベントが投稿されるとここに表示されます。</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingEvents.map((event) => (
                <div key={event.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>主催者: {event.organizer}</span>
                        <span>開催日: {formatDate(event.startAt.toString())}</span>
                        <span>場所: {event.place || '未設定'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => approveEvent(event.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        承認
                      </button>
                      <button
                        onClick={() => rejectEvent(event.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        拒否
                      </button>
                      <button
                        onClick={() => editEvent(event.id)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 公開済みイベント */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">公開済みイベント</h2>
            <p className="text-sm text-gray-600">承認済みで公開されているイベント</p>
          </div>
          
          {publishedEvents.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">公開済みのイベントはありません</h3>
              <p className="mt-1 text-sm text-gray-500">イベントを承認するとここに表示されます。</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {publishedEvents.map((event) => (
                <div key={event.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>主催者: {event.organizer}</span>
                        <span>開催日: {formatDate(event.startAt.toString())}</span>
                        <span>場所: {event.place || '未設定'}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        公開済み
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => editEvent(event.id)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 