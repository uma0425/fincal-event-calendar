'use client'

import { useState } from 'react'
import { Calendar, Users, TrendingUp, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { demoEvents } from '@/lib/demoData'

export default function AdminPage() {
  const [events, setEvents] = useState(demoEvents)
  const [selectedEvent, setSelectedEvent] = useState<typeof demoEvents[0] | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const stats = [
    {
      title: '総イベント数',
      value: events.length,
      icon: Calendar,
      description: '登録済みイベント'
    },
    {
      title: '今月のイベント',
      value: events.filter(event => {
        const eventDate = new Date(event.startAt)
        const now = new Date()
        return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
      }).length,
      icon: TrendingUp,
      description: '今月開催予定'
    },
    {
      title: '参加者予想',
      value: events.reduce((sum, event) => sum + (event.maxParticipants || 0), 0),
      icon: Users,
      description: '総参加者数'
    }
  ]

  const handleEditEvent = (event: typeof demoEvents[0]) => {
    setSelectedEvent(event)
    setIsEditing(true)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('このイベントを削除しますか？')) {
      setEvents(events.filter(event => event.id !== eventId))
    }
  }

  const handleSaveEvent = (updatedEvent: typeof demoEvents[0]) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ))
    setIsEditing(false)
    setSelectedEvent(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">管理者ダッシュボード</h1>
        <p className="text-gray-600">イベントの管理と統計情報の確認</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
              <stat.icon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* イベント管理 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* イベント一覧 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">イベント一覧</h2>
                  <p className="text-sm text-gray-600 mt-1">登録済みイベントの管理</p>
                </div>
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Plus className="h-4 w-4 mr-2" />
                  新規作成
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(event.startAt).toLocaleDateString('ja-JP')} - {event.place}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {event.type}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {event.fee === 0 ? '無料' : `¥${event.fee}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(`/events/${event.id}`, '_blank')}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="inline-flex items-center p-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 編集パネル */}
        <div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">イベント編集</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedEvent ? 'イベントの詳細を編集' : 'イベントを選択してください'}
              </p>
            </div>
            <div className="p-6">
              {selectedEvent && isEditing ? (
                <EventEditForm
                  event={selectedEvent}
                  onSave={handleSaveEvent}
                  onCancel={() => {
                    setIsEditing(false)
                    setSelectedEvent(null)
                  }}
                />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>編集するイベントを選択してください</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface EventEditFormProps {
  event: typeof demoEvents[0]
  onSave: (event: typeof demoEvents[0]) => void
  onCancel: () => void
}

function EventEditForm({ event, onSave, onCancel }: EventEditFormProps) {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || '',
    location: event.place,
    type: event.type,
    fee: event.fee || 0,
    maxParticipants: event.maxParticipants || 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...event,
      ...formData,
      place: formData.location
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          タイトル
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          説明
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          場所
        </label>
        <input
          id="location"
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          タイプ
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="seminar">セミナー</option>
          <option value="meetup">ミートアップ</option>
          <option value="workshop">ワークショップ</option>
          <option value="webinar">ウェビナー</option>
          <option value="other">その他</option>
        </select>
      </div>

      <div>
        <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-1">
          参加費
        </label>
        <input
          id="fee"
          type="number"
          value={formData.fee}
          onChange={(e) => setFormData({ ...formData, fee: parseInt(e.target.value) || 0 })}
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
          最大参加者数
        </label>
        <input
          id="maxParticipants"
          type="number"
          value={formData.maxParticipants}
          onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })}
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
} 