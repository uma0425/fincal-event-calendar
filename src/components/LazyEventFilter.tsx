'use client'

import dynamic from 'next/dynamic'
import { FilterState } from '@/types/filter'
import LoadingSpinner from './LoadingSpinner'

// EventFilterを動的インポート
const EventFilter = dynamic(() => import('./calendar/EventFilter'), {
  loading: () => (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-md"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded-md mb-2"></div>
        <div className="h-4 bg-gray-200 rounded-md"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded-md mb-2"></div>
        <div className="h-4 bg-gray-200 rounded-md"></div>
      </div>
      <div className="flex justify-center py-4">
        <LoadingSpinner size="sm" text="フィルターを読み込み中..." />
      </div>
    </div>
  ),
  ssr: false
})

interface LazyEventFilterProps {
  filters: FilterState
  onFiltersChange: (newFilters: Partial<FilterState>) => void
  totalEvents: number
  filteredCount: number
}

export default function LazyEventFilter({ filters, onFiltersChange, totalEvents, filteredCount }: LazyEventFilterProps) {
  return <EventFilter onFiltersChange={onFiltersChange} />
} 