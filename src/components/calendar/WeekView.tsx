'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatTime, getEventTypeLabel, getEventTypeColor } from '@/lib/utils'
import { Event } from '@/types'
import FavoriteButton from '@/components/events/FavoriteButton'

interface WeekViewProps {
  events: Event[]
  onDateSelect?: (date: Date) => void
}

export default function WeekView({ events, onDateSelect }: WeekViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // 週の開始日（日曜日）を計算
  const weekStart = useMemo(() => {
    const start = new Date(currentDate)
    const dayOfWeek = start.getDay()
    start.setDate(start.getDate() - dayOfWeek)
    return start
  }, [currentDate])

  // 週の終了日（土曜日）を計算
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    return end
  }, [weekStart])

  // 週の日付配列を生成
  const weekDays = useMemo(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(day.getDate() + i)
      days.push(day)
    }
    return days
  }, [weekStart])

  // 時間スロット（9:00-21:00）
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 9; hour <= 21; hour++) {
      slots.push(hour)
    }
    return slots
  }, [])

  // 指定日のイベントを取得
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startAt)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  // 指定時間のイベントを取得
  const getEventsForTimeSlot = (date: Date, hour: number) => {
    return getEventsForDate(date).filter(event => {
      const eventHour = new Date(event.startAt).getHours()
      return eventHour === hour
    })
  }

  // 日付が今日かどうか
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // 前週に移動
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  // 翌週に移動
  const goToNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  // 今日に戻る
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // 週の表示名
  const weekName = `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`

  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* ナビゲーション */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">{weekName}</h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors"
          >
            今日
          </button>
        </div>
      </div>

      {/* 週ビュー */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-3 border-r border-gray-200 bg-gray-50"></div>
            {weekDays.map((date, index) => (
              <div
                key={index}
                className={`p-3 text-center border-r border-gray-200 ${
                  isToday(date) ? 'bg-primary-50' : 'bg-gray-50'
                }`}
              >
                <div className={`text-sm font-medium ${
                  index === 0 ? 'text-red-600' : 
                  index === 6 ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {weekdays[index]}
                </div>
                <div className={`text-lg font-bold ${
                  isToday(date) ? 'text-primary-600' : 'text-gray-700'
                }`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* 時間スロット */}
          <div className="grid grid-cols-8">
            {timeSlots.map((hour) => (
              <div key={hour} className="contents">
                {/* 時間ラベル */}
                <div className="p-2 border-r border-b border-gray-200 bg-gray-50 text-xs text-gray-500 text-right">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                
                {/* 各曜日のセル */}
                {weekDays.map((date, dayIndex) => {
                  const timeSlotEvents = getEventsForTimeSlot(date, hour)
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`p-1 border-r border-b border-gray-200 min-h-[60px] ${
                        isToday(date) ? 'bg-primary-50' : ''
                      }`}
                    >
                      {timeSlotEvents.map((event) => (
                        <div
                          key={event.id}
                          className="block p-2 mb-1 text-xs rounded cursor-pointer hover:bg-gray-100 transition-colors border-l-4 relative"
                          style={{
                            borderLeftColor: getEventTypeColor(event.type).includes('blue') ? '#3B82F6' :
                                           getEventTypeColor(event.type).includes('green') ? '#10B981' :
                                           getEventTypeColor(event.type).includes('yellow') ? '#F59E0B' :
                                           getEventTypeColor(event.type).includes('purple') ? '#8B5CF6' : '#6B7280'
                          }}
                        >
                          {/* お気に入りボタン */}
                          <div className="absolute top-1 right-1">
                            <FavoriteButton eventId={event.id} size="sm" />
                          </div>
                          
                          <Link href={`/events/${event.id}`}>
                            <div className="font-medium truncate pr-6">
                              {event.title}
                            </div>
                            <div className="text-gray-500 truncate">
                              {formatTime(event.startAt)} - {formatTime(event.endAt)}
                            </div>
                            <div className="text-gray-400 truncate">
                              {event.place}
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center space-x-4 text-sm">
          <span className="font-medium text-gray-700">イベントタイプ:</span>
                    {(['seminar', 'meetup', 'workshop', 'webinar'] as const).map((type) => (
            <div key={type} className="flex items-center space-x-1">
              <div
                className="w-3 h-3 rounded"
                style={{
                  backgroundColor: getEventTypeColor(type).includes('blue') ? '#3B82F6' :
                                 getEventTypeColor(type).includes('green') ? '#10B981' :
                                 getEventTypeColor(type).includes('yellow') ? '#F59E0B' :
                                 getEventTypeColor(type).includes('purple') ? '#8B5CF6' : '#6B7280'
                }}
              />
              <span className="text-gray-600">{getEventTypeLabel(type)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 