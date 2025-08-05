'use client'

import { useState, useEffect } from 'react'
import { EventStatus, EventType } from '@prisma/client'

interface Event {
  id: string
  title: string
  description?: string
  startAt: string
  endAt: string
  type: EventType
  organizer: string
  place?: string
  status: EventStatus
  createdAt: string
  user?: {
    name?: string
    email: string
  }
}

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<EventStatus | 'all'>('all')

  useEffect(() => {
    fetchEvents()
  }, [filterStatus])

  const fetchEvents = async () => {
    try {
      const url = filterStatus === 'all' 
        ? '/api/admin/events'
        : `/api/admin/events?status=${filterStatus}`
      
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setEvents(data.data)
      }
    } catch (error) {
      console.error('イベントの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateEventStatus = async (eventId: string, status: EventStatus) => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, status }),
      })
      
      if (response.ok) {
        // イベントリストを更新
        fetchEvents()
      } else {
        alert('ステータスの更新に失敗しました。')
      }
    } catch (error) {
      alert('エラーが発生しました。')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventTypeLabel = (type: EventType) => {
    const typeLabels: { [key: string]: string } = {
      seminar: 'セミナー',
      webinar: 'ウェビナー',
      meetup: 'ミートアップ',
      workshop: 'ワークショップ',
      other: 'その他'
    }
    return typeLabels[type] || type
  }

  const getStatusLabel = (status: EventStatus) => {
    const statusLabels: { [key: string]: string } = {
      pending: '承認待ち',
      published: '公開済み',
      rejected: '却下'
    }
    return statusLabels[status] || status
  }

  const getStatusColor = (status: EventStatus) => {
    const statusColors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">イベントを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">管理者ダッシュボード</h1>
        <p className="text-gray-600">イベントの承認・管理を行います</p>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">ステータス:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as EventStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="pending">承認待ち</option>
            <option value="published">公開済み</option>
            <option value="rejected">却下</option>
          </select>
          <span className="text-sm text-gray-500">{events.length}件のイベント</span>
        </div>
      </div>

      {/* イベント一覧 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">該当するイベントがありません</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{event.description}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {getEventTypeLabel(event.type)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(event.startAt)}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {event.organizer}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(event.createdAt)}
                  </div>
                </div>
                
                {/* アクションボタン */}
                {event.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateEventStatus(event.id, 'published')}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      承認
                    </button>
                    <button
                      onClick={() => updateEventStatus(event.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      却下
                    </button>
                  </div>
                )}
                
                {event.status === 'rejected' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateEventStatus(event.id, 'published')}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      承認
                    </button>
                  </div>
                )}
                
                {event.status === 'published' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateEventStatus(event.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      却下
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 