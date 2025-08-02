export interface FilterState {
  search: string
  types: string[]
  prefecture: string
  organizer: string
  place: string
  feeRange: { min: number | null; max: number | null }
  dateRange: { start: string; end: string }
  target?: string[]
  favoritesOnly: boolean
  categories: string[]
  participationFormat: string[]
  datePeriod: 'all' | 'today' | 'week' | 'month'
  sortBy: 'startAt' | 'title' | 'fee' | 'popularity'
  sortOrder: 'asc' | 'desc'
} 