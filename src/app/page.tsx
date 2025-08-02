'use client'

import { useState, useMemo, useCallback, Suspense } from 'react'
import LazyCalendarView from '@/components/LazyCalendarView'
import LazyEventFilter from '@/components/LazyEventFilter'
import { FilterState } from '@/types/filter'
import Logo from '@/components/Logo'
import { Event } from '@/types'
import { FavoriteProvider, useFavorites } from '@/contexts/FavoriteContext'
import { demoEvents } from '@/lib/demoData'
import LoadingSpinner from '@/components/LoadingSpinner'

type EventType = 'seminar' | 'meetup' | 'workshop' | 'webinar'

function HomePageContent() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    types: [],
    prefecture: '',
    organizer: '',
    place: '',
    feeRange: { min: null, max: null },
    dateRange: { start: '', end: '' },
    favoritesOnly: false,
    categories: [],
    participationFormat: [],
    datePeriod: 'all',
    sortBy: 'startAt',
    sortOrder: 'asc'
  })

  const { favorites } = useFavorites()

  // フィルタリングとソート
  const filteredEvents = useMemo(() => {
    let events = [...demoEvents]

    // 検索フィルター
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      events = events.filter(event =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.organizer.toLowerCase().includes(searchLower) ||
        event.place.toLowerCase().includes(searchLower)
      )
    }

    // お気に入りフィルター
    if (filters.favoritesOnly) {
      events = events.filter(event => favorites.includes(event.id))
    }

    // カテゴリフィルター
    if (filters.categories.length > 0) {
      events = events.filter(event => filters.categories.includes(event.type))
    }

    // 参加形式フィルター
    if (filters.participationFormat.length > 0) {
      events = events.filter(event => {
        const isOnline = event.place.toLowerCase().includes('オンライン')
        return filters.participationFormat.includes(isOnline ? 'online' : 'offline')
      })
    }

    // 日付フィルター
    const now = new Date()
    switch (filters.datePeriod) {
      case 'today':
        events = events.filter(event => {
          const eventDate = new Date(event.startAt)
          return eventDate.toDateString() === now.toDateString()
        })
        break
      case 'week':
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        events = events.filter(event => {
          const eventDate = new Date(event.startAt)
          return eventDate >= now && eventDate <= weekFromNow
        })
        break
      case 'month':
        const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        events = events.filter(event => {
          const eventDate = new Date(event.startAt)
          return eventDate >= now && eventDate <= monthFromNow
        })
        break
    }

    // ソート
    events.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'startAt':
          comparison = new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'fee':
          comparison = (a.fee || 0) - (b.fee || 0)
          break
        case 'popularity':
          comparison = (a.maxParticipants || 0) - (b.maxParticipants || 0)
          break
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

    return events
  }, [filters, favorites])

  const handleFiltersChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  return (
    <div className="max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <Logo />
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-2">
          イベントカレンダー
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          最新のイベント情報をカレンダー形式で確認できます。セミナー、ミートアップ、ワークショップなど様々なイベントを検索・フィルタリングできます。
        </p>
      </div>

      {/* フィルター */}
      <div className="mb-8">
        <Suspense fallback={<LoadingSpinner />}>
          <LazyEventFilter
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalEvents={demoEvents.length}
            filteredCount={filteredEvents.length}
          />
        </Suspense>
      </div>

      {/* カレンダービュー */}
      <div className="bg-white rounded-lg shadow-md">
        <Suspense fallback={<LoadingSpinner />}>
          <LazyCalendarView events={filteredEvents} />
        </Suspense>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <FavoriteProvider>
      <HomePageContent />
    </FavoriteProvider>
  )
} 