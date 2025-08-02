'use client'

import { Event } from '@/types'
import EventCard from './EventCard'
import FavoriteButton from '@/components/events/FavoriteButton'
import { formatDate, formatTime, getEventTypeLabel, getEventTypeColor, formatFee } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ListViewProps {
  events: Event[]
}

export default function ListView({ events }: ListViewProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">イベントが見つかりません</h3>
        <p className="text-gray-500">条件を変更して再度検索してください。</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 検索結果ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">イベント情報</h2>
          <span className="text-gray-600">検索結果{events.length}件</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
            すべての期間
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
            新着情報順
          </button>
        </div>
      </div>

      {/* イベントリスト */}
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="card hover:shadow-md transition-shadow">
            <div className="card-body">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`badge ${getEventTypeColor(event.type)}`}>
                      {getEventTypeLabel(event.type)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(event.startAt)}
                    </span>
                  </div>
                  
                  <Link 
                    href={`/events/${event.id}`}
                    className="block group"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {event.title}
                    </h3>
                  </Link>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>主催者:</strong> {event.organizer}</p>
                      <p><strong>場所:</strong> {event.place}</p>
                      <p><strong>時間:</strong> {formatTime(event.startAt)} - {formatTime(event.endAt)}</p>
                    </div>
                    <div>
                      <p><strong>参加費:</strong> {formatFee(event.fee)}</p>
                      <p><strong>対象:</strong> {event.target.join(', ')}</p>
                      {event.prefecture && (
                        <p><strong>都道府県:</strong> {event.prefecture}</p>
                      )}
                    </div>
                  </div>
                  
                  {event.description && (
                    <p className="mt-3 text-gray-600 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
                
                <div className="lg:ml-4 flex flex-col space-y-2">
                  <div className="flex items-center justify-between lg:justify-end">
                    <FavoriteButton eventId={event.id} size="sm" />
                  </div>
                  <Link
                    href={`/events/${event.id}`}
                    className="btn btn-outline w-full lg:w-auto"
                  >
                    詳細を見る
                  </Link>
                  <a
                    href={event.registerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full lg:w-auto"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    申込
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 