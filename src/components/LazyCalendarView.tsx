'use client'

import dynamic from 'next/dynamic'
import { Event } from '@/types'
import LoadingSpinner from './LoadingSpinner'

// CalendarViewを動的インポート
const CalendarView = dynamic(() => import('./calendar/CalendarView'), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" text="カレンダーを読み込み中..." />
    </div>
  ),
  ssr: false
})

interface LazyCalendarViewProps {
  events: Event[]
}

export default function LazyCalendarView({ events }: LazyCalendarViewProps) {
  return <CalendarView events={events} />
} 