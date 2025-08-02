'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatTime, getEventTypeLabel, getEventTypeColor } from '@/lib/utils'
import { Event } from '@/types'
import FavoriteButton from '@/components/events/FavoriteButton'

interface MonthViewProps {
  events: Event[]
  onDateSelect?: (date: Date) => void
}

export default function MonthView({ events, onDateSelect }: MonthViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // 月の開始日と終了日を計算
  const monthStart = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  }, [currentDate])

  const monthEnd = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  }, [currentDate])

  // カレンダーの開始日（前月の日曜日）
  const calendarStart = useMemo(() => {
    const start = new Date(monthStart)
    const dayOfWeek = start.getDay()
    start.setDate(start.getDate() - dayOfWeek)
    return start
  }, [monthStart])

  // カレンダーの終了日（翌月の土曜日）
  const calendarEnd = useMemo(() => {
    const end = new Date(monthEnd)
    const dayOfWeek = end.getDay()
    end.setDate(end.getDate() + (6 - dayOfWeek))
    return end
  }, [monthEnd])

  // カレンダーの日付配列を生成
  const calendarDays = useMemo(() => {
    const days = []
    const current = new Date(calendarStart)
    
    while (current <= calendarEnd) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [calendarStart, calendarEnd])

  // 指定日のイベントを取得
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startAt)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  // 日付が今日かどうか
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // 日付が今月かどうか
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear()
  }

  // 前月に移動
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // 翌月に移動
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // 今日に戻る
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // 月の表示名
  const monthName = currentDate.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long' 
  })

  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* ナビゲーション */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">{monthName}</h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors"
          >
            今日
          </button>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekdays.map((day, index) => (
              <div
                key={day}
                className={`p-3 text-center text-sm font-medium ${
                  index === 0 ? 'text-red-600' : 
                  index === 6 ? 'text-blue-600' : 'text-gray-900'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              const dayEvents = getEventsForDate(date)
              const isCurrentMonthDay = isCurrentMonth(date)
              const isTodayDate = isToday(date)
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                    !isCurrentMonthDay ? 'bg-gray-50' : ''
                  }`}
                >
                  {/* 日付 */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isTodayDate
                          ? 'bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                          : isCurrentMonthDay
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-1 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* イベント */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="block p-1 text-xs rounded cursor-pointer hover:bg-gray-100 transition-colors relative"
                      >
                        {/* お気に入りボタン */}
                        <div className="absolute top-0 right-0">
                          <FavoriteButton eventId={event.id} size="sm" />
                        </div>
                        
                        <Link href={`/events/${event.id}`}>
                          <div className="flex items-center space-x-1 pr-4">
                            <div className={`w-2 h-2 rounded-full ${getEventTypeColor(event.type).replace('badge', '')}`} />
                            <span className="truncate font-medium">
                              {event.title}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {formatTime(event.startAt)}
                          </div>
                        </Link>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 3}件
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center space-x-4 text-sm">
          <span className="font-medium text-gray-700">イベントタイプ:</span>
          {(['seminar', 'meetup', 'workshop', 'webinar'] as const).map((type) => (
            <div key={type} className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${getEventTypeColor(type).replace('badge', '')}`} />
              <span className="text-gray-600">{getEventTypeLabel(type)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 