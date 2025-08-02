export interface FilterState {
  search: string
  favoritesOnly: boolean
  categories: string[]
  participationFormat: string[]
  datePeriod: 'all' | 'today' | 'week' | 'month'
  sortBy: 'startAt' | 'title' | 'fee' | 'popularity'
  sortOrder: 'asc' | 'desc'
} 