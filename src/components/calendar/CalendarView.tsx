'use client'

import { useState } from 'react'
import { Event } from '@/types'
import { formatDate, formatTime, getEventTypeLabel, getEventTypeColor, formatFee } from '@/lib/utils'
import { Calendar, List, Grid, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import WeekView from './WeekView'
import MonthView from './MonthView'
import ListView from './ListView'
import FavoriteButton from '@/components/events/FavoriteButton'

interface CalendarViewProps {
  events: Event[]
}

export default function CalendarView({ events }: CalendarViewProps) {
  const [view, setView] = useState<'month' | 'week' | 'list'>('list')

  const viewButtons = [
    { id: 'list', label: 'リスト', icon: List },
    { id: 'week', label: '週', icon: Calendar },
    { id: 'month', label: '月', icon: Grid },
  ] as const

  return (
    <div className="space-y-4">
      {/* ビュー切り替え */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          イベント一覧 ({events.length}件)
        </h2>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          {viewButtons.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                view === id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* カレンダービュー */}
      {view === 'list' && <ListView events={events} />}
      {view === 'week' && <WeekView events={events} />}
      {view === 'month' && <MonthView events={events} />}
    </div>
  )
} 