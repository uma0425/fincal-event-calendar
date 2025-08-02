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
  const { favorites } = useFavorites()
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
    datePeriod: [],
    sortBy: 'date',
    sortOrder: 'asc'
  })

  // フィルター変更ハンドラーをメモ化
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])

  // フィルタリングされたイベント
  const filteredEvents = useMemo(() => {
    let events = demoEvents.filter(event => {
      // 検索フィルター
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const searchableText = [
          event.title,
          event.description,
          event.organizer,
          event.place,
          event.target.join(' ')
        ].join(' ').toLowerCase()
        
        if (!searchableText.includes(searchLower)) {
          return false
        }
      }

      // イベントタイプフィルター
      if (filters.types.length > 0 && !filters.types.includes(event.type)) {
        return false
      }

      // 都道府県フィルター
      if (filters.prefecture && filters.prefecture !== '全国' && event.prefecture !== filters.prefecture) {
        return false
      }

      // 主催者フィルター
      if (filters.organizer) {
        const organizerLower = filters.organizer.toLowerCase()
        if (!event.organizer.toLowerCase().includes(organizerLower)) {
          return false
        }
      }

      // 場所フィルター
      if (filters.place) {
        const placeLower = filters.place.toLowerCase()
        if (!event.place.toLowerCase().includes(placeLower)) {
          return false
        }
      }

      // 料金範囲フィルター
      if (filters.feeRange.min !== null || filters.feeRange.max !== null) {
        const eventFee = event.fee ?? 0
        const minFee = filters.feeRange.min ?? 0
        const maxFee = filters.feeRange.max ?? Infinity
        
        if (eventFee < minFee || eventFee > maxFee) {
          return false
        }
      }

      // 日付範囲フィルター
      if (filters.dateRange.start || filters.dateRange.end) {
        const eventDate = new Date(event.startAt)
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null
        
        if (startDate && eventDate < startDate) {
          return false
        }
        if (endDate && eventDate > endDate) {
          return false
        }
      }

      // お気に入りフィルター
      if (filters.favoritesOnly && !favorites.includes(event.id)) {
        return false
      }

      return true
    })

    // ソート機能
    events.sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title, 'ja')
          break
        case 'fee':
          const feeA = a.fee ?? 0
          const feeB = b.fee ?? 0
          comparison = feeA - feeB
          break
        case 'popularity':
          // 仮の実装：お気に入り数でソート
          const favA = favorites.includes(a.id) ? 1 : 0
          const favB = favorites.includes(b.id) ? 1 : 0
          comparison = favB - favA
          break
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison
    })

    return events
  }, [filters, favorites])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <Logo size="lg" className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              会計・ファイナンスイベントカレンダー
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed px-4">
              会計・ファイナンス領域のイベント情報を一元化し、誰でも自由に追加できるオープンカレンダー
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* フィルター（サイドバー） */}
          <div className="lg:w-80 flex-shrink-0 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:sticky lg:top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">絞り込み</h3>
              <LazyEventFilter onFilterChange={handleFilterChange} />
            </div>
          </div>

          {/* カレンダー（メインコンテンツ） */}
          <div className="flex-1 order-1 lg:order-2">
            <LazyCalendarView events={filteredEvents} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return <HomePageContent />
} 